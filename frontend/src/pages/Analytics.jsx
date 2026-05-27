import { useState, useEffect } from 'react'
import { analyticsAPI } from '../services/api'
import '../styles/Pages.css'

const Analytics = () => {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chartType, setChartType] = useState('pie')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await analyticsAPI.getOverview()
        setOverview(response.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) return <div className="page-container">Загрузка аналитики...</div>
  if (error) return <div className="page-container alert alert-error">{error}</div>

  return (
    <div className="page-container">
      <h1>Аналитика</h1>
      
      <div className="chart-controls">
        <label>Тип графика:</label>
        <select value={chartType} onChange={e => setChartType(e.target.value)}>
          <option value="pie">Круговая диаграмма</option>
          <option value="timeline">Хронология</option>
          <option value="bar">Столбчатая диаграмма</option>
        </select>
      </div>

      {overview && (
        <div className="analytics-container">
          <div className="analytics-card">
            <h3>Расходы по категориям</h3>
            <div className="chart-placeholder">
              Тип графика: {chartType}
              {/* Здесь будет отрисован график на основе данных API */}
            </div>
          </div>

          <div className="analytics-stats">
            <div className="stat-item">
              <h4>Доходы</h4>
              <p>${overview.total_income?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="stat-item">
              <h4>Расходы</h4>
              <p>${overview.total_expenses?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="stat-item">
              <h4>Баланс</h4>
              <p>${(overview.balance || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Analytics
