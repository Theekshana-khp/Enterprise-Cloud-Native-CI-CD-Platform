import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/', label: 'My Tasks', icon: '☑', end: true },
  { to: '/', label: 'Projects', icon: '▤' },
  { to: '/', label: 'Team', icon: '👥' },
  { to: '/', label: 'Settings', icon: '⚙' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">✓</span>
        <span className="brand-text">TaskFlow</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item, index) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end ?? index === 0}
            className={({ isActive }) =>
              `sidebar-link${isActive && index === 0 ? ' active' : ''}`
            }
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-promo">
        <div className="sidebar-promo-icon">⚡</div>
        <p className="sidebar-promo-title">Get more done together</p>
        <p className="sidebar-promo-text">Upgrade to Pro for advanced features</p>
        <button type="button" className="btn btn-light btn-sm">
          Upgrade Now
        </button>
      </div>
    </aside>
  );
}
