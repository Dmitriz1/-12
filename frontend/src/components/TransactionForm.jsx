import { useState } from 'react'
import '../styles/Form.css'

const TransactionForm = ({ onSubmit, isLoading, error, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {
    description: '',
    amount: '',
    category: 'food',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
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
    if (formData.description && formData.amount) {
      onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <div className="form-error">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="description">Описание</label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="amount">Сумма</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Тип</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="expense">Расход</option>
            <option value="income">Доход</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">Категория</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="food">Еда</option>
            <option value="transport">Транспорт</option>
            <option value="entertainment">Развлечения</option>
            <option value="utilities">Коммунальные услуги</option>
            <option value="salary">Зарплата</option>
            <option value="other">Другое</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Дата</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={isLoading}
      >
        {isLoading ? 'Сохранение...' : 'Сохранить транзакцию'}
      </button>
    </form>
  )
}

export default TransactionForm
