import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function LogisticsDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(r => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const myOrders = orders.filter(o => o.logistics?._id === user?._id || o.logistics === user?._id);
  const available = orders.filter(o => o.orderStatus === 'pickup_ready' && !o.logistics);
  const inTransit = myOrders.filter(o => o.orderStatus === 'in_transit').length;
  const delivered = myOrders.filter(o => o.orderStatus === 'delivered').length;

  return (
    <div className="container page">
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>🚚 Delivery Dashboard</h1>
      <p className="text-gray text-sm" style={{ marginBottom: 24 }}>Welcome, {user?.name}</p>

      <div className="grid-3" style={{ marginBottom: 28 }}>
        {[
          { label: 'Available Pickups', value: available.length, icon: '📦' },
          { label: 'In Transit', value: inTransit, icon: '🚚' },
          { label: 'Delivered', value: delivered, icon: '✅' }
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 28 }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <Link to="/logistics/orders" className="card" style={{ textAlign: 'center', cursor: 'pointer', textDecoration: 'none' }}>
          <div style={{ fontSize: 48 }}>📦</div>
          <h3 style={{ fontWeight: 600, marginTop: 12 }}>View All Orders</h3>
          <p className="text-gray text-sm mt-1">
            {available.length > 0
              ? <span style={{ color: 'var(--green)', fontWeight: 600 }}>{available.length} orders ready for pickup</span>
              : 'No new pickups right now'}
          </p>
        </Link>
        <Link to="/profile-setup" className="card" style={{ textAlign: 'center', cursor: 'pointer', textDecoration: 'none' }}>
          <div style={{ fontSize: 48 }}>⚙️</div>
          <h3 style={{ fontWeight: 600, marginTop: 12 }}>Edit Profile</h3>
          <p className="text-gray text-sm mt-1">Update vehicle and service area</p>
        </Link>
      </div>
    </div>
  );
}
