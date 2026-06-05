import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateCredentials } from '../utils/validation';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const { valid, errors: ve } = validateCredentials(username, password);
    if (password !== confirm) {
      ve.confirm = 'Пароли не совпадают';
    }
    if (!valid || ve.confirm) {
      setErrors(ve);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await register(username, password);
      navigate('/transactions');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h1>Регистрация</h1>
      <form onSubmit={handleSubmit} className="auth-form" aria-label="Форма регистрации">
        <Input
          id="reg-username"
          label="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errors.username}
          autoComplete="username"
        />
        <Input
          id="reg-password"
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="new-password"
        />
        <Input
          id="reg-confirm"
          label="Подтверждение пароля"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
          autoComplete="new-password"
        />
        {serverError && (
          <p role="alert" className="form__server-error">
            {serverError}
          </p>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </Button>
      </form>
      <p className="auth-switch">
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  );
}