import { useEffect, useRef, useState } from 'react';

const toInputDate = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');

export default function TaskForm({ task, onSubmit, onClose }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'pending',
    priority: task?.priority || 'medium',
    dueDate: toInputDate(task?.dueDate),
  });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const titleRef = useRef(null);

  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    titleRef.current?.focus(); // focus once, when the dialog opens
    const onKey = (e) => e.key === 'Escape' && closeRef.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Title is required.');
    setBusy(true);
    setError(null);
    try {
      await onSubmit({ ...form, dueDate: form.dueDate || null });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="form-title" noValidate>
        <h2 id="form-title">{task ? 'Edit task' : 'New task'}</h2>

        <label>Title
          <input ref={titleRef} value={form.title} onChange={set('title')} maxLength={120} required />
        </label>
        <label>Description
          <textarea rows={3} value={form.description} onChange={set('description')} maxLength={1000} />
        </label>
        <div className="grid3">
          <label>Status
            <select value={form.status} onChange={set('status')}>
              <option value="pending">Pending</option>
              <option value="in-progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </label>
          <label>Priority
            <select value={form.priority} onChange={set('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label>Due date
            <input type="date" value={form.dueDate} onChange={set('dueDate')} />
          </label>
        </div>

        {error && <p className="alert" role="alert">{error}</p>}
        <div className="actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : task ? 'Save changes' : 'Add task'}</button>
        </div>
      </form>
    </div>
  );
}
