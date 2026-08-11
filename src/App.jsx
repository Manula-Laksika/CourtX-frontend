import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import LawyerDashboard from './pages/LawyerDashboard';
import StaffDashboard from './pages/StaffDashboard';
import ClientDashboard from './pages/ClientDashboard';
import ForgotPassword from './pages/ForgotPassword';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // login, register, dashboard
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage on startup
    const token = localStorage.getItem('courtx_token');
    const storedUser = localStorage.getItem('courtx_user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setView('dashboard');
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('courtx_token');
    localStorage.removeItem('courtx_user');
    setUser(null);
    setView('login');
    // Clear state cache
    window.location.reload();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FDFBF7', color: '#0f766e', fontFamily: 'Inter, sans-serif', fontWeight: '700', fontSize: '1.125rem', letterSpacing: '0.02em' }}>
        <span className="animate-pulse">CourtX Registry Loading...</span>
      </div>
    );
  }

                                        //changed

  if (view === 'login') {
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess} 
        onNavigateToRegister={() => setView('register')} 
        onNavigateToForgotPassword={() => setView('forgotPassword')}  //changed
      />
    );
  }
  

  if (view === 'login') {
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess} 
        onNavigateToRegister={() => setView('register')} 
      />
    );
  }

  
                            //changed

  if (view === 'forgotPassword') {
  return (
    <ForgotPassword
      onNavigateToLogin={() => setView('login')}
    />
  );
}

  if (view === 'register') {
    return (
      <Register 
        onNavigateToLogin={() => setView('login')} 
      />
    );
  }

  if (view === 'dashboard' && user) {
    switch (user.role) {
      case 'lawyer':
        return <LawyerDashboard user={user} onLogout={handleLogout} />;
      case 'court_staff':
      case 'admin':
        return <StaffDashboard user={user} onLogout={handleLogout} />;
      case 'client':
        return <ClientDashboard user={user} onLogout={handleLogout} />;
      default:
        return <Login onLoginSuccess={handleLoginSuccess} onNavigateToRegister={() => setView('register')} />;
    }
  }

                                          //changed

  return <Login onLoginSuccess={handleLoginSuccess} onNavigateToRegister={() => setView('register')} onNavigateToForgotPassword={() => setView('forgotPassword')} />;
}
