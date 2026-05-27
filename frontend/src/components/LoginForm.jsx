import { useState } from 'react'
import '../styles/Form.css'

const LoginForm = ({ onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (formData.username && formData.password) {
      onSubmit(formData.username, formData.password)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <div className="form-error">{error}</div>}
      
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

      <button
        type="submit"
        className="btn btn-primary"
        disabled={isLoading}
      >
        {isLoading ? 'Входим...' : 'Войти'}
      </button>
    </form>
  )
}

export default LoginForm
