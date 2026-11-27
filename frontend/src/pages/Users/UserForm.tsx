import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usersApi } from '../../api/users';
import { extractErrorMessage } from '../../api/client';
import { validateUser } from '../../utils/validation';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import shared from '../../styles/shared.module.css';
import styles from './Users.module.css';

export function UserForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = id !== undefined;
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      return;
    }
    let active = true;
    usersApi
      .getById(Number(id))
      .then(({ data }) => {
        if (active) {
          setUsername(data.username);
        }
      })
      .catch((err) => {
        if (active) {
          setServerError(extractErrorMessage(err));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id, isEdit]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const payload = {
      username: username.trim(),
      ...(password ? { password } : {}),
    };
    const validation = validateUser(payload, { passwordRequired: !isEdit });
    setErrors(validation.errors);
    if (!validation.valid) {
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await usersApi.update(Number(id), payload);
      } else {
        await usersApi.create({ username: payload.username, password });
      }
      navigate('/users');
    } catch (err) {
      setServerError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <h1 className={styles.title}>
        {isEdit ? 'Редактирование пользователя' : 'Новый пользователь'}
      </h1>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} noValidate>
          <Input
            id="username"
            label="Имя пользователя"
            value={username}
            error={errors.username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            id="password"
            type="password"
            label="Пароль"
            value={password}
            error={errors.password}
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
          />
          {isEdit && (
            <p className={styles.hint}>
              Оставьте поле пустым, чтобы не менять пароль
            </p>
          )}

          {serverError && (
            <p role="alert" className={shared.serverError}>
              {serverError}
            </p>
          )}

          <div className={styles.formActions}>
            <Button type="submit" disabled={saving}>
              {saving ? 'Сохранение…' : 'Сохранить'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/users')}
            >
              Отмена
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
