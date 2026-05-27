import { useState, useEffect } from 'react'
import { transactionsAPI, analyticsAPI } from '../services/api'
import '../styles/Pages.css'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentTransactions, setRecentTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const [statsRes, txRes] = await Promise.all([
          analyticsAPI.getOverview(),
          transactionsAPI.getAll(5, 0),
        ])
        setStats(statsRes.data)
        setRecentTransactions(txRes.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) return <div className="page-container">Загрузка...</div>
  if (error) return <div className="page-container error">{error}</div>

  return (
    <div className="page-container">
      <h1>Дашборд</h1>
      
      {stats && (
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Доходы</h3>
            <p className="stat-value income">+${stats.total_income?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="stat-card">
            <h3>Расходы</h3>
            <p className="stat-value expense">-${stats.total_expenses?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="stat-card">
            <h3>Баланс</h3>
            <p className={`stat-value ${(stats.balance || 0) >= 0 ? 'income' : 'expense'}`}>
              ${(stats.balance || 0).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <div className="dashboard-section">
        <h2>Последние транзакции</h2>
        {recentTransactions.length > 0 ? (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Описание</th>
                <th>Категория</th>
                <th>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map(tx => (
                <tr key={tx.id}>
                  <td>{new Date(tx.date).toLocaleDateString()}</td>
                  <td>{tx.description}</td>
                  <td>{tx.category}</td>
                  <td className={`amount ${tx.type}`}>
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Транзакций пока нет</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard
