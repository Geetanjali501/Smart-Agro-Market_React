import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const statusClass = {
  placed: 'badge-orange', accepted: 'badge-green', rejected: 'badge-red',
  pickup_ready: 'badge-blue', in_transit: 'badge-blue', delivered: 'badge-green', cancelled: 'badge-gray'
};

const statusLabel = {
  placed: '⏳ Placed', accepted: '✅ Accepted', rejected: '❌ Rejected',
  pickup_ready: '📦 Ready for Pickup', in_transit: '🚚 In Transit',
  delivered: '✅ Delivered', cancelled: '🚫 Cancelled'
};

export default function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  const [review, setReview] = useState({ rating: 5, review: '' });

  const fetchOrders = () => {
    api.get('/orders')
      .then(r => setOrders(r.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const confirmDelivery = async id => {
    setUpdating(id);
    try {
      await api.put(`/orders/${id}/status`, { status: 'delivered' });
      toast.success('Delivery confirmed! Payment released to farmer.');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm delivery');
    } finally { setUpdating(null); }
  };

  const cancelOrder = async id => {
    if (!window.confirm('Cancel this order?')) return;
    setUpdating(id);
    try {
      await api.put(`/orders/${id}/status`, { status: 'cancelled' });
      toast.success('Order cancelled');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel at this stage');
    } finally { setUpdating(null); }
  };

  const submitReview = async id => {
    try {
      await api.put(`/orders/${id}/review`, review);
      toast.success('Review submitted!');
      setReviewing(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return <div className="flex-center" style={{ height: 300 }}><div className="spinner" /></div>;

  return (
    <div className="container page">
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>📦 My Orders</h2>
      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📭</div>
          <p>No orders yet — <a href="/marketplace" className="text-green" style={{ fontWeight: 600 }}>browse the marketplace</a></p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(o => (
            <div key={o._id} className="card">
              <div className="flex-between" style={{ flexWrap: 'wrap', gap: 8 }}>
                <div className="flex gap-3" style={{ alignItems: 'center' }}>
                  {o.product?.images?.[0]
                    ? <img src={o.product.images[0]} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }} />
                    : <div style={{ width: 56, height: 56, background: 'var(--green-light)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🌾</div>
                  }
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{o.product?.name}</div>
                    <div className="text-gray text-sm">{o.quantity} {o.product?.unit} · ₹{o.totalPrice}</div>
                  </div>
                </div>
                <span className={`badge ${statusClass[o.orderStatus] || 'badge-gray'}`}>
                  {statusLabel[o.orderStatus] || o.orderStatus}
                </span>
              </div>

              <div className="text-sm text-gray mt-2">
                🧑‍🌾 Farmer: {o.farmer?.name} · 📍 {o.farmer?.farmLocation}
              </div>
              <div className="text-sm text-gray">
                🗓 {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                {' · '}{o.deliveryOption}
              </div>
              {o.trackingInfo && (
                <div className="text-sm mt-1" style={{ color: 'var(--green)' }}>🔍 Tracking: {o.trackingInfo}</div>
              )}
              <div className="text-sm mt-1">
                💳 Payment:{' '}
                <span style={{ fontWeight: 600, color: o.paymentStatus === 'released' ? 'var(--green)' : o.paymentStatus === 'refunded' ? 'var(--red)' : '#6b7280' }}>
                  {o.paymentStatus}
                </span>
              </div>

              <div className="flex gap-2 mt-3" style={{ flexWrap: 'wrap' }}>
                {o.orderStatus === 'placed' && (
                  <button className="btn btn-danger btn-sm" disabled={updating === o._id} onClick={() => cancelOrder(o._id)}>
                    🚫 Cancel Order
                  </button>
                )}
                {o.orderStatus === 'in_transit' && (
                  <button className="btn btn-primary btn-sm" disabled={updating === o._id} onClick={() => confirmDelivery(o._id)}>
                    {updating === o._id ? '...' : '✅ Confirm Delivery'}
                  </button>
                )}
                {o.orderStatus === 'delivered' && !o.buyerRating && (
                  reviewing === o._id ? (
                    <div style={{ width: '100%', background: 'var(--gray-light)', borderRadius: 8, padding: 12, marginTop: 4 }}>
                      <div className="form-group">
                        <label>Rating (1–5 ⭐)</label>
                        <input type="number" min={1} max={5} value={review.rating}
                          onChange={e => setReview(p => ({ ...p, rating: Number(e.target.value) }))}
                          style={{ width: 80 }} />
                      </div>
                      <div className="form-group">
                        <label>Your Review</label>
                        <textarea rows={2} value={review.review}
                          onChange={e => setReview(p => ({ ...p, review: e.target.value }))}
                          placeholder="How was the quality and delivery?" />
                      </div>
                      <div className="flex gap-2">
                        <button className="btn btn-primary btn-sm" onClick={() => submitReview(o._id)}>Submit</button>
                        <button className="btn btn-outline btn-sm" onClick={() => setReviewing(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn btn-outline btn-sm" onClick={() => { setReview({ rating: 5, review: '' }); setReviewing(o._id); }}>
                      ⭐ Rate & Review
                    </button>
                  )
                )}
                {o.buyerRating && (
                  <div className="text-sm" style={{ color: '#6b7280' }}>
                    ⭐ Your rating: {o.buyerRating}/5 {o.buyerReview && `— "${o.buyerReview}"`}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
