# Screen — Product detail

- **Route:** `/productos/:id`
- **Feature:** [Products catalog](../features/productos.md)
- **Design reference:** N/A. There is no mockup; the screen is built with standard Ionic
  components and the theme that comes with the starter.

---

## Purpose

The user sees every field of one product and can go to the form to edit it or delete it after
a simple confirmation.

---

## UI regions

| Region | Component | Notes |
|--------|-----------|-------|
| Header | `IonHeader`, `IonToolbar`, `IonBackButton`, `IonTitle` | Title "Detalle del producto". The back button goes to `/productos`. |
| Body | `IonList` with one `IonItem` per field, or `EmptyState` | Shows every field of the product: the id, the name, the category, the price in Colombian pesos, the stock and the stock label, with the labels "Id", "Nombre", "Categoría", "Precio" and "Stock". The stock label is a `StockBadge`, highlighted when the product is out of stock or has few units: it uses the Ionic color `danger` for "Agotado" and `warning` for "Pocas unidades". |
| Delete confirmation | Text and two `IonButton` | Visible only when `isConfirmingDelete` is true. Text "¿Eliminar este producto?" with the buttons "Confirmar" and "Cancelar". |
| Footer / CTA | Two `IonButton` | "Editar" and "Eliminar". Visible only when the product is loaded. |

---

## States

| State | Trigger | UI |
|-------|---------|-----|
| Loading | The request is in flight (`status` is `'loading'`). | Text "Cargando producto…". |
| Loaded | The API returned the product (`status` is `'ready'`). | The fields of the product, with the "Editar" and "Eliminar" buttons. |
| Empty | N/A | This screen shows one product. If the product does not exist, the screen shows the Error state. |
| Error | The request failed (`status` is `'error'`). | `EmptyState` with the title "No se pudo cargar", the message from `getErrorMessage` and the "Volver a la lista" button. When the product does not exist (404), the message is "No encontramos ese producto." |
| Offline | The API does not answer. | There is no offline mode. The client throws a network `ApiError`, so the screen shows the Error state with the message "No fue posible conectar con el servidor. Verifique que la API esté en ejecución." |

---

## Actions

| User action | Result | Use case / event |
|-------------|--------|------------------|
| Opens the screen, or comes back to it from another screen | The product is loaded from the API. The `:id` of the route is text, so it is converted to a number. | `getProduct(id)`, with the same loading pattern as the list; the product is shown with `toProductView`. |
| Taps "Editar" | The app goes to `/productos/:id/editar`. | `routerLink` of the button. |
| Taps "Eliminar" | The confirmation appears on the screen. Nothing is deleted yet. | `isConfirmingDelete` changes to true. |
| Taps "Cancelar" | The confirmation disappears and the product stays. | `isConfirmingDelete` changes to false. |
| Taps "Confirmar" | The product is deleted and the app goes back to `/productos`. If the request fails, the screen shows the Error state. | `deleteProduct(id)`, then `useHistory`. |
| Taps the back button or "Volver a la lista" | The app goes to `/productos`. | `IonBackButton`, or `useHistory` in the Error state. |

The route only accepts digits in `:id` (it is declared as `/productos/:id(\d+)` in
`src/app/App.tsx`), so a text like `/productos/abc` never opens this screen.

---

## Accessibility

- [x] All interactive elements have accessible labels: every button has visible text.
- [ ] Touch targets ≥ 44×44 pt / 48×48 dp: not fully met. The buttons keep the Ionic size, which
  is about 36 px high in the default Material Design mode.
- [x] Text scales with OS font-size setting: the screen does not set fixed font sizes.
- [ ] Contrast meets WCAG AA: not fully met. The texts use the default Ionic colors, but the
  green of the starter theme (`#009540`) with white text has a contrast of about 3.9:1, below
  the 4.5:1 that AA asks for small text. The theme comes with the starter and was not changed.
- [x] The stock status is never shown by color alone: the label text is always visible
  ("Agotado", "Pocas unidades" or "Disponible").
