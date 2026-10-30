import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errorMessage } from '../api.js';

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (isLogin) await login({ email: form.email, password: form.password });
      else await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth">
      <section className="auth-card">
        <h1>Taskboard</h1>
        <p className="sub">{isLogin ? 'Sign in to see your tasks.' : 'Create an account to start tracking tasks.'}</p>

        <form onSubmit={submit} noValidate>
          {!isLogin && (
            <label>Name
              <input value={form.name} onChange={set('name')} autoComplete="name" required minLength={2} maxLength={60} />
            </label>
          )}
          <label>Email
            <input type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
          </label>
          <label>Password
            <input type="password" value={form.password} onChange={set('password')}
              autoComplete={isLogin ? 'current-password' : 'new-password'} required minLength={isLogin ? 1 : 8} />
            {!isLogin && <span className="hint">At least 8 characters, with a letter and a number.</span>}
          </label>

          {error && <p className="alert" role="alert">{error}</p>}
          <button className="btn primary block" disabled={busy}>{busy ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}</button>
        </form>

        <p className="switch">
          {isLogin ? 'New here? ' : 'Already have an account? '}
          <Link to={isLogin ? '/register' : '/login'}>{isLogin ? 'Create an account' : 'Sign in'}</Link>
        </p>
      </section>
    </main>
  );
}
