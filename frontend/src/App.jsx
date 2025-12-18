
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import InfluencerList from './pages/InfluencerList';
import InfluencerProfile from './pages/InfluencerProfile';
import CompanyDashboard from './pages/CompanyDashboard';
import InfluencerDashboard from './pages/InfluencerDashboard';
import './App.css';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
   
    if (user.role === 'influencer') {
      return <Navigate to="/influencer-dashboard" />;
    } else if (user.role === 'company') {
      return <Navigate to="/company-dashboard" />;
    }
    return <Navigate to="/" />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (user) {
    
    if (user.role === 'influencer') {
      return <Navigate to="/influencer-dashboard" />;
    } else if (user.role === 'company') {
      return <Navigate to="/company-dashboard" />;
    }
  }

  return children;
};

const CompanyProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Allow access if user is company OR there's temporary viewing access
  const tempCompanyViewing = localStorage.getItem('tempCompanyViewing');
  const hasTempAccess = tempCompanyViewing && (Date.now() - JSON.parse(tempCompanyViewing).timestamp < 300000);

  if (!user && !hasTempAccess) {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <div className="card">
          <h2>Authentication Required</h2>
          <p>You need to be logged in as a company to browse influencers.</p>
          <div style={{ marginTop: '20px' }}>
            <a href="/login" className="btn btn-primary">Login</a>
            <a href="/register" className="btn btn-secondary" style={{ marginLeft: '10px' }}>Register</a>
          </div>
        </div>
      </div>
    );
  }

  if (user && user.role !== 'company' && !hasTempAccess) {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <div className="card">
          <h2>Access Denied</h2>
          <p>Only companies can browse influencers. You are logged in as an {user.role}.</p>
          <div style={{ marginTop: '20px' }}>
            <a href="/influencer-dashboard" className="btn btn-primary">Go to Your Dashboard</a>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
         
          <Route path="/" element={
            <PublicRoute>
              <Home />
            </PublicRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          <Route path="/influencers" element={
            <CompanyProtectedRoute>
              <InfluencerList />
            </CompanyProtectedRoute>
          } />
          <Route path="/influencers/:id" element={
            <CompanyProtectedRoute>
              <InfluencerProfile />
            </CompanyProtectedRoute>
          } />

       
          <Route path="/influencer-dashboard" element={
            <ProtectedRoute requiredRole="influencer">
              <InfluencerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/company-dashboard" element={
            <ProtectedRoute requiredRole="company">
              <CompanyDashboard />
            </ProtectedRoute>
          } />

      
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;