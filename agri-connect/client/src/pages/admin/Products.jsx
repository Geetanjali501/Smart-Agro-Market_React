import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});
  const [updating, setUpdating] = useState(null);

  const fetchProducts = () => {
    api.get('/admin/products/pending')
      .then(r => setProducts(r.data))
      .catch(() => toast.error('Failed to load pending products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const decide = async (id, status) => {
    setUpdating(id + status);
    try {
      await api.put(`/admin/products/${id}`, { status, adminNote: notes[id] || '' });
      toast.success(`Product ${status}`);
      fetchProducts();
    } catch { toast.error('Failed to update'); }
    finally { setUpdating(null); }
  };

  if (loading) return <div className="flex-center" style={{ height: 300 }}><div className="spinner" /></div>;

  return (
    <div className="container page">
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>🌿 Product Approval Queue</h2>

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🎉</div>
          <p>No pending product approvals!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {products.map(p => (
            <div key={p._id} className="card">
              <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
                {p.images?.[0]
                  ? <img src={p.images[0]} alt={p.name} style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                  : <div style={{ width: 90, height: 90, background: 'var(--green-light)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0 }}>🌾</div>
                }
                <div style={{ flex: 1 }}>
                  <div className="flex-between" style={{ flexWrap: 'wrap', gap: 4 }}>
                    <h3 style={{ fontWeight: 600 }}>{p.name}</h3>
                    <span className="badge badge-orange">Pending Review</span>
                  </div>
                  <div className="text-sm text-gray mt-1">
                    {p.category} · Grade {p.qualityGrade} · ₹{p.price}/{p.unit} · {p.quantity} {p.unit}
                    {p.isOrganic && <span className="badge badge-green" style={{ marginLeft: 8 }}>🌿 Organic</span>}
                  </div>
                  <div className="text-sm text-gray">
                    🧑‍🌾 {p.farmer?.name} · {p.farmer?.farmLocation}
                  </div>
                  {p.description && <div className="text-sm text-gray mt-1">"{p.description}"</div>}
                </div>
              </div>

              <div className="form-group mt-3">
                <label>Note to Farmer (optional)</label>
                <input
                  value={notes[p._id] || ''}
                  onChange={e => setNotes(prev => ({ ...prev, [p._id]: e.target.value }))}
                  placeholder="Reason for rejection or any feedback..."
                />
              </div>

              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm" disabled={!!updating} onClick={() => decide(p._id, 'approved')}>
                  ✅ Approve
                </button>
                <button className="btn btn-danger btn-sm" disabled={!!updating} onClick={() => decide(p._id, 'rejected')}>
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
