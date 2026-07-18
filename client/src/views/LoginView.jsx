import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

  const [step, setStep] = useState('login'); // 'login' | 'forgot' | 'reset'
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    clearError();
    const queryError = searchParams.get('error');
    if (queryError) {
      toast.error(queryError);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else if (result.unverified) {
      toast.success('Please verify your email to continue.');
      navigate(`/verify-otp?email=${encodeURIComponent(result.email)}`);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail) return;
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: resetEmail });
      toast.success('Reset OTP sent to your email.');
      setStep('reset');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail || !otp || !newPassword) return;
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email: resetEmail, otp, newPassword });
      toast.success('Password reset successfully. Please login.');
      setStep('login');
      setEmail(resetEmail);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (roleEmail, rolePassword) => {
    setLoading(true);
    setEmail(roleEmail);
    setPassword(rolePassword);
    const result = await login(roleEmail, rolePassword);
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else if (result.unverified) {
      toast.success('Please verify your email to continue.');
      navigate(`/verify-otp?email=${encodeURIComponent(result.email)}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.png" alt="Carpooling" className="w-12 h-12 object-contain rounded-lg" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Carpooling</h1>
            <p className="text-xs text-slate-400">Enterprise Mobility Platform</p>
          </div>
        </div>

        {step === 'login' && (
          <>
            <h2 className="text-lg font-medium text-slate-700 mb-6">Log in to your account</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-sm text-[#e85d4a] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@co.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-[#e85d4a] focus:bg-white transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs uppercase tracking-wider text-slate-500">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setStep('forgot');
                    }}
                    className="text-xs text-[#e85d4a] hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-[#e85d4a] focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#e85d4a] hover:bg-[#d94d3a] disabled:opacity-50 text-white font-medium py-3 rounded text-sm transition-colors mt-6 shadow-sm cursor-pointer"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>

              <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block text-center">Quick Demo Login</span>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('rajpatel@gmail.com', 'Password123!')}
                    className="flex-1 py-2 px-3 bg-slate-50 border border-slate-200 hover:border-[#e85d4a]/50 hover:bg-[#e85d4a]/5 text-slate-700 hover:text-[#e85d4a] rounded-lg text-xs font-bold transition-all cursor-pointer text-center"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('sujalpanchal25072005@gmail.com', 'Password123!')}
                    className="flex-1 py-2 px-3 bg-slate-50 border border-slate-200 hover:border-[#e85d4a]/50 hover:bg-[#e85d4a]/5 text-slate-700 hover:text-[#e85d4a] rounded-lg text-xs font-bold transition-all cursor-pointer text-center"
                  >
                    Employee
                  </button>
                </div>
              </div>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">Or continue with</span></div>
            </div>

            <a
              href="/api/auth/google"
              className="w-full flex items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-3 rounded text-sm transition-colors font-medium"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.63z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Continue with Google
            </a>

            <p className="text-center text-xs text-slate-500 mt-8">
              Don't have an account? <Link to="/signup" className="text-[#e85d4a] hover:underline font-medium">Sign up</Link>
            </p>
          </>
        )}

        {step === 'forgot' && (
          <>
            <h2 className="text-lg font-medium text-slate-700 mb-2">Forgot Password</h2>
            <p className="text-xs text-slate-400 mb-6">Enter your registered work email to receive a password reset OTP.</p>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@co.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-[#e85d4a] focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#e85d4a] hover:bg-[#d94d3a] disabled:opacity-50 text-white font-medium py-3 rounded text-sm transition-colors mt-6 shadow-sm cursor-pointer"
              >
                {loading ? 'Sending OTP...' : 'Send Reset OTP'}
              </button>

              <button
                type="button"
                onClick={() => setStep('login')}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2.5 rounded text-sm transition-colors cursor-pointer"
              >
                Back to Login
              </button>
            </form>
          </>
        )}

        {step === 'reset' && (
          <>
            <h2 className="text-lg font-medium text-slate-700 mb-2">Create New Password</h2>
            <p className="text-xs text-slate-400 mb-6">Enter the 6-digit OTP code sent to your email and set a new password.</p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">6-Digit OTP</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm text-slate-800 tracking-widest text-center font-bold focus:outline-none focus:border-[#e85d4a] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 8 characters..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-[#e85d4a] focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#e85d4a] hover:bg-[#d94d3a] disabled:opacity-50 text-white font-medium py-3 rounded text-sm transition-colors mt-6 shadow-sm cursor-pointer"
              >
                {loading ? 'Resetting password...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => setStep('forgot')}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2.5 rounded text-sm transition-colors cursor-pointer"
              >
                Resend OTP / Change Email
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
