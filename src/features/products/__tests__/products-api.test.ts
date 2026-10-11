// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { startTestServer } from './test-server';

/**
 * Prueba de la API de EJEMPLO (ya viene dada). Patrón que se espera en las pruebas de la API:
 *  1. `startTestServer()` levanta la API en un puerto libre antes de cada prueba.
 *  2. `fetch` (el de Node, sin dependencias extra) llama a la API como lo haría la app.
 *  3. Se comprueba el código de estado y el cuerpo.
 *  4. `close()` cierra el servidor al terminar.
 */
let baseUrl = '';
let close: () => Promise<void>;

beforeEach(async () => {
  ({ baseUrl, close } = await startTestServer());
});

afterEach(async () => {
  await close();
});

describe('API de productos (ejemplo)', () => {
  it('arranca y responde 404 con el formato de error en una ruta desconocida', async () => {
    const response = await fetch(`${baseUrl}/api/no-existe`);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: expect.any(String), details: expect.any(Array) });
  });
});

/**
 * API tests of the exam (Part 5). They follow the same pattern as the example above and they
 * are the tests listed in docs/features/productos.md.
 */
describe('POST /api/products', () => {
  it('responde 400 con { error, details } cuando los datos no validan', async () => {
    const response = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', price: 0, category: 'Ropa', stock: -1 }),
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Datos inválidos');
    // The four fields are wrong, so the API returns one message for each of them.
    expect(body.details).toEqual([
      'name es obligatorio',
      'price debe ser un número mayor que 0',
      'category debe ser una de: Bebidas, Snacks, Aseo, Hogar',
      'stock debe ser un entero mayor o igual que 0',
    ]);
  });
});

describe('GET /api/products/:id', () => {
  it('responde 404 cuando el producto no existe', async () => {
    const response = await fetch(`${baseUrl}/api/products/99`);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({
      error: 'Producto no encontrado',
      details: ['No existe un producto con id 99'],
    });
  });
});

describe('manejador 404 que viene en el starter', () => {
  it('responde 404 con «Ruta no encontrada» cuando la API no ofrece ese método', async () => {
    // The route /api/products/1 exists for GET, PUT and DELETE, but not for PATCH. No route
    // answers, so the request reaches the 404 handler at the end of createApp().
    const response = await fetch(`${baseUrl}/api/products/1`, { method: 'PATCH' });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: 'Ruta no encontrada', details: ['PATCH /api/products/1'] });
  });
});
