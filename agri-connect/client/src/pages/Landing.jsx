import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();
  const dashPath = user ? (user.role === 'farmer' ? '/farmer' : user.role === 'admin' ? '/admin' : '/buyer') : null;

  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1a5c32 0%, #2d8c4e 100%)', color: 'white', padding: '80px 20px' }}>
        <div className="container text-center">
          <h1 style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.2 }}>🌱 AgriConnect</h1>
          <p style={{ fontSize: 20, marginTop: 16, opacity: 0.9 }}>
            Connecting Farmers Directly to Buyers — Fresh, Fair, and Fast
          </p>
          <div className="flex-center gap-3 mt-4" style={{ marginTop: 32 }}>
            {user ? (
              <Link to={dashPath} className="btn" style={{ background: 'white', color: 'var(--green)', fontSize: 16, padding: '14px 32px' }}>
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn" style={{ background: 'white', color: 'var(--green)', fontSize: 16, padding: '14px 32px' }}>
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-outline" style={{ borderColor: 'white', color: 'white', fontSize: 16, padding: '14px 32px' }}>
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container page">
        <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 40 }}>Why AgriConnect?</h2>
        <div className="grid-3">
          {[
            { icon: '🌾', title: 'Direct from Farm', desc: 'No middlemen — farmers list directly, buyers buy directly at fair prices.' },
            { icon: '💳', title: 'Secure Payments', desc: 'Escrow-protected payments released only after delivery confirmation.' },
            { icon: '🚚', title: 'Real-time Tracking', desc: 'Track your order from farm to doorstep with live logistics updates.' },
            { icon: '🤖', title: 'AI Price Advisor', desc: 'Smart pricing suggestions based on market trends and demand forecasts.' },
            { icon: '📱', title: 'Crop Disease AI', desc: 'Upload a leaf photo and get instant disease diagnosis and treatment tips.' },
            { icon: '☁️', title: 'Weather Alerts', desc: 'Personalized weather forecasts and storm warnings for farmers.' }
          ].map(f => (
            <div key={f.title} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40 }}>{f.icon}</div>
              <h3 style={{ fontWeight: 600, marginTop: 12 }}>{f.title}</h3>
              <p style={{ color: 'var(--gray)', marginTop: 8, fontSize: 14 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Roles */}
      <div style={{ background: 'var(--green-light)', padding: '60px 20px' }}>
        <div className="container">
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 40 }}>Who is it for?</h2>
          <div className="grid-3">
            {[
              { icon: '🌾', role: 'Farmers & Producers', desc: 'List your crops, get fair prices, manage orders and track earnings.' },
              { icon: '🛒', role: 'Buyers', desc: 'Consumers, retailers, wholesalers and restaurants buying fresh produce.' },
              { icon: '🚚', role: 'Logistics Partners', desc: 'Deliver farm-fresh produce to buyers across the region.' }
            ].map(r => (
              <div key={r.role} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48 }}>{r.icon}</div>
                <h3 style={{ fontWeight: 600, marginTop: 12 }}>{r.role}</h3>
                <p style={{ color: 'var(--gray)', marginTop: 8, fontSize: 14 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#1a5c32', color: 'rgba(255,255,255,0.8)', textAlign: 'center', padding: 24 }}>
        <p>© 2026 AgriConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}
