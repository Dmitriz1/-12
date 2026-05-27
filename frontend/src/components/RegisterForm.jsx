import { useState } from 'react'
import '../styles/Form.css'

const RegisterForm = ({ onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  })

  const [validationError, setValidationError] = useState('')

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    setValidationError('')
  }

  const handleSubmit = e => {
    e.preventDefault()
    
    if (!formData.username || !formData.password) {
      setValidationError('Все поля обязательны')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Пароли не совпадают')
      return
    }

    if (formData.password.length < 6) {
      setValidationError('Пароль должна быть не менее 6 символов')
      return
    }

    onSubmit(formData.username, formData.password)
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <div className="form-error">{error}</div>}
      {validationError && <div className="form-error">{validationError}</div>}
      
      <div className="form-group">
        <label htmlFor="username">Пользователь</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Пароль</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Повторите пароль</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={isLoading}
      >
        {isLoading ? 'Регистрируюсь...' : 'Регистрация'}
      </button>
    </form>
  )
}

export default RegisterForm
