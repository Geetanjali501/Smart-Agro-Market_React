import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Dairy', 'Other'];

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category: '', grade: '', organic: '', minPrice: '', maxPrice: '' });

  const fetchProducts = (f = filters) => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(f).filter(([, v]) => v !== ''));
    api.get('/products', { params })
      .then(r => setProducts(r.data))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const setF = k => e => setFilters(p => ({ ...p, [k]: e.target.value }));

  const addToCart = (e, p) => {
    e.preventDefault();
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(i => i.productId === p._id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ productId: p._id, name: p.name, price: p.price, unit: p.unit, quantity: 1, image: p.images?.[0] });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success(`${p.name} added to cart`);
  };

  return (
    <div className="container page">
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>🛒 Marketplace</h2>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, alignItems: 'end' }}>
          <div>
            <label>Search</label>
            <input value={filters.search} onChange={setF('search')} placeholder="Search crops..." onKeyDown={e => e.key === 'Enter' && fetchProducts()} />
          </div>
          <div>
            <label>Category</label>
            <select value={filters.category} onChange={setF('category')}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label>Grade</label>
            <select value={filters.grade} onChange={setF('grade')}>
              <option value="">All Grades</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
            </select>
          </div>
          <div>
            <label>Min ₹</label>
            <input type="number" value={filters.minPrice} onChange={setF('minPrice')} placeholder="0" />
          </div>
          <div>
            <label>Max ₹</label>
            <input type="number" value={filters.maxPrice} onChange={setF('maxPrice')} placeholder="Any" />
          </div>
          <div>
            <label>Type</label>
            <select value={filters.organic} onChange={setF('organic')}>
              <option value="">All</option>
              <option value="true">Organic only</option>
            </select>
          </div>
          <div>
            <label>&nbsp;</label>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => fetchProducts()} disabled={loading}>
              🔍 Search
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: 300 }}><div className="spinner" /></div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🌿</div>
          <p>No products found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid-3">
          {products.map(p => (
            <div key={p._id} className="product-card">
              <Link to={`/product/${p._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {p.images?.[0]
                  ? <img src={p.images[0]} alt={p.name} />
                  : <div style={{ height: 180, background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>🌾</div>
                }
                <div className="product-info">
                  <div className="flex-between">
                    <span className="product-name">{p.name}</span>
                    <span className="badge badge-green">Grade {p.qualityGrade}</span>
                  </div>
                  <div className="text-gray text-sm mt-1">{p.category} · {p.location}</div>
                  <div className="flex-between" style={{ marginTop: 8 }}>
                    <span className="product-price">₹{p.price}/{p.unit}</span>
                    <span className="text-sm text-gray">{p.quantity} {p.unit} left</span>
                  </div>
                  <div className="text-sm text-gray mt-1">
                    🧑‍🌾 {p.farmer?.name} · ⭐ {p.farmer?.rating > 0 ? p.farmer.rating.toFixed(1) : 'New'}
                    {p.isOrganic && <span className="badge badge-green" style={{ marginLeft: 8 }}>🌿</span>}
                  </div>
                </div>
              </Link>
              <div style={{ padding: '0 14px 14px' }}>
                <button className="btn btn-outline btn-sm" style={{ width: '100%' }} onClick={e => addToCart(e, p)}>
                  🛍️ Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
