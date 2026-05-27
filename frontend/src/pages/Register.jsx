import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import RegisterForm from '../components/RegisterForm'
import '../styles/Pages.css'

const Register = () => {
  const { register, isLoading, error } = useAuth()
  const navigate = useNavigate()

  const handleRegister = async (username, password) => {
    const result = await register(username, password)
    if (result.success) {
      navigate('/dashboard')
    }
  }

  return (
    <div className="page-container">
      <div className="auth-wrapper">
        <div className="auth-card">
          <h2>Создание аккаунта</h2>
          <RegisterForm
            onSubmit={handleRegister}
            isLoading={isLoading}
            error={error}
          />
          <p className="auth-link">
            Уже есть аккаунт? <Link to="/login">Войдите</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
