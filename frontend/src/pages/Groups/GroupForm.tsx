import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { groupsApi } from '../../api/groups';
import { useNotification } from '../../components/Notification/NotificationContext';
import { Button } from '../../components/ui/Button';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import shared from '../../styles/shared.module.css';
import {
  handleApiError,
  isRequestCancelled,
  toFormSubmitError,
} from '../../utils/apiErrorHandler';
import { validateGroup } from '../../utils/validation';
import styles from './Groups.module.css';

/** Форма группы: режим создания/редактирования определяется параметром :id в URL. */
export function GroupForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = id !== undefined;
  const navigate = useNavigate();
  const showNotification = useNotification();

  const [name, setName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingGroup, setLoadingGroup] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Загрузка данных при редактировании
  useEffect(() => {
    if (!isEdit) return;
    const groupId = Number(id);
    if (!Number.isInteger(groupId)) {
      setLoadError('Некорректный идентификатор группы');
      setLoadingGroup(false);
      return;
    }
    const controller = new AbortController();
    setLoadingGroup(true);
    groupsApi
      .getById(groupId, controller.signal)
      .then((group) => setName(group.name))
      .catch((err) => {
        if (isRequestCancelled(err)) return;
        setLoadError(handleApiError(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingGroup(false);
      });
    return () => controller.abort();
  }, [id, isEdit]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Клиентская валидация
    const { valid, errors: validationErrors } = validateGroup({ name });
    if (!valid) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    try {
      setLoading(true);
      if (isEdit) {
        await groupsApi.update(Number(id), { name: name.trim() });
        showNotification('Группа обновлена', 'success');
      } else {
        await groupsApi.create({ name: name.trim() });
        showNotification('Группа создана', 'success');
      }
      navigate('/groups');
    } catch (err) {
      const formError = toFormSubmitError(err);
      setErrors({ general: formError.message, ...formError.fieldErrors });
      showNotification(formError.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className={shared.pageHeader}>
        <h1>{isEdit ? 'Редактировать группу' : 'Создать группу'}</h1>
        <ButtonLink to="/groups" variant="secondary">
          К списку
        </ButtonLink>
      </div>

      <section className={`${styles.panel} ${styles.formPanel}`}>
        {loadingGroup && <Spinner />}
        {loadError && (
          <p role="alert" className={shared.serverError}>
            {loadError}
          </p>
        )}
        {!loadingGroup && !loadError && (
          <form onSubmit={handleSubmit} aria-label="Форма группы" noValidate>
            {errors.general && (
              <p role="alert" className={shared.serverError}>
                {errors.general}
              </p>
            )}
            <Input
              id="group-name"
              label="Название"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              placeholder="Например: Семья"
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
            </Button>
          </form>
        )}
      </section>
    </div>
  );
}
