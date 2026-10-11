/**
 * API de productos (Express).
 *
 * `createApp()` construye y devuelve la aplicación SIN ponerla a escuchar:
 *  - `server/index.js` la pone a escuchar en el puerto 3000 (`npm run server`);
 *  - las pruebas la levantan con `app.listen(0)` (puerto libre) y llaman con `fetch`
 *    (ver el helper `startTestServer()` en src/features/products/__tests__/test-server.ts).
 *
 * Contrato (el detalle se documenta en docs/api/products-endpoints.md, Parte 1):
 *   GET    /api/products?search=&category=   200 + arreglo
 *   GET    /api/products/:id                 200 | 400 | 404
 *   POST   /api/products                     201 | 400
 *   PUT    /api/products/:id                 200 | 400 | 404
 *   DELETE /api/products/:id                 204 | 400 | 404
 * Formato de error uniforme: { "error": "mensaje", "details": ["..."] }
 *
 * QUÉ YA VIENE HECHO (no se pide escribirlo, pero sí entenderlo y explicarlo en el ADR-002
 * y en la sección «API error handling» del README):
 *   - express.json(): convierte el cuerpo JSON en `req.body`.
 *   - cors(): permite que la app (puerto 5173) llame a la API (puerto 3000).
 *   - parseId(): convierte el parámetro `:id` en número, o devuelve null si no es numérico.
 *   - Manejador 404 (ruta desconocida) y manejador de errores central (500).
 *
 * QUÉ SE ESCRIBE (Parte 2 del TODO.md): las cinco rutas de /api/products. Hoy responden
 * 501 (stub) y deben reemplazarse por la lógica real.
 */
const express = require('express');
const cors = require('cors');
const seedProducts = require('./data/products.json');

// Categorías permitidas (la app usa la misma lista).
const CATEGORIES = ['Bebidas', 'Snacks', 'Aseo', 'Hogar'];

/**
 * YA DADO. Convierte el texto de `:id` en número.
 * Devuelve null si no son solo dígitos ("abc", "1.5", "-2"): la ruta responde 400 en ese caso.
 */
function parseId(rawId) {
  return /^\d+$/.test(rawId) ? Number(rawId) : null;
}

// Answers 400 when the :id of the route is not numeric.
function sendInvalidId(res) {
  return res.status(400).json({ error: 'Id inválido', details: ['El id debe ser numérico'] });
}

// Answers 404 when no product has that id.
function sendNotFound(res, id) {
  return res.status(404).json({
    error: 'Producto no encontrado',
    details: [`No existe un producto con id ${id}`],
  });
}

function createApp() {
  const app = express();

  // YA DADO: CORS para el origen de desarrollo de la app y lectura del cuerpo JSON.
  app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
  app.use(express.json());

  // Almacenamiento en memoria: copia de la semilla (se reinicia con el servidor).
  // TODO(Parte 2): úselo en las rutas de abajo y lleve la cuenta del siguiente id.
  const products = seedProducts.map((item) => ({ ...item }));
  void CATEGORIES;

  const notImplemented = (_req, res) => {
    res.status(501).json({ error: 'Not implemented' });
  };

  // GET /api/products: the list, with two optional filters that arrive in `req.query`.
  app.get('/api/products', (req, res) => {
    const { search, category } = req.query;
    let result = products;

    // search: the name contains the text, without case sensitivity. An empty text does not filter.
    if (typeof search === 'string' && search.trim() !== '') {
      const text = search.trim().toLowerCase();
      result = result.filter((product) => product.name.toLowerCase().includes(text));
    }

    // category: exact match. An empty value does not filter.
    if (typeof category === 'string' && category !== '') {
      result = result.filter((product) => product.category === category);
    }

    res.json(result);
  });

  // GET /api/products/:id: one product. 400 if the id is not numeric, 404 if it does not exist.
  app.get('/api/products/:id', (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) return sendInvalidId(res);

    const product = products.find((item) => item.id === id);
    if (!product) return sendNotFound(res, id);

    return res.json(product);
  });

  // TODO(Parte 2): POST /api/products → 201 con el producto creado | 400 con { error, details[] }.
  //   Patrón de validación:  const details = [];  if (...) details.push('mensaje');
  app.post('/api/products', notImplemented);
  // TODO(Parte 2): PUT /api/products/:id → 200 con el producto actualizado | 400 | 404.
  app.put('/api/products/:id', notImplemented);
  // TODO(Parte 2): DELETE /api/products/:id → 204 sin cuerpo (res.status(204).end()) | 400 | 404.
  app.delete('/api/products/:id', notImplemented);

  // YA DADO: ruta desconocida → 404 con el formato de error uniforme.
  app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada', details: [`${req.method} ${req.originalUrl}`] });
  });

  // YA DADO: manejador de errores central (se reconoce por tener CUATRO parámetros).
  // Express lo ejecuta cuando una ruta lanza una excepción o llama a next(error).
  // eslint-disable-next-line no-unused-vars -- Express exige los 4 parámetros para reconocerlo.
  app.use((err, _req, res, _next) => {
    if (err && err.type === 'entity.parse.failed') {
      // JSON malformado en el cuerpo: es un error de quien llama, no del servidor.
      return res.status(400).json({ error: 'El cuerpo no es un JSON válido', details: [] });
    }
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor', details: [] });
  });

  return app;
}

module.exports = { createApp, CATEGORIES, parseId };
