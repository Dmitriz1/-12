import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoginForm from '../components/LoginForm'
import '../styles/Pages.css'

const Login = () => {
  const { login, isLoading, error } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (username, password) => {
    const result = await login(username, password)
    if (result.success) {
      navigate('/dashboard')
    }
  }

  return (
    <div className="page-container">
      <div className="auth-wrapper">
        <div className="auth-card">
          <h2>Вход в систему</h2>
          <LoginForm
            onSubmit={handleLogin}
            isLoading={isLoading}
            error={error}
          />
          <p className="auth-link">
            Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
