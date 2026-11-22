import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const statusClass = {
  pickup_ready: 'badge-orange',
  in_transit: 'badge-blue',
  delivered: 'badge-green'
};

export default function LogisticsOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [tracking, setTracking] = useState({});

  const fetchOrders = () => {
    api.get('/orders')
      .then(r => setOrders(r.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const claimOrder = async id => {
    setUpdating(id + 'claim');
    try {
      await api.put('/orders/' + id + '/claim');
      toast.success('Order claimed! Head for pickup.');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to claim');
    } finally { setUpdating(null); }
  };

  const updateStatus = async (id, status) => {
    setUpdating(id + status);
    try {
      await api.put('/orders/' + id + '/status', { status, trackingInfo: tracking[id] || '' });
      toast.success(status === 'in_transit' ? 'Marked as in transit!' : 'Delivery confirmed!');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setUpdating(null); }
  };

  // Available = pickup_ready and not claimed
  const available = orders.filter(o => o.orderStatus === 'pickup_ready' && !o.logistics);
  // My orders = claimed by me
  const mine = orders.filter(o => {
    const lid = o.logistics?._id || o.logistics;
    return lid && lid.toString() === (user?._id || user?.id)?.toString();
  });

  if (loading) return <div className="flex-center" style={{ height: 300 }}><div className="spinner" /></div>;

  return (
    <div className="container page">
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>📦 Delivery Orders</h2>

      {/* Available pickups */}
      <h3 style={{ fontWeight: 600, marginBottom: 12, color: 'var(--green)' }}>
        🟢 Available Pickups ({available.length})
      </h3>

      {available.length === 0 ? (
        <div className="card text-center" style={{ padding: 32, marginBottom: 24, color: 'var(--gray)' }}>
          No orders ready for pickup right now. Check back soon!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
          {available.map(o => (
            <div key={o._id} className="card">
              <div className="flex-between" style={{ flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{o.product?.name}</div>
                  <div className="text-gray text-sm">{o.quantity} units · ₹{o.totalPrice} · {o.deliveryOption}</div>
                </div>
                <span className="badge badge-orange">Ready for Pickup</span>
              </div>
              <div className="text-sm text-gray mt-2">
                🌾 Pickup from: <strong>{o.farmer?.name}</strong> · {o.farmer?.farmLocation}
              </div>
              <div className="text-sm text-gray">
                📍 Deliver to: {o.deliveryAddress?.city}, {o.deliveryAddress?.state} — {o.deliveryAddress?.pincode}
              </div>
              <div className="text-sm text-gray">
                👤 Buyer: {o.buyer?.name} · {o.buyer?.phone}
              </div>
              <div className="text-sm text-gray">
                🗓 {new Date(o.createdAt).toLocaleDateString('en-IN')}
              </div>
              <button className="btn btn-primary btn-sm mt-3"
                disabled={updating === o._id + 'claim'}
                onClick={() => claimOrder(o._id)}>
                🙋 Claim this Order
              </button>
            </div>
          ))}
        </div>
      )}

      {/* My active orders */}
      <h3 style={{ fontWeight: 600, marginBottom: 12, color: '#2563eb' }}>
        🚚 My Active Deliveries ({mine.filter(o => o.orderStatus !== 'delivered').length})
      </h3>

      {mine.filter(o => o.orderStatus !== 'delivered').length === 0 ? (
        <div className="card text-center" style={{ padding: 32, marginBottom: 24, color: 'var(--gray)' }}>
          No active deliveries. Claim an order above to start!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
          {mine.filter(o => o.orderStatus !== 'delivered').map(o => (
            <div key={o._id} className="card">
              <div className="flex-between" style={{ flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{o.product?.name}</div>
                  <div className="text-gray text-sm">{o.quantity} units · ₹{o.totalPrice}</div>
                </div>
                <span className={`badge ${statusClass[o.orderStatus] || 'badge-gray'}`}>{o.orderStatus}</span>
              </div>
              <div className="text-sm text-gray mt-2">
                🌾 From: {o.farmer?.name} · {o.farmer?.farmLocation} · 📞 {o.farmer?.phone}
              </div>
              <div className="text-sm text-gray">
                📍 To: {o.deliveryAddress?.street}, {o.deliveryAddress?.city}, {o.deliveryAddress?.state} — {o.deliveryAddress?.pincode}
              </div>
              <div className="text-sm text-gray">
                👤 {o.buyer?.name} · {o.buyer?.phone}
              </div>

              <div className="form-group mt-3">
                <label>Tracking / Notes (optional)</label>
                <input
                  value={tracking[o._id] || ''}
                  onChange={e => setTracking(p => ({ ...p, [o._id]: e.target.value }))}
                  placeholder="e.g. Out for delivery, near Koramangala..."
                />
              </div>

              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {o.orderStatus === 'pickup_ready' && (
                  <button className="btn btn-primary btn-sm"
                    disabled={updating === o._id + 'in_transit'}
                    onClick={() => updateStatus(o._id, 'in_transit')}>
                    🚚 Mark In Transit
                  </button>
                )}
                {o.orderStatus === 'in_transit' && (
                  <button className="btn btn-primary btn-sm"
                    disabled={updating === o._id + 'delivered'}
                    onClick={() => updateStatus(o._id, 'delivered')}>
                    ✅ Mark Delivered
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed */}
      {mine.filter(o => o.orderStatus === 'delivered').length > 0 && (
        <>
          <h3 style={{ fontWeight: 600, marginBottom: 12, color: '#6b7280' }}>
            ✅ Completed Deliveries ({mine.filter(o => o.orderStatus === 'delivered').length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mine.filter(o => o.orderStatus === 'delivered').map(o => (
              <div key={o._id} className="card" style={{ opacity: 0.75 }}>
                <div className="flex-between">
                  <div>
                    <div style={{ fontWeight: 600 }}>{o.product?.name}</div>
                    <div className="text-gray text-sm">{o.deliveryAddress?.city} · {new Date(o.updatedAt).toLocaleDateString('en-IN')}</div>
                  </div>
                  <span className="badge badge-green">Delivered</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
