import { STATUS_LABELS, TASK_STATUSES } from '../api/tasks';
import TaskCard from './TaskCard';

export default function KanbanBoard({ tasksByStatus, onAddInColumn, onEdit, onDelete, onStatusChange }) {
  return (
    <div className="kanban-board">
      {TASK_STATUSES.map((status) => (
        <section key={status} className="kanban-column">
          <header className="kanban-column-header">
            <h3>{STATUS_LABELS[status]}</h3>
            <span className="kanban-count">{tasksByStatus[status]?.length ?? 0}</span>
          </header>
          <div className="kanban-column-body">
            {(tasksByStatus[status] ?? []).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
          <button type="button" className="kanban-add" onClick={() => onAddInColumn(status)}>
            + Add a task
          </button>
        </section>
      ))}
    </div>
  );
}
