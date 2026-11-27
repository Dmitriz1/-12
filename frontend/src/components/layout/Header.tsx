import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import styles from './Header.module.css';

export function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.brand}>
        💰 Finance Manager
      </Link>
      <div className={styles.links}>
        <Link to="/">Главная</Link>
        {isAuthenticated && (
          <>
            <Link to="/transactions">Транзакции</Link>
            <Link to="/analytics">Аналитика</Link>
            <Link to="/groups">Группы</Link>
            <Link to="/users">Пользователи</Link>
            <Button variant="ghost" onClick={handleLogout}>
              Выйти
            </Button>
          </>
        )}
        {!isAuthenticated && <Link to="/login">Войти</Link>}
      </div>
    </nav>
  );
}
