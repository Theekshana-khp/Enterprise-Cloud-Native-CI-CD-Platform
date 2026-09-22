import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

export default function DashboardLayout({ search, onSearchChange, children }) {
  return (
    <div className="dashboard-root">
      <Sidebar />
      <div className="dashboard-main">
        <TopBar search={search} onSearchChange={onSearchChange} />
        <div className="dashboard-content">{children}</div>
      </div>
    </div>
  );
}
