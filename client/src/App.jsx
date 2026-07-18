import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { 
  Car, Shield, Wallet, BarChart3, Clock, Settings, LogOut, Search, MapPin, Calendar, 
  User, CheckCircle, AlertTriangle, MessageSquare, Send, Phone, RefreshCw, Plus, X, Menu, Loader
} from 'lucide-react';
import * as maptilersdk from '@maptiler/sdk';
import useAuthStore from './store/authStore';
import api from './api/axios';

// ─── MAPTILER CONFIG ────────────────────────────────────────────────
maptilersdk.config.apiKey = 'RL13CDEQU2gZu8sIcdc0';

// ─── WRAPPER / ROUTER ───────────────────────────────────────────────
export default function App() {
  const { loadUser, loading } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#141414] border border-[#222] rounded-lg p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#e85d4a]/10 rounded flex items-center justify-center">
            <Car className="w-6 h-6 text-[#e85d4a]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Carpooling</h1>
            <p className="text-xs text-neutral-400">Enterprise Mobility Platform</p>
          </div>
        </div>

        <h2 className="text-lg font-medium text-white mb-6">Log in to your account</h2>

        {error && (
          <div className="mb-6 p-4 bg-[#e85d4a]/10 border border-[#e85d4a]/20 rounded text-sm text-[#e85d4a] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">Work Email</label>
            <input
              type="email"
              required
              placeholder="name@co.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e85d4a] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e85d4a] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e85d4a] hover:bg-[#d94d3a] disabled:opacity-50 text-white font-medium py-3 rounded text-sm transition-colors mt-6"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#222]"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#141414] px-2 text-neutral-500">Or continue with</span></div>
        </div>

        <a
          href="/api/auth/google"
          className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] hover:bg-[#222] border border-[#262626] text-white py-3 rounded text-sm transition-colors font-medium"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.63z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Google Work Account
        </a>

        <p className="text-center text-xs text-neutral-400 mt-8">
          Don't have an account? <Link to="/signup" className="text-[#e85d4a] hover:underline">Sign up</Link>
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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#141414] border border-[#222] rounded-lg p-8 my-8">
        <h2 className="text-xl font-bold tracking-tight text-white mb-2">Create your account</h2>
        <p className="text-xs text-neutral-400 mb-6">Use your company email domain to register</p>

        {error && (
          <div className="mb-6 p-4 bg-[#e85d4a]/10 border border-[#e85d4a]/20 rounded text-sm text-[#e85d4a] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">Full Name</label>
            <input
              type="text"
              required
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e85d4a] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">Work Email</label>
            <input
              type="email"
              required
              placeholder="name@co.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e85d4a] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">Password</label>
            <input
              type="password"
              required
              placeholder="Min. 8 chars, 1 capital, 1 number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e85d4a] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">Mobile Number</label>
            <input
              type="tel"
              required
              placeholder="9876543210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e85d4a] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">Department</label>
              <input
                type="text"
                placeholder="Engineering"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e85d4a] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">Office Seat/Location</label>
              <input
                type="text"
                placeholder="Tower A"
                value={office}
                onChange={(e) => setOffice(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e85d4a] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e85d4a] hover:bg-[#d94d3a] disabled:opacity-50 text-white font-medium py-3 rounded text-sm transition-colors mt-6"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-400 mt-8">
          Already have an account? <Link to="/login" className="text-[#e85d4a] hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

// ─── MAIN LAYOUT & NAVIGATION ───────────────────────────────────────
function MainLayout() {
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row">
      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#141414] border-b border-[#222]">
        <div className="flex items-center gap-2">
          <Car className="w-6 h-6 text-[#e85d4a]" />
          <span className="font-bold tracking-tight">Carpooling</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-[#222] rounded">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#141414] border-r border-[#222] flex flex-col transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-0'} transition-transform duration-200 md:relative md:translate-x-0`}>
        <div className="p-6 flex items-center justify-between border-b border-[#222]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#e85d4a]/10 rounded flex items-center justify-center">
              <Car className="w-5 h-5 text-[#e85d4a]" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-white">Carpooling</span>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{user?.role}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 hover:bg-[#222] rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SidebarLink to="/" icon={Search} label="Find & Offer Ride" onClick={() => setSidebarOpen(false)} />
          <SidebarLink to="/trips" icon={Clock} label="My Trips" onClick={() => setSidebarOpen(false)} />
          <SidebarLink to="/vehicle" icon={Car} label="My Vehicle" onClick={() => setSidebarOpen(false)} />
          <SidebarLink to="/wallet" icon={Wallet} label="Wallet" onClick={() => setSidebarOpen(false)} />
          
          {user?.role === 'admin' && (
            <>
              <div className="pt-4 pb-2 px-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Admin Panel</div>
              <SidebarLink to="/admin" icon={Shield} label="Manage Portal" onClick={() => setSidebarOpen(false)} />
              <SidebarLink to="/reports" icon={BarChart3} label="ESG & Analytics" onClick={() => setSidebarOpen(false)} />
            </>
          )}

          <div className="pt-4 pb-2 px-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Preferences</div>
          <SidebarLink to="/settings" icon={Settings} label="Settings" onClick={() => setSidebarOpen(false)} />
        </nav>

        <div className="p-4 border-t border-[#222] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-neutral-400 uppercase">{user?.name?.slice(0, 2)}</div>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-white truncate max-w-[110px]">{user?.name}</p>
              <p className="text-[10px] text-neutral-500 truncate max-w-[110px]">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="p-2 text-neutral-400 hover:text-white hover:bg-[#222] rounded transition-colors" title="Log Out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 overflow-y-auto bg-[#0a0a0a]">
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/trips" element={<MyTripsView />} />
          <Route path="/trips/:id" element={<TripDetailView />} />
          <Route path="/vehicle" element={<MyVehicleView />} />
          <Route path="/wallet" element={<WalletView />} />
          <Route path="/admin" element={<AdminPortalView />} />
          <Route path="/reports" element={<ReportsView />} />
          <Route path="/settings" element={<SettingsView />} />
        </Routes>
      </main>
    </div>
  );
}

function SidebarLink({ to, icon: Icon, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium text-neutral-400 hover:text-white hover:bg-[#1a1a1a] transition-all group"
    >
      <Icon className="w-4 h-4 text-neutral-500 group-hover:text-[#e85d4a] transition-colors" />
      <span>{label}</span>
    </Link>
  );
}

// ─── DASHBOARD: FIND & OFFER RIDE ────────────────────────────────────
function DashboardView() {
  const [activeTab, setActiveTab] = useState('find'); // find or offer
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [seats, setSeats] = useState(1);
  const [rides, setRides] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [fareOffer, setFareOffer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

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
    e.preventDefault();
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

  const handleOfferRide = async (e) => {
    e.preventDefault();
    if (!selectedVehicle) {
      alert('You must select an approved vehicle. Add one in the "My Vehicle" tab.');
      return;
    }
    setLoading(true);
    try {
      const dateTime = new Date(`${date}T08:00:00Z`).toISOString(); // Default commute time
      await api.post('/rides', {
        vehicleId: selectedVehicle,
        startLocation: { address: pickup, lat: 23.0225, lng: 72.5714 }, // Mock coords for Gandhinagar/Ahmedabad
        destination: { address: destination, lat: 23.1974, lng: 72.6326 },
        dateTime,
        totalSeats: Number(seats),
        farePerSeat: Number(fareOffer),
      });
      alert('Ride published successfully!');
      setPickup('');
      setDestination('');
      setFareOffer(0);
    } catch (err) {
      alert(err.response?.data?.message || 'Error publishing ride');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (rideId) => {
    try {
      const res = await api.post('/trips/book', { rideId, seatsBooked: 1 });
      alert('Ride booked successfully! You can manage it in the "My Trips" tab.');
      // Refresh list
      setRides(rides.filter(r => r._id !== rideId));
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-[#222] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-xs text-neutral-400">Search commute pools or share your route</p>
        </div>
        <div className="flex bg-[#141414] border border-[#222] rounded p-1">
          <button 
            onClick={() => setActiveTab('find')}
            className={`px-4 py-2 text-xs font-medium rounded transition-colors ${activeTab === 'find' ? 'bg-[#e85d4a] text-white' : 'text-neutral-400 hover:text-white'}`}
          >
            Find a Ride
          </button>
          <button 
            onClick={() => setActiveTab('offer')}
            className={`px-4 py-2 text-xs font-medium rounded transition-colors ${activeTab === 'offer' ? 'bg-[#e85d4a] text-white' : 'text-neutral-400 hover:text-white'}`}
          >
            Offer a Ride
          </button>
        </div>
      </div>

      {activeTab === 'find' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-[#141414] border border-[#222] p-6 rounded-lg h-fit space-y-6">
            <h2 className="text-sm uppercase tracking-wider text-neutral-400 font-semibold">Search Rides</h2>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-2">Pickup Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter pickup point"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#262626] rounded pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-2">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#262626] rounded pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-2">Seats</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    required
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#e85d4a] hover:bg-[#d94d3a] disabled:opacity-50 text-white font-medium py-3 rounded text-sm transition-colors"
              >
                {loading ? 'Searching...' : 'Search Pools'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm uppercase tracking-wider text-neutral-400 font-semibold">Available Ride Pools</h2>
            {msg && <p className="text-sm text-neutral-500">{msg}</p>}
            {rides.length === 0 && !msg && (
              <div className="border border-dashed border-[#222] rounded-lg p-12 text-center text-neutral-500">
                <Search className="w-8 h-8 mx-auto mb-3 text-neutral-600" />
                <p className="text-sm">Submit search criteria on the left to see matching pools.</p>
              </div>
            )}

            <div className="space-y-3">
              {rides.map((ride) => (
                <div key={ride._id} className="bg-[#141414] border border-[#222] p-5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center text-xs font-bold uppercase">
                        {ride.driverId?.name?.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{ride.driverId?.name}</p>
                        <p className="text-[10px] text-accent-emerald">Trust Score: {ride.driverId?.trustScore || 5.0}★</p>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-neutral-400">
                      <p><b>From:</b> {ride.startLocation.address}</p>
                      <p><b>To:</b> {ride.destination.address}</p>
                      <p><b>Departure:</b> {new Date(ride.dateTime).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end gap-3 border-t md:border-t-0 border-[#222] pt-3 md:pt-0">
                    <div className="text-left md:text-right">
                      <p className="text-lg font-bold text-white">₹{ride.farePerSeat}</p>
                      <p className="text-[10px] text-neutral-500">{ride.availableSeats} seats left</p>
                    </div>
                    <button
                      onClick={() => handleBook(ride._id)}
                      className="bg-[#e85d4a] hover:bg-[#d94d3a] text-white text-xs font-semibold px-4 py-2 rounded transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#141414] border border-[#222] p-8 rounded-lg max-w-xl mx-auto space-y-6">
          <h2 className="text-sm uppercase tracking-wider text-neutral-400 font-semibold">Publish a Route Pool</h2>
          
          {vehicles.length === 0 ? (
            <div className="bg-[#e85d4a]/10 border border-[#e85d4a]/20 p-4 rounded text-sm text-[#e85d4a] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>You don't have an approved vehicle. Add a vehicle and wait for admin approval to offer rides.</span>
            </div>
          ) : (
            <form onSubmit={handleOfferRide} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-2">Select Vehicle</label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
                >
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>{v.model} - {v.registrationNumber}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-2">Pickup Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sargasan, Gandhinagar"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-2">Destination Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infocity, Gandhinagar"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-2">Available Seats</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    required
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-2">Fare Offer Per Seat (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="₹80"
                  value={fareOffer}
                  onChange={(e) => setFareOffer(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#e85d4a] hover:bg-[#d94d3a] disabled:opacity-50 text-white font-medium py-3 rounded text-sm transition-colors mt-6"
              >
                {loading ? 'Publishing...' : 'Publish Ride Pool'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MY TRIPS VIEW ──────────────────────────────────────────────────
function MyTripsView() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await api.get('/trips/my-trips');
      setTrips(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Trips</h1>
        <p className="text-xs text-neutral-400">Track and manage your bookings & pools</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 animate-spin text-[#e85d4a]" />
        </div>
      ) : trips.length === 0 ? (
        <div className="border border-dashed border-[#222] rounded-lg p-12 text-center text-neutral-500">
          <Clock className="w-8 h-8 mx-auto mb-3 text-neutral-600" />
          <p className="text-sm">You haven't participated in any trips yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <Link 
              to={`/trips/${trip._id}`}
              key={trip._id} 
              className="block bg-[#141414] hover:bg-[#1a1a1a] border border-[#222] hover:border-[#333] p-5 rounded-lg transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-[#222] px-2 py-0.5 rounded text-neutral-400 uppercase font-semibold">
                      Trip #{trip._id.slice(-6)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      trip.status === 'completed_paid' ? 'bg-accent-emerald/10 text-accent-emerald' : 
                      trip.status === 'cancelled' ? 'bg-[#e85d4a]/10 text-[#e85d4a]' : 'bg-accent-amber/10 text-accent-amber'
                    }`}>
                      {trip.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-sm text-neutral-300">
                    <p className="truncate max-w-md"><b>From:</b> {trip.rideId?.startLocation?.address || 'Gandhinagar'}</p>
                    <p className="truncate max-w-md"><b>To:</b> {trip.rideId?.destination?.address || 'Ahmedabad'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 border-[#222] pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-sm font-semibold text-white">₹{trip.fare}</p>
                    <p className="text-[10px] text-neutral-500">{trip.seatsBooked} seats booked</p>
                  </div>
                  <p className="text-xs text-neutral-400">
                    {new Date(trip.rideId?.dateTime || trip.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TRIP DETAIL & REAL-TIME TRACKING / CHAT ─────────────────────────
function TripDetailView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthStore();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [showQR, setShowQR] = useState(false);
  const socketRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  // Parse ID manually from window location if react-router useParams fails
  const tripId = id || window.location.pathname.split('/').pop();

  useEffect(() => {
    fetchTripDetails();
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      const res = await api.get(`/trips/${tripId}`);
      setTrip(res.data.data);
      initializeSocketChat(res.data.data);
      initializeMap();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const initializeSocketChat = (tripData) => {
    // In production, socket would connect using socket.io-client.
    // For local fallback if server not running or connection fails:
    setChatMessages([
      { _id: '1', senderName: 'System', message: 'Chat room initialized successfully.', type: 'system' }
    ]);
  };

  const initializeMap = () => {
    // Wait for DOM element
    setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return;
      
      try {
        mapRef.current = new maptilersdk.Map({
          container: mapContainerRef.current,
          style: maptilersdk.MapStyle.STREETS.DARK,
          center: [72.5714, 23.0225], // Gandhinagar center
          zoom: 12,
        });

        // Add mock route line
        mapRef.current.on('load', () => {
          mapRef.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [72.5714, 23.0225],
                  [72.6326, 23.1974]
                ]
              }
            }
          });

          mapRef.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#e85d4a',
              'line-width': 4
            }
          });
        });
      } catch (err) {
        console.error('Map loading error:', err);
      }
    }, 100);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const newMsg = {
      _id: Date.now().toString(),
      senderName: user.name,
      message: typedMessage,
      type: 'text',
      createdAt: new Date().toISOString(),
    };

    setChatMessages([...chatMessages, newMsg]);
    setTypedMessage('');
  };

  const handleVerifyQR = async () => {
    // Driver scans passenger's QR code.
    // For simulation, we can trigger the API call directly.
    try {
      await api.post('/trips/verify-qr', { qrCode: trip.verificationQR });
      alert('Verification Successful! Trip has started.');
      fetchTripDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      await api.patch(`/trips/${tripId}/status`, { status });
      alert(`Trip status updated: ${status.replace('_', ' ')}`);
      fetchTripDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleWalletPay = async () => {
    try {
      await api.post('/payments/wallet-pay', { tripId });
      alert('Fare paid successfully using your wallet balance!');
      fetchTripDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-6 h-6 animate-spin text-[#e85d4a]" />
      </div>
    );
  }

  if (!trip) {
    return <div className="p-8 text-center text-neutral-400">Trip not found.</div>;
  }

  const isDriver = user._id === trip.driverId._id;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tight">Trip Details</h1>
            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
              trip.status === 'completed_paid' ? 'bg-accent-emerald/10 text-accent-emerald' : 
              trip.status === 'cancelled' ? 'bg-[#e85d4a]/10 text-[#e85d4a]' : 'bg-accent-amber/10 text-accent-amber'
            }`}>
              {trip.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-neutral-400">Trip ID: #{trip._id}</p>
        </div>

        <div className="flex items-center gap-3">
          {!isDriver && trip.status === 'booked' && (
            <button 
              onClick={() => setShowQR(true)} 
              className="bg-[#1a1a1a] border border-[#222] hover:bg-[#222] text-white text-xs font-semibold px-4 py-2.5 rounded transition-all flex items-center gap-2"
            >
              Show QR Code
            </button>
          )}

          {isDriver && trip.status === 'booked' && (
            <button 
              onClick={handleVerifyQR}
              className="bg-accent-emerald hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded transition-all"
            >
              Simulate Passenger QR Scan
            </button>
          )}

          {isDriver && trip.status === 'started' && (
            <button 
              onClick={() => handleUpdateStatus('in_progress')}
              className="bg-[#e85d4a] hover:bg-[#d94d3a] text-white text-xs font-semibold px-4 py-2.5 rounded transition-all"
            >
              Start Driving (In Progress)
            </button>
          )}

          {isDriver && trip.status === 'in_progress' && (
            <button 
              onClick={() => handleUpdateStatus('completed')}
              className="bg-[#e85d4a] hover:bg-[#d94d3a] text-white text-xs font-semibold px-4 py-2.5 rounded transition-all"
            >
              Arrive at Destination (Finish)
            </button>
          )}

          {!isDriver && trip.status === 'payment_pending' && (
            <button 
              onClick={handleWalletPay}
              className="bg-accent-emerald hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded transition-all"
            >
              Pay ₹{trip.fare} with Wallet
            </button>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#141414] border border-[#222] rounded-lg p-6 max-w-sm w-full text-center relative space-y-6">
            <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg">Trip Verification QR</h3>
            <p className="text-xs text-neutral-400">Ask the driver to scan this QR code when boarding the vehicle.</p>
            <div className="bg-white p-4 rounded-lg w-48 h-48 mx-auto flex items-center justify-center">
              {/* Dynamic QR generation would be placed here */}
              <div className="border-4 border-[#0a0a0a] w-full h-full bg-[#0a0a0a] rounded flex items-center justify-center text-white text-xs font-bold font-mono">
                {trip.verificationQR.slice(0, 8).toUpperCase()}
              </div>
            </div>
            <button onClick={() => setShowQR(false)} className="w-full bg-[#1a1a1a] hover:bg-[#222] border border-[#262626] text-white py-2.5 rounded text-xs transition-colors">
              Close
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Map & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div ref={mapContainerRef} className="w-full h-96 bg-[#141414] border border-[#222] rounded-lg overflow-hidden">
            {/* MapTiler Map renders here */}
          </div>

          <div className="bg-[#141414] border border-[#222] rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">Ride Route & Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-neutral-500 uppercase">From</p>
                <p className="font-medium text-white">{trip.rideId?.startLocation?.address}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-neutral-500 uppercase">To</p>
                <p className="font-medium text-white">{trip.rideId?.destination?.address}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-neutral-500 uppercase">Departure Time</p>
                <p className="font-medium text-white">{new Date(trip.rideId?.dateTime).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-neutral-500 uppercase">Total Fare</p>
                <p className="font-bold text-[#e85d4a]">₹{trip.fare} ({trip.seatsBooked} seats booked)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Chat */}
        <div className="bg-[#141414] border border-[#222] rounded-lg flex flex-col h-[550px]">
          <div className="p-4 border-b border-[#222] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-[#e85d4a]" />
              <div>
                <h3 className="text-sm font-bold text-white">Ride Group Chat</h3>
                <p className="text-[10px] text-neutral-500">Live communication</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {chatMessages.map((msg) => (
              <div key={msg._id} className={`flex flex-col ${msg.type === 'system' ? 'items-center' : msg.senderName === user.name ? 'items-end' : 'items-start'}`}>
                {msg.type === 'system' ? (
                  <span className="text-[10px] bg-neutral-800 text-neutral-400 px-3 py-1 rounded-full">{msg.message}</span>
                ) : (
                  <>
                    <span className="text-[10px] text-neutral-500 mb-1">{msg.senderName}</span>
                    <div className={`text-sm px-3.5 py-2 rounded-lg max-w-[80%] ${msg.senderName === user.name ? 'bg-[#e85d4a] text-white' : 'bg-[#1a1a1a] text-neutral-300'}`}>
                      {msg.message}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-[#222] flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              className="flex-1 bg-[#1a1a1a] border border-[#262626] rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#e85d4a]"
            />
            <button type="submit" className="bg-[#e85d4a] hover:bg-[#d94d3a] p-2.5 rounded text-white transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── MY VEHICLE VIEW ────────────────────────────────────────────────
function MyVehicleView() {
  const [vehicles, setVehicles] = useState([]);
  const [model, setModel] = useState('');
  const [regNum, setRegNum] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [fuelType, setFuelType] = useState('petrol');
  const [efficiency, setEfficiency] = useState(15);
  const [loading, setLoading] = useState(true);

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
      alert('Vehicle submitted successfully! Awaiting Admin approval.');
      setModel('');
      setRegNum('');
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Vehicles</h1>
        <p className="text-xs text-neutral-400">Register and manage vehicles for carpooling</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-[#141414] border border-[#222] p-6 rounded-lg h-fit space-y-6">
          <h2 className="text-sm uppercase tracking-wider text-neutral-400 font-semibold">Add a Vehicle</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs text-neutral-400 mb-2">Model Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Swift Dzire"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-2">Registration Number</label>
              <input
                type="text"
                required
                placeholder="e.g. GJ01AB1234"
                value={regNum}
                onChange={(e) => setRegNum(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-2">Capacity</label>
                <input
                  type="number"
                  min="2"
                  max="8"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-2">Fuel Type</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
                >
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="cng">CNG</option>
                  <option value="electric">Electric</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-2">Fuel Efficiency (km/L)</label>
              <input
                type="number"
                min="1"
                required
                value={efficiency}
                onChange={(e) => setEfficiency(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#e85d4a] hover:bg-[#d94d3a] text-white font-medium py-3 rounded text-sm transition-colors mt-6"
            >
              Submit Vehicle
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm uppercase tracking-wider text-neutral-400 font-semibold">Registered Vehicles</h2>
          {loading ? (
            <Loader className="w-6 h-6 animate-spin text-[#e85d4a]" />
          ) : vehicles.length === 0 ? (
            <div className="border border-dashed border-[#222] rounded-lg p-12 text-center text-neutral-500">
              <Car className="w-8 h-8 mx-auto mb-3 text-neutral-600" />
              <p className="text-sm">No vehicles registered yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicles.map((v) => (
                <div key={v._id} className="bg-[#141414] border border-[#222] p-5 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base">{v.model}</h3>
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
                      v.status === 'active' ? 'bg-accent-emerald/10 text-accent-emerald' : 
                      v.status === 'pending' ? 'bg-accent-amber/10 text-accent-amber' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {v.status}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-400 space-y-1">
                    <p><b>Registration:</b> {v.registrationNumber}</p>
                    <p><b>Capacity:</b> {v.seatingCapacity} seats</p>
                    <p><b>Fuel Type:</b> {v.fuelType.toUpperCase()}</p>
                    <p><b>Efficiency:</b> {v.fuelEfficiency} km/L</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── WALLET VIEW ────────────────────────────────────────────────────
function WalletView() {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const bRes = await api.get('/wallet/balance');
      setBalance(bRes.data.data.balance);

      const hRes = await api.get('/wallet/history');
      setHistory(hRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    try {
      // Simulate dynamic QR generation
      await api.post('/payments/generate-qr', { amount: Number(amount) });
      alert(`Simulation: Wallet recharged with ₹${amount}!`);
      setAmount('');
      fetchWallet();
    } catch (err) {
      alert('Recharge failed');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Wallet</h1>
        <p className="text-xs text-neutral-400">Manage your balance and view transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#141414] border border-[#222] p-6 rounded-lg space-y-4">
            <p className="text-xs uppercase tracking-wider text-neutral-400">Available Balance</p>
            <p className="text-3xl font-bold text-white">₹{balance.toFixed(2)}</p>
          </div>

          <div className="bg-[#141414] border border-[#222] p-6 rounded-lg space-y-4">
            <h2 className="text-sm uppercase tracking-wider text-neutral-400 font-semibold">Recharge Wallet</h2>
            <form onSubmit={handleRecharge} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
                />
              </div>
              <button type="submit" className="w-full bg-accent-emerald hover:bg-emerald-600 text-white font-medium py-3 rounded text-sm transition-colors">
                Simulate UPI Recharge
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm uppercase tracking-wider text-neutral-400 font-semibold">Transaction History</h2>
          {loading ? (
            <Loader className="w-6 h-6 animate-spin text-[#e85d4a]" />
          ) : history.length === 0 ? (
            <div className="border border-dashed border-[#222] rounded-lg p-12 text-center text-neutral-500">
              <Wallet className="w-8 h-8 mx-auto mb-3 text-neutral-600" />
              <p className="text-sm">No transaction records found.</p>
            </div>
          ) : (
            <div className="bg-[#141414] border border-[#222] rounded-lg divide-y divide-[#222]">
              {history.map((tx) => (
                <div key={tx._id} className="p-4 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-white">{tx.description}</p>
                    <p className="text-[10px] text-neutral-500">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                  <p className={`font-bold ${tx.type === 'credit' ? 'text-accent-emerald' : 'text-[#e85d4a]'}`}>
                    {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN PORTAL VIEW ──────────────────────────────────────────────
function AdminPortalView() {
  const [employees, setEmployees] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [dept, setDept] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const eRes = await api.get('/admin/employees');
      setEmployees(eRes.data.data);

      const vRes = await api.get('/admin/vehicles');
      setVehicles(vRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/employees', { name: empName, email: empEmail, department: dept });
      alert('Employee added successfully and notification email sent.');
      setEmpName('');
      setEmpEmail('');
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add employee');
    }
  };

  const toggleAccess = async (empId, currentAccess) => {
    try {
      await api.patch(`/admin/employees/${empId}/access`, { platformAccess: !currentAccess });
      fetchAdminData();
    } catch (err) {
      alert('Access update failed');
    }
  };

  const approveVehicle = async (vehicleId, status) => {
    try {
      await api.patch(`/vehicles/${vehicleId}/approve`, { status });
      fetchAdminData();
    } catch (err) {
      alert('Approval update failed');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Portal</h1>
        <p className="text-xs text-neutral-400">Manage employee directories, approvals, and vehicle lists</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-[#141414] border border-[#222] p-6 rounded-lg h-fit space-y-6">
          <h2 className="text-sm uppercase tracking-wider text-neutral-400 font-semibold">Register New Employee</h2>
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div>
              <label className="block text-xs text-neutral-400 mb-2">Full Name</label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={empName}
                onChange={(e) => setEmpName(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-2">Work Email</label>
              <input
                type="email"
                required
                placeholder="john.doe@co.com"
                value={empEmail}
                onChange={(e) => setEmpEmail(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-2">Department</label>
              <input
                type="text"
                placeholder="e.g. Sales"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
              />
            </div>

            <button type="submit" className="w-full bg-[#e85d4a] hover:bg-[#d94d3a] text-white font-medium py-3 rounded text-sm transition-colors mt-6">
              Register Employee
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h2 className="text-sm uppercase tracking-wider text-neutral-400 font-semibold">Employee Roster</h2>
            <div className="bg-[#141414] border border-[#222] rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#1a1a1a] text-xs uppercase tracking-wider text-neutral-400 border-b border-[#222]">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {employees.map(emp => (
                    <tr key={emp._id} className="hover:bg-[#1a1a1a]">
                      <td className="px-6 py-4 font-medium text-white">{emp.name}<br/><span className="text-xs text-neutral-500">{emp.email}</span></td>
                      <td className="px-6 py-4 text-neutral-400">{emp.department || '-'}</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleAccess(emp._id, emp.platformAccess)}
                          className={`text-xs px-2.5 py-1.5 rounded font-semibold ${emp.platformAccess ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-[#e85d4a]/10 text-[#e85d4a]'}`}
                        >
                          {emp.platformAccess ? 'Revoke Access' : 'Grant Access'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm uppercase tracking-wider text-neutral-400 font-semibold">Pending Vehicle Approvals</h2>
            <div className="bg-[#141414] border border-[#222] rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#1a1a1a] text-xs uppercase tracking-wider text-neutral-400 border-b border-[#222]">
                  <tr>
                    <th className="px-6 py-4">Owner</th>
                    <th className="px-6 py-4">Vehicle Detail</th>
                    <th className="px-6 py-4">Approval Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {vehicles.map(v => (
                    <tr key={v._id} className="hover:bg-[#1a1a1a]">
                      <td className="px-6 py-4 font-medium text-white">{v.ownerId?.name || 'Employee'}</td>
                      <td className="px-6 py-4 text-neutral-400">{v.model} ({v.registrationNumber})</td>
                      <td className="px-6 py-4">
                        {v.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button onClick={() => approveVehicle(v._id, 'active')} className="bg-accent-emerald hover:bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1 rounded">Approve</button>
                            <button onClick={() => approveVehicle(v._id, 'inactive')} className="bg-[#e85d4a] hover:bg-red-600 text-white text-xs font-semibold px-2.5 py-1 rounded">Reject</button>
                          </div>
                        ) : (
                          <span className={`text-xs uppercase font-bold ${v.status === 'active' ? 'text-accent-emerald' : 'text-[#e85d4a]'}`}>{v.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── REPORTS VIEW ───────────────────────────────────────────────────
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-6 h-6 animate-spin text-[#e85d4a]" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ESG & Financial Analytics</h1>
        <p className="text-xs text-neutral-400">Carbon footprints, fleet efficiency summaries, and financial reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#141414] border border-[#222] p-5 rounded-lg">
          <p className="text-xs uppercase text-neutral-400">Total Distance Pooled</p>
          <p className="text-2xl font-bold text-white mt-1">{report?.metrics?.totalDistance || 0} km</p>
        </div>
        <div className="bg-[#141414] border border-[#222] p-5 rounded-lg">
          <p className="text-xs uppercase text-neutral-400 font-medium">CO2 Saved (ESG)</p>
          <p className="text-2xl font-bold text-accent-emerald mt-1">{report?.metrics?.totalCO2Saved?.toFixed(2) || 0} kg</p>
        </div>
        <div className="bg-[#141414] border border-[#222] p-5 rounded-lg">
          <p className="text-xs uppercase text-neutral-400">Fuel Saved</p>
          <p className="text-2xl font-bold text-white mt-1">{report?.metrics?.totalFuelSaved?.toFixed(2) || 0} Litres</p>
        </div>
        <div className="bg-[#141414] border border-[#222] p-5 rounded-lg">
          <p className="text-xs uppercase text-neutral-400">Total Savings Amount</p>
          <p className="text-2xl font-bold text-[#e85d4a] mt-1">₹{report?.metrics?.totalFuelCostSavedAmount || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm uppercase tracking-wider text-neutral-400 font-semibold">Monthly Financial Summary</h2>
          <div className="bg-[#141414] border border-[#222] rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#1a1a1a] text-xs uppercase tracking-wider text-neutral-400 border-b border-[#222]">
                <tr>
                  <th className="px-6 py-4">Month</th>
                  <th className="px-6 py-4">Total Revenue</th>
                  <th className="px-6 py-4">Fuel Saved Cost</th>
                  <th className="px-6 py-4">Estimated Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {report?.financialSummary?.map((sum, index) => (
                  <tr key={index} className="hover:bg-[#1a1a1a]">
                    <td className="px-6 py-4 font-medium text-white">{sum.month}</td>
                    <td className="px-6 py-4 text-neutral-400">₹{sum.revenue}</td>
                    <td className="px-6 py-4 text-neutral-400">₹{sum.fuelCostSaved}</td>
                    <td className="px-6 py-4 text-accent-emerald font-semibold">₹{sum.netProfit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm uppercase tracking-wider text-neutral-400 font-semibold">Top Costliest Vehicles</h2>
          <div className="bg-[#141414] border border-[#222] rounded-lg overflow-hidden divide-y divide-[#222]">
            {report?.topCostlyVehicles?.map(v => (
              <div key={v._id} className="p-4 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-white">{v.model}</p>
                  <p className="text-[10px] text-neutral-500">{v.registrationNumber}</p>
                </div>
                <p className="font-bold text-[#e85d4a]">₹{v.estimatedCost}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS VIEW ──────────────────────────────────────────────────
function SettingsView() {
  const { user } = useAuthStore();
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [dept, setDept] = useState(user?.department || '');
  const [office, setOffice] = useState(user?.officeLocation || '');

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/users/profile', { mobile, department: dept, officeLocation: office });
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Update failed');
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-xs text-neutral-400">Manage account information and security preferences</p>
      </div>

      <div className="bg-[#141414] border border-[#222] p-8 rounded-lg space-y-6">
        <h2 className="text-sm uppercase tracking-wider text-neutral-400 font-semibold font-mono">Personal Preferences</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-2">Full Name</label>
            <input type="text" disabled value={user?.name} className="w-full bg-[#1a1a1a] border border-[#262626] text-neutral-500 rounded px-4 py-3 text-sm focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-2">Work Email</label>
            <input type="email" disabled value={user?.email} className="w-full bg-[#1a1a1a] border border-[#262626] text-neutral-500 rounded px-4 py-3 text-sm focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-2">Mobile Number</label>
            <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-400 mb-2">Department</label>
              <input type="text" value={dept} onChange={(e) => setDept(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]" />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-2">Office Seat</label>
              <input type="text" value={office} onChange={(e) => setOffice(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#262626] rounded px-4 py-3 text-sm focus:outline-none" />
            </div>
          </div>

          <button type="submit" className="w-full bg-[#e85d4a] hover:bg-[#d94d3a] text-white font-medium py-3 rounded text-sm transition-colors mt-6">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
