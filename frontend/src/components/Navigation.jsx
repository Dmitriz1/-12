import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Navigation.css'

const Navigation = () => {
  const { isAuthenticated, logout } = useAuth()

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Управление финансами
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Главная
            </Link>
          </li>
          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link">
                  Дашборд
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/transactions" className="nav-link">
                  Транзакции
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/groups" className="nav-link">
                  Группы
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/analytics" className="nav-link">
                  Аналитика
                </Link>
              </li>
              <li className="nav-item">
                <button onClick={logout} className="nav-link logout-btn">
                  Выход
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link">
                  Вход
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link">
                  Регистрация
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navigation
