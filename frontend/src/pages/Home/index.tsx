import { useAuth } from '../../hooks/useAuth';
import { ButtonLink } from '../../components/ui/ButtonLink';
import styles from './Home.module.css';

export function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.home}>
      <h1 className={styles.title}>💰 Finance Manager</h1>
      <p className={styles.subtitle}>
        Учёт доходов и расходов, аналитика и персональные AI-рекомендации
      </p>
      <div className={styles.actions}>
        {isAuthenticated ? (
          <ButtonLink to="/transactions">Перейти к транзакциям</ButtonLink>
        ) : (
          <>
            <ButtonLink to="/login">Войти</ButtonLink>
            <ButtonLink to="/register" variant="ghost">
              Регистрация
            </ButtonLink>
          </>
        )}
      </div>
    </div>
  );
}
