import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { getErrorMessage } from '../data/api-error';
import { deleteProduct, getProduct } from '../data/products-api';
import { toProductView } from '../domain/product';
import type { Product } from '../domain/product';
import EmptyState from './EmptyState';
import StockBadge from './StockBadge';

/**
 * Pantalla: detalle de un producto (ruta /productos/:id).
 *
 * `useParams` lee el `:id` de la ruta; llega como TEXTO, así que se convierte con `Number(id)`.
 *
 * What was built in Part 3 (see docs/screens/product-detail.md):
 *  - the product is loaded with `getProduct`, with the same pattern as the list: `useState` for
 *    the state, `useEffect` for the first load and `useIonViewWillEnter` to load it again when
 *    the user comes back (ADR-001);
 *  - Loading and Error states; "not found" arrives as an ApiError 404 and `getErrorMessage`
 *    turns it into "No encontramos ese producto.";
 *  - the "Editar" button, and the "Eliminar" button with a simple confirmation on the screen
 *    (`isConfirmingDelete`); after the delete the app goes back to the list.
 */
type LoadStatus = 'loading' | 'ready' | 'error';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const history = useHistory();

  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const isLoadingRef = useRef(false);

  const loadProduct = useCallback(async () => {
    if (isLoadingRef.current) return; // avoids asking for the product twice at the same time
    isLoadingRef.current = true;
    setStatus('loading');
    setIsConfirmingDelete(false);
    try {
      setProduct(await getProduct(productId));
      setStatus('ready');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setStatus('error');
    } finally {
      isLoadingRef.current = false;
    }
  }, [productId]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  useIonViewWillEnter(() => {
    void loadProduct();
  });

  const goToList = () => history.push('/productos');

  const confirmDelete = async () => {
    try {
      await deleteProduct(productId);
      goToList();
    } catch (error) {
      // If the delete fails, the screen shows the Error state with the message.
      setErrorMessage(getErrorMessage(error));
      setStatus('error');
    } finally {
      setIsConfirmingDelete(false);
    }
  };

  const view = product ? toProductView(product) : null;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/productos" />
          </IonButtons>
          <IonTitle>Detalle del producto</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {status === 'loading' && <p>Cargando producto…</p>}
        {status === 'error' && (
          <EmptyState
            title="No se pudo cargar"
            message={errorMessage}
            actionLabel="Volver a la lista"
            onAction={goToList}
          />
        )}
        {status === 'ready' && view && (
          <>
            <IonList>
              <IonItem>
                <IonLabel>
                  <p>Nombre</p>
                  <h2>{view.name}</h2>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <p>Categoría</p>
                  <h2>{view.category}</h2>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <p>Precio</p>
                  <h2>{view.priceLabel}</h2>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <p>Stock</p>
                  <h2>{view.stock}</h2>
                </IonLabel>
                <StockBadge product={view} slot="end" />
              </IonItem>
            </IonList>

            {isConfirmingDelete ? (
              <div className="ion-margin-top">
                <IonText>
                  <p>¿Eliminar este producto?</p>
                </IonText>
                <IonButton color="danger" onClick={() => void confirmDelete()}>
                  Confirmar
                </IonButton>
                <IonButton fill="outline" onClick={() => setIsConfirmingDelete(false)}>
                  Cancelar
                </IonButton>
              </div>
            ) : (
              <div className="ion-margin-top">
                <IonButton routerLink={`/productos/${productId}/editar`}>Editar</IonButton>
                <IonButton color="danger" fill="outline" onClick={() => setIsConfirmingDelete(true)}>
                  Eliminar
                </IonButton>
              </div>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductDetailPage;
