import { useState, useEffect } from 'react'
import { transactionsAPI } from '../services/api'
import TransactionForm from '../components/TransactionForm'
import TransactionList from '../components/TransactionList'
import '../styles/Pages.css'

const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await transactionsAPI.getAll()
      setTransactions(response.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true)
      if (editingId) {
        await transactionsAPI.update(editingId, formData)
        setEditingId(null)
      } else {
        await transactionsAPI.create(formData)
      }
      setShowForm(false)
      await fetchTransactions()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту транзакцию?')) return
    try {
      await transactionsAPI.delete(id)
      await fetchTransactions()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (transaction) => {
    setEditingId(transaction.id)
    setShowForm(true)
  }

  if (loading) return <div className="page-container">Загрузка...</div>

  return (
    <div className="page-container">
      <h1>Транзакции</h1>
      
      {error && <div className="alert alert-error">{error}</div>}
      
      <button
        className="btn btn-primary"
        onClick={() => {
          setEditingId(null)
          setShowForm(!showForm)
        }}
      >
        {showForm ? 'Отмена' : '+ Добавить транзакцию'}
      </button>

      {showForm && (
        <div className="form-section">
          <TransactionForm
            onSubmit={handleSubmit}
            isLoading={submitting}
            error={error}
          />
        </div>
      )}

      <TransactionList
        transactions={transactions}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </div>
  )
}

export default Transactions
