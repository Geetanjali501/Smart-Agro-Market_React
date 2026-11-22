import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminKyc() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchFarmers = () => {
    api.get('/admin/kyc-pending')
      .then(r => setFarmers(r.data))
      .catch(() => toast.error('Failed to load KYC requests'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFarmers(); }, []);

  const decide = async (id, approved) => {
    setUpdating(id);
    try {
      await api.put(`/admin/kyc/${id}`, { approved });
      toast.success(approved ? 'Farmer approved!' : 'Farmer rejected');
      fetchFarmers();
    } catch { toast.error('Failed to update'); }
    finally { setUpdating(null); }
  };

  if (loading) return <div className="flex-center" style={{ height: 300 }}><div className="spinner" /></div>;

  return (
    <div className="container page">
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>✅ KYC Verification Queue</h2>

      {farmers.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🎉</div>
          <p>No pending KYC requests — all caught up!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {farmers.map(f => (
            <div key={f._id} className="card">
              <div className="flex-between" style={{ flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: 16 }}>{f.name}</h3>
                  <div className="text-gray text-sm">{f.email || f.phone}</div>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm" disabled={updating === f._id} onClick={() => decide(f._id, true)}>
                    ✅ Approve
                  </button>
                  <button className="btn btn-danger btn-sm" disabled={updating === f._id} onClick={() => decide(f._id, false)}>
                    ❌ Reject
                  </button>
                </div>
              </div>

              <div className="grid-2 mt-3" style={{ fontSize: 13 }}>
                <div><strong>Farm Location:</strong> {f.farmLocation || '—'}</div>
                <div><strong>Land Size:</strong> {f.landSize || '—'}</div>
                <div><strong>Crops:</strong> {f.cropsGrown?.join(', ') || '—'}</div>
                <div><strong>Registered:</strong> {new Date(f.createdAt).toLocaleDateString('en-IN')}</div>
              </div>

              {f.bankDetails?.accountNumber && (
                <div style={{ marginTop: 10, fontSize: 12, background: 'var(--gray-light)', borderRadius: 6, padding: '6px 10px' }}>
                  🏦 Bank: {f.bankDetails.accountHolder} · IFSC: {f.bankDetails.ifsc}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
