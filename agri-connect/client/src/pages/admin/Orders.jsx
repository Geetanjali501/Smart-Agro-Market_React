import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const statusClass = {
  placed: 'badge-orange', accepted: 'badge-green', rejected: 'badge-red',
  pickup_ready: 'badge-blue', in_transit: 'badge-blue', delivered: 'badge-green', cancelled: 'badge-gray'
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/orders')
      .then(r => setOrders(r.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex-center" style={{ height: 300 }}><div className="spinner" /></div>;

  return (
    <div className="container page">
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>📦 All Orders ({orders.length})</h2>

      {orders.length === 0 ? (
        <div className="empty-state"><div className="icon">📭</div><p>No orders yet</p></div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <thead style={{ background: 'var(--green)', color: 'white' }}>
              <tr>
                {['Product', 'Buyer', 'Farmer', 'Qty', 'Amount', 'Commission', 'Status', 'Payment', 'Date'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 13, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={o._id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                  <td style={{ padding: '10px 14px', fontSize: 14, fontWeight: 500 }}>{o.product?.name || '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13 }}>{o.buyer?.name || '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13 }}>{o.farmer?.name || '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13 }}>{o.quantity}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>₹{o.totalPrice}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13 }}>₹{Number(o.commission || 0).toFixed(2)}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span className={`badge ${statusClass[o.orderStatus] || 'badge-gray'}`}>{o.orderStatus}</span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span className="badge badge-gray">{o.paymentStatus}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--gray)', whiteSpace: 'nowrap' }}>
                    {new Date(o.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
