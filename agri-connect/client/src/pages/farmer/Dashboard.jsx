import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [advisory, setAdvisory] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/users/farmer/dashboard')
      .then(r => setStats(r.data))
      .catch(() => setError('Failed to load dashboard stats'));

    api.get('/users/farmer/advisory')
      .then(r => setAdvisory(r.data))
      .catch(() => {});
  }, []);

  return (
    <div className="container page">
      <div className="flex-between mb-4" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>👋 Welcome, {user?.name}</h1>
          {!user?.isApproved && (
            <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, padding: '8px 14px', marginTop: 8, fontSize: 13 }}>
              ⏳ Your KYC is pending admin approval. You'll be able to list products once approved.
            </div>
          )}
        </div>
        {user?.isApproved && (
          <Link to="/farmer/add-product" className="btn btn-primary">➕ Add Product</Link>
        )}
      </div>

      {error && (
        <div style={{ background: '#fee2e2', borderRadius: 8, padding: 12, marginBottom: 20, color: '#dc2626' }}>{error}</div>
      )}

      {stats && (
        <div className="grid-4" style={{ marginBottom: 28 }}>
          {[
            { label: 'Total Orders', value: stats.totalOrders, icon: '📦' },
            { label: 'Pending Orders', value: stats.pendingOrders, icon: '⏳' },
            { label: 'Completed', value: stats.completedOrders, icon: '✅' },
            { label: 'Total Earnings', value: `₹${Number(stats.totalEarnings || 0).toFixed(2)}`, icon: '💰' }
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ fontSize: 28 }}>{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {advisory && (
        <div className="grid-2">
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 14 }}>☁️ Weather Forecast</h3>
            <div className="flex gap-3" style={{ marginBottom: 12, alignItems: 'center' }}>
              <div style={{ fontSize: 40 }}>🌤</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 20 }}>{advisory.weather.temperature}</div>
                <div className="text-gray text-sm">{advisory.weather.condition} · Humidity: {advisory.weather.humidity}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {advisory.weather.forecast.map(f => (
                <div key={f.day} style={{ flex: 1, background: 'var(--gray-light)', borderRadius: 8, padding: '8px 6px', textAlign: 'center', fontSize: 12 }}>
                  <div style={{ fontWeight: 600 }}>{f.day}</div>
                  <div>{f.condition}</div>
                  <div style={{ color: 'var(--green)', fontWeight: 700 }}>{f.temp}</div>
                </div>
              ))}
            </div>
            {advisory.alerts.length > 0 && (
              <div style={{ marginTop: 12 }}>
                {advisory.alerts.map(a => (
                  <div key={a} style={{ background: '#fee2e2', borderRadius: 6, padding: '6px 10px', marginTop: 6, fontSize: 12, color: '#991b1b' }}>
                    ⚠️ {a}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 14 }}>📈 Market Price Trends</h3>
            {advisory.marketPriceTrends.map(m => (
              <div key={m.crop} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontWeight: 500 }}>{m.crop}</span>
                <div className="flex gap-2" style={{ alignItems: 'center' }}>
                  <span style={{ fontWeight: 700 }}>₹{m.price}/kg</span>
                  <span>{m.trend === 'up' ? '📈' : m.trend === 'down' ? '📉' : '➡️'}</span>
                </div>
              </div>
            ))}
            <h3 style={{ fontWeight: 700, margin: '16px 0 10px' }}>🌿 Recommended Crops</h3>
            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
              {advisory.cropRecommendations.map(c => (
                <span key={c} className="badge badge-green" style={{ padding: '4px 12px' }}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid-3 mt-4">
        <Link to="/farmer/listings" className="card" style={{ textAlign: 'center', cursor: 'pointer', textDecoration: 'none' }}>
          <div style={{ fontSize: 40 }}>🌾</div>
          <h3 style={{ fontWeight: 600, marginTop: 10 }}>My Listings</h3>
          <p className="text-gray text-sm mt-1">Manage your products</p>
        </Link>
        <Link to="/farmer/orders" className="card" style={{ textAlign: 'center', cursor: 'pointer', textDecoration: 'none' }}>
          <div style={{ fontSize: 40 }}>📦</div>
          <h3 style={{ fontWeight: 600, marginTop: 10 }}>Incoming Orders</h3>
          <p className="text-gray text-sm mt-1">Accept or reject orders</p>
        </Link>
        <Link to="/profile-setup" className="card" style={{ textAlign: 'center', cursor: 'pointer', textDecoration: 'none' }}>
          <div style={{ fontSize: 40 }}>⚙️</div>
          <h3 style={{ fontWeight: 600, marginTop: 10 }}>Edit Profile</h3>
          <p className="text-gray text-sm mt-1">Update farm & bank details</p>
        </Link>
      </div>
    </div>
  );
}
