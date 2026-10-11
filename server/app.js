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
 * QUÉ SE ESCRIBIÓ (Parte 2 del TODO.md): las cinco rutas de /api/products, con su
 * validación, sus filtros y sus funciones de apoyo.
 */
const express = require('express');
const cors = require('cors');
const seedProducts = require('./data/products.json');

// Categorías permitidas (la app usa la misma lista).
const CATEGORIES = ['Bebidas', 'Snacks', 'Aseo', 'Hogar'];

// Maximum length of the product name (the app uses the same value).
const NAME_MAX_LENGTH = 60;

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

// Answers 400 when the body does not pass the validation.
function sendInvalidData(res, details) {
  return res.status(400).json({ error: 'Datos inválidos', details });
}

// Checks the body of POST and PUT. It checks the four fields and returns one message for
// each problem. An empty array means that the body is valid.
function validateProductBody(body) {
  const { name, price, category, stock } = body;
  const details = [];

  if (typeof name !== 'string' || name.trim() === '') {
    details.push('name es obligatorio');
  } else if (name.trim().length > NAME_MAX_LENGTH) {
    details.push(`name debe tener máximo ${NAME_MAX_LENGTH} caracteres`);
  }

  if (typeof price !== 'number' || price <= 0) {
    details.push('price debe ser un número mayor que 0');
  }

  if (!CATEGORIES.includes(category)) {
    details.push(`category debe ser una de: ${CATEGORIES.join(', ')}`);
  }

  if (!Number.isInteger(stock) || stock < 0) {
    details.push('stock debe ser un entero mayor o igual que 0');
  }

  return details;
}

// Keeps only the four fields of a product, with the name trimmed. Other fields of the body
// are ignored, including `id`.
function pickProductFields(body) {
  return {
    name: body.name.trim(),
    price: body.price,
    category: body.category,
    stock: body.stock,
  };
}

function createApp() {
  const app = express();

  // YA DADO: CORS para el origen de desarrollo de la app y lectura del cuerpo JSON.
  app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
  app.use(express.json());

  // Almacenamiento en memoria: copia de la semilla (se reinicia con el servidor).
  const products = seedProducts.map((item) => ({ ...item }));

  // Counter for the next id. It starts after the highest id of the seed data (9), and an id
  // is never used again after a delete.
  let nextId = Math.max(...products.map((item) => item.id)) + 1;

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

  // POST /api/products: creates a product. 201 with the new product, 400 if the body is not valid.
  app.post('/api/products', (req, res) => {
    const body = req.body ?? {}; // a request without body counts as an empty object
    const details = validateProductBody(body);
    if (details.length > 0) return sendInvalidData(res, details);

    const product = { id: nextId, ...pickProductFields(body) };
    nextId += 1;
    products.push(product);

    return res.status(201).json(product);
  });

  // PUT /api/products/:id: updates a product. It checks the id, then that the product exists,
  // then the body. 200 with the updated product, 400 or 404 on error.
  app.put('/api/products/:id', (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) return sendInvalidId(res);

    const index = products.findIndex((item) => item.id === id);
    if (index === -1) return sendNotFound(res, id);

    const body = req.body ?? {};
    const details = validateProductBody(body);
    if (details.length > 0) return sendInvalidData(res, details);

    products[index] = { id, ...pickProductFields(body) };

    return res.json(products[index]);
  });

  // DELETE /api/products/:id: deletes a product. 204 without body, 400 or 404 on error.
  app.delete('/api/products/:id', (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) return sendInvalidId(res);

    const index = products.findIndex((item) => item.id === id);
    if (index === -1) return sendNotFound(res, id);

    products.splice(index, 1);

    return res.status(204).end();
  });

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
