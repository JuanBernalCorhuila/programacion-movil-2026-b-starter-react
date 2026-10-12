# Screen — Product form

- **Route:** `/productos/nuevo` (create) and `/productos/:id/editar` (edit)
- **Feature:** [Products catalog](../features/productos.md)
- **Design reference:** N/A. There is no mockup; the screen is built with standard Ionic
  components and the theme that comes with the starter.

---

## Purpose

The user creates a new product or edits an existing one. It is one screen for the two routes:
when the route has an `id`, the form is in edit mode and loads the data of that product.

---

## UI regions

| Region | Component | Notes |
|--------|-----------|-------|
| Header | `IonHeader`, `IonToolbar`, `IonBackButton`, `IonTitle` | Title "Nuevo producto" in create mode and "Editar producto" in edit mode. The back button goes to `/productos`. |
| Save error | Text and a list | Visible only when the request to save fails. Shows the error message and, when the server sends them, its `details`. |
| Body | Three `IonInput` and four `IonButton` | Fields "Nombre", "Precio" and "Stock", and one button per category ("Bebidas", "Snacks", "Aseo" and "Hogar") under the label "Categoría". The selected category looks different from the others. Each field shows its validation message next to it. |
| Footer / CTA | `IonButton` | "Guardar". |

---

## Validation

The form validates with `validateProduct` when the user taps "Guardar". The rules are the same
as the rules of the API (see [`product-entity.md`](../api/product-entity.md)).

| Field | Rule | Message |
|-------|------|---------|
| `name` | Required. A text with only spaces counts as empty. | "El nombre es obligatorio." |
| `name` | Maximum 60 characters, counted without the spaces at the start and at the end. | "El nombre debe tener máximo 60 caracteres." |
| `price` | A number greater than 0. An empty field is not valid. | "El precio debe ser un número mayor que 0." |
| `category` | Required, and one of the four categories. | "Seleccione una categoría." |
| `stock` | An integer greater than or equal to 0. An empty field is not valid. | "El stock debe ser un número entero mayor o igual que 0." |

---

## States

| State | Trigger | UI |
|-------|---------|-----|
| Loading | Edit mode only: the product is being loaded (`status` is `'loading'`). | Text "Cargando producto…". |
| Loaded | The form is ready (`status` is `'ready'`). | Empty fields in create mode; the fields filled with the product in edit mode. |
| Empty | N/A | A form has no empty state. |
| Error | Edit mode only: the product could not be loaded (`status` is `'error'`). | `EmptyState` with the title "No se pudo cargar", the message from `getErrorMessage` and the "Volver a la lista" button. When the product does not exist (404), the message is "No encontramos ese producto." |
| Validation error | The user taps "Guardar" and `validateProduct` finds invalid fields. | A message next to each invalid field. Nothing is sent to the API. |
| Save error | The request to save fails, for example the API answers 400. | The error message and the `details` of the server, above the fields. The form keeps the data so the user can correct it and save again. |
| Offline | The API does not answer. | There is no offline mode. The client throws a network `ApiError`: when loading, the screen shows the Error state; when saving, it shows the Save error. |

---

## Actions

| User action | Result | Use case / event |
|-------------|--------|------------------|
| Opens `/productos/nuevo` | The form appears with empty fields. | No request. |
| Opens `/productos/:id/editar` | The product is loaded from the API and the fields are filled. | `getProduct(id)`, with the same loading pattern as the list. |
| Types in a field | The field keeps the new value. | `onIonInput` updates the variable of that field (`name`, `price` or `stock`). |
| Taps a category button | That category is selected. | Updates `category`. |
| Taps "Guardar" with invalid data | The validation messages appear. | `validateProduct`. |
| Taps "Guardar" with valid data | The product is saved and the app goes to `/productos`, where the list is loaded again. | `createProduct(input)` in create mode or `updateProduct(id, input)` in edit mode, then `useHistory`. |
| Taps the back button or "Volver a la lista" | The app goes to `/productos` without saving. | `IonBackButton`, or `useHistory` in the Error state. |

---

## Accessibility

- [ ] All interactive elements have accessible labels: every field has a label and every
  button has visible text.
- [ ] Touch targets ≥ 44×44 pt / 48×48 dp: the screen uses the default size of the Ionic
  buttons and inputs.
- [ ] Text scales with OS font-size setting: the screen does not set fixed font sizes.
- [ ] Contrast meets WCAG AA: the screen uses the starter theme and the default Ionic colors.
- [ ] An error is never shown by color alone: every invalid field has a text message.
