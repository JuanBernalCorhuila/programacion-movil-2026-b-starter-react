# Endpoint Integration — Products

- **Feature:** [Products catalog](../features/productos.md)
- **Method + path:** the five endpoints of `/api/products` (see the summary)
- **Auth required:** No

The API is built with Express in `server/app.js` and runs on `http://localhost:3000`
(`npm run server`). The app calls it through the functions of `data/products-api.ts`, as
explained in [ADR-002](../decisions/ADR-002-consumo-api.md).

---

## Summary

| # | Method + path | Success | Errors | Client function |
|---|---------------|---------|--------|-----------------|
| 1 | `GET /api/products` | 200 with an array | None | `getProducts` |
| 2 | `GET /api/products/:id` | 200 with the product | 400, 404 | `getProduct` |
| 3 | `POST /api/products` | 201 with the created product | 400 | `createProduct` |
| 4 | `PUT /api/products/:id` | 200 with the updated product | 400, 404 | `updateProduct` |
| 5 | `DELETE /api/products/:id` | 204 without body | 400, 404 | `deleteProduct` |

---

## Common rules

**Product shape.** Every product has this shape (see [`product-entity.md`](./product-entity.md)):

```json
{ "id": 1, "name": "Agua mineral 600 ml", "price": 1800, "category": "Bebidas", "stock": 120 }
```

**Error format.** Every error uses the same format, with one message in `details` for each
problem:

```json
{ "error": "Datos inválidos", "details": ["name es obligatorio", "price debe ser un número mayor que 0"] }
```

**The `:id` of the route.** `parseId()` accepts only digits. If the `id` is not numeric (for
example `abc` or `1.5`), the API answers 400. If it is numeric but no product has that `id`, the
API answers 404.

| Case | Status | Body |
|------|--------|------|
| The `id` is not numeric | 400 | `{ "error": "Id inválido", "details": ["El id debe ser numérico"] }` |
| No product has that `id` | 404 | `{ "error": "Producto no encontrado", "details": ["No existe un producto con id 99"] }` |

**Validation of the body (`POST` and `PUT`).** The four fields are required. The API checks all
of them and answers 400 with the error "Datos inválidos" and one message for each problem.

| Field | Rule | Message in `details` |
|-------|------|----------------------|
| `name` | A text that is not empty. A text with only spaces counts as empty. | "name es obligatorio" |
| `name` | Maximum 60 characters. | "name debe tener máximo 60 caracteres" |
| `price` | A number greater than 0. A text such as `"1800"` is not valid. | "price debe ser un número mayor que 0" |
| `category` | One of "Bebidas", "Snacks", "Aseo" or "Hogar". | "category debe ser una de: Bebidas, Snacks, Aseo, Hogar" |
| `stock` | An integer greater than or equal to 0. | "stock debe ser un entero mayor o igual que 0" |

The API saves the name without the spaces at the start and at the end. Other fields of the body
are ignored, including `id`.

**Errors that the starter already handles.** They also use the error format:

| Case | Status | Body |
|------|--------|------|
| The route does not exist | 404 | `{ "error": "Ruta no encontrada", "details": ["GET /api/otra"] }` |
| The body is not valid JSON | 400 | `{ "error": "El cuerpo no es un JSON válido", "details": [] }` |
| A route fails in an unexpected way | 500 | `{ "error": "Error interno del servidor", "details": [] }` |

**DTO → domain mapping.** N/A. The JSON of the API has the same shape as the `Product` type of
`domain/product.ts`, so the client uses it as it comes. To show a product, the screens turn it
into a `ProductView` with `toProductView`.

**Errors in the app.** In every endpoint, if the API does not answer, the client throws a
network `ApiError` and the screen shows "No fue posible conectar con el servidor. Verifique que
la API esté en ejecución." A 500 is shown with the message of the server.

---

## 1. `GET /api/products`

Returns the list of products. It accepts two optional filters that can be used together.

### Request

| Param | In | Type | Required | Notes |
|-------|----|------|----------|-------|
| `search` | query | string | No | Keeps the products whose name contains the text, without case sensitivity. An empty value does not filter. |
| `category` | query | string | No | Keeps the products of that exact category. An empty value does not filter. |

**Body (if any):** None.

### Response

**Success (200):** an array of products. If no product matches, the array is empty.

`GET /api/products?category=Aseo`

```json
[
  { "id": 6, "name": "Detergente líquido 1 L", "price": 12500, "category": "Aseo", "stock": 18 },
  { "id": 7, "name": "Jabón de manos 250 ml", "price": 6900, "category": "Aseo", "stock": 3 }
]
```

### Errors

| Status | Meaning | App behavior |
|--------|---------|--------------|
| None | This endpoint has no errors of its own. A category that does not exist returns an empty array. | — |

**App behavior:** the list screen calls `getProducts()` without filters when it opens and when
the user comes back to it, and then filters in memory with `filterProducts`. If the request
fails, the list shows the Error state with the "Reintentar" button.

---

## 2. `GET /api/products/:id`

Returns one product.

### Request

| Param | In | Type | Required | Notes |
|-------|----|------|----------|-------|
| `id` | path | number | Yes | Identifier of the product. Only digits. |

**Body (if any):** None.

### Response

**Success (200):** the product.

`GET /api/products/3`

```json
{ "id": 3, "name": "Gaseosa cola 1,5 L", "price": 4800, "category": "Bebidas", "stock": 4 }
```

### Errors

| Status | Meaning | App behavior |
|--------|---------|--------------|
| 400 | The `id` is not numeric. | It does not happen from the app, because the routes only accept digits in `:id`. |
| 404 | No product has that `id`. | The detail and the form in edit mode show the Error state with "No encontramos ese producto." |

**App behavior:** the detail screen and the form in edit mode call `getProduct(id)` when they
open.

---

## 3. `POST /api/products`

Creates a product. The API gives it the next `id` of a counter that starts after the highest
`id` of the seed data, so the first created product gets the `id` 9. An `id` is never used again
after a delete.

### Request

No params.

**Body:**

```json
{ "name": "Té helado 500 ml", "price": 3200, "category": "Bebidas", "stock": 24 }
```

### Response

**Success (201):** the created product, with its new `id`.

```json
{ "id": 9, "name": "Té helado 500 ml", "price": 3200, "category": "Bebidas", "stock": 24 }
```

### Errors

| Status | Meaning | App behavior |
|--------|---------|--------------|
| 400 | The body does not pass the validation. | The form shows the Save error with the message of the server and its `details`, and keeps the data. |

**App behavior:** the form in create mode validates with `validateProduct` first, so a 400 is
not usual. When the API answers 201, the app goes to `/productos`.

---

## 4. `PUT /api/products/:id`

Updates a product. The body replaces the four fields; the `id` does not change.

### Request

| Param | In | Type | Required | Notes |
|-------|----|------|----------|-------|
| `id` | path | number | Yes | Identifier of the product. Only digits. |

**Body:**

```json
{ "name": "Gaseosa cola 1,5 L", "price": 5100, "category": "Bebidas", "stock": 30 }
```

### Response

**Success (200):** the updated product.

`PUT /api/products/3`

```json
{ "id": 3, "name": "Gaseosa cola 1,5 L", "price": 5100, "category": "Bebidas", "stock": 30 }
```

### Errors

The API checks in this order: the `id`, then that the product exists, then the body.

| Status | Meaning | App behavior |
|--------|---------|--------------|
| 400 | The `id` is not numeric, or the body does not pass the validation. | The form shows the Save error with the message of the server and its `details`, and keeps the data. |
| 404 | No product has that `id`. | The form shows the Save error with "No encontramos ese producto." |

**App behavior:** the form in edit mode validates with `validateProduct` first. When the API
answers 200, the app goes to `/productos`.

---

## 5. `DELETE /api/products/:id`

Deletes a product.

### Request

| Param | In | Type | Required | Notes |
|-------|----|------|----------|-------|
| `id` | path | number | Yes | Identifier of the product. Only digits. |

**Body (if any):** None.

### Response

**Success (204):** no body.

### Errors

| Status | Meaning | App behavior |
|--------|---------|--------------|
| 400 | The `id` is not numeric. | It does not happen from the app, because the routes only accept digits in `:id`. |
| 404 | No product has that `id`. | The detail shows the Error state with "No encontramos ese producto." |

**App behavior:** the detail screen calls `deleteProduct(id)` when the user taps "Confirmar".
When the API answers 204, the app goes to `/productos`.

---

## Caching / offline

- **Strategy:** online-only. Every screen asks the API when it opens.
- **Cached entity:** N/A. The app does not cache products.
- **TTL / invalidation:** N/A. The list is loaded again every time the user comes back to it.
