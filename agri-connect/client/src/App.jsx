import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Landing from './pages/Landing';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import VerifyOtp from './pages/auth/VerifyOtp';
import ProfileSetup from './pages/auth/ProfileSetup';

import FarmerDashboard from './pages/farmer/Dashboard';
import FarmerListings from './pages/farmer/Listings';
import AddProduct from './pages/farmer/AddProduct';
import FarmerOrders from './pages/farmer/Orders';

import Marketplace from './pages/buyer/Marketplace';
import ProductDetail from './pages/buyer/ProductDetail';
import Cart from './pages/buyer/Cart';
import BuyerOrders from './pages/buyer/Orders';
import BuyerDashboard from './pages/buyer/Dashboard';

import AdminDashboard from './pages/admin/Dashboard';
import AdminKyc from './pages/admin/Kyc';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';

import LogisticsDashboard from './pages/logistics/Dashboard';
import LogisticsOrders from './pages/logistics/Orders';

import Navbar from './components/Navbar';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex-center" style={{ height: '100vh' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/profile-setup" element={<PrivateRoute><ProfileSetup /></PrivateRoute>} />

        {/* Farmer */}
        <Route path="/farmer" element={<PrivateRoute roles={['farmer']}><FarmerDashboard /></PrivateRoute>} />
        <Route path="/farmer/listings" element={<PrivateRoute roles={['farmer']}><FarmerListings /></PrivateRoute>} />
        <Route path="/farmer/add-product" element={<PrivateRoute roles={['farmer']}><AddProduct /></PrivateRoute>} />
        <Route path="/farmer/orders" element={<PrivateRoute roles={['farmer']}><FarmerOrders /></PrivateRoute>} />

        {/* Buyer */}
        <Route path="/marketplace" element={<PrivateRoute roles={['buyer']}><Marketplace /></PrivateRoute>} />
        <Route path="/product/:id" element={<PrivateRoute roles={['buyer']}><ProductDetail /></PrivateRoute>} />
        <Route path="/cart" element={<PrivateRoute roles={['buyer']}><Cart /></PrivateRoute>} />
        <Route path="/buyer" element={<PrivateRoute roles={['buyer']}><BuyerDashboard /></PrivateRoute>} />
        <Route path="/buyer/orders" element={<PrivateRoute roles={['buyer']}><BuyerOrders /></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/kyc" element={<PrivateRoute roles={['admin']}><AdminKyc /></PrivateRoute>} />
        <Route path="/admin/products" element={<PrivateRoute roles={['admin']}><AdminProducts /></PrivateRoute>} />
        <Route path="/admin/orders" element={<PrivateRoute roles={['admin']}><AdminOrders /></PrivateRoute>} />

        {/* Logistics */}
        <Route path="/logistics" element={<PrivateRoute roles={['logistics']}><LogisticsDashboard /></PrivateRoute>} />
        <Route path="/logistics/orders" element={<PrivateRoute roles={['logistics']}><LogisticsOrders /></PrivateRoute>} />
      </Routes>
    </>
  );
}
