import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Dairy', 'Other'];

// Well-known crop default images from Unsplash (free, no key needed)
const CROP_IMAGES = {
  tomato: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&q=80',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80',
  onion: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=600&q=80',
  rice: 'https://images.unsplash.com/photo-1536304993881-ff86e0c9c6c3?w=600&q=80',
  wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80',
  maize: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&q=80',
  corn: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&q=80',
  spinach: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80',
  carrot: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&q=80',
  mango: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80',
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80',
  apple: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&q=80',
  grapes: 'https://images.unsplash.com/photo-1515779122185-2390ccdf060b?w=600&q=80',
  chilli: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600&q=80',
  pepper: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600&q=80',
  cauliflower: 'https://images.unsplash.com/photo-1566842600175-97dca489844f?w=600&q=80',
  cabbage: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&q=80',
  brinjal: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=600&q=80',
  eggplant: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=600&q=80',
  ginger: 'https://images.unsplash.com/photo-1573414405524-df2b73e9e42e?w=600&q=80',
  garlic: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=600&q=80',
  lemon: 'https://images.unsplash.com/photo-1582476832001-c9f12d8fffdb?w=600&q=80',
  peas: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&q=80',
  soybean: 'https://images.unsplash.com/photo-1612257999049-8d6d5e4b84f9?w=600&q=80',
};

function getAutoImage(cropName) {
  if (!cropName) return null;
  const key = cropName.toLowerCase().trim();
  // Exact match
  if (CROP_IMAGES[key]) return CROP_IMAGES[key];
  // Partial match
  for (const [k, url] of Object.entries(CROP_IMAGES)) {
    if (key.includes(k) || k.includes(key)) return url;
  }
  // Generic fallback via Unsplash search
  return `https://source.unsplash.com/600x400/?${encodeURIComponent(cropName + ' vegetable crop farm')}`;
}

export default function AddProduct() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageMode, setImageMode] = useState('auto'); // 'auto' | 'upload' | 'camera'
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadPreviews, setUploadPreviews] = useState([]);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraPhoto, setCameraPhoto] = useState(null); // base64
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [form, setForm] = useState({
    name: '', category: '', description: '', quantity: '',
    unit: 'kg', price: '', qualityGrade: 'A',
    harvestDate: '', isOrganic: false, location: user?.farmLocation || ''
  });

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const autoImageUrl = getAutoImage(form.name);

  // ── Upload mode ──────────────────────────────────────────
  const handleFileChange = e => {
    const files = [...e.target.files];
    setUploadedFiles(files);
    setUploadPreviews(files.map(f => URL.createObjectURL(f)));
  };

  // ── Camera mode ──────────────────────────────────────────
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
    } catch {
      toast.error('Camera not accessible. Use upload instead.');
      setImageMode('upload');
    }
  };

  const stopCamera = () => {
    cameraStream?.getTracks().forEach(t => t.stop());
    setCameraStream(null);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCameraPhoto(dataUrl);
    stopCamera();
    toast.success('Photo captured!');
  };

  const retakePhoto = () => {
    setCameraPhoto(null);
    startCamera();
  };

  // ── Switch image mode ────────────────────────────────────
  const switchMode = mode => {
    stopCamera();
    setCameraPhoto(null);
    setUploadedFiles([]);
    setUploadPreviews([]);
    setImageMode(mode);
    if (mode === 'camera') startCamera();
  };

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async e => {
    e.preventDefault();
    if (!user?.isApproved) return toast.error('KYC not approved yet.');

    setLoading(true);
    try {
      const fd = new FormData();

      // Append form fields
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));

      if (imageMode === 'upload' && uploadedFiles.length > 0) {
        uploadedFiles.forEach(f => fd.append('images', f));
      } else if (imageMode === 'camera' && cameraPhoto) {
        // Convert base64 to blob and append
        const res = await fetch(cameraPhoto);
        const blob = await res.blob();
        fd.append('images', blob, 'camera-photo.jpg');
      } else if (imageMode === 'auto') {
        // Pass the auto image URL as a string field — server will store it
        fd.append('autoImageUrl', autoImageUrl || '');
      }

      await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Product submitted for approval!');
      navigate('/farmer/listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally { setLoading(false); }
  };

  if (!user?.isApproved) {
    return (
      <div className="container page">
        <div className="card text-center" style={{ maxWidth: 480, margin: '0 auto', padding: 40 }}>
          <div style={{ fontSize: 48 }}>⏳</div>
          <h3 style={{ fontWeight: 600, marginTop: 12 }}>KYC Pending Approval</h3>
          <p className="text-gray text-sm mt-2">Admin needs to verify your account before you can list products.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>🌾 Add New Product</h2>
      <div className="card" style={{ maxWidth: 720 }}>
        <form onSubmit={handleSubmit}>

          {/* ── Basic Info ── */}
          <div className="grid-2">
            <div className="form-group">
              <label>Crop Name *</label>
              <input value={form.name} onChange={set('name')} placeholder="e.g. Fresh Tomatoes" required />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select value={form.category} onChange={set('category')} required>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={set('description')} rows={2} placeholder="Optional — freshness, storage tips, etc." />
          </div>

          {/* ── Price & Quantity ── */}
          <div className="grid-2">
            <div className="form-group">
              <label>Quantity *</label>
              <div className="flex gap-2">
                <input type="number" min="1" value={form.quantity} onChange={set('quantity')} placeholder="Amount" required style={{ flex: 2 }} />
                <select value={form.unit} onChange={set('unit')} style={{ flex: 1 }}>
                  <option value="kg">kg</option>
                  <option value="tonnes">tonnes</option>
                  <option value="pieces">pieces</option>
                  <option value="dozen">dozen</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Your Price per {form.unit} (₹) *</label>
              <input type="number" min="1" value={form.price} onChange={set('price')} placeholder="You decide the price" required />
              <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 4 }}>💡 Set any price you feel is fair</div>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Quality Grade *</label>
              <select value={form.qualityGrade} onChange={set('qualityGrade')} required>
                <option value="A">Grade A — Premium</option>
                <option value="B">Grade B — Standard</option>
                <option value="C">Grade C — Economy</option>
              </select>
            </div>
            <div className="form-group">
              <label>Harvest Date *</label>
              <input type="date" value={form.harvestDate} onChange={set('harvestDate')} required />
            </div>
          </div>

          <div className="form-group">
            <label>Farm Location *</label>
            <input value={form.location} onChange={set('location')} placeholder="Village, District" required />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <input type="checkbox" id="organic" checked={form.isOrganic} onChange={set('isOrganic')} style={{ width: 'auto' }} />
            <label htmlFor="organic" style={{ margin: 0, cursor: 'pointer' }}>🌿 Organically grown</label>
          </div>

          {/* ── Image Section (OPTIONAL) ── */}
          <div style={{ background: 'var(--gray-light)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>
              📷 Product Image <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--gray)' }}>(optional)</span>
            </div>

            {/* Mode selector */}
            <div className="flex gap-2" style={{ marginBottom: 14 }}>
              {[
                { key: 'auto', label: '🔍 Auto (from name)' },
                { key: 'upload', label: '📁 Upload photo' },
                { key: 'camera', label: '📸 Take photo' }
              ].map(m => (
                <button type="button" key={m.key} onClick={() => switchMode(m.key)}
                  style={{
                    padding: '7px 14px', borderRadius: 8, border: `2px solid ${imageMode === m.key ? 'var(--green)' : '#e5e7eb'}`,
                    background: imageMode === m.key ? 'var(--green-light)' : 'white',
                    color: imageMode === m.key ? 'var(--green)' : '#374151',
                    fontWeight: imageMode === m.key ? 600 : 400, cursor: 'pointer', fontSize: 13
                  }}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Auto mode */}
            {imageMode === 'auto' && (
              <div>
                {form.name ? (
                  <div>
                    <img src={autoImageUrl} alt={form.name}
                      style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }}
                      onError={e => { e.target.style.display = 'none'; }} />
                    <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 6 }}>
                      Auto-fetched image for "{form.name}" — switch to Upload or Camera to use your own
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--gray)', fontSize: 13 }}>
                    Type the crop name above to auto-load an image
                  </div>
                )}
              </div>
            )}

            {/* Upload mode */}
            {imageMode === 'upload' && (
              <div>
                <input type="file" accept="image/*" multiple onChange={handleFileChange} />
                {uploadPreviews.length > 0 && (
                  <div className="flex gap-2" style={{ marginTop: 10, flexWrap: 'wrap' }}>
                    {uploadPreviews.map((src, i) => (
                      <img key={i} src={src} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Camera mode */}
            {imageMode === 'camera' && (
              <div>
                {cameraPhoto ? (
                  <div>
                    <img src={cameraPhoto} alt="captured" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 8 }} />
                    <button type="button" className="btn btn-outline btn-sm mt-3" onClick={retakePhoto}>🔄 Retake</button>
                  </div>
                ) : (
                  <div>
                    <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxHeight: 220, borderRadius: 8, background: '#000' }} />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <div className="flex gap-2 mt-3">
                      {cameraStream && (
                        <button type="button" className="btn btn-primary btn-sm" onClick={capturePhoto}>📸 Capture</button>
                      )}
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => switchMode('upload')}>
                        Switch to Upload
                      </button>
                    </div>
                    {!cameraStream && (
                      <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 8 }}>
                        Starting camera... (if it doesn't open, switch to Upload)
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ background: 'var(--green-light)', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13, color: 'var(--green-dark)' }}>
            ✅ Your product will go live in the marketplace immediately after submission.
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: 12 }} disabled={loading}>
              {loading ? 'Submitting...' : '📤 List Product Now'}
            </button>
            <button type="button" className="btn btn-outline" style={{ padding: 12 }} onClick={() => navigate('/farmer/listings')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
