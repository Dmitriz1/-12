import '../styles/Pages.css'

const Home = () => {
  return (
    <div className="page-container">
      <div className="hero">
        <h1>Управление финансами</h1>
        <p>Эффективно управляйте своими расходами и доходами</p>
        <div className="hero-features">
          <div className="feature">
            <h3>Отслеживание транзакций</h3>
            <p>Отслеживайте все свои расходы и доходы в одном месте</p>
          </div>
          <div className="feature">
            <h3>Совместные расходы</h3>
            <p>Создавайте группы и делите расходы с друзьями</p>
          </div>
          <div className="feature">
            <h3>Аналитика</h3>
            <p>Визуализируйте ваши модели расходов и бюджеты</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
