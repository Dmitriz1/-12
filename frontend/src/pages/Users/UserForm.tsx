import { useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './Users.module.css';

export function UserForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  return (
    <div>
      <h1 className={styles.title}>
        {isEdit ? 'Редактирование пользователя' : 'Новый пользователь'}
      </h1>
      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.card}>
          <Input id="user-name" label="Имя пользователя" placeholder="username" />
          <Button type="submit">Сохранить</Button>
        </div>
      </form>
    </div>
  );
}
