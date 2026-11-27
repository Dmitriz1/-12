import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { transactionsApi } from '../../api/transactions';
import { useNotification } from '../../components/Notification/NotificationContext';
import { TransactionForm } from '../../components/transactions/TransactionForm';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { Spinner } from '../../components/ui/Spinner';
import shared from '../../styles/shared.module.css';
import {
  handleApiError,
  isRequestCancelled,
  toFormSubmitError,
} from '../../utils/apiErrorHandler';
import type { TransactionCreate } from '../../types';
import styles from './Transactions.module.css';

/** Страница создания/редактирования: режим определяется параметром :id в URL. */
export function TransactionFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = id !== undefined;
  const navigate = useNavigate();
  const showNotification = useNotification();

  const [initial, setInitial] = useState<TransactionCreate | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;
    const txId = Number(id);
    if (!Number.isInteger(txId)) {
      setLoadError('Некорректный идентификатор транзакции');
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    transactionsApi
      .getById(txId, controller.signal)
      .then(({ title, type, category, amount }) => {
        setInitial({ title, type, category, amount });
      })
      .catch((err) => {
        if (isRequestCancelled(err)) return;
        setLoadError(handleApiError(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, isEdit]);

  async function handleSubmit(data: TransactionCreate) {
    try {
      if (isEdit) {
        await transactionsApi.update(Number(id), data);
        showNotification('Транзакция обновлена', 'success');
      } else {
        await transactionsApi.create(data);
        showNotification('Транзакция создана', 'success');
      }
    } catch (err) {
      const formError = toFormSubmitError(err);
      showNotification(formError.message, 'error');
      throw formError;
    }
    navigate('/transactions');
  }

  return (
    <div>
      <div className={shared.pageHeader}>
        <h1>{isEdit ? 'Редактировать транзакцию' : 'Новая транзакция'}</h1>
        <ButtonLink to="/transactions" variant="secondary">
          К списку
        </ButtonLink>
      </div>

      <section className={`${styles.panel} ${styles.formPanel}`}>
        {loading && <Spinner />}
        {loadError && (
          <p role="alert" className={shared.serverError}>
            {loadError}
          </p>
        )}
        {!loading && !loadError && (
          <TransactionForm
            onSubmit={handleSubmit}
            initialValues={initial ?? undefined}
            submitLabel={isEdit ? 'Сохранить' : 'Добавить'}
            resetOnSuccess={false}
          />
        )}
      </section>
    </div>
  );
}
