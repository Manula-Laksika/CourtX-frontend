import React, { useState } from 'react';
import { Mail, ArrowLeft, Scale } from 'lucide-react';


export default function ForgotPassword({ onNavigateToLogin }) {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    setFieldError('');
    setSuccess('');

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      setFieldError('E-mail address is required.');
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setFieldError('Please enter a valid e-mail address.');
      return;
    }

    setSuccess(
      'If an account exists with this e-mail, password reset instructions will be sent.'
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-8">

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-teal-600 p-2 rounded-lg">
            <Scale size={20} className="text-white" />
          </div>
          <span className="font-extrabold tracking-widest text-slate-900">
            COURTX
          </span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900">
          Forgot Password
        </h2>

        <p className="text-sm text-slate-500 mt-2 mb-6">
          Enter your registered e-mail address to reset your password.
        </p>

        {success && (
          <div className="mb-4 p-3 bg-teal-50 text-teal-700 text-sm rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            E-mail Address
          </label>

          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              id="email"
              type="email"
              value={email}
              placeholder="example@email.com"
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full border rounded-lg py-2.5 pl-10 pr-3 outline-none ${
                fieldError
                  ? 'border-red-500'
                  : 'border-slate-300 focus:border-teal-600'
              }`}
            />
          </div>

          {fieldError && (
            <p className="text-red-600 text-xs font-semibold mt-1.5">
              ⚠️ {fieldError}
            </p>
          )}

          <button
            type="submit"
            className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg"
          >
            Send Reset Link
          </button>
        </form>

        <button
          type="button"
          onClick={onNavigateToLogin}
          className="mt-5 flex items-center justify-center gap-2 w-full text-sm text-teal-600 font-semibold"
        >
          <ArrowLeft size={16} />
          Back to Login
        </button>

      </div>
    </div>
  );
}
