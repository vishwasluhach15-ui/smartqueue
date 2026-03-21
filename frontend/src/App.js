import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login          from './pages/Login';
import Register       from './pages/Register';
import Home           from './pages/Home';
import BookToken      from './pages/BookToken';
import MyToken        from './pages/MyToken';
import AdminDash      from './pages/AdminDash';
import ForgotPassword from './pages/ForgotPassword';
import Profile        from './pages/Profile';
import DisplayBoard   from './pages/DisplayBoard';
import './index.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spin"/></div>;
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spin"/></div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/" />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/display/:officeId" element={<DisplayBoard />} />
          <Route path="/display"         element={<DisplayBoard />} />
          <Route path="/"                element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/profile"         element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/book/:officeId"  element={<PrivateRoute><BookToken /></PrivateRoute>} />
          <Route path="/token/:tokenId"  element={<PrivateRoute><MyToken /></PrivateRoute>} />
          <Route path="/admin"           element={<AdminRoute><AdminDash /></AdminRoute>} />
          <Route path="*"                element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
