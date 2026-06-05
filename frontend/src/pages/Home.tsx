import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home">
      <h1>💰 Finance Manager</h1>
      <p className="home__subtitle">
        Учёт доходов и расходов, аналитика и персональные AI-рекомендации
      </p>
      <div className="home__actions">
        {isAuthenticated ? (
          <Link to="/transactions" className="btn btn--primary">
            Перейти к транзакциям
          </Link>
        ) : (
          <>
            <Link to="/login" className="btn btn--primary">
              Войти
            </Link>
            <Link to="/register" className="btn btn--ghost">
              Регистрация
            </Link>
          </>
        )}
      </div>
    </div>
  );
}