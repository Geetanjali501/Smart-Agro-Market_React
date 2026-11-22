import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const statusClass = {
  placed: 'badge-orange', accepted: 'badge-green', rejected: 'badge-red',
  pickup_ready: 'badge-blue', in_transit: 'badge-blue', delivered: 'badge-green', cancelled: 'badge-gray'
};

export default function FarmerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchOrders = () => {
    api.get('/orders')
      .then(r => setOrders(r.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id + status);
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success(`Order ${status}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order');
    } finally { setUpdating(null); }
  };

  if (loading) return <div className="flex-center" style={{ height: 300 }}><div className="spinner" /></div>;

  return (
    <div className="container page">
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>📦 Incoming Orders</h2>
      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📭</div>
          <p>No orders yet — they'll appear here once buyers place them.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(o => (
            <div key={o._id} className="card">
              <div className="flex-between" style={{ flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 16 }}>{o.product?.name}</span>
                  <span className="text-gray text-sm" style={{ marginLeft: 12 }}>
                    {o.quantity} {o.product?.unit || 'units'} · ₹{o.totalPrice}
                  </span>
                </div>
                <span className={`badge ${statusClass[o.orderStatus] || 'badge-gray'}`}>{o.orderStatus}</span>
              </div>

              <div className="text-sm text-gray mt-2">
                👤 Buyer: <strong>{o.buyer?.name}</strong> · {o.buyer?.phone}
              </div>
              <div className="text-sm text-gray">
                📍 Delivery: {o.deliveryAddress?.city}, {o.deliveryAddress?.state} · {o.deliveryOption}
              </div>
              <div className="text-sm text-gray">
                🗓 {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div className="text-sm mt-1">
                💳 Payment: <span style={{ fontWeight: 600, color: o.paymentStatus === 'released' ? 'var(--green)' : '#6b7280' }}>
                  {o.paymentStatus}
                </span>
              </div>

              <div className="flex gap-2 mt-3" style={{ flexWrap: 'wrap' }}>
                {o.orderStatus === 'placed' && (
                  <>
                    <button className="btn btn-primary btn-sm"
                      disabled={updating === o._id + 'accepted'}
                      onClick={() => updateStatus(o._id, 'accepted')}>
                      ✅ Accept
                    </button>
                    <button className="btn btn-danger btn-sm"
                      disabled={updating === o._id + 'rejected'}
                      onClick={() => updateStatus(o._id, 'rejected')}>
                      ❌ Reject
                    </button>
                  </>
                )}
                {o.orderStatus === 'accepted' && (
                  <button className="btn btn-outline btn-sm"
                    disabled={updating === o._id + 'pickup_ready'}
                    onClick={() => updateStatus(o._id, 'pickup_ready')}>
                    📦 Mark Ready for Pickup
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
