import { useEffect, useMemo, useState } from 'react';
import api, { errorMessage } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import useTasks from '../hooks/useTasks.js';
import useDebounce from '../hooks/useDebounce.js';
import TaskItem from '../components/TaskItem.jsx';
import TaskForm from '../components/TaskForm.jsx';
import Pagination from '../components/Pagination.jsx';

const SORTS = {
  newest: { sortBy: 'createdAt', order: 'desc', label: 'Newest first' },
  oldest: { sortBy: 'createdAt', order: 'asc', label: 'Oldest first' },
  due: { sortBy: 'dueDate', order: 'asc', label: 'Due date' },
  title: { sortBy: 'title', order: 'asc', label: 'Title A–Z' },
  updated: { sortBy: 'updatedAt', order: 'desc', label: 'Recently updated' },
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState({ status: '', priority: '', search: '', sort: 'newest', page: 1 });
  const [formTask, setFormTask] = useState(undefined); // undefined = closed, null = new, object = edit
  const [notice, setNotice] = useState(null);

  const debouncedSearch = useDebounce(filters.search);
  const params = useMemo(() => {
    const { sortBy, order } = SORTS[filters.sort];
    const p = { page: filters.page, limit: 8, sortBy, order };
    if (filters.status) p.status = filters.status;
    if (filters.priority) p.priority = filters.priority;
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    return p;
  }, [filters.status, filters.priority, filters.sort, filters.page, debouncedSearch]);

  const { tasks, pagination, stats, loading, error, refresh } = useTasks(params);

  // Reset to page 1 whenever a filter changes.
  const change = (patch) => setFilters((f) => ({ ...f, ...patch, page: 1 }));
  useEffect(() => { setFilters((f) => (f.page === 1 ? f : { ...f, page: 1 })); }, [debouncedSearch]);

  // If the last item on a page is removed, step back a page.
  useEffect(() => {
    if (!loading && tasks.length === 0 && pagination.page > 1) setFilters((f) => ({ ...f, page: f.page - 1 }));
  }, [loading, tasks.length, pagination.page]);

  const flash = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(null), 3500);
  };

  const run = async (action, success) => {
    try {
      await action();
      await refresh();
      if (success) flash(success);
    } catch (err) {
      flash(errorMessage(err));
    }
  };

  const saveTask = async (values) => {
    try {
      if (formTask) await api.put(`/tasks/${formTask.id}`, values);
      else await api.post('/tasks', values);
    } catch (err) {
      throw new Error(errorMessage(err));
    }
    setFormTask(undefined);
    await refresh();
    flash(formTask ? 'Task updated.' : 'Task added.');
  };

  const setStatus = (task, status) => run(() => api.patch(`/tasks/${task.id}/status`, { status }), `Moved to ${status.replace('-', ' ')}.`);
  const remove = (task) => {
    if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) run(() => api.delete(`/tasks/${task.id}`), 'Task deleted.');
  };

  const hasFilters = filters.status || filters.priority || filters.search;

  return (
    <div className="page">
      <header className="bar">
        <h1>Taskboard</h1>
        <div className="bar-right">
          <span className="who">{user.name}</span>
          <button className="btn small" onClick={logout}>Sign out</button>
        </div>
      </header>

      <section className="stats" aria-label="Task summary">
        {[['', 'All', stats.total], ['pending', 'Pending', stats.pending], ['in-progress', 'In progress', stats['in-progress']], ['completed', 'Completed', stats.completed]].map(([value, label, count]) => (
          <button key={label} className={`stat st-${value || 'all'}`} aria-pressed={filters.status === value} onClick={() => change({ status: value })}>
            <strong>{count}</strong><span>{label}</span>
          </button>
        ))}
      </section>

      <section className="toolbar" aria-label="Filter and sort">
        <input type="search" placeholder="Search title or description" value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} aria-label="Search tasks" />
        <select value={filters.priority} onChange={(e) => change({ priority: e.target.value })} aria-label="Filter by priority">
          <option value="">Any priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={filters.sort} onChange={(e) => change({ sort: e.target.value })} aria-label="Sort tasks">
          {Object.entries(SORTS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
        </select>
        <button className="btn primary" onClick={() => setFormTask(null)}>New task</button>
      </section>

      {notice && <p className="toast" role="status">{notice}</p>}
      {error && <p className="alert" role="alert">{error} <button className="link" onClick={refresh}>Retry</button></p>}

      {loading && tasks.length === 0 ? (
        <p className="center-note">Loading tasks…</p>
      ) : tasks.length === 0 && !error ? (
        <div className="empty">
          <h2>{hasFilters ? 'No tasks match these filters' : 'No tasks yet'}</h2>
          <p>{hasFilters ? 'Try a different search or clear the filters.' : 'Add your first task to get started.'}</p>
          {hasFilters
            ? <button className="btn" onClick={() => setFilters({ status: '', priority: '', search: '', sort: 'newest', page: 1 })}>Clear filters</button>
            : <button className="btn primary" onClick={() => setFormTask(null)}>New task</button>}
        </div>
      ) : (
        <ul className={loading ? 'tasks is-loading' : 'tasks'}>
          {tasks.map((t) => <TaskItem key={t.id} task={t} onStatus={setStatus} onEdit={setFormTask} onDelete={remove} />)}
        </ul>
      )}

      <Pagination pagination={pagination} onPage={(page) => setFilters((f) => ({ ...f, page }))} />

      {formTask !== undefined && <TaskForm task={formTask} onSubmit={saveTask} onClose={() => setFormTask(undefined)} />}
    </div>
  );
}
