import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(() => toast.error('Failed to load product'))
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = () => {
    if (qty < 1 || qty > product.quantity) return toast.error(`Enter quantity between 1 and ${product.quantity}`);
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(i => i.productId === id);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({ productId: id, name: product.name, price: product.price, unit: product.unit, quantity: qty, image: product.images?.[0] });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success('Added to cart!');
  };

  const buyNow = () => {
    addToCart();
    navigate('/cart');
  };

  if (loading) return <div className="flex-center" style={{ height: 400 }}><div className="spinner" /></div>;
  if (!product) return (
    <div className="container page empty-state">
      <div className="icon">❌</div>
      <p>Product not found</p>
    </div>
  );

  return (
    <div className="container page">
      <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm" style={{ marginBottom: 20 }}>← Back</button>

      <div className="grid-2" style={{ gap: 32, alignItems: 'start' }}>
        <div>
          {product.images?.length > 0
            ? <img src={product.images[activeImage]} alt={product.name} style={{ width: '100%', borderRadius: 12, maxHeight: 400, objectFit: 'cover' }} />
            : <div style={{ height: 300, background: 'var(--green-light)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>🌾</div>
          }
          {product.images?.length > 1 && (
            <div className="flex gap-2" style={{ marginTop: 12 }}>
              {product.images.map((img, i) => (
                <img key={i} src={img} alt="" onClick={() => setActiveImage(i)}
                  style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: activeImage === i ? '2px solid var(--green)' : '2px solid transparent' }} />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex gap-2" style={{ marginBottom: 10, flexWrap: 'wrap' }}>
            <span className="badge badge-green">Grade {product.qualityGrade}</span>
            {product.isOrganic && <span className="badge badge-green">🌿 Organic</span>}
            <span className="badge badge-gray">{product.category}</span>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 700 }}>{product.name}</h1>
          <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--green)', marginTop: 8 }}>
            ₹{product.price}/{product.unit}
          </div>
          <div className="text-gray text-sm mt-1">
            {product.quantity} {product.unit} available
          </div>

          {product.description && (
            <p style={{ marginTop: 16, color: '#374151', lineHeight: 1.6 }}>{product.description}</p>
          )}

          <div style={{ background: 'var(--gray-light)', borderRadius: 8, padding: 14, marginTop: 16 }}>
            <h4 style={{ fontWeight: 600, marginBottom: 8 }}>🧑‍🌾 About the Farmer</h4>
            <div style={{ fontSize: 14 }}>
              <div><strong>{product.farmer?.name}</strong></div>
              {product.farmer?.farmLocation && <div className="text-gray">📍 {product.farmer.farmLocation}</div>}
              <div className="text-gray">
                ⭐ {product.farmer?.rating > 0 ? product.farmer.rating.toFixed(1) : 'New'} · {product.farmer?.totalRatings || 0} reviews
              </div>
            </div>
          </div>

          {product.harvestDate && (
            <div style={{ marginTop: 10, fontSize: 14, color: 'var(--gray)' }}>
              🗓 Harvested: {new Date(product.harvestDate).toLocaleDateString('en-IN')}
            </div>
          )}
          {product.location && (
            <div style={{ fontSize: 14, color: 'var(--gray)' }}>📍 {product.location}</div>
          )}

          <div className="flex gap-3" style={{ alignItems: 'center', marginTop: 24 }}>
            <label style={{ margin: 0, fontWeight: 600 }}>Qty:</label>
            <input type="number" min={1} max={product.quantity} value={qty}
              onChange={e => setQty(Math.max(1, Math.min(product.quantity, Number(e.target.value))))}
              style={{ width: 80 }} />
            <span className="text-gray text-sm">Total: ₹{(product.price * qty).toFixed(2)}</span>
          </div>

          <div className="flex gap-3 mt-4">
            <button className="btn btn-outline" onClick={addToCart}>🛍️ Add to Cart</button>
            <button className="btn btn-primary" onClick={buyNow}>⚡ Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
