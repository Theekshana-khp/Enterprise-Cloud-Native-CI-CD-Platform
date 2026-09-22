import { useCallback, useEffect, useMemo, useState } from 'react';
import StatsCards from '../components/StatsCards';
import KanbanBoard from '../components/KanbanBoard';
import UpcomingDeadlines from '../components/UpcomingDeadlines';
import TaskModal from '../components/TaskModal';
import { createTask, deleteTask, fetchTasks, updateTask } from '../api/tasks';
import { useAuth } from '../context/AuthContext';
import { formatHeaderDate, getGreeting, isToday } from '../utils/format';

export default function DashboardPage({ search }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState('TODO');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch {
      setError('Could not load tasks. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.project || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q),
    );
  }, [tasks, search]);

  const tasksByStatus = useMemo(
    () => ({
      TODO: filtered.filter((t) => t.status === 'TODO'),
      IN_PROGRESS: filtered.filter((t) => t.status === 'IN_PROGRESS'),
      COMPLETED: filtered.filter((t) => t.status === 'COMPLETED'),
    }),
    [filtered],
  );

  const stats = useMemo(
    () => ({
      total: tasks.length,
      inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      completed: tasks.filter((t) => t.status === 'COMPLETED').length,
      dueToday: tasks.filter((t) => t.dueDate && isToday(t.dueDate) && t.status !== 'COMPLETED').length,
    }),
    [tasks],
  );

  const completedThisMonth = useMemo(() => {
    const now = new Date();
    return tasks.filter((t) => {
      if (t.status !== 'COMPLETED' || !t.createdAt) return false;
      const d = new Date(t.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [tasks]);

  function openCreate(status = 'TODO') {
    setEditingTask(null);
    setDefaultStatus(status);
    setModalOpen(true);
  }

  function openEdit(task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  async function handleSave(payload) {
    if (editingTask) {
      const updated = await updateTask(editingTask.id, payload);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } else {
      const created = await createTask(payload);
      setTasks((prev) => [created, ...prev]);
    }
  }

  async function handleStatusChange(task, status) {
    const updated = await updateTask(task.id, {
      title: task.title,
      description: task.description,
      status,
      project: task.project,
      category: task.category,
      dueDate: task.dueDate,
    });
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  async function handleDelete(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    await deleteTask(task.id);
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
  }

  return (
    <div className="dashboard-page">
      <section className="hero-row">
        <div>
          <p className="hero-date">{formatHeaderDate()}</p>
          <h1 className="hero-title">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="hero-sub">Here&apos;s what&apos;s happening with your work today.</p>
        </div>
        <div className="hero-actions">
          <div className="team-avatars">
            <span className="avatar avatar-sm">A</span>
            <span className="avatar avatar-sm">B</span>
            <span className="avatar avatar-sm">C</span>
            <span className="avatar avatar-sm avatar-more">+2</span>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => openCreate('TODO')}>
            + Add New Task
          </button>
        </div>
      </section>

      <StatsCards stats={stats} />

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p className="loading-text">Loading your board…</p>}

      <div className="board-layout">
        <div className="board-main">
          <KanbanBoard
            tasksByStatus={tasksByStatus}
            onAddInColumn={openCreate}
            onEdit={openEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        </div>
        <UpcomingDeadlines tasks={tasks} completedThisMonth={completedThisMonth} />
      </div>

      <TaskModal
        open={modalOpen}
        initialTask={editingTask}
        defaultStatus={defaultStatus}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
