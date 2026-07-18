import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function VerifyOtpView() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const navigate = useNavigate();
  const { verifyOtp, resendOtp, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    clearError();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }
    setLoading(true);
    const success = await verifyOtp(email, otp);
    setLoading(false);
    if (success) {
      toast.success('Email verified successfully! Welcome.');
      navigate('/');
    }
  };

  const handleResend = async () => {
    setResending(true);
    const success = await resendOtp(email);
    setResending(false);
    if (success) {
      toast.success('New OTP sent to your email.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg p-8 my-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo.png" alt="Carpooling" className="w-12 h-12 object-contain rounded-lg" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Verify Email</h1>
            <p className="text-xs text-slate-400">Enter OTP sent to your mailbox</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-sm text-[#e85d4a] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">Registered Email</label>
            <input
              type="email"
              required
              disabled={!!emailParam}
              placeholder="name@co.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-[#e85d4a] focus:bg-white transition-all disabled:opacity-75"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">6-Digit OTP</label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="e.g. 123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm font-semibold tracking-widest text-center text-slate-800 focus:outline-none focus:border-[#e85d4a] focus:bg-white transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e85d4a] hover:bg-[#d94d3a] disabled:opacity-50 text-white font-medium py-3 rounded text-sm transition-colors mt-6 shadow-sm cursor-pointer"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="flex justify-between items-center text-xs mt-6 pt-4 border-t border-slate-100">
          <button 
            type="button" 
            onClick={handleResend}
            disabled={resending}
            className="text-[#e85d4a] hover:underline font-bold disabled:opacity-50 cursor-pointer"
          >
            {resending ? 'Resending...' : 'Resend Verification Code'}
          </button>
          <Link to="/login" className="text-slate-400 hover:underline font-medium">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
