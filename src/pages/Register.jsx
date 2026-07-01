import React, { useState } from 'react';
import { Scale, User, Mail, Calendar, Hash, Phone, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';

export default function Register({ onNavigateToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [barNumber, setBarNumber] = useState('');
  const [regDate, setRegDate] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          phone,
          password,
          barNumber,
          regDate
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('Your registration request has been submitted successfully! Please wait 1-3 days for Court Registry approval.');
      // Clear fields
      setUsername('');
      setEmail('');
      setBarNumber('');
      setRegDate('');
      setPhone('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FDFBF7] text-slate-800">
      {/* Left Crest/Branding Panel */}
      <div className="md:w-5/12 bg-white p-8 md:p-16 flex flex-col justify-between border-r border-slate-200 relative overflow-hidden">
        {/* Subtle Crest/Watermark design */}
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
          <Scale size={450} strokeWidth={1} />
        </div>

        <div className="z-10 flex items-center gap-3">
          <div className="bg-teal-600 p-2 rounded-lg flex items-center justify-center">
            <Scale size={20} className="text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-widest font-heading text-slate-900">COURTX</span>
        </div>

        {/* Large Crest Banner */}
        <div className="z-10 my-12 text-center md:text-left flex flex-col items-center md:items-start">
          <div className="w-48 h-48 border-2 border-slate-200 rounded-full flex items-center justify-center mb-8 bg-slate-50 shadow-inner">
            <Scale size={96} className="text-slate-400" />
          </div>
          <span className="w-16 h-1 bg-slate-900 mb-6 rounded"></span>
          <p className="text-2xl font-serif italic text-slate-800 mb-2 leading-relaxed">
            "The law is reason free from passion."
          </p>
          <span className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Aristotle &mdash; 322 BC
          </span>
        </div>

        <div className="z-10 text-slate-400 text-xs">
          CourtX Registry Office &bull; Ministry of Justice Sri Lanka
        </div>
      </div>

      {/* Right Registration Form Panel */}
      <div className="md:w-7/12 p-8 md:p-16 flex flex-col justify-center bg-[#FDFBF7] overflow-y-auto">
        <div className="max-w-xl w-full mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-900 font-heading">Lawyer Registration</h2>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              Please provide your valid credentials to access the registry. <br />
              Verification typically takes 1-3 days.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r flex items-start gap-3 text-amber-800 text-sm animate-fade-in">
              <ShieldAlert className="shrink-0 mt-0.5" size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-teal-50 border-l-4 border-teal-500 rounded-r flex items-start gap-3 text-teal-800 text-sm animate-fade-in">
              <Scale className="shrink-0 mt-0.5 text-teal-600" size={18} />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="courtx-label" htmlFor="username">Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User size={18} />
                  </span>
                  <input
                    id="username"
                    type="text"
                    required
                    placeholder="e.g. j_saman"
                    className="courtx-input pl-10"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
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
                    placeholder="saman@lawfirm.lk"
                    className="courtx-input pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="courtx-label" htmlFor="barNumber">Bar Council Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Hash size={18} />
                  </span>
                  <input
                    id="barNumber"
                    type="text"
                    required
                    placeholder="BAR/YYYY/XXXX"
                    className="courtx-input pl-10"
                    value={barNumber}
                    onChange={(e) => setBarNumber(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="courtx-label" htmlFor="regDate">Bar Registration Date</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Calendar size={18} />
                  </span>
                  <input
                    id="regDate"
                    type="date"
                    required
                    className="courtx-input pl-10"
                    value={regDate}
                    onChange={(e) => setRegDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="courtx-label" htmlFor="phone">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Phone size={18} />
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+94 77 123 4567"
                    className="courtx-input pl-10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="courtx-label" htmlFor="password">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create Password (min. 8 chars)"
                    className="courtx-input pl-10 pr-10"
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
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full courtx-btn courtx-btn-primary py-3 flex items-center justify-center font-bold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors"
              >
                {loading ? 'Submitting Registry Request...' : 'Register →'}
              </button>
            </div>
          </form>

          {/* Login Redirect */}
          <div className="mt-6 text-center border-t border-slate-100 pt-4 flex flex-col items-center gap-4">
            <button
              onClick={onNavigateToLogin}
              className="text-teal-600 hover:text-teal-700 font-bold text-xs tracking-wider uppercase"
            >
              Existing Member Login
            </button>

            <span className="text-[10px] text-slate-400 text-center leading-normal max-w-sm">
              BY REGISTERING, YOU AFFIRM COMPLIANCE WITH THE STATE BOARD OF PROFESSIONAL RESPONSIBILITY.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
