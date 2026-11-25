import { ButtonLink } from '../components/ui/ButtonLink';
import styles from './NotFound.module.css';

export function NotFound() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>404 — Страница не найдена</h1>
      <p className={styles.text}>Запрашиваемая страница не существует.</p>
      <ButtonLink to="/" variant="secondary">
        Вернуться на главную
      </ButtonLink>
    </div>
  );
}
