import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function SignupView() {
  const { register, error, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [dept, setDept] = useState('');
  const [office, setOffice] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await register(name, email, password, mobile, dept, office);
    setLoading(false);
    if (success) {
      toast.success('Registration successful! OTP sent to your email.');
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg p-8 my-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo.png" alt="Carpooling" className="w-12 h-12 object-contain rounded-lg" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Carpooling</h1>
            <p className="text-xs text-slate-400">Enterprise Mobility Platform</p>
          </div>
        </div>
        <h2 className="text-lg font-bold tracking-tight text-slate-800 mb-1">Create your account</h2>
        <p className="text-xs text-slate-400 mb-6 font-medium">Use your company email domain to register</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-sm text-[#e85d4a] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">Full Name</label>
            <input
              type="text"
              required
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-[#e85d4a] focus:bg-white transition-all"
            />
          </div>

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
            <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">Password</label>
            <input
              type="password"
              required
              placeholder="Min. 8 chars, 1 capital, 1 number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-[#e85d4a] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">Mobile Number</label>
            <input
              type="tel"
              required
              placeholder="9876543210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-[#e85d4a] focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">Department</label>
              <input
                type="text"
                placeholder="Engineering"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-[#e85d4a] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">Office Seat</label>
              <input
                type="text"
                placeholder="Tower A"
                value={office}
                onChange={(e) => setOffice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-[#e85d4a] focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e85d4a] hover:bg-[#d94d3a] disabled:opacity-50 text-white font-medium py-3 rounded text-sm transition-colors mt-6 shadow-sm"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-8">
          Already have an account? <Link to="/login" className="text-[#e85d4a] hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}
