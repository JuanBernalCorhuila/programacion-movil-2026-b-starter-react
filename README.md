# Catálogo de productos · Starter Ionic React (versión 2)

Parcial práctico del corte 2 · Programación Móvil · CORHUILA 2026-B (modalidad individual).

Este repositorio es el punto de partida. El proyecto tiene tres piezas que se construyen durante el parcial, siguiendo el [Mobile Governance Framework](https://github.com/jesusarielgb-works/mobile-governance-framework):

- **API Express** (`server/`): CRUD de productos con validación, filtros y manejo de errores.
- **App Ionic React** (`src/`): lista con búsqueda y filtro, detalle, y formulario de crear y editar, organizada por capas.
- **Ejercicio Kotlin** (`kotlin/Product.kt`): modelo y funciones básicas, con lo visto en la semana 7.

Además, la **documentación** (`docs/`) se escribe antes del código, a partir de las plantillas del framework.

## Documentación

Los documentos del proyecto están en `docs/` y describen lo que hace el código:

- Funcionalidad: [`features/productos.md`](./docs/features/productos.md)
- Pantallas: [`product-list.md`](./docs/screens/product-list.md), [`product-detail.md`](./docs/screens/product-detail.md) y [`product-form.md`](./docs/screens/product-form.md)
- Decisiones: [`ADR-001-estado.md`](./docs/decisions/ADR-001-estado.md) y [`ADR-002-consumo-api.md`](./docs/decisions/ADR-002-consumo-api.md)
- API: [`products-endpoints.md`](./docs/api/products-endpoints.md) y [`product-entity.md`](./docs/api/product-entity.md)
- Checklist de entrega: [`definition-of-done.md`](./docs/definition-of-done.md)

> El enunciado oficial es el PDF de la actividad en Moodle. Este README es un resumen; si algo difiere, manda el PDF.

## Cómo ejecutar

Requisito: Node.js 22.12 o superior (`node --version`).

```bash
npm install        # instala dependencias (una sola vez)
npm run server     # arranca la API en http://localhost:3000
npm run dev        # arranca la app en http://localhost:5173 (en otra terminal)
npm test           # corre las pruebas (Vitest)
npm run lint       # revisión de estilo del código
npm run build      # revisión de tipos y compilación para producción
```

La app y la API se ejecutan al mismo tiempo, cada una en su terminal. La app lee la dirección de la API de la variable `VITE_API_URL`: copie `.env.example` como `.env` si necesita cambiarla. El archivo `.env` está ignorado por Git; nunca se versiona.

Rutas de la app: `/productos` (lista), `/productos/nuevo`, `/productos/:id` (detalle) y `/productos/:id/editar`.

La API implementa las cinco rutas de `/api/products`, y la app permite listar, buscar, filtrar, ver, crear, editar y eliminar productos contra ella. Para ver el estado de error de la app, detenga la API.

El ejercicio Kotlin se ejecuta aparte: pegue el contenido de `kotlin/Product.kt` en el [Kotlin Playground](https://play.kotlinlang.org) y pulse **Run**.

## Flujo de entrega

1. Haga un **fork** de este repositorio a su cuenta de GitHub y clónelo.
2. Cree una rama de funcionalidad: `git switch -c feature/productos`.
3. Trabaje la lista de [TODO.md](./TODO.md), en orden, con commits pequeños en formato [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): resumen` (por ejemplo, `docs(productos): describe la funcionalidad` o `feat(api): agrega el endpoint de lista`).
4. Los documentos de `docs/` van **antes** que el código: el primer commit de código debe ser posterior al commit de documentación.
5. Abra un **Pull Request hacia el `main` de su propio fork** (no hacia el repositorio original), con una descripción de lo hecho y el checklist de `docs/definition-of-done.md` marcado.
6. Pegue el **enlace del PR** en la actividad de Moodle (texto en línea) antes del cierre: sábado 10 de octubre de 2026, 11:59 p. m.

## Qué se evalúa (5,0)

| Parte | Puntos |
|---|---|
| 1. Documentar antes de codificar | 0,75 |
| 2. API Express | 1,0 |
| 3. App Ionic | 1,5 |
| 4. Kotlin | 0,5 |
| 5. Calidad | 0,5 |
| 6. Git y entrega | 0,25 |
| 7. Inglés | 0,5 |

El detalle de cada criterio está en [TODO.md](./TODO.md).

## Contrato de la API (resumen)

Recurso `/api/products` con `{ id: number, name: string, price: number, category: string, stock: integer }`. Los datos semilla están en `server/data/products.json` y se guardan en memoria (se reinician al reiniciar el servidor).

| Método y ruta | Éxito | Errores |
|---|---|---|
| `GET /api/products?search=&category=` | 200 + arreglo | — |
| `GET /api/products/:id` | 200 + objeto | 400 (id no numérico) · 404 |
| `POST /api/products` | 201 + objeto creado | 400 |
| `PUT /api/products/:id` | 200 + objeto actualizado | 400 · 404 |
| `DELETE /api/products/:id` | 204 sin cuerpo | 400 · 404 |

Validación: `name` obligatorio (máximo 60 caracteres), `price` número mayor que 0, `category` una de `Bebidas`, `Snacks`, `Aseo` o `Hogar`, y `stock` entero mayor o igual que 0. Todo error usa el formato `{ "error": "mensaje", "details": ["..."] }`; una ruta desconocida responde 404 con ese formato, y un error inesperado, 500.

## Estructura

```text
docs/                         plantillas del framework y documentos del proyecto
  features/ screens/ decisions/ api/ definition-of-done.md
kotlin/Product.kt             ejercicio Kotlin resuelto
server/
  app.js                      createApp(): las cinco rutas de la API + piezas ya dadas
  index.js                    arranque en el puerto 3000
  data/products.json          8 productos semilla
src/app/                      arranque, rutas y tema
src/features/products/        funcionalidad organizada por capas del framework
  data/                       config.ts (API_URL), api-error.ts (ApiError), products-api.ts (cliente fetch)
  domain/product.ts           tipos, formatCOP (dado), validateProduct, toProductView, filterProducts
  presentation/               páginas, EmptyState (dado, modelo de props tipadas), ProductCard y StockBadge
  __tests__/                  test-server.ts (helper dado), pruebas de ejemplo y pruebas del parcial
```

Capas (framework, `01-architecture/layers-and-state`): `presentation` depende de `domain` y de `data`; `data` depende de `domain`; `domain` no depende de nada. El estado de cada pantalla puede vivir en la misma página con `useState` y `useEffect`.

## Qué ya viene resuelto

Para concentrar el parcial en lo trabajado en clase, algunas piezas vienen hechas y con comentarios en español. Se usan y se explican (ADR-002 y la sección «API error handling»), pero no se piden escritas:

- **Servidor:** `express.json()`, `cors()`, `parseId()`, el manejador 404 de rutas desconocidas y el manejador central de errores (500), en `server/app.js`.
- **Cliente:** `API_URL` (`data/config.ts`), la clase `ApiError` y `getErrorMessage` (`data/api-error.ts`), y `getProducts` resuelta como ejemplo (con la función `request`) en `data/products-api.ts`.
- **Dominio:** `formatCOP()`.
- **Presentación:** `EmptyState` como modelo de componente con props tipadas; el esqueleto de la lista (carga con `useEffect` e `IonItem`/`IonLabel`) y el campo `IonInput` del formulario.
- **Pruebas:** el helper `startTestServer()` y un ejemplo de prueba de la API.

## Entrega: secciones de este README

Al terminar, agregue aquí abajo las dos secciones escritas en inglés (3 a 5 frases cada una) que indica la Parte 7 de [TODO.md](./TODO.md): **State management decision** y **API error handling**. También actualice este README con cualquier paso adicional necesario para ejecutar su versión.

## State management decision

Each screen keeps its own state with `useState`, loads its data with `useEffect`, and loads it again with `useIonViewWillEnter` when the user comes back to it. I chose this pattern because the app is small, the screens do not share data, and it is what we studied in class. Values that can be calculated, such as the "empty" and "no results" states, are not saved as state: they come from the products and the filters. If the app grows and several screens need the same data, the first step would be custom hooks, and the next one a store such as Context or Redux, recorded in a new ADR.

## API error handling

The API answers every error with the same format, `{ error, details }`, so the client can read all of them in the same way. The 404 handler from the starter answers when a route does not exist (the test with `PATCH /api/products/1` shows it), and the central error handler answers 500 when a route fails in an unexpected way. In the app, every failure becomes an `ApiError`: if `fetch` throws, it is a network error and its `status` is `null`; if the response is not successful, it keeps the status code and the `details` from the server. Then `getErrorMessage` turns the error into a clear message, for example "No encontramos ese producto." for a 404. The user sees an error state with a "Reintentar" or "Volver a la lista" button, and the form shows the server `details` above the fields.

---

Las plantillas de `docs/` provienen del Mobile Governance Framework (licencia MIT; ver `docs/LICENSE-mobile-governance-framework.txt`).
