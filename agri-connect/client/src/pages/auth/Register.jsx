import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: '' });
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.role) return toast.error('Please select your role');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      if (data.smsError) {
        toast.error(data.smsError);
      } else {
        toast.success('OTP sent to your phone!');
      }
      navigate('/verify-otp', { state: { userId: data.userId, devOtp: data.devOtp, smsError: data.smsError } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--green-light)', padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 460 }}>
        <div className="text-center mb-4">
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>🌱 Join AgriConnect</h1>
          <p className="text-gray text-sm mt-1">Create your account to get started</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input value={form.name} onChange={set('name')} placeholder="Your full name" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="Min 8 characters" required minLength={8} />
          </div>
          <div className="form-group">
            <label>I am a...</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
              {[
                { value: 'farmer', label: '🌾 Farmer / Producer' },
                { value: 'buyer', label: '🛒 Buyer' },
                { value: 'logistics', label: '🚚 Logistics Partner' }
              ].map(r => (
                <button type="button" key={r.value} onClick={() => setForm(p => ({ ...p, role: r.value }))}
                  style={{
                    padding: '12px 8px', border: `2px solid ${form.role === r.value ? 'var(--green)' : '#e5e7eb'}`,
                    borderRadius: 8, background: form.role === r.value ? 'var(--green-light)' : 'white',
                    fontWeight: form.role === r.value ? 600 : 400, color: form.role === r.value ? 'var(--green)' : '#374151',
                    cursor: 'pointer', transition: 'all 0.2s', fontSize: 13
                  }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: 15, marginTop: 8 }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-gray mt-3">
          Already have an account? <Link to="/login" className="text-green" style={{ fontWeight: 600 }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
