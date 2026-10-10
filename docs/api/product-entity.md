# Entity — Product

- **Store:** N/A (in-memory storage). The API keeps the products in an array in memory,
  created from the seed data of `server/data/products.json` (8 products). The array resets
  when the server restarts. The app does not save products on the device.
- **Table/collection:** N/A (in-memory storage). The array is `products`, inside `createApp()`
  in `server/app.js`.
- **Schema version introduced:** N/A (in-memory storage).

---

## Fields

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | number (integer) | No | Identifier. The API assigns it when the product is created, with a counter. It never changes and it is not sent in the body. |
| `name` | string | No | Required. Not empty (a text with only spaces counts as empty). Maximum 60 characters. Saved without the spaces at the start and at the end. |
| `price` | number | No | Required. Greater than 0. It is a value in Colombian pesos. |
| `category` | string | No | Required. One of "Bebidas", "Snacks", "Aseo" or "Hogar". |
| `stock` | number (integer) | No | Required. Greater than or equal to 0. |

Example:

```json
{ "id": 1, "name": "Agua mineral 600 ml", "price": 1800, "category": "Bebidas", "stock": 120 }
```

The entity has no date fields (`created_at`, `updated_at`), because the exam statement does not
ask for them.

**Where the rules are checked.** The same rules are checked in two places: in the API, when it
receives a `POST` or a `PUT` (see [`products-endpoints.md`](./products-endpoints.md)), and in
the app, with `validateProduct`, before the form sends the data (see
[`product-form.md`](../screens/product-form.md)).

**Types and constants in the app** (`src/features/products/domain/product.ts`):

| Name | What it is |
|------|------------|
| `Product` | The product as the API returns it, with the five fields. |
| `ProductInput` | The data of the form: the same fields without `id`. |
| `ProductView` | The product ready to be shown. It adds `priceLabel`, `stockLabel`, `isLowStock` and `isOutOfStock`. |
| `CATEGORIES` | The four allowed categories. |
| `NAME_MAX_LENGTH` | 60, the maximum length of the name. |
| `LOW_STOCK_THRESHOLD` | 5, the limit of "few units". |

**Stock label.** `toProductView` calculates the label from `stock`:

| Stock | Label |
|-------|-------|
| 0 | "Agotado" |
| From 1 to 4 (less than `LOW_STOCK_THRESHOLD`) | "Pocas unidades" |
| 5 or more | "Disponible" |

The price is shown with `formatCOP`, for example `1250000` becomes "$ 1.250.000".

In the API and in the app the `stock` is never `null`. Only the Kotlin exercise
(`kotlin/Product.kt`) has a `stock` that admits `null`, and in that case the label is "Sin dato".

---

## Indexes

N/A (in-memory storage). The API finds a product by its `id` in the array.

---

## Relationships

N/A (in-memory storage). `Product` is the only entity. The category is a text from a fixed
list, not another entity.

---

## Sync

- **Synced?** No. N/A (in-memory storage): the app does not keep a local copy to sync.
- **Conflict policy:** N/A (in-memory storage).

---

## Migration notes

N/A (in-memory storage). There are no migrations: the data starts again from the seed file
every time the server starts.
