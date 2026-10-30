import { useCallback, useEffect, useRef, useState } from 'react';
import api, { errorMessage } from '../api.js';

// Loads one page of tasks plus the status counts. Re-fetches when params change.
export default function useTasks(params) {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 8 });
  const [stats, setStats] = useState({ pending: 0, 'in-progress': 0, completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reqId = useRef(0);

  const key = JSON.stringify(params);

  const refresh = useCallback(async () => {
    const id = ++reqId.current; // ignore out-of-order responses
    setLoading(true);
    setError(null);
    try {
      const [list, st] = await Promise.all([api.get('/tasks', { params: JSON.parse(key) }), api.get('/tasks/stats')]);
      if (id !== reqId.current) return;
      setTasks(list.data.data);
      setPagination(list.data.pagination);
      setStats(st.data.data);
    } catch (err) {
      if (id === reqId.current) setError(errorMessage(err));
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [key]);

  useEffect(() => { refresh(); }, [refresh]);

  return { tasks, pagination, stats, loading, error, refresh };
}
