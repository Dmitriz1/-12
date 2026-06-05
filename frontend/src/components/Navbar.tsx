import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">
        💰 Finance Manager
      </Link>
      <div className="navbar__links">
        <Link to="/">Главная</Link>
        {isAuthenticated && (
          <>
            <Link to="/transactions">Транзакции</Link>
            <Link to="/analytics">Аналитика</Link>
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