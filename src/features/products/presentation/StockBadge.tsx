import { IonBadge } from '@ionic/react';

import type { ProductView } from '../domain/product';

export interface StockBadgeProps {
  /** Product already prepared with `toProductView`. */
  product: ProductView;
  /** Optional Ionic slot, for example "end" to place the badge at the right of an `IonItem`. */
  slot?: string;
}

/**
 * Ionic color of the stock label: `danger` for "Agotado" and `warning` for "Pocas unidades".
 * "Disponible" uses `medium`, a neutral gray, so it is not highlighted.
 */
function getStockColor(product: ProductView): string {
  if (product.isOutOfStock) return 'danger';
  if (product.isLowStock) return 'warning';
  return 'medium';
}

/**
 * Stock label of a product, shared by `ProductCard` and the detail screen, so the colors are
 * defined in one place. The label always shows its text, so the stock status is never shown by
 * color alone.
 */
const StockBadge: React.FC<StockBadgeProps> = ({ product, slot }) => (
  <IonBadge slot={slot} color={getStockColor(product)}>
    {product.stockLabel}
  </IonBadge>
);

export default StockBadge;
