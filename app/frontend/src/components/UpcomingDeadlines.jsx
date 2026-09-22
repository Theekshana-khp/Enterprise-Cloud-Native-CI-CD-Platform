import { daysUntil, formatDueDate, initials } from '../utils/format';
import { useAuth } from '../context/AuthContext';

function deadlineLabel(task) {
  const diff = daysUntil(task.dueDate);
  if (diff === null) return 'No date';
  if (diff < 0) return 'Overdue';
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  return `In ${diff} days`;
}

export default function UpcomingDeadlines({ tasks, completedThisMonth }) {
  const { user } = useAuth();
  const withDue = tasks
    .filter((t) => t.dueDate && t.status !== 'COMPLETED')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  return (
    <aside className="right-panel">
      <section className="panel-card">
        <h3 className="panel-title">Upcoming Deadlines</h3>
        <ul className="deadline-list">
          {withDue.length === 0 && <li className="deadline-empty">No upcoming deadlines</li>}
          {withDue.map((task) => {
            const d = new Date(task.dueDate);
            const label = deadlineLabel(task);
            const urgent = label === 'Due today' || label === 'Overdue';
            return (
              <li key={task.id} className="deadline-item">
                <div className="deadline-date">
                  <span className="deadline-month">
                    {d.toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}
                  </span>
                  <span className="deadline-day">{d.getDate()}</span>
                </div>
                <div className="deadline-body">
                  <strong>{task.title}</strong>
                  <span>{task.project || 'General'}</span>
                  <span className={urgent ? 'deadline-urgent' : 'deadline-soon'}>{label}</span>
                </div>
                <div className="avatar avatar-sm">{initials(user?.name)}</div>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="panel-card progress-card">
        <div className="progress-icon">🏆</div>
        <div>
          <strong>You&apos;re making great progress!</strong>
          <p>
            {completedThisMonth} task{completedThisMonth === 1 ? '' : 's'} completed this month
          </p>
        </div>
      </section>
    </aside>
  );
}
