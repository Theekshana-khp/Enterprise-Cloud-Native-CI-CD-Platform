import { useAuth } from '../context/AuthContext';
import { initials } from '../utils/format';

export default function TopBar({ search, onSearchChange }) {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          type="search"
          className="search-input"
          placeholder="Search tasks, projects, or people..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="topbar-actions">
        <button type="button" className="icon-btn notification-btn" aria-label="Notifications">
          🔔
          <span className="notification-dot" />
        </button>
        <div className="user-menu">
          <div className="avatar">{initials(user?.name)}</div>
          <div className="user-meta">
            <span className="user-name">{user?.name}</span>
            <span className="user-email">{user?.email}</span>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
