import { useEffect, useState } from 'react';
import { TASK_STATUSES, STATUS_LABELS } from '../api/tasks';

const emptyForm = {
  title: '',
  description: '',
  status: 'TODO',
  project: '',
  category: 'General',
  dueDate: '',
};

export default function TaskModal({ open, initialTask, defaultStatus, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initialTask) {
      setForm({
        title: initialTask.title || '',
        description: initialTask.description || '',
        status: initialTask.status || 'TODO',
        project: initialTask.project || '',
        category: initialTask.category || 'General',
        dueDate: initialTask.dueDate || '',
      });
    } else {
      setForm({ ...emptyForm, status: defaultStatus || 'TODO' });
    }
    setError('');
  }, [open, initialTask, defaultStatus]);

  if (!open) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        project: form.project.trim() || null,
        category: form.category.trim() || null,
        dueDate: form.dueDate || null,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save task.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>{initialTask ? 'Edit task' : 'New task'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <form className="modal-form" onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          <label>
            Title
            <input name="title" value={form.title} onChange={handleChange} required maxLength={255} />
          </label>
          <label>
            Project
            <input name="project" value={form.project} onChange={handleChange} placeholder="Marketing Website" />
          </label>
          <label>
            Category
            <select name="category" value={form.category} onChange={handleChange}>
              <option>Design</option>
              <option>Development</option>
              <option>Research</option>
              <option>DevOps</option>
              <option>General</option>
            </select>
          </label>
          <label>
            Description
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
          </label>
          <label>
            Status
            <select name="status" value={form.status} onChange={handleChange}>
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Due date
            <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
