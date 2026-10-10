# ADR-002 — API consumption

- **ID:** ADR-002
- **Date:** 2026-10-10
- **Status:** Accepted
- **Authors:** Juan Camilo Bernal Gordillo

---

## Context

The app reads and saves the products through the Express API (`/api/products`). A request can
fail in two different ways, and the user needs a clear message in both:

- **Network error:** the API does not answer (for example, the server is stopped).
- **Unsuccessful response:** the API answers, but with an error code such as 400, 404 or 500.

The framework asks for one HTTP client for the app, and to turn the low-level errors into
errors that the screens can understand before they reach the user (`03-api-and-data/api-networking`
and `02-code-and-ui/coding-standards`). Without a decision, each page could call the API in its
own way and repeat the URL and the error handling.

**Known constraints:**
- The starter already gives `API_URL`, `ApiError`, `getErrorMessage`, `request` and
  `getProducts`. They are used as they come.
- Only `fetch` is used, as seen in class (week 8). No new library is added.
- The API and the app run in different ports (3000 and 5173) during development.
- The API has no login, so the requests carry no token.

---

## Decision

**We decided:** to consume the API with `fetch` through one client module,
`data/products-api.ts`. Every request goes through its `request` function, and the pages never
call `fetch` directly.

**Justification:**
One module keeps the URL, the JSON format and the error handling in one place. The pages only
call a function and show the result.

How the client works:

- **Base URL:** `API_URL` (`data/config.ts`) reads `VITE_API_URL` from the `.env` file. If
  the file does not exist, it uses `http://localhost:3000`. The `.env` file is not versioned.
- **One function per endpoint:** `getProducts`, `getProduct`, `createProduct`,
  `updateProduct` and `deleteProduct`. `POST` and `PUT` send the product as JSON with the
  header `Content-Type: application/json`.
- **Errors become `ApiError`:** if `fetch` throws, the API did not answer, so `request`
  throws an `ApiError` with `status` equal to `null` (`isNetworkError` is true). If the
  response is not successful, `request` reads the body `{ error, details }` and throws an
  `ApiError` with the code and the `details` of the server.
- **A 204 has no body:** after a `DELETE`, `request` returns `undefined`.

Where the errors are translated:

- `getErrorMessage` (`data/api-error.ts`) turns any error into a message for the user. A
  network error gives "No fue posible conectar con el servidor. Verifique que la API esté en
  ejecución.", a 404 gives "No encontramos ese producto.", and any other response gives the
  message that the server sent.
- The pages call `getErrorMessage` inside the `catch` and save the text in `errorMessage`. The
  form also reads `details` from the `ApiError` to show each problem that the server found.

What the API already gives (in `server/app.js`), so the client can trust one error format:

- `express.json()` turns the JSON body into `req.body`. If the body is not valid JSON, the
  error handler answers 400.
- `cors()` lets the app in port 5173 call the API in port 3000.
- `parseId()` turns the `:id` of the route into a number, or returns `null` when it is not
  only digits. In that case the route answers 400.
- The 404 handler answers when the route does not exist, and the central error handler
  answers 500 when a route fails in an unexpected way.
- Every error uses the same format, `{ "error": "...", "details": [] }`. That is why
  `request` can read any error in the same way.

About the layers: `presentation` imports the functions of `data` directly, as the starter
defines (`presentation` depends on `domain` and `data`; `data` depends on `domain`; `domain`
depends on nothing). The framework is stricter and asks to go through a repository interface.
In this app the functions of `products-api.ts` take the place of the repository, because one
feature with five endpoints does not need more.

---

## Evaluated alternatives

| Alternative | Pros | Cons | Reason for discarding |
|-------------|------|------|-----------------------|
| `fetch` in one client module, with `request` and `ApiError` (chosen) | The URL and the error handling are in one place. No extra library. The starter already gives the pattern. | No timeouts and no automatic retries. | — (chosen) |
| `fetch` directly inside each page | Fewer files. | The URL and the error handling are repeated in every page. The pages would know about HTTP, which breaks the layers. | It mixes `presentation` with `data`. |
| A library such as `axios` | It parses JSON and throws on error codes by itself. It has timeouts. | A new dependency that was not seen in class. | `fetch` with the `request` function already covers what the app needs. |

---

## Consequences

**Positive:**
- A change in the URL or in the error format is made in one file.
- The pages do not know about HTTP: they call a function and show a message.
- The user always gets a clear message, and can tell "the server is down" from "the product
  does not exist".

**Negative / Trade-offs:**
- There is no timeout: if the API takes too long, the screen stays in the Loading state.
- There are no automatic retries. The user retries by hand with the "Reintentar" button.
- There are no DTOs. The JSON of the API has the same shape as the `Product` type, so it is
  used as it comes; if the API changes, the type must change too.
- The client lives inside the feature (`features/products/data/`) and not in a shared
  `core/network/` folder, because the app has only one feature.

**Impact on the system:**
- Affected features/screens: `ProductListPage`, `ProductDetailPage`, `ProductFormPage` and
  `data/products-api.ts`.
- Documents to update: [`products-endpoints.md`](../api/products-endpoints.md) and the "API
  error handling" section of the README.

---

## References

- Mobile Governance Framework, `03-api-and-data/api-networking.md` and
  `02-code-and-ui/coding-standards.md`:
  <https://github.com/jesusarielgb-works/mobile-governance-framework>
- Exam statement (Parcial práctico C2) and `TODO.md`, Parts 2 and 3.
- Related to: [ADR-001 — State management](./ADR-001-estado.md)
