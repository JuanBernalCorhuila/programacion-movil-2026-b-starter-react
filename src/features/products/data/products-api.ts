/**
 * Capa DATA: cliente HTTP de la API de productos (server/app.js).
 *
 * `request` y `getProducts` YA ESTÁN RESUELTOS como ejemplo del patrón. El resto de las
 * funciones se escribieron en la Parte 3 del TODO.md, replicando ese patrón.
 */
import type { Product, ProductInput } from '../domain/product';
import { ApiError } from './api-error';
import { API_URL } from './config';

// Header of the requests that send a JSON body (POST and PUT).
const JSON_HEADERS = { 'Content-Type': 'application/json' };

/**
 * YA DADO. Hace una petición a la API y devuelve el cuerpo JSON ya convertido.
 *  1. Si `fetch` lanza una excepción, la API no respondió: ApiError de red (status null).
 *  2. Si la respuesta no es exitosa (`!response.ok`), se lee el cuerpo `{ error, details }`
 *     y se lanza un ApiError con el código que devolvió el servidor.
 *  3. El 204 (DELETE) no trae cuerpo: se devuelve undefined.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new ApiError('No fue posible conectar con el servidor.', null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(body?.error ?? `Error ${response.status}`, response.status, body?.details ?? []);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export interface ProductQuery {
  search?: string;
  category?: string;
}

/** YA DADO (ejemplo): GET /api/products?search=&category= */
export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.category) params.set('category', query.category);
  const queryString = params.toString();
  return request<Product[]>(`/api/products${queryString ? `?${queryString}` : ''}`);
}

/** GET /api/products/:id: one product. It throws an ApiError 404 if it does not exist. */
export async function getProduct(id: number): Promise<Product> {
  return request<Product>(`/api/products/${id}`);
}

/** POST /api/products: creates a product and returns it with its new id. */
export async function createProduct(input: ProductInput): Promise<Product> {
  return request<Product>('/api/products', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

/** PUT /api/products/:id: updates a product and returns it. */
export async function updateProduct(id: number, input: ProductInput): Promise<Product> {
  return request<Product>(`/api/products/${id}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

/** DELETE /api/products/:id: deletes a product. The API answers 204, without body. */
export async function deleteProduct(id: number): Promise<void> {
  return request<void>(`/api/products/${id}`, { method: 'DELETE' });
}
