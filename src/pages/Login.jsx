import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Scale, ShieldAlert } from 'lucide-react';

export default function Login({ onLoginSuccess, onNavigateToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('lawyer');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    const trimmedEmail = email.trim();
    const newErrors = {};

    // Client-side Validation Checks
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      newErrors.email = 'E-mail address is required.';
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid e-mail address format (e.g. name@courtx.lk).';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password, role })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Success
      localStorage.setItem('courtx_token', data.token);
      localStorage.setItem('courtx_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFillCredentials = (testEmail, testPassword, testRole) => {
    setEmail(testEmail);
    setPassword(testPassword);
    if (testRole) setRole(testRole);
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FDFBF7] text-slate-800">
      {/* Left Branding Panel */}
      <div className="md:w-1/2 bg-slate-900 text-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle Watermark Scale background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
          <Scale size={500} strokeWidth={1} />
        </div>

        <div className="z-10 flex items-center gap-3">
          <div className="bg-teal-600 p-2.5 rounded-lg flex items-center justify-center">
            <Scale size={24} className="text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-widest font-heading text-white">COURTX</span>
        </div>

        <div className="z-10 my-16 max-w-md">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6 leading-tight">
            Next Generation <br />
            <span className="text-teal-400">Court</span> Management.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed font-sans">
            Secure digital platform for smart court case filing, records management, and real-time hearing scheduling.
          </p>
        </div>

        <div className="z-10 text-slate-500 text-sm flex items-center gap-2">
          <span>&copy; 2026 CourtX Inc. Sri Lanka Ministry of Justice.</span>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-[#FDFBF7]">
        <div className="max-w-md w-full mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 font-heading">User Login</h2>
            <p className="text-slate-500 mt-2">Enter your registry credentials to sign in.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r flex items-start gap-3 text-amber-800 text-sm">
              <ShieldAlert className="shrink-0 mt-0.5" size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="courtx-label" htmlFor="role">Account Type</label>
              <select
                id="role"
                className="courtx-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="lawyer">Lawyer</option>
                <option value="client">Client</option>
                <option value="staff">Court Staff</option>
                <option value="admin">Super Admin</option>
              </select>
            </div>

            <div>
              <label className="courtx-label" htmlFor="email">E-mail Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail size={18} />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@courtx.lk"
                  className={`courtx-input courtx-input-with-icon ${fieldErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-red-600 text-xs font-semibold mt-1.5 animate-fade-in flex items-center gap-1">
                  <span>⚠️</span> {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="courtx-label" htmlFor="password">Password</label>
                <a href="#forgot" className="text-xs text-amber-600 hover:text-amber-700 font-semibold uppercase tracking-wider">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className={`courtx-input courtx-input-with-icon courtx-input-with-right-icon ${fieldErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-600 text-xs font-semibold mt-1.5 animate-fade-in flex items-center gap-1">
                  <span>⚠️</span> {fieldErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full courtx-btn courtx-btn-primary py-3 flex items-center justify-center font-bold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors mt-6"
            >
              {loading ? 'Authenticating...' : 'Log in →'}
            </button>
          </form>

          {/* Registration Redirect Link */}
          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <span className="text-slate-500 text-sm">New to the CourtX firm? </span>
            <button
              onClick={onNavigateToRegister}
              className="text-teal-600 hover:text-teal-700 font-bold text-sm tracking-wide uppercase ml-1"
            >
              Request Registration
            </button>
          </div>

          {/* Seed Developer Credentials Quick Links */}
          <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">Demo Accounts:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleFillCredentials('lawyer@courtx.lk', 'Lawyer@123', 'lawyer')}
                className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-100 text-left"
              >
                <strong>Lawyer Workspace</strong>
                <div className="text-slate-500">lawyer@courtx.lk</div>
              </button>
              <button
                onClick={() => handleFillCredentials('staff@courtx.lk', 'Staff@123', 'staff')}
                className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-100 text-left"
              >
                <strong>Court Staff Registry</strong>
                <div className="text-slate-500">staff@courtx.lk</div>
              </button>
              <button
                onClick={() => handleFillCredentials('client@courtx.lk', 'Client@123', 'client')}
                className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-100 text-left"
              >
                <strong>Client (Litigant) View</strong>
                <div className="text-slate-500">client@courtx.lk</div>
              </button>
              <button
                onClick={() => handleFillCredentials('admin@courtx.lk', 'Admin@123', 'admin')}
                className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-100 text-left"
              >
                <strong>Super Admin</strong>
                <div className="text-slate-500">admin@courtx.lk</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
