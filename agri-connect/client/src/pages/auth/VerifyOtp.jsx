import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const userId = location.state?.userId;
  const devOtp = location.state?.devOtp;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  if (!userId) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--green-light)' }}>
        <div className="card text-center" style={{ maxWidth: 400 }}>
          <p>Session expired. <a href="/register" className="text-green" style={{ fontWeight: 600 }}>Register again</a></p>
        </div>
      </div>
    );
  }

  const handleSubmit = async e => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Enter a 6-digit OTP');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { userId, otp });
      await login(data.token, data.user);
      toast.success('Account verified! Welcome to AgriConnect.');
      navigate('/profile-setup');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--green-light)', padding: 20 }}>
      <div className="card text-center" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ fontSize: 48 }}>📱</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 12 }}>Verify Your Account</h2>
        <p className="text-gray text-sm mt-2">Enter the 6-digit OTP</p>

        {devOtp && (
          <div style={{
            background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8,
            padding: '12px 16px', margin: '16px 0', textAlign: 'center'
          }}>
            <div style={{ fontSize: 12, color: '#92400e', marginBottom: 4 }}>Your OTP (for this session)</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 8, color: 'var(--green-dark)' }}>{devOtp}</div>
            <div style={{ fontSize: 11, color: '#92400e', marginTop: 4 }}>Valid for 10 minutes</div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <input
            value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit OTP" maxLength={6} required
            style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8, padding: 14 }}
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 12, marginTop: 16 }} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}
