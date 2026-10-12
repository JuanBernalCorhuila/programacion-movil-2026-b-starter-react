import { IonItem, IonLabel } from '@ionic/react';

import type { ProductView } from '../domain/product';
import StockBadge from './StockBadge';

export interface ProductCardProps {
  product: ProductView;
  /** Se invoca con el id del producto cuando la persona toca la tarjeta. */
  onSelect?: (id: number) => void;
}

/**
 * Reusable card of one product (used in the list). It follows the model of `EmptyState.tsx`:
 * typed props, it only shows the data it receives, and it reports the tap with a function
 * (`onSelect`) without knowing where the app goes next.
 *
 * It shows the name, the category, the price and the stock label (`StockBadge`).
 */
const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => (
  <IonItem button detail onClick={() => onSelect?.(product.id)}>
    <IonLabel>
      <h2>{product.name}</h2>
      <p>{product.category}</p>
      <p>{product.priceLabel}</p>
    </IonLabel>
    <StockBadge product={product} slot="end" />
  </IonItem>
);

export default ProductCard;
