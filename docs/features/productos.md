# Feature — Products catalog

- **Owner:** Juan Camilo Bernal Gordillo
- **Status:** Planned
- **Related stories:** N/A. The requirements come from the exam statement (Parcial práctico C2) and from `TODO.md`.

---

## Purpose

A small store needs to keep its product catalog up to date. This feature lets the user see the
products, search and filter them, check the detail of one product, and create, edit or delete
products through the Express API.

---

## Screens

| Screen | Route | Purpose |
|--------|-------|---------|
| Product list (`ProductListPage`) | `/productos` | Shows all the products, with a text search and a category filter. |
| Product detail (`ProductDetailPage`) | `/productos/:id` | Shows every field of one product, with the Edit and Delete actions. |
| New product (`ProductFormPage`) | `/productos/nuevo` | Form to create a product. |
| Edit product (`ProductFormPage`) | `/productos/:id/editar` | The same form, loaded with the data of an existing product. |

The four routes are declared in `src/app/App.tsx`. Create and edit share one component, so there
are three screen specs:

- [`product-list.md`](../screens/product-list.md)
- [`product-detail.md`](../screens/product-detail.md)
- [`product-form.md`](../screens/product-form.md)

---

## State

- **Pattern:** Local state inside each page, with `useState` and `useEffect`. There is no global
  store. The reasons are in [ADR-001](../decisions/ADR-001-estado.md).
- **State object(s):**
  - List: `products`, `status` (`'loading'`, `'ready'` or `'error'`), `errorMessage`, `search`
    and `category`.
  - Detail: `product`, `status`, `errorMessage` and `isConfirmingDelete`.
  - Form: `status` (for the load in edit mode), one variable per field (`name`, `price`,
    `category`, `stock`), the validation errors by field, and the error message and `details`
    sent by the server.
- **Key transitions:**
  - `loading → ready` when the API answers.
  - `loading → error` when the request fails.
  - `error → loading` when the user taps "Reintentar".
  - "Empty" and "No results" are not extra values of `status`. Both happen in `ready`: the list
    is empty when the API returns zero products, and there are no results when there are
    products but the filters match none of them.

---

## Data

- **Use cases:** There are no use case classes. The business rules are pure functions in
  `domain/product.ts`: `validateProduct`, `toProductView`, `filterProducts` and `formatCOP`.
- **Repositories:** There are no repository classes. The HTTP client is a set of functions in
  `data/products-api.ts`: `getProducts`, `getProduct`, `createProduct`, `updateProduct` and
  `deleteProduct`. How the app uses them is explained in
  [ADR-002](../decisions/ADR-002-consumo-api.md).
- **Remote sources / endpoints:** The five endpoints of `/api/products`. See
  [`products-endpoints.md`](../api/products-endpoints.md).
  - `GET /api/products`
  - `GET /api/products/:id`
  - `POST /api/products`
  - `PUT /api/products/:id`
  - `DELETE /api/products/:id`
- **Local persistence:** N/A. The app does not save data on the device. The API keeps the
  products in memory and they reset when the server restarts. The entity is described in
  [`product-entity.md`](../api/product-entity.md).

The list asks the API for all the products once and then filters them in memory with
`filterProducts`. This is what makes it possible to tell "Empty" from "No results".

---

## Edge cases & states

- [ ] Loading: the list, the detail and the form in edit mode show a loading message while
  they wait for the API.
- [ ] Empty: the API returns zero products.
- [ ] No results: there are products, but the search text or the category matches none.
- [ ] Error / retry: the list shows the error message and a "Reintentar" button.
- [ ] Not found: the product does not exist (the API answers 404), so the detail and the form
  in edit mode show "No encontramos ese producto."
- [ ] Validation: the form shows a message next to each invalid field. If the server rejects
  the data (400), the form shows its message and its `details`.
- [ ] Offline: there is no offline mode. If the API does not answer, the client throws a
  network `ApiError` and the screen shows the error state.
- [ ] Permission denied: N/A. The app has no login and no roles.

---

## Decisions

- [ADR-001 — State management](../decisions/ADR-001-estado.md)
- [ADR-002 — API consumption](../decisions/ADR-002-consumo-api.md)

---

## Tests

- Unit: `validateProduct`, `toProductView` and `filterProducts`, in
  `__tests__/product.test.ts`.
- Widget/UI: N/A. The exam does not ask for screen tests; the screens are checked by hand
  against the running API.
- Integration/E2E: API tests with `startTestServer()` in `__tests__/products-api.test.ts`: a
  `POST` with invalid data answers 400 with `{ error, details }`, and a `GET` of an id that
  does not exist answers 404.
