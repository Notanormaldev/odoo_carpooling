import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';
import SupportChatWidget from '../components/SupportChatWidget';

// View Imports
import DashboardView from '../views/DashboardView';
import MyTripsView from '../views/MyTripsView';
import TripDetailView from '../views/TripDetailView';
import MyVehicleView from '../views/MyVehicleView';
import WalletView from '../views/WalletView';
import RideHistoryView from '../views/RideHistoryView';
import ReportsView from '../views/ReportsView';
import SettingsView from '../views/SettingsView';

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

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative">
      {/* Horizontal Header Bar (Exactly like wireframes, without Organization name in top right) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/logo.png" alt="Carpooling" className="w-9 h-9 object-contain rounded-lg" />
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
              <p className="text-xs font-semibold text-slate-800 capitalize">{user?.name}</p>
            </div>
            
            <div className="w-10 h-10 bg-slate-100 rounded-full overflow-hidden border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 uppercase cursor-pointer" onClick={() => navigate('/settings')}>
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.slice(0, 2)
              )}
            </div>

            <button onClick={logout} className="p-2 text-slate-400 hover:text-[#e85d4a] rounded transition-colors cursor-pointer" title="Log Out">
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

      {/* LangChain Support Widget */}
      <SupportChatWidget />
    </div>
  );
}
