import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

function DashboardShell({ search, onSearchChange, children }) {
  const { theme } = useTheme();

  return (
    <div className="dashboard-root" data-theme={theme}>
      <Sidebar />
      <div className="dashboard-main">
        <TopBar search={search} onSearchChange={onSearchChange} />
        <div className="dashboard-content">{children}</div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ search, onSearchChange, children }) {
  return (
    <ThemeProvider>
      <DashboardShell search={search} onSearchChange={onSearchChange}>
        {children}
      </DashboardShell>
    </ThemeProvider>
  );
}
