import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';
import SupportChatWidget from '../components/SupportChatWidget';
import SosWidget from '../components/SosWidget';

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
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

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

            <button onClick={() => setShowLogoutModal(true)} className="p-2 text-slate-400 hover:text-[#e85d4a] rounded transition-colors cursor-pointer" title="Log Out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Premium Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl space-y-4 transform scale-100 transition-all">
            <div className="w-12 h-12 bg-rose-50 text-[#e85d4a] rounded-full flex items-center justify-center mx-auto mb-2">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="font-bold text-slate-800 text-base">Log Out?</h4>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to log out of your session?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 border border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold py-2 rounded text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
                className="flex-1 bg-[#e85d4a] hover:bg-[#d94d3a] text-white font-semibold py-2 rounded text-xs transition-colors shadow-sm cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

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
      <SosWidget />
    </div>
  );
}
