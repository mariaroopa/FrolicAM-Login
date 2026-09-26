import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(sessionStorage.getItem('frolicam_user') || '{}')

  function handleLogout() {
    sessionStorage.removeItem('frolicam_token')
    sessionStorage.removeItem('frolicam_user')
    navigate('/')
  }

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div className="brand">
          <div className="brand-mark">FA</div>
          <p className="brand-name">FrolicAM</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <main className="dashboard-main">
        <h1>Welcome, {user.name || 'Learner'} 👋</h1>
        <p className="muted">
          This is a placeholder dashboard for the FrolicAM login flow demo.
        </p>

        <div className="stat-grid">
          <div className="stat-card">
            <p className="stat-label">Active Internships</p>
            <p className="stat-value">3</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Projects Completed</p>
            <p className="stat-value">7</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Bootcamp Progress</p>
            <p className="stat-value">68%</p>
          </div>
        </div>
      </main>
    </div>
  )
}