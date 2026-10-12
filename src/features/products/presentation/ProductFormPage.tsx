import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { ApiError, getErrorMessage } from '../data/api-error';
import { createProduct, getProduct, updateProduct } from '../data/products-api';
import { CATEGORIES, validateProduct } from '../domain/product';
import type { ProductField, ProductInput } from '../domain/product';
import EmptyState from './EmptyState';

/**
 * Pantalla: formulario de producto. La misma pantalla sirve para dos rutas:
 *  - /productos/nuevo          → crear (no hay `id` en la ruta)
 *  - /productos/:id/editar     → editar (hay `id`; precargar los campos con `getProduct`)
 *
 * El campo «Nombre» de abajo es un EJEMPLO YA DADO de campo controlado: el valor vive en una
 * variable de estado (`useState`) y `onIonInput` la actualiza cada vez que la persona escribe.
 *
 * What was built in Part 3 (see docs/screens/product-form.md):
 *  - the fields "Precio" and "Stock", and one `IonButton` per category with a state variable;
 *  - inline validation with `validateProduct()` when the user taps "Guardar": each message
 *    appears next to its field and nothing is sent to the API;
 *  - `createProduct` or `updateProduct`; if the server rejects the data, its message and its
 *    `details` appear above the fields and the form keeps the data;
 *  - in edit mode, the product is loaded with the same pattern as the other screens (ADR-001).
 */
type LoadStatus = 'loading' | 'ready' | 'error';

// The number fields keep text. An empty field becomes NaN, so `validateProduct` rejects it.
function toNumber(value: string): number {
  return value.trim() === '' ? NaN : Number(value);
}

const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = id !== undefined;
  const productId = Number(id);
  const history = useHistory();

  const [status, setStatus] = useState<LoadStatus>('ready');
  const [errorMessage, setErrorMessage] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [errors, setErrors] = useState<Partial<Record<ProductField, string>>>({});
  const [saveError, setSaveError] = useState('');
  const [saveDetails, setSaveDetails] = useState<string[]>([]);
  const isLoadingRef = useRef(false);

  // Create mode: empty fields. Edit mode: the fields are filled with the product of the API.
  // Ionic keeps the page in memory, so this also runs when the user comes back to the form.
  const loadForm = useCallback(async () => {
    setErrors({});
    setSaveError('');
    setSaveDetails([]);

    if (!isEditing) {
      setName('');
      setPrice('');
      setCategory('');
      setStock('');
      setStatus('ready');
      return;
    }

    if (isLoadingRef.current) return; // avoids asking for the product twice at the same time
    isLoadingRef.current = true;
    setStatus('loading');
    try {
      const product = await getProduct(productId);
      setName(product.name);
      setPrice(String(product.price));
      setCategory(product.category);
      setStock(String(product.stock));
      setStatus('ready');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setStatus('error');
    } finally {
      isLoadingRef.current = false;
    }
  }, [isEditing, productId]);

  useEffect(() => {
    void loadForm();
  }, [loadForm]);

  useIonViewWillEnter(() => {
    void loadForm();
  });

  const goToList = () => history.push('/productos');

  const save = async () => {
    const input: ProductInput = {
      name: name.trim(),
      price: toNumber(price),
      category,
      stock: toNumber(stock),
    };

    // Inline validation: if a field is invalid, nothing is sent to the API.
    const result = validateProduct(input);
    setErrors(result.errors);
    if (!result.isValid) return;

    setSaveError('');
    setSaveDetails([]);
    try {
      if (isEditing) {
        await updateProduct(productId, input);
      } else {
        await createProduct(input);
      }
      goToList();
    } catch (error) {
      // The server rejected the data or did not answer: the form keeps the data.
      setSaveError(getErrorMessage(error));
      setSaveDetails(error instanceof ApiError ? error.details : []);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/productos" />
          </IonButtons>
          <IonTitle>{isEditing ? 'Editar producto' : 'Nuevo producto'}</IonTitle>
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
        {status === 'ready' && (
          <>
            {saveError && (
              <IonText color="danger">
                <p>{saveError}</p>
                {saveDetails.length > 0 && (
                  <ul>
                    {saveDetails.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                )}
              </IonText>
            )}

            <IonInput
              label="Nombre"
              labelPlacement="floating"
              fill="outline"
              value={name}
              onIonInput={(event) => setName(String(event.detail.value ?? ''))}
            />
            {errors.name && (
              <IonText color="danger">
                <p>{errors.name}</p>
              </IonText>
            )}

            <IonInput
              className="ion-margin-top"
              label="Precio"
              labelPlacement="floating"
              fill="outline"
              type="number"
              value={price}
              onIonInput={(event) => setPrice(String(event.detail.value ?? ''))}
            />
            {errors.price && (
              <IonText color="danger">
                <p>{errors.price}</p>
              </IonText>
            )}

            <IonInput
              className="ion-margin-top"
              label="Stock"
              labelPlacement="floating"
              fill="outline"
              type="number"
              value={stock}
              onIonInput={(event) => setStock(String(event.detail.value ?? ''))}
            />
            {errors.stock && (
              <IonText color="danger">
                <p>{errors.stock}</p>
              </IonText>
            )}

            <p>Categoría</p>
            {CATEGORIES.map((item) => (
              <IonButton
                key={item}
                size="small"
                fill={category === item ? 'solid' : 'outline'}
                onClick={() => setCategory(item)}
              >
                {item}
              </IonButton>
            ))}
            {errors.category && (
              <IonText color="danger">
                <p>{errors.category}</p>
              </IonText>
            )}

            <IonButton expand="block" className="ion-margin-top" onClick={() => void save()}>
              Guardar
            </IonButton>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductFormPage;
