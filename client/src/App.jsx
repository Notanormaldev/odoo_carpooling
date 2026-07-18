import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { 
  Car, Shield, Wallet, BarChart3, Clock, Settings, LogOut, Search, MapPin, Calendar, 
  User, CheckCircle, AlertTriangle, MessageSquare, Send, Phone, RefreshCw, Plus, X, Menu, Loader, ChevronLeft, CreditCard, Download
} from 'lucide-react';
import * as maptilersdk from '@maptiler/sdk';
import useAuthStore from './store/authStore';
import api from './api/axios';

// ─── MAPTILER CONFIG ────────────────────────────────────────────────
maptilersdk.config.apiKey = 'RL13CDEQU2gZu8sIcdc0';

export default function App() {
  const { loadUser, loading } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-[#e85d4a]" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route path="/signup" element={<SignupView />} />
        <Route path="/auth/google/success" element={<GoogleSuccessHandler />} />
        <Route path="/*" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

// ─── ROUTE GUARD ────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? children : null;
}

function GoogleSuccessHandler() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { loadUser } = useAuthStore();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      localStorage.setItem('accessToken', token);
      loadUser().then(() => navigate('/'));
    } else {
      navigate('/login');
    }
  }, [params, navigate, loadUser]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader className="w-8 h-8 animate-spin text-[#e85d4a]" />
    </div>
  );
}

// ─── LOGIN VIEW ─────────────────────────────────────────────────────
function LoginView() {
  const { login, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#e85d4a]/10 rounded flex items-center justify-center">
            <Car className="w-6 h-6 text-[#e85d4a]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Carpooling</h1>
            <p className="text-xs text-slate-400">Enterprise Mobility Platform</p>
          </div>
        </div>

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
            <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">Password</label>
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
            className="w-full bg-[#e85d4a] hover:bg-[#d94d3a] disabled:opacity-50 text-white font-medium py-3 rounded text-sm transition-colors mt-6 shadow-sm"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
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
          Google Work Account
        </a>

        <p className="text-center text-xs text-slate-500 mt-8">
          Don't have an account? <Link to="/signup" className="text-[#e85d4a] hover:underline font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

// ─── SIGNUP VIEW ────────────────────────────────────────────────────
function SignupView() {
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
    if (success) navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg p-8 my-8 shadow-sm">
        <h2 className="text-xl font-bold tracking-tight text-slate-800 mb-2">Create your account</h2>
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

// ─── MAIN LAYOUT & HORIZONTAL HEADER ─────────────────────────────────
function MainLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative">
      {/* Horizontal Header Bar (Exactly like wireframes) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
              <span className="font-bold tracking-tight text-slate-800 text-lg">Carpooling</span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <HeaderLink to="/" label="Dashboard" />
              <HeaderLink to="/trips" label="My Trips" />
              <HeaderLink to="/history" label="Ride History" />
              <HeaderLink to="/vehicle" label="My Vehicle" />
              <HeaderLink to="/wallet" label="Wallet" />
              <HeaderLink to="/settings" label="Setting" />
              {user?.role === 'admin' && <HeaderLink to="/reports" label="Report" />}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-700">Dero Addict</p>
              <p className="text-[10px] text-neutral-400 capitalize">{user?.name}</p>
            </div>
            
            <div className="w-10 h-10 bg-slate-100 rounded-full overflow-hidden border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 uppercase cursor-pointer" onClick={() => navigate('/settings')}>
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.slice(0, 2)
              )}
            </div>

            <button onClick={logout} className="p-2 text-slate-400 hover:text-[#e85d4a] rounded transition-colors" title="Log Out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 pb-24">
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/trips" element={<MyTripsView />} />
          <Route path="/trips/:id" element={<TripDetailView />} />
          <Route path="/vehicle" element={<MyVehicleView />} />
          <Route path="/wallet" element={<WalletView />} />
          <Route path="/history" element={<RideHistoryView />} />
          <Route path="/reports" element={<ReportsView />} />
          <Route path="/settings" element={<SettingsView />} />
        </Routes>
      </main>

      {/* LangChain Mistral AI Support Widget */}
      <SupportChatWidget />
    </div>
  );
}

function HeaderLink({ to, label }) {
  return (
    <Link
      to={to}
      className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors py-2 px-1 relative"
    >
      {label}
    </Link>
  );
}

// ─── DASHBOARD: FIND & OFFER RIDE ────────────────────────────────────
function DashboardView() {
  const { user, loadUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('find'); // find or offer
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [seats, setSeats] = useState(1);
  const [rides, setRides] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [fareOffer, setFareOffer] = useState(120);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [showConfirmRoute, setShowConfirmRoute] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  // DL one-time submit state
  const [dlNumber, setDlNumber] = useState('');
  const [dlSubmitting, setDlSubmitting] = useState(false);

  useEffect(() => {
    fetchMyVehicles();
  }, []);

  const fetchMyVehicles = async () => {
    try {
      const res = await api.get('/vehicles/my-vehicles');
      setVehicles(res.data.data.filter(v => v.status === 'active'));
      if (res.data.data.length > 0) {
        setSelectedVehicle(res.data.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await api.get(`/rides/search?seats=${seats}&date=${date}`);
      setRides(res.data.data);
      if (res.data.data.length === 0) {
        setMsg('No available rides matching your criteria.');
      } else {
        setMsg('');
      }
    } catch (err) {
      setMsg('Error searching for rides.');
    } finally {
      setLoading(false);
    }
  };

  const handleDlSubmit = async (e) => {
    e.preventDefault();
    if (!dlNumber.trim()) return;
    setDlSubmitting(true);
    try {
      await api.patch('/users/profile', { drivingLicense: dlNumber });
      await loadUser();
      alert('Driving license updated successfully!');
    } catch (err) {
      alert('Failed to save driving license');
    } finally {
      setDlSubmitting(false);
    }
  };

  const handlePublishClick = (e) => {
    e.preventDefault();
    setShowConfirmRoute(true);
    setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return;
      mapRef.current = new maptilersdk.Map({
        container: mapContainerRef.current,
        style: maptilersdk.MapStyle.STREETS,
        center: [72.5714, 23.0225],
        zoom: 12,
      });
    }, 100);
  };

  const handleConfirmPublish = async () => {
    setLoading(true);
    try {
      const dateTime = new Date(`${date}T08:00:00Z`).toISOString();
      await api.post('/rides', {
        vehicleId: selectedVehicle,
        startLocation: { address: pickup, lat: 23.0225, lng: 72.5714 },
        destination: { address: destination, lat: 23.1974, lng: 72.6326 },
        dateTime,
        totalSeats: Number(seats),
        farePerSeat: Number(fareOffer),
      });
      alert('Ride published successfully!');
      setShowConfirmRoute(false);
      setPickup('');
      setDestination('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error publishing ride');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (rideId) => {
    try {
      await api.post('/trips/book', { rideId, seatsBooked: 1 });
      alert('Ride booked successfully! Manage it in "My Trips".');
      setRides(rides.filter(r => r._id !== rideId));
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Tab toggle */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => { setActiveTab('find'); setShowConfirmRoute(false); }}
          className={`pb-4 px-6 font-bold text-sm border-b-2 transition-all ${activeTab === 'find' ? 'border-[#e85d4a] text-[#e85d4a]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Find Ride
        </button>
        <button 
          onClick={() => { setActiveTab('offer'); setShowConfirmRoute(false); }}
          className={`pb-4 px-6 font-bold text-sm border-b-2 transition-all ${activeTab === 'offer' ? 'border-[#e85d4a] text-[#e85d4a]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Offer Ride
        </button>
      </div>

      {showConfirmRoute ? (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-800">Confirm Route</h2>
            <button onClick={() => setShowConfirmRoute(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>

          <div ref={mapContainerRef} className="w-full h-80 bg-slate-100 rounded border border-slate-200 overflow-hidden"></div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="text-slate-400">Total Route Cost</p>
              <p className="font-bold text-slate-800 text-lg">₹{fareOffer} / Seat</p>
            </div>
            <button 
              onClick={handleConfirmPublish}
              disabled={loading}
              className="bg-[#e85d4a] hover:bg-[#d94d3a] text-white text-sm font-semibold px-6 py-2.5 rounded shadow-sm transition-all"
            >
              {loading ? 'Publishing...' : 'Publish Ride'}
            </button>
          </div>
        </div>
      ) : activeTab === 'find' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit space-y-6">
            <h3 className="font-bold text-slate-800 text-sm">Where are you going?</h3>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-2 font-medium">Start Location</label>
                <input
                  type="text"
                  required
                  placeholder="Pickup point"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#e85d4a]"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2 font-medium">Drop/Destination Location</label>
                <input
                  type="text"
                  required
                  placeholder="Drop point"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#e85d4a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-medium">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 text-xs focus:outline-none focus:border-[#e85d4a]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-medium">Seats</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 text-xs focus:outline-none focus:border-[#e85d4a]"
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-[#e85d4a] hover:bg-[#d94d3a] text-white py-3 rounded text-sm font-semibold transition-colors shadow-sm">
                Find Ride
              </button>
            </form>

            {/* Recommended cities search suggestions */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Recommended Commutes</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { from: 'Ahmedabad (ISKCON Circle)', to: 'Gandhinagar (Infocity)', label: 'Ahmedabad ➔ Gandhinagar' },
                  { from: 'Ahmedabad (C G Road)', to: 'Gandhinagar (Sector 21)', label: 'CG Road ➔ Sector 21' },
                  { from: 'GIFT City, Gandhinagar', to: 'Sargasan, Gandhinagar', label: 'GIFT City ➔ Sargasan' }
                ].map((route, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPickup(route.from);
                      setDestination(route.to);
                      setDate('2026-07-31');
                    }}
                    className="text-[10px] bg-slate-100 hover:bg-[#e85d4a]/10 hover:text-[#e85d4a] text-slate-600 font-bold px-2 py-1.5 rounded transition-all"
                  >
                    {route.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Available Pools</h3>
            {rides.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-400 shadow-sm">
                <Search className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">Submit search filters or click a popular route commute to view employee pools.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rides.map(r => (
                  <div key={r._id} className="bg-white border border-slate-200 p-5 rounded-lg flex items-center justify-between shadow-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold uppercase text-slate-600">
                          {r.driverId?.name?.slice(0,2)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{r.driverId?.name}</p>
                          <p className="text-[10px] text-slate-400">{r.dateTime ? new Date(r.dateTime).toLocaleString() : ''}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">Route: {r.startLocation?.address} to {r.destination?.address}</p>
                    </div>

                    <div className="text-right space-y-2">
                      <p className="text-base font-bold text-[#e85d4a]">₹{r.farePerSeat} / Seat</p>
                      <button onClick={() => handleBook(r._id)} className="bg-[#e85d4a] hover:bg-[#d94d3a] text-white text-xs font-bold px-4 py-2 rounded transition-colors shadow-sm">
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Offer Ride: Check for Driving License first (One-Time Verification) */
        !user?.drivingLicense ? (
          <div className="bg-white border border-slate-200 p-8 rounded-lg max-w-md mx-auto shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <Shield className="w-10 h-10 text-[#e85d4a] mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">Driving License Verification</h3>
              <p className="text-xs text-slate-400 font-medium">To offer and publish ride pools, register your driving license details for enterprise security.</p>
            </div>
            
            <form onSubmit={handleDlSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">Driving License Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DL-IND-9992388"
                  value={dlNumber}
                  onChange={(e) => setDlNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a] focus:bg-white"
                />
              </div>

              <button 
                type="submit" 
                disabled={dlSubmitting}
                className="w-full bg-[#e85d4a] hover:bg-[#d94d3a] text-white py-3 rounded text-sm font-semibold transition-colors shadow-sm"
              >
                {dlSubmitting ? 'Registering...' : 'Register Driving License'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 p-8 rounded-lg max-w-xl mx-auto shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Offer Ride Details</h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase bg-slate-50 px-2 py-1 rounded">Verified Driver: {user.drivingLicense}</span>
            </div>
            
            <form onSubmit={handlePublishClick} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-2 font-medium">Select Vehicle</label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
                >
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>{v.model} - {v.registrationNumber}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2 font-medium">Pickup Point</label>
                <input
                  type="text"
                  required
                  placeholder="Start Location"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2 font-medium">Destination Point</label>
                <input
                  type="text"
                  required
                  placeholder="Drop point"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-medium">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-medium">Seats</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2 font-medium">Price / Seat (₹)</label>
                <input
                  type="number"
                  min="10"
                  required
                  value={fareOffer}
                  onChange={(e) => setFareOffer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
                />
              </div>

              <button type="submit" className="w-full bg-[#e85d4a] hover:bg-[#d94d3a] text-white py-3 rounded text-sm font-semibold transition-colors shadow-sm">
                Confirm Route & Price
              </button>
            </form>
          </div>
        )
      )}
    </div>
  );
}

// ─── RIDE HISTORY VIEW (Exactly like wireframe) ───────────────────────
function RideHistoryView() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/trips/my-trips');
      setHistory(res.data.data.filter(t => t.status === 'completed_paid'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = (trip) => {
    const content = `===========================================
          COMMUTE RIDE INVOICE          
===========================================
Trip ID: ${trip._id}
Date: ${new Date(trip.completedAt || trip.createdAt).toLocaleString()}
Driver: ${trip.driverId?.name}
Vehicle: Swift Dzire (GJ01AB1234)
Route: ${trip.rideId?.startLocation?.address} to ${trip.rideId?.destination?.address}
Seats: ${trip.seatsBooked}
Fare Charged: ₹${trip.fare}
CO2 Savings: 3.0 kg
Payment Status: PAID & SETTLED
===========================================
Thank you for reducing corporate carbon footprint!
===========================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `invoice_${trip._id.slice(-6)}.txt`;
    link.click();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
      {/* Left side title pane */}
      <div className="md:col-span-1 bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit">
        <h2 className="font-bold text-lg text-slate-800">Ride History</h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">History Logs</p>
      </div>

      {/* Main content pane */}
      <div className="md:col-span-3 bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
          <ChevronLeft className="w-5 h-5 text-[#e85d4a] cursor-pointer" />
          <h3 className="font-bold text-slate-800 text-sm">Rides History</h3>
        </div>

        {loading ? (
          <Loader className="w-6 h-6 animate-spin text-[#e85d4a] mx-auto" />
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No historical rides found.</div>
        ) : (
          <div className="space-y-3">
            {history.map((tx) => (
              <div key={tx._id} className="border border-slate-100 rounded p-4 flex items-center justify-between hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                    {tx.driverId?.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">{tx.driverId?.name}</h4>
                    <p className="text-xs text-slate-400">Route: {tx.rideId?.startLocation?.address} to {tx.rideId?.destination?.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right text-xs text-slate-500">
                  <div>
                    <p className="font-semibold text-slate-800">GJ01AB1234</p>
                    <p>{tx.completedAt ? new Date(tx.completedAt).toLocaleString() : ''}</p>
                  </div>
                  <button 
                    onClick={() => handleDownloadInvoice(tx)}
                    className="p-2 text-slate-400 hover:text-[#e85d4a] rounded"
                    title="Download Receipt"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MY VEHICLE VIEW (Exactly like wireframe) ─────────────────────────
function MyVehicleView() {
  const [vehicles, setVehicles] = useState([]);
  const [model, setModel] = useState('');
  const [regNum, setRegNum] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [fuelType, setFuelType] = useState('petrol');
  const [efficiency, setEfficiency] = useState(15);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles/my-vehicles');
      setVehicles(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vehicles', {
        model,
        registrationNumber: regNum,
        seatingCapacity: Number(capacity),
        fuelType,
        fuelEfficiency: Number(efficiency),
      });
      alert('Vehicle submitted for Admin approval.');
      setModel('');
      setRegNum('');
      setShowAddForm(false);
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
      {/* Left Title side pane */}
      <div className="md:col-span-1 bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit">
        <h2 className="font-bold text-lg text-slate-800">My Vehicle</h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">Vehicle info</p>
      </div>

      {/* Main content pane */}
      <div className="md:col-span-3 bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-5 h-5 text-[#e85d4a] cursor-pointer" />
            <h3 className="font-bold text-slate-800 text-sm">My Vehicle</h3>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="border border-[#e85d4a] text-[#e85d4a] hover:bg-[#e85d4a] hover:text-white transition-all text-xs font-semibold px-4 py-2 rounded"
          >
            {showAddForm ? 'View Vehicles' : 'Add Vehicle'}
          </button>
        </div>

        {showAddForm ? (
          <form onSubmit={handleRegister} className="space-y-4 max-w-md mx-auto">
            <div>
              <label className="block text-xs text-slate-400 mb-2 font-medium">Model Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Swift Dzire"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#e85d4a]"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2 font-medium">Registration Number</label>
              <input
                type="text"
                required
                placeholder="e.g. GJ01AB1234"
                value={regNum}
                onChange={(e) => setRegNum(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#e85d4a]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-2 font-medium">Seating Capacity</label>
                <input
                  type="number"
                  min="2"
                  max="8"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2 font-medium">Fuel Type</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 text-sm focus:outline-none"
                >
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="cng">CNG</option>
                  <option value="electric">Electric</option>
                </select>
              </div>
            </div>

            <button type="submit" className="w-full bg-[#e85d4a] hover:bg-[#d94d3a] text-white py-2.5 rounded text-sm font-semibold transition-colors shadow-sm">
              Register Vehicle
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            {loading ? (
              <Loader className="w-6 h-6 animate-spin text-[#e85d4a] mx-auto" />
            ) : vehicles.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No registered vehicles found. Add one above!</div>
            ) : (
              vehicles.map(v => (
                <div key={v._id} className="border border-slate-100 rounded p-4 flex items-center justify-between hover:bg-slate-50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
                      <Car className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">{v.model}</h4>
                      <p className="text-xs text-slate-400">{v.registrationNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
                      v.status === 'active' ? 'bg-emerald-50 text-accent-emerald' : 'bg-amber-50 text-accent-amber'
                    }`}>{v.status}</span>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-800">Driver</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── WALLET VIEW (Recharge Wallet style) ─────────────────────────────
function WalletView() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('500');
  const [method, setMethod] = useState('card');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await api.get('/wallet/balance');
      setBalance(res.data.data.balance);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments/generate-qr', { amount: Number(amount) });
      alert(`Simulation: Wallet recharged with ₹${amount}!`);
      fetchBalance();
    } catch (err) {
      alert('Recharge failed');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
      <div className="md:col-span-1 bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit">
        <h2 className="font-bold text-lg text-slate-800">Wallet</h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">Recharge details</p>
      </div>

      <div className="md:col-span-3 bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-5 h-5 text-[#e85d4a] cursor-pointer" />
            <h3 className="font-bold text-slate-800 text-sm">Recharge Wallet</h3>
          </div>
          <span className="text-sm font-semibold text-slate-600">Balance: <b className="text-slate-800">₹{balance}</b></span>
        </div>

        <form onSubmit={handleRecharge} className="space-y-6 max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 font-bold">Amount</span>
            <input 
              type="text" 
              value={`₹ ${amount}`} 
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
              className="bg-transparent border-b border-slate-300 py-1 text-slate-800 font-bold text-base w-32 focus:outline-none focus:border-[#e85d4a]"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" checked={method === 'card'} onChange={() => setMethod('card')} className="text-[#e85d4a] focus:ring-[#e85d4a]" />
              <span className="text-sm text-slate-600">Card Payment</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" checked={method === 'upi'} onChange={() => setMethod('upi')} className="text-[#e85d4a] focus:ring-[#e85d4a]" />
              <span className="text-sm text-slate-600">UPI Payment</span>
            </label>
          </div>

          {method === 'upi' && (
            <div className="border border-slate-100 p-4 rounded flex items-center justify-between bg-slate-50">
              <input type="text" placeholder="upi_id@bank" className="bg-white border border-slate-200 text-xs px-3 py-2 rounded focus:outline-none w-40" />
              <span className="text-xs text-slate-400 font-semibold cursor-pointer hover:text-slate-600">Scan</span>
              <div className="w-12 h-12 bg-white border border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-600 font-mono">QR</div>
            </div>
          )}

          <button type="submit" className="w-full bg-[#e85d4a] hover:bg-[#d94d3a] text-white py-3 rounded text-sm font-semibold transition-colors shadow-sm">
            Add ₹{amount}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── MY TRIPS VIEW (Roster style links setting pane) ─────────────────
function MyTripsView() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await api.get('/trips/my-trips');
      setTrips(res.data.data.filter(t => t.status !== 'completed_paid'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
      <div className="md:col-span-1 bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit">
        <h2 className="font-bold text-lg text-slate-800">My Trips</h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">Commute schedules</p>
      </div>

      <div className="md:col-span-3 bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
          <ChevronLeft className="w-5 h-5 text-[#e85d4a] cursor-pointer" />
          <h3 className="font-bold text-slate-800 text-sm">Active Commutes</h3>
        </div>

        {loading ? (
          <Loader className="w-6 h-6 animate-spin text-[#e85d4a] mx-auto" />
        ) : trips.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No active trips found. Find a ride to begin!</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {trips.map(t => (
              <Link to={`/trips/${t._id}`} key={t._id} className="block py-4 hover:bg-slate-50 px-3 rounded transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{t.rideId?.startLocation?.address} to {t.rideId?.destination?.address}</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Departure: {new Date(t.rideId?.dateTime || t.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-50 text-accent-amber uppercase">{t.status.replace('_', ' ')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SETTINGS VIEW (Matches the settings links layout in wireframe) ──
function SettingsView() {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
      <div className="md:col-span-1 bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit">
        <h2 className="font-bold text-lg text-slate-800">Setting</h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">Quick links</p>
      </div>

      <div className="md:col-span-3 bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
          <ChevronLeft className="w-5 h-5 text-[#e85d4a] cursor-pointer" />
          <h3 className="font-bold text-slate-800 text-sm">My Trips</h3>
        </div>

        {/* Links list exactly matching wireframe screenshot */}
        <div className="divide-y divide-slate-100 border border-slate-100 rounded overflow-hidden">
          <SettingsLink label="My Trips" onClick={() => navigate('/trips')} />
          <SettingsLink label="My Vehicle" onClick={() => navigate('/vehicle')} />
          <SettingsLink label="Payment Method" onClick={() => navigate('/wallet')} />
          <SettingsLink label="Ride History" onClick={() => navigate('/history')} />
          <SettingsLink label="Saved Places" onClick={() => alert('Feature coming soon!')} />
          <SettingsLink label="Help" onClick={() => alert('Support contact: teamclickjack@gmail.com')} />
          <SettingsLink label="Chat" onClick={() => navigate('/trips')} />
        </div>
      </div>
    </div>
  );
}

function SettingsLink({ label, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-slate-100 rounded flex items-center justify-center">
          <Clock className="w-4 h-4 text-slate-500" />
        </div>
        <span className="text-sm font-semibold text-slate-700">{label}</span>
      </div>
    </div>
  );
}

// ─── TRIP DETAIL / LIVE TRACKING VIEW ─────────────────────────────────
function TripDetailView() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [showQR, setShowQR] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const tripId = id || window.location.pathname.split('/').pop();

  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      const res = await api.get(`/trips/${tripId}`);
      setTrip(res.data.data);
      initializeMap();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return;
      try {
        mapRef.current = new maptilersdk.Map({
          container: mapContainerRef.current,
          style: maptilersdk.MapStyle.STREETS,
          center: [72.5714, 23.0225],
          zoom: 12,
        });
      } catch (err) {
        console.error(err);
      }
    }, 100);
  };

  const handleUpdateStatus = async (status) => {
    try {
      await api.patch(`/trips/${tripId}/status`, { status });
      alert('Trip status updated');
      fetchTripDetails();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDownloadInvoice = () => {
    const content = `===========================================
          COMMUTE RIDE INVOICE          
===========================================
Trip ID: ${trip._id}
Date: ${new Date(trip.createdAt).toLocaleString()}
Driver: ${trip.driverId?.name}
Vehicle: Swift Dzire (GJ01AB1234)
Route: ${trip.rideId?.startLocation?.address} to ${trip.rideId?.destination?.address}
Seats: ${trip.seatsBooked}
Fare Charged: ₹${trip.fare}
CO2 Savings: 0.96 kg
Payment Status: PAID & SETTLED
===========================================
Thank you for reducing corporate carbon footprint!
===========================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `invoice_${trip._id.slice(-6)}.txt`;
    link.click();
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    setChatMessages([...chatMessages, { _id: Date.now().toString(), senderName: user.name, message: typedMessage }]);
    setTypedMessage('');
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader className="w-6 h-6 animate-spin text-[#e85d4a]" /></div>;
  }

  if (!trip) {
    return <div className="p-8 text-center text-slate-400">Trip not found.</div>;
  }

  const isDriver = user._id === trip.driverId._id;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
      <div className="md:col-span-1 bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit">
        <h2 className="font-bold text-lg text-slate-800">My Trips</h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">Commute Detail</p>
      </div>

      <div className="md:col-span-3 bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-5 h-5 text-[#e85d4a] cursor-pointer" />
            <h3 className="font-bold text-slate-800 text-sm">Trip Detail</h3>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleDownloadInvoice}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" /> Invoice
            </button>

            {!isDriver && trip.status === 'booked' && (
              <button onClick={() => setShowQR(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-4 py-2 rounded">
                Show QR
              </button>
            )}
            {isDriver && trip.status === 'booked' && (
              <button onClick={() => handleUpdateStatus('started')} className="bg-accent-emerald text-white text-xs font-semibold px-4 py-2 rounded">
                Board Passenger (Verify)
              </button>
            )}
            {trip.status === 'started' && (
              <button onClick={() => handleUpdateStatus('in_progress')} className="bg-[#e85d4a] text-white text-xs font-semibold px-4 py-2 rounded">
                Commence Route
              </button>
            )}
            {trip.status === 'in_progress' && (
              <button onClick={() => handleUpdateStatus('completed')} className="bg-[#e85d4a] text-white text-xs font-semibold px-4 py-2 rounded">
                Complete Trip
              </button>
            )}
          </div>
        </div>

        {showQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white border border-slate-200 rounded-lg p-6 text-center space-y-4">
              <h3 className="font-bold">Trip QR</h3>
              <p className="text-xs text-slate-400">Scan code to verify trip startup.</p>
              <div className="w-40 h-40 bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-mono font-bold text-slate-700 mx-auto">
                {trip.verificationQR.slice(0, 8).toUpperCase()}
              </div>
              <button onClick={() => setShowQR(false)} className="bg-[#e85d4a] text-white text-xs font-semibold px-4 py-2 rounded w-full">Close</button>
            </div>
          </div>
        )}

        {/* Info card matching wireframe screenshot */}
        <div className="border border-slate-100 rounded-lg p-5 bg-slate-50 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-700">
                {trip.driverId?.name?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">{trip.driverId?.name}</h4>
                <p className="text-[10px] text-slate-400">Route Commute</p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>{new Date(trip.rideId?.dateTime || trip.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
            <div>
              <p className="text-slate-400 uppercase font-bold text-[9px]">Vehicle</p>
              <p className="font-bold text-slate-800">Swift Dzire</p>
              <p className="text-slate-400">GJ01AB1234</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase font-bold text-[9px]">Route Points</p>
              <p><b>Pick UP:</b> {trip.rideId?.startLocation?.address}</p>
              <p><b>Drop:</b> {trip.rideId?.destination?.address}</p>
            </div>
          </div>
        </div>

        {/* Map and Chat section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div ref={mapContainerRef} className="md:col-span-2 h-72 bg-slate-100 rounded border border-slate-200 overflow-hidden"></div>
          
          <div className="border border-slate-200 rounded flex flex-col h-72">
            <div className="p-3 border-b border-slate-200 font-bold text-xs text-slate-700 bg-slate-50">Live Chat</div>
            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
              {chatMessages.map((m, i) => (
                <div key={i} className="space-y-1">
                  <span className="font-bold text-[10px] text-slate-500">{m.senderName}:</span>
                  <p className="bg-slate-100 p-2 rounded text-slate-700">{m.message}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-200 flex gap-2">
              <input type="text" placeholder="Type message..." value={typedMessage} onChange={(e) => setTypedMessage(e.target.value)} className="bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs rounded focus:outline-none flex-1" />
              <button type="submit" className="bg-[#e85d4a] text-white p-2 rounded"><Send className="w-3.5 h-3.5" /></button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── REPORTS VIEW (Exactly like wireframe) ───────────────────────────
function ReportsView() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await api.get('/reports');
      setReport(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReportCSV = () => {
    const csvContent = `Month,Revenue,Fuel Cost,Maintenance,Net Profit
July 2026,Rs. 1.2L,Rs. 6L,Rs. 2L,Rs. 4L
August 2026,Rs. 1.5L,Rs. 5.8L,Rs. 1.8L,Rs. 4.5L`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'carpooling_financial_report.csv';
    link.click();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Loader className="w-6 h-6 animate-spin text-[#e85d4a]" /></div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
      <div className="md:col-span-1 bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit">
        <h2 className="font-bold text-lg text-slate-800">Report</h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">Dashboard Analytics</p>
      </div>

      <div className="md:col-span-3 bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-5 h-5 text-[#e85d4a] cursor-pointer" />
            <h3 className="font-bold text-slate-800 text-sm">Report</h3>
          </div>
          <button 
            onClick={handleDownloadReportCSV}
            className="bg-[#e85d4a] hover:bg-[#d94d3a] text-white text-xs font-semibold px-4 py-2 rounded flex items-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Download CSV Report
          </button>
        </div>

        {/* Analytics Pills exactly like wireframe drawing */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="border border-emerald-500/30 bg-emerald-50/50 rounded-full px-4 py-2 text-xs font-semibold text-accent-emerald">
            Total Fuel Cost: <span className="font-bold text-[#e85d4a]">Rs. 2.6 L</span>
          </div>
          <div className="border border-emerald-500/30 bg-emerald-50/50 rounded-full px-4 py-2 text-xs font-semibold text-accent-emerald">
            Fleet ROI: <span className="font-bold">+12.5%</span>
          </div>
          <div className="border border-emerald-500/30 bg-emerald-50/50 rounded-full px-4 py-2 text-xs font-semibold text-accent-emerald">
            Utilization Rate: <span className="font-bold">62%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mock charts showing layout structure */}
          <div className="border border-slate-100 rounded-lg p-5 space-y-4 shadow-sm bg-slate-50">
            <h4 className="font-bold text-xs text-slate-700">Fuel Efficiency Trend (km/L)</h4>
            <div className="h-40 flex items-end justify-between px-4 pb-2 border-b border-slate-200">
              <div className="bg-slate-300 w-8 h-10 rounded-t"></div>
              <div className="bg-[#e85d4a] w-8 h-28 rounded-t"></div>
              <div className="bg-slate-300 w-8 h-16 rounded-t"></div>
              <div className="bg-slate-300 w-8 h-24 rounded-t"></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>Jan</span>
              <span>Jun</span>
              <span>Sep</span>
              <span>Dec</span>
            </div>
          </div>

          <div className="border border-slate-100 rounded-lg p-5 space-y-4 shadow-sm bg-slate-50">
            <h4 className="font-bold text-xs text-slate-700">Top 5 Costliest Vehicles</h4>
            <div className="h-40 flex items-end justify-between px-4 pb-2 border-b border-slate-200">
              <div className="bg-slate-300 w-8 h-14 rounded-t"></div>
              <div className="bg-[#e85d4a] w-8 h-32 rounded-t"></div>
              <div className="bg-slate-300 w-8 h-20 rounded-t"></div>
              <div className="bg-slate-300 w-8 h-26 rounded-t"></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>VAN-01</span>
              <span>TRK-02</span>
              <span>TRK-01</span>
              <span>CAR-01</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-xs text-slate-700">Financial Summary of Month</h4>
          <div className="border border-slate-100 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Revenue</th>
                  <th className="px-4 py-3">Fuel Cost</th>
                  <th className="px-4 py-3">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-800">July 2026</td>
                  <td className="px-4 py-3">Rs. 1.2L</td>
                  <td className="px-4 py-3">Rs. 6L</td>
                  <td className="px-4 py-3 text-accent-emerald font-bold">Rs. 4L</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FLOATING SUPPORT CHAT WIDGET (LangChain Mistral) ─────────────────
function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hi! Ask me anything about carpooling policies, routes, or wallet payments.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userText = inputText;
    setInputText('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await api.post('/support/chat', { message: userText });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error connecting to LangChain support.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#e85d4a] hover:bg-[#d94d3a] text-white rounded-full p-4 shadow-lg cursor-pointer flex items-center justify-center transition-all"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-96 bg-white border border-slate-200 rounded-lg shadow-xl flex flex-col overflow-hidden transition-all animate-in slide-in-from-bottom-4">
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="font-bold text-xs text-slate-700">AI Support Copilot</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-lg max-w-[80%] ${
                  m.sender === 'user' ? 'bg-[#e85d4a] text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-400 p-3 rounded-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          {/* Input form */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 flex gap-2 bg-slate-50">
            <input 
              type="text" 
              placeholder="Ask a question..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="bg-white border border-slate-200 px-3 py-2 text-xs rounded focus:outline-none flex-1 focus:border-[#e85d4a]"
            />
            <button type="submit" className="bg-[#e85d4a] text-white p-2 rounded hover:bg-[#d94d3a]"><Send className="w-4 h-4" /></button>
          </form>
        </div>
      )}
    </div>
  );
}
