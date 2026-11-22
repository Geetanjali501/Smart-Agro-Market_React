import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = {
  farmer: [
    { to: '/farmer', label: '🏠 Dashboard' },
    { to: '/farmer/listings', label: '🌾 My Listings' },
    { to: '/farmer/add-product', label: '➕ Add Product' },
    { to: '/farmer/orders', label: '📦 Orders' }
  ],
  buyer: [
    { to: '/buyer', label: '🏠 Dashboard' },
    { to: '/marketplace', label: '🛒 Marketplace' },
    { to: '/cart', label: '🛍️ Cart' },
    { to: '/buyer/orders', label: '📦 My Orders' }
  ],
  admin: [
    { to: '/admin', label: '📊 Dashboard' },
    { to: '/admin/kyc', label: '✅ KYC' },
    { to: '/admin/products', label: '🌿 Products' },
    { to: '/admin/orders', label: '📦 Orders' }
  ],
  logistics: [
    { to: '/logistics', label: '🏠 Dashboard' },
    { to: '/logistics/orders', label: '📦 Deliveries' }
  ]
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = navLinks[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = to => location.pathname === to;

  return (
    <nav style={{ background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container flex-between" style={{ height: 60 }}>
        <Link to="/" style={{ fontWeight: 700, fontSize: 20, color: 'var(--green)', textDecoration: 'none' }}>
          🌱 AgriConnect
        </Link>

        <div className="flex gap-3" style={{ alignItems: 'center' }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              fontSize: 13, fontWeight: isActive(l.to) ? 700 : 500,
              color: isActive(l.to) ? 'var(--green)' : '#374151',
              borderBottom: isActive(l.to) ? '2px solid var(--green)' : '2px solid transparent',
              paddingBottom: 2, textDecoration: 'none'
            }}>
              {l.label}
            </Link>
          ))}

          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setMenuOpen(o => !o)}
              style={{ fontWeight: 600 }}
            >
              👤 {user?.name?.split(' ')[0]}
            </button>
            {menuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: '110%', background: 'white',
                border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, minWidth: 170,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 200
              }}>
                <div style={{ padding: '6px 12px', fontSize: 12, color: 'var(--gray)', borderBottom: '1px solid #f3f4f6', marginBottom: 4 }}>
                  {user?.email || user?.phone}<br />
                  <span className="badge badge-green" style={{ marginTop: 2 }}>{user?.role}</span>
                </div>
                <Link to="/profile-setup"
                  style={{ display: 'block', padding: '8px 12px', fontSize: 14, color: '#374151', textDecoration: 'none' }}
                  onClick={() => setMenuOpen(false)}>
                  ⚙️ Edit Profile
                </Link>
                <button onClick={handleLogout} style={{
                  display: 'block', width: '100%', padding: '8px 12px',
                  textAlign: 'left', background: 'none', border: 'none',
                  fontSize: 14, color: 'var(--red)', cursor: 'pointer'
                }}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
