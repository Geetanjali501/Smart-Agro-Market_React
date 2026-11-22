import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [ordering, setOrdering] = useState(null);
  const [form, setForm] = useState({
    street: '', city: '', state: '', pincode: '',
    deliveryOption: 'standard', paymentMethod: 'UPI'
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(stored);
    // Pre-fill address from user profile if available
    if (user?.deliveryAddress) {
      setForm(p => ({
        ...p,
        street: user.deliveryAddress.street || '',
        city: user.deliveryAddress.city || '',
        state: user.deliveryAddress.state || '',
        pincode: user.deliveryAddress.pincode || ''
      }));
    }
  }, [user]);

  const syncCart = updated => {
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const remove = productId => syncCart(cart.filter(i => i.productId !== productId));

  const updateQty = (productId, qty) => {
    if (qty < 1) return;
    syncCart(cart.map(i => i.productId === productId ? { ...i, quantity: qty } : i));
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const placeOrder = async item => {
    if (!form.city || !form.state || !form.pincode)
      return toast.error('Please fill in delivery address (city, state, pincode)');

    setOrdering(item.productId);
    try {
      await api.post('/orders', {
        productId: item.productId,
        quantity: item.quantity,
        deliveryAddress: { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
        deliveryOption: form.deliveryOption,
        paymentMethod: form.paymentMethod
      });
      toast.success(`Order placed for ${item.name}!`);
      remove(item.productId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setOrdering(null); }
  };

  const placeAll = async () => {
    if (!form.city || !form.state || !form.pincode)
      return toast.error('Please fill in delivery address first');
    for (const item of cart) {
      await placeOrder(item);
    }
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="container page">
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>🛍️ My Cart</h2>

      {cart.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🛒</div>
          <p>Your cart is empty</p>
          <Link to="/marketplace" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Marketplace</Link>
        </div>
      ) : (
        <div className="grid-2" style={{ gap: 32, alignItems: 'start' }}>
          <div>
            {cart.map(item => (
              <div key={item.productId} className="card" style={{ marginBottom: 16 }}>
                <div className="flex gap-3">
                  {item.image
                    ? <img src={item.image} alt={item.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                    : <div style={{ width: 72, height: 72, background: 'var(--green-light)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🌾</div>
                  }
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div className="text-gray text-sm">₹{item.price}/{item.unit}</div>
                    <div className="flex gap-2" style={{ alignItems: 'center', marginTop: 8 }}>
                      <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="btn btn-outline btn-sm" style={{ padding: '2px 10px' }}>−</button>
                      <span style={{ fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="btn btn-outline btn-sm" style={{ padding: '2px 10px' }}>+</button>
                      <span style={{ fontWeight: 700, color: 'var(--green)', marginLeft: 8 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2" style={{ alignItems: 'flex-start', flexDirection: 'column' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => placeOrder(item)} disabled={ordering === item.productId}>
                      {ordering === item.productId ? '...' : '⚡ Order'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(item.productId)}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}

            <div className="card flex-between">
              <span style={{ fontSize: 18, fontWeight: 700 }}>Total: ₹{total.toFixed(2)}</span>
              <button className="btn btn-primary" onClick={placeAll} disabled={ordering !== null}>
                ⚡ Order All ({cart.length})
              </button>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>📍 Delivery Details</h3>
            <div className="form-group"><label>Street</label><input value={form.street} onChange={set('street')} placeholder="Street address" /></div>
            <div className="grid-2">
              <div className="form-group"><label>City *</label><input value={form.city} onChange={set('city')} required /></div>
              <div className="form-group"><label>State *</label><input value={form.state} onChange={set('state')} required /></div>
            </div>
            <div className="form-group"><label>Pincode *</label><input value={form.pincode} onChange={set('pincode')} required /></div>
            <div className="form-group">
              <label>Delivery Type</label>
              <select value={form.deliveryOption} onChange={set('deliveryOption')}>
                <option value="standard">Standard Delivery</option>
                <option value="cold-chain">Cold Chain (perishables)</option>
                <option value="pickup">Self Pickup</option>
              </select>
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select value={form.paymentMethod} onChange={set('paymentMethod')}>
                <option value="UPI">UPI</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="NetBanking">Net Banking</option>
                <option value="Wallet">Wallet</option>
              </select>
            </div>
            <div style={{ background: 'var(--green-light)', borderRadius: 8, padding: 10, fontSize: 12, color: 'var(--green-dark)' }}>
              🔒 Payment is held in escrow and released to the farmer only after you confirm delivery.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
