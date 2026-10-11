import { IonBadge, IonItem, IonLabel } from '@ionic/react';

import type { ProductView } from '../domain/product';

export interface ProductCardProps {
  product: ProductView;
  /** Se invoca con el id del producto cuando la persona toca la tarjeta. */
  onSelect?: (id: number) => void;
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
 * Reusable card of one product (used in the list). It follows the model of `EmptyState.tsx`:
 * typed props, it only shows the data it receives, and it reports the tap with a function
 * (`onSelect`) without knowing where the app goes next.
 *
 * It shows the name, the category, the price and the stock label. The label always has its
 * text, so the stock status is never shown by color alone.
 */
const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => (
  <IonItem button detail onClick={() => onSelect?.(product.id)}>
    <IonLabel>
      <h2>{product.name}</h2>
      <p>{product.category}</p>
      <p>{product.priceLabel}</p>
    </IonLabel>
    <IonBadge slot="end" color={getStockColor(product)}>
      {product.stockLabel}
    </IonBadge>
  </IonItem>
);

export default ProductCard;
