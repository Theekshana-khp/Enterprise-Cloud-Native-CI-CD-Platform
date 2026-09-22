import { STATUS_LABELS } from '../api/tasks';
import { formatDueDate, initials } from '../utils/format';
import { useAuth } from '../context/AuthContext';

const categoryClass = (category) => {
  const key = (category || 'general').toLowerCase();
  if (key.includes('design')) return 'tag-design';
  if (key.includes('dev')) return 'tag-dev';
  if (key.includes('research')) return 'tag-research';
  if (key.includes('ops')) return 'tag-ops';
  return 'tag-default';
};

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const { user } = useAuth();

  return (
    <article className="kanban-card">
      <h4 className="kanban-card-title">{task.title}</h4>
      <p className="kanban-card-project">{task.project || 'General'}</p>
      {task.category && (
        <span className={`task-tag ${categoryClass(task.category)}`}>{task.category}</span>
      )}
      <div className="kanban-card-footer">
        <span className="kanban-due">📅 {formatDueDate(task.dueDate)}</span>
        <div className="avatar avatar-sm" title={user?.name}>
          {initials(user?.name)}
        </div>
      </div>
      <div className="kanban-card-actions">
        <select
          className="status-select"
          value={task.status}
          onChange={(e) => onStatusChange(task, e.target.value)}
          aria-label="Change status"
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-ghost btn-xs" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button type="button" className="btn btn-danger btn-xs" onClick={() => onDelete(task)}>
          Delete
        </button>
      </div>
    </article>
  );
}
