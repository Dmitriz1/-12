import { useState, useEffect } from 'react'
import '../styles/TransactionList.css'

const TransactionList = ({ transactions, onDelete, onEdit }) => {
  const [sortBy, setSortBy] = useState('date')
  const [sortedTransactions, setSortedTransactions] = useState(transactions)

  useEffect(() => {
    const sorted = [...transactions].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date)
      }
      if (sortBy === 'amount') {
        return b.amount - a.amount
      }
      if (sortBy === 'category') {
        return a.category.localeCompare(b.category)
      }
      return 0
    })
    setSortedTransactions(sorted)
  }, [transactions, sortBy])

  if (sortedTransactions.length === 0) {
    return <div className="empty-state">Транзакции не найдены</div>
  }

  return (
    <div className="transaction-list">
      <div className="sort-controls">
        <label>Сортировать по:</label>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="date">Дата</option>
          <option value="amount">Сумма</option>
          <option value="category">Категория</option>
        </select>
      </div>
      
      <table className="transactions-table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Категория</th>
            <th>Описание</th>
            <th>Сумма</th>
            <th>Тип</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {sortedTransactions.map(tx => (
            <tr key={tx.id} className={`transaction-row ${tx.type}`}>
              <td>{new Date(tx.date).toLocaleDateString()}</td>
              <td>{tx.category}</td>
              <td>{tx.description}</td>
              <td className={`amount ${tx.type}`}>
                {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
              </td>
              <td>{tx.type === 'income' ? 'Доход' : 'Расход'}</td>
              <td className="actions">
                <button onClick={() => onEdit(tx)} className="btn-small">Редактировать</button>
                <button onClick={() => onDelete(tx.id)} className="btn-small btn-danger">Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TransactionList
