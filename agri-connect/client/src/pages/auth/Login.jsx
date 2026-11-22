import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      // Auto-detect if email or phone
      const isPhone = /^\+?\d{7,15}$/.test(identifier.trim());
      const payload = isPhone
        ? { phone: identifier.trim(), password }
        : { email: identifier.trim().toLowerCase(), password };

      const { data } = await api.post('/auth/login', payload);
      await login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);

      const redirects = { farmer: '/farmer', buyer: '/buyer', admin: '/admin', logistics: '/logistics' };
      navigate(redirects[data.user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--green-light)', padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        <div className="text-center mb-4">
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>🌱 Welcome Back</h1>
          <p className="text-gray text-sm mt-1">Login to your AgriConnect account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email or Phone Number</label>
            <input
              value={identifier} onChange={e => setIdentifier(e.target.value)}
              placeholder="email@example.com or +91..." required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 12, fontSize: 15 }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center text-sm text-gray mt-3">
          Don't have an account? <Link to="/register" className="text-green" style={{ fontWeight: 600 }}>Register</Link>
        </p>
        <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--gray-light)', borderRadius: 8, fontSize: 12, color: 'var(--gray)' }}>
          Admin: admin@agriconnect.com / Admin@1234
        </div>
      </div>
    </div>
  );
}
