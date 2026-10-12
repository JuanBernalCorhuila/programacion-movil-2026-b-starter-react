import { describe, expect, it } from 'vitest';
import seedProducts from '../../../../server/data/products.json';
import {
  CATEGORIES,
  filterProducts,
  formatCOP,
  LOW_STOCK_THRESHOLD,
  toProductView,
  validateProduct,
} from '../domain/product';

/**
 * Pruebas unitarias de EJEMPLO (ya vienen dadas) para que `npm test` corra desde el inicio.
 * Muestran el estilo esperado: describe / it / expect, sin red ni pantallas.
 */
describe('datos semilla de la API (ejemplo)', () => {
  it('trae 8 productos con ids 1 a 8', () => {
    expect(seedProducts).toHaveLength(8);
    expect(seedProducts.map((item) => item.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('usa solo categorías permitidas y stock entero no negativo', () => {
    for (const item of seedProducts) {
      expect(CATEGORIES).toContain(item.category);
      expect(Number.isInteger(item.stock)).toBe(true);
      expect(item.stock).toBeGreaterThanOrEqual(0);
    }
  });

  it('incluye productos agotados y con pocas unidades para probar las etiquetas', () => {
    expect(seedProducts.some((item) => item.stock === 0)).toBe(true);
    expect(seedProducts.some((item) => item.stock > 0 && item.stock < LOW_STOCK_THRESHOLD)).toBe(true);
  });
});

describe('formatCOP (ejemplo)', () => {
  it('separa los miles con punto y antepone el signo de pesos', () => {
    expect(formatCOP(1250000)).toBe('$ 1.250.000');
    expect(formatCOP(8500)).toBe('$ 8.500');
    expect(formatCOP(950)).toBe('$ 950');
  });
});

/**
 * Unit tests of the exam (Part 5) for the three domain functions. They are the tests listed in
 * docs/features/productos.md. They do not use the network or the screens.
 */
describe('validateProduct', () => {
  it('rechaza un nombre vacío, un precio menor o igual que 0 y una categoría no permitida', () => {
    const result = validateProduct({ name: '   ', price: 0, category: 'Ropa', stock: 10 });

    expect(result.isValid).toBe(false);
    // The stock is valid, so there are only three messages: one for each invalid field.
    expect(result.errors).toEqual({
      name: 'El nombre es obligatorio.',
      price: 'El precio debe ser un número mayor que 0.',
      category: 'Seleccione una categoría.',
    });
  });

  it('acepta un producto con los cuatro campos correctos', () => {
    const result = validateProduct({
      name: 'Jugo de mango 1 L',
      price: 4500,
      category: 'Bebidas',
      stock: 0,
    });

    expect(result).toEqual({ isValid: true, errors: {} });
  });
});

describe('toProductView', () => {
  it('formatea el precio en pesos y marca «Agotado» y «Pocas unidades»', () => {
    const product = { id: 1, name: 'Agua mineral 600 ml', price: 1250000, category: 'Bebidas' };

    const outOfStock = toProductView({ ...product, stock: 0 });
    const lowStock = toProductView({ ...product, stock: LOW_STOCK_THRESHOLD - 1 });
    const available = toProductView({ ...product, stock: LOW_STOCK_THRESHOLD });

    expect(outOfStock.priceLabel).toBe('$ 1.250.000');
    expect(outOfStock.stockLabel).toBe('Agotado');
    expect(outOfStock.isOutOfStock).toBe(true);
    expect(lowStock.stockLabel).toBe('Pocas unidades');
    expect(lowStock.isLowStock).toBe(true);
    expect(available.stockLabel).toBe('Disponible');
    expect(available.isLowStock).toBe(false);
  });
});

describe('filterProducts', () => {
  it('filtra por texto sin distinguir mayúsculas y por categoría exacta', () => {
    const byText = filterProducts(seedProducts, { search: 'AGUA', category: '' });
    const byCategory = filterProducts(seedProducts, { search: '', category: 'Aseo' });
    const byWrongCase = filterProducts(seedProducts, { search: '', category: 'aseo' });
    const withoutFilters = filterProducts(seedProducts, { search: '   ', category: '' });

    expect(byText.map((item) => item.id)).toEqual([1]);
    expect(byCategory.map((item) => item.id)).toEqual([6, 7]);
    expect(byWrongCase).toEqual([]);
    expect(withoutFilters).toHaveLength(8);
  });
});
