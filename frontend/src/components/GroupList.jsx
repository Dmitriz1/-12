import { useState, useEffect } from 'react'
import '../styles/GroupList.css'

const GroupList = ({ groups, onDelete, onEdit }) => {
  if (groups.length === 0) {
    return <div className="empty-state">Группы не найдены. Создайте группу, чтобы начать делить расходы!</div>
  }

  return (
    <div className="group-list">
      <div className="groups-grid">
        {groups.map(group => (
          <div key={group.id} className="group-card">
            <h3>{group.name}</h3>
            <p className="group-description">{group.description || 'Нет описания'}</p>
            <div className="group-members">
              <strong>Участники:</strong> {group.members_count || 0}
            </div>
            <div className="group-actions">
              <button onClick={() => onEdit(group)} className="btn-small">Редактировать</button>
              <button onClick={() => onDelete(group.id)} className="btn-small btn-danger">Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GroupList
