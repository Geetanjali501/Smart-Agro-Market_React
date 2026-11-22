import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const statusClass = { pending: 'badge-orange', approved: 'badge-green', rejected: 'badge-red', sold: 'badge-gray' };

export default function FarmerListings() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchListings = () => {
    setLoading(true);
    api.get('/products/farmer/my-listings')
      .then(r => setProducts(r.data))
      .catch(() => setError('Failed to load listings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchListings(); }, []);

  const deleteProduct = async id => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Listing deleted');
      fetchListings();
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="flex-center" style={{ height: 300 }}><div className="spinner" /></div>;

  return (
    <div className="container page">
      <div className="flex-between mb-4">
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>🌾 My Listings</h2>
        <Link to="/farmer/add-product" className="btn btn-primary">➕ Add Product</Link>
      </div>

      {error && <div style={{ background: '#fee2e2', borderRadius: 8, padding: 12, marginBottom: 16, color: '#dc2626' }}>{error}</div>}

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🌱</div>
          <p>No listings yet. Add your first product!</p>
          <Link to="/farmer/add-product" className="btn btn-primary" style={{ marginTop: 16 }}>➕ Add Product</Link>
        </div>
      ) : (
        <div className="grid-3">
          {products.map(p => (
            <div key={p._id} className="card">
              {p.images?.[0]
                ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }} />
                : <div style={{ width: '100%', height: 160, background: 'var(--green-light)', borderRadius: 8, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🌾</div>
              }
              <div className="flex-between">
                <h3 style={{ fontWeight: 600 }}>{p.name}</h3>
                <span className={`badge ${statusClass[p.status] || 'badge-gray'}`}>{p.status}</span>
              </div>
              <div className="text-gray text-sm mt-1">{p.category} · Grade {p.qualityGrade} {p.isOrganic ? '· 🌿 Organic' : ''}</div>
              <div style={{ marginTop: 8 }}>
                <span style={{ fontWeight: 700, color: 'var(--green)', fontSize: 18 }}>₹{p.price}/{p.unit}</span>
                <span className="text-gray text-sm" style={{ marginLeft: 8 }}>{p.quantity} {p.unit} left</span>
              </div>
              {p.adminNote && (
                <div style={{ background: '#fee2e2', borderRadius: 6, padding: '6px 10px', marginTop: 8, fontSize: 12, color: '#991b1b' }}>
                  📝 Admin Note: {p.adminNote}
                </div>
              )}
              <button className="btn btn-danger btn-sm mt-3" onClick={() => deleteProduct(p._id)}>🗑️ Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
