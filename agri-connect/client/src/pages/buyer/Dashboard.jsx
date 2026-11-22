import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/users/buyer/dashboard')
      .then(r => setStats(r.data))
      .catch(() => {});
  }, []);

  return (
    <div className="container page">
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>👋 Welcome, {user?.name}</h1>

      {stats && (
        <div className="grid-3" style={{ marginBottom: 28 }}>
          {[
            { label: 'Total Orders', value: stats.totalOrders, icon: '📦' },
            { label: 'Active Orders', value: stats.activeOrders, icon: '🚚' },
            { label: 'Total Spent', value: `₹${Number(stats.totalSpent || 0).toFixed(2)}`, icon: '💳' }
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
        <Link to="/marketplace" className="card" style={{ textAlign: 'center', cursor: 'pointer', textDecoration: 'none' }}>
          <div style={{ fontSize: 48 }}>🛒</div>
          <h3 style={{ fontWeight: 600, marginTop: 12 }}>Browse Marketplace</h3>
          <p className="text-gray text-sm mt-1">Explore fresh produce from local farmers</p>
        </Link>
        <Link to="/buyer/orders" className="card" style={{ textAlign: 'center', cursor: 'pointer', textDecoration: 'none' }}>
          <div style={{ fontSize: 48 }}>📦</div>
          <h3 style={{ fontWeight: 600, marginTop: 12 }}>My Orders</h3>
          <p className="text-gray text-sm mt-1">Track and manage your orders</p>
        </Link>
        <Link to="/cart" className="card" style={{ textAlign: 'center', cursor: 'pointer', textDecoration: 'none' }}>
          <div style={{ fontSize: 48 }}>🛍️</div>
          <h3 style={{ fontWeight: 600, marginTop: 12 }}>My Cart</h3>
          <p className="text-gray text-sm mt-1">Review and checkout items</p>
        </Link>
        <Link to="/profile-setup" className="card" style={{ textAlign: 'center', cursor: 'pointer', textDecoration: 'none' }}>
          <div style={{ fontSize: 48 }}>⚙️</div>
          <h3 style={{ fontWeight: 600, marginTop: 12 }}>Edit Profile</h3>
          <p className="text-gray text-sm mt-1">Update delivery address and preferences</p>
        </Link>
      </div>
    </div>
  );
}
