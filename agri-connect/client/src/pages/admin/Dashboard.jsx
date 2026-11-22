import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex-center" style={{ height: 300 }}><div className="spinner" /></div>;

  return (
    <div className="container page">
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>📊 Admin Dashboard</h1>

      {stats && (
        <div className="grid-4" style={{ marginBottom: 32 }}>
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
            { label: 'Products', value: stats.totalProducts, icon: '🌾' },
            { label: 'Orders', value: stats.totalOrders, icon: '📦' },
            { label: 'Revenue (Commission)', value: `₹${Number(stats.revenue || 0).toFixed(2)}`, icon: '💰' }
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ fontSize: 28 }}>{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid-2">
        <Link to="/admin/kyc" className="card" style={{ cursor: 'pointer', textDecoration: 'none' }}>
          <div className="flex-between">
            <div>
              <h3 style={{ fontWeight: 600 }}>✅ KYC Approvals</h3>
              <p className="text-gray text-sm mt-1">Review and approve farmer registrations</p>
            </div>
            {stats?.pendingKyc > 0 && (
              <span className="badge badge-orange" style={{ fontSize: 15, padding: '4px 12px' }}>
                {stats.pendingKyc} pending
              </span>
            )}
          </div>
        </Link>

        <Link to="/admin/products" className="card" style={{ cursor: 'pointer', textDecoration: 'none' }}>
          <div className="flex-between">
            <div>
              <h3 style={{ fontWeight: 600 }}>🌿 Product Approvals</h3>
              <p className="text-gray text-sm mt-1">Review listings before they go live</p>
            </div>
            {stats?.pendingProducts > 0 && (
              <span className="badge badge-orange" style={{ fontSize: 15, padding: '4px 12px' }}>
                {stats.pendingProducts} pending
              </span>
            )}
          </div>
        </Link>

        <Link to="/admin/orders" className="card" style={{ cursor: 'pointer', textDecoration: 'none' }}>
          <h3 style={{ fontWeight: 600 }}>📦 All Orders</h3>
          <p className="text-gray text-sm mt-1">Monitor all platform transactions</p>
        </Link>
      </div>
    </div>
  );
}
