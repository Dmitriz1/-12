import { ButtonLink } from '../../components/ui/ButtonLink';
import styles from './Users.module.css';

export function UsersList() {
  return (
    <div>
      <h1 className={styles.title}>Пользователи</h1>
      <div className={styles.card}>
        <p className={styles.text}>
          Здесь появится список пользователей. Раздел подготовлен по требованиям
          практического занятия; CRUD-эндпоинты пользователей будут добавлены
          на следующем занятии.
        </p>
        <ButtonLink to="/users/new">Добавить пользователя</ButtonLink>
      </div>
    </div>
  );
}
