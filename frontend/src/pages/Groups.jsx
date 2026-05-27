import { useState, useEffect } from 'react'
import { groupsAPI } from '../services/api'
import GroupForm from '../components/GroupForm'
import GroupList from '../components/GroupList'
import '../styles/Pages.css'

const Groups = () => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const response = await groupsAPI.getAll()
      setGroups(response.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true)
      await groupsAPI.create(formData)
      setShowForm(false)
      await fetchGroups()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту группу?')) return
    try {
      await groupsAPI.delete(id)
      await fetchGroups()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className="page-container">Загрузка...</div>

  return (
    <div className="page-container">
      <h1>Группы расходов</h1>
      
      {error && <div className="alert alert-error">{error}</div>}
      
      <button
        className="btn btn-primary"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Отмена' : '+ Создать группу'}
      </button>

      {showForm && (
        <div className="form-section">
          <GroupForm
            onSubmit={handleSubmit}
            isLoading={submitting}
            error={error}
          />
        </div>
      )}

      <GroupList
        groups={groups}
        onDelete={handleDelete}
        onEdit={() => {}} // TODO: Implement edit
      />
    </div>
  )
}

export default Groups
