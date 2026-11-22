import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProfileSetup() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    farmLocation: '', cropsGrown: '', landSize: '',
    accountNumber: '', ifsc: '', accountHolder: '',
    street: '', city: '', state: '', pincode: '', businessType: ''
  });

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      let payload = {};
      if (user.role === 'farmer') {
        payload = {
          farmLocation: form.farmLocation,
          cropsGrown: form.cropsGrown ? form.cropsGrown.split(',').map(s => s.trim()).filter(Boolean) : [],
          landSize: form.landSize,
          bankDetails: {
            accountNumber: form.accountNumber,
            ifsc: form.ifsc,
            accountHolder: form.accountHolder
          }
        };
      } else {
        payload = {
          deliveryAddress: {
            street: form.street, city: form.city,
            state: form.state, pincode: form.pincode
          },
          businessType: form.businessType || undefined
        };
      }

      const { data } = await api.put('/auth/profile', payload);
      setUser(data);
      toast.success('Profile saved!');

      const redirects = { farmer: '/farmer', buyer: '/marketplace', admin: '/admin', logistics: '/buyer' };
      navigate(redirects[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--green-light)', padding: '40px 20px' }}>
      <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          {user?.role === 'farmer' ? '🌾 Farmer Profile Setup' : '🛒 Buyer Profile Setup'}
        </h2>
        <p className="text-gray text-sm" style={{ marginBottom: 20 }}>
          You can skip and update this later from your profile settings.
        </p>

        {user?.role === 'farmer' && (
          <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 13 }}>
            ⏳ After setup, your account will be reviewed by admin before you can list products (KYC verification).
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {user?.role === 'farmer' ? (
            <>
              <div className="form-group">
                <label>Farm Location</label>
                <input value={form.farmLocation} onChange={set('farmLocation')} placeholder="Village, District, State" />
              </div>
              <div className="form-group">
                <label>Crops Grown (comma-separated)</label>
                <input value={form.cropsGrown} onChange={set('cropsGrown')} placeholder="Tomato, Wheat, Rice" />
              </div>
              <div className="form-group">
                <label>Land Size</label>
                <input value={form.landSize} onChange={set('landSize')} placeholder="e.g. 5 acres" />
              </div>
              <h3 style={{ fontWeight: 600, margin: '16px 0 12px' }}>Bank Details (for payments)</h3>
              <div className="form-group">
                <label>Account Holder Name</label>
                <input value={form.accountHolder} onChange={set('accountHolder')} placeholder="Name as per bank" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Account Number</label>
                  <input value={form.accountNumber} onChange={set('accountNumber')} placeholder="Account number" />
                </div>
                <div className="form-group">
                  <label>IFSC Code</label>
                  <input value={form.ifsc} onChange={set('ifsc')} placeholder="e.g. SBIN0001234" />
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Delivery Address</h3>
              <div className="form-group">
                <label>Street</label>
                <input value={form.street} onChange={set('street')} placeholder="Street address" />
              </div>
              <div className="grid-2">
                <div className="form-group"><label>City</label><input value={form.city} onChange={set('city')} /></div>
                <div className="form-group"><label>State</label><input value={form.state} onChange={set('state')} /></div>
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input value={form.pincode} onChange={set('pincode')} />
              </div>
              <div className="form-group">
                <label>Business Type</label>
                <select value={form.businessType} onChange={set('businessType')}>
                  <option value="">Individual Consumer</option>
                  <option value="retailer">Retailer</option>
                  <option value="wholesaler">Wholesaler</option>
                  <option value="restaurant">Restaurant</option>
                </select>
              </div>
            </>
          )}

          <div className="flex gap-3 mt-4">
            <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: 12 }} disabled={loading}>
              {loading ? 'Saving...' : 'Save & Continue →'}
            </button>
            <button type="button" className="btn btn-outline" style={{ padding: 12 }}
              onClick={() => navigate(user?.role === 'farmer' ? '/farmer' : '/marketplace')}>
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
