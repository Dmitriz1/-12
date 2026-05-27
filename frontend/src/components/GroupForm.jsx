import { useState } from 'react'
import '../styles/Form.css'

const GroupForm = ({ onSubmit, isLoading, error, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    description: '',
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
    if (formData.name) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <div className="form-error">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="name">Название группы</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isLoading}
          placeholder="например, Коммунальные расходы"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Описание</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="Необязательно: опишите цель этой группы"
          rows="3"
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={isLoading}
      >
        {isLoading ? 'Сохранение...' : 'Сохранить группу'}
      </button>
    </form>
  )
}

export default GroupForm
