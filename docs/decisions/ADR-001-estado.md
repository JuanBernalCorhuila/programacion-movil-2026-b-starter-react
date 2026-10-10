# ADR-001 — State management

- **ID:** ADR-001
- **Date:** 2026-10-10
- **Status:** Accepted
- **Authors:** Juan Camilo Bernal Gordillo

---

## Context

The products feature has three screens (list, detail and form). Each screen needs state: the
data that comes from the API, the status of the request (loading, ready or error), the error
message, the filters of the list and the fields of the form.

The framework asks to choose one state pattern for the whole app and to record it in an ADR
(`01-architecture/layers-and-state`). Without a decision, each screen could handle its state
in a different way and the code would be harder to read and to explain.

**Known constraints:**
- The app is small: one feature with three screens.
- The exam statement says that the state lives in each page with `useState` and `useEffect`.
- Only the tools seen in class (weeks 6 to 9) are used. No new library is added.
- The screens do not share data. Each screen asks the API for what it needs, and only the
  `id` of the product travels in the route.

---

## Decision

**We decided:** to keep the state local in each page, with `useState` for the values and
`useEffect` to load the data when the screen opens.

**Justification:**
The three screens follow the same pattern, so there is one way to do it in the whole app:

- A `status` variable with three values (`'loading'`, `'ready'` and `'error'`), the data, and
  an `errorMessage`.
- The data that can be calculated is not saved as state. For example, the filtered list and
  the "Empty" and "No results" states are calculated from `products`, `search` and `category`.
- The state changes only through its `set` function, never by changing the value directly.
- The pages hold the state, but the rules (validate, filter and format) live in the pure
  functions of `domain/product.ts`.

This is simpler than the patterns that the framework lists (MVVM, MVI or Store), but it
keeps its main rules: one pattern for the whole app, data that flows in one direction (the
state draws the screen, and the user actions update the state) and no business logic inside
the views. The list that comes with the starter already works this way, so the other two
screens copy that pattern.

---

## Evaluated alternatives

| Alternative | Pros | Cons | Reason for discarding |
|-------------|------|------|-----------------------|
| Local state in each page with `useState` and `useEffect` (chosen) | Simple and seen in class. No extra library. The starter list already uses it. | The loading code is repeated in the three pages. The state is lost when the user leaves the screen. | — (chosen) |
| A custom hook per screen (for example `useProducts`) | Shorter pages. The loading logic can be reused and tested alone. | More files and one more level to follow for three small screens. | Not needed for this size. It is the first step if the app grows. |
| A global store (Redux, Zustand or Context) | One place for the state. The screens can share data. | A new library and new concepts that were not seen in class. More code to write. | Too much for this scope: no screen shares state with another. |

---

## Consequences

**Positive:**
- The code is easy to read and to explain: each page shows its own state.
- Each screen is independent, so a change in one does not break another.
- The data is always fresh, because every screen asks the API when it opens.

**Negative / Trade-offs:**
- The loading pattern (`status`, `errorMessage`, `try` / `catch`) is written three times.
- There is no cache, so the app makes one request each time a screen opens.
- If the app grows and several screens need the same data, local state will be hard to keep
  in sync. In that case the first step is to move the logic to custom hooks, and the next
  step is a store, recorded in a new ADR that supersedes this one.

**Impact on the system:**
- Affected features/screens: `ProductListPage`, `ProductDetailPage` and `ProductFormPage`.
- Documents to update: the State section of [`productos.md`](../features/productos.md), the
  three screen specs in [`screens/`](../screens/) and the "State management decision" section
  of the README.

---

## References

- Mobile Governance Framework, `01-architecture/layers-and-state.md`:
  <https://github.com/jesusarielgb-works/mobile-governance-framework>
- Exam statement (Parcial práctico C2) and `TODO.md`, Part 3.
- Related to: [ADR-002 — API consumption](./ADR-002-consumo-api.md)
