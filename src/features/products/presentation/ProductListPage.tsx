import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { getErrorMessage } from '../data/api-error';
import { getProducts } from '../data/products-api';
import { CATEGORIES, filterProducts, toProductView } from '../domain/product';
import type { Product } from '../domain/product';
import EmptyState from './EmptyState';
import ProductCard from './ProductCard';

/**
 * Pantalla: lista de productos (ruta /productos).
 *
 * El código de abajo es un EJEMPLO MÍNIMO YA DADO de cómo se carga una lista:
 *  - `useState` guarda los productos, el estado de la carga y el mensaje de error;
 *  - `useEffect` con `[]` carga la lista UNA vez, al abrir la pantalla;
 *  - `useIonViewWillEnter` la recarga cuando la persona VUELVE a esta pantalla (Ionic mantiene la
 *    página en memoria, así que sin esto no se vería, por ejemplo, un producto recién creado);
 *
 * What was added in Part 3 (see docs/screens/product-list.md):
 *  - a text search (`IonInput`) and a category filter with one `IonButton` per option; each one
 *    has its own state variable and the list is filtered in memory with `filterProducts()`;
 *  - the Empty state (the API has no products) and the No results state (the filters match
 *    nothing), both with `EmptyState`. They are not saved as state: they are calculated;
 *  - one `ProductCard` per product, built with `toProductView()`;
 *  - a tap on a product goes to /productos/:id (`useHistory`).
 * Para ver el estado de error, detenga el servidor (`npm run server`).
 */
type LoadStatus = 'loading' | 'ready' | 'error';

// Options of the category filter: "Todas" (an empty value means all) plus the four categories.
const CATEGORY_OPTIONS = [
  { label: 'Todas', value: '' },
  ...CATEGORIES.map((item) => ({ label: item, value: item })),
];

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const isLoadingRef = useRef(false);
  const history = useHistory();

  const loadProducts = useCallback(async () => {
    if (isLoadingRef.current) return; // evita pedir la lista dos veces a la vez
    isLoadingRef.current = true;
    setStatus('loading');
    try {
      setProducts(await getProducts());
      setStatus('ready');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setStatus('error');
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useIonViewWillEnter(() => {
    void loadProducts();
  });

  // Calculated on every render from the state; they are not saved as state.
  const visibleProducts = filterProducts(products, { search, category });
  const isEmpty = products.length === 0;
  const hasNoResults = !isEmpty && visibleProducts.length === 0;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Productos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {status === 'loading' && <p className="ion-padding">Cargando productos…</p>}
        {status === 'error' && (
          <EmptyState
            title="No se pudo cargar"
            message={errorMessage}
            actionLabel="Reintentar"
            onAction={() => void loadProducts()}
          />
        )}
        {status === 'ready' && (
          <>
            <div className="ion-padding">
              <IonInput
                label="Buscar"
                labelPlacement="floating"
                fill="outline"
                value={search}
                onIonInput={(event) => setSearch(String(event.detail.value ?? ''))}
              />
              <div className="ion-margin-top">
                {CATEGORY_OPTIONS.map((option) => (
                  <IonButton
                    key={option.label}
                    size="small"
                    fill={category === option.value ? 'solid' : 'outline'}
                    onClick={() => setCategory(option.value)}
                  >
                    {option.label}
                  </IonButton>
                ))}
              </div>
            </div>
            {isEmpty && <EmptyState title="No hay productos" />}
            {hasNoResults && <EmptyState title="No se encontraron resultados" />}
            {visibleProducts.length > 0 && (
              <IonList>
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={toProductView(product)}
                    onSelect={(id) => history.push(`/productos/${id}`)}
                  />
                ))}
              </IonList>
            )}
          </>
        )}
        <IonButton routerLink="/productos/nuevo" className="ion-margin">
          Nuevo producto
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default ProductListPage;
