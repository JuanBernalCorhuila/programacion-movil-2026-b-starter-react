# Screen — Product list

- **Route:** `/productos`
- **Feature:** [Products catalog](../features/productos.md)
- **Design reference:** N/A. There is no mockup; the screen is built with standard Ionic
  components and the theme that comes with the starter.

---

## Purpose

The user sees all the products of the catalog, searches them by name, filters them by
category, opens the detail of one product and goes to the form to create a new one.

---

## UI regions

| Region | Component | Notes |
|--------|-----------|-------|
| Header | `IonHeader`, `IonToolbar`, `IonTitle` | Title "Productos". |
| Search | `IonInput` | Text field with the label "Buscar". It filters by product name. |
| Category filter | Five `IonButton` | "Todas", "Bebidas", "Snacks", "Aseo" and "Hogar". The selected button looks different from the others. |
| Body | `IonList` with one `ProductCard` per product, or `EmptyState` | Each card shows the name, the category, the price in Colombian pesos and the stock label. The stock label is highlighted when the product is out of stock or has few units. |
| Footer / CTA | `IonButton` | "Nuevo producto". It goes to `/productos/nuevo`. |

The search and the category filter are visible when `status` is `'ready'`. The "Nuevo producto"
button is always visible.

---

## States

| State | Trigger | UI |
|-------|---------|-----|
| Loading | The request is in flight (`status` is `'loading'`). | Text "Cargando productos…". |
| Loaded | `status` is `'ready'` and the filtered list has products. | One `ProductCard` per product. |
| Empty | `status` is `'ready'` and the API returned zero products. | `EmptyState` with the title "No hay productos". The user can create one with "Nuevo producto". |
| No results | `status` is `'ready'` and there are products, but `filterProducts` returns none. | `EmptyState` with the title "No se encontraron resultados". The search and the filter stay on screen so the user can change them. |
| Error | The request failed (`status` is `'error'`). | `EmptyState` with the title "No se pudo cargar", the message from `getErrorMessage` and the "Reintentar" button. |
| Offline | The API does not answer. | There is no offline mode. The client throws a network `ApiError`, so the screen shows the Error state with the message "No fue posible conectar con el servidor. Verifique que la API esté en ejecución." |

---

## Actions

| User action | Result | Use case / event |
|-------------|--------|------------------|
| Opens the screen, or comes back to it from another screen | The list is loaded from the API. | `getProducts()` inside `loadProducts`, called from `useEffect` and `useIonViewWillEnter`. |
| Types in the search field | The list keeps the products whose name contains the text, without case sensitivity. | Updates `search`; the list is filtered with `filterProducts`. |
| Taps a category button | The list keeps only the products of that category. "Todas" removes the filter. | Updates `category` (an empty text means all the categories); the list is filtered with `filterProducts`. |
| Taps a product card | The app goes to `/productos/:id`. | `onSelect` of `ProductCard`, then `useHistory`. |
| Taps "Nuevo producto" | The app goes to `/productos/nuevo`. | `routerLink` of the button. |
| Taps "Reintentar" | The list is loaded again. | `loadProducts()`. |

---

## Accessibility

- [ ] All interactive elements have accessible labels: the search field has a label and every
  button has visible text.
- [ ] Touch targets ≥ 44×44 pt / 48×48 dp: the screen uses the default size of the Ionic
  buttons and items.
- [ ] Text scales with OS font-size setting: the screen does not set fixed font sizes.
- [ ] Contrast meets WCAG AA: the screen uses the starter theme and the default Ionic colors.
- [ ] The stock status is never shown by color alone: the label text is always visible
  ("Agotado", "Pocas unidades" or "Disponible").
