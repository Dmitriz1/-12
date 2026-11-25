import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { validateCredentials } from '../../utils/validation';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import shared from '../../styles/shared.module.css';
import styles from '../Auth.module.css';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const { valid, errors: ve } = validateCredentials(username, password);
    if (!valid) {
      setErrors(ve);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await login(username, password);
      navigate('/transactions');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <h1 className={styles.title}>Вход</h1>
      <form onSubmit={handleSubmit} className={styles.form} aria-label="Форма входа">
        <Input
          id="login-username"
          label="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errors.username}
          autoComplete="username"
        />
        <Input
          id="login-password"
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="current-password"
        />
        {serverError && (
          <p role="alert" className={shared.serverError}>
            {serverError}
          </p>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </Button>
      </form>
      <p className={styles.switch}>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </div>
  );
}
