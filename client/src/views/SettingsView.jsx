import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Clock, Car, Wallet, BarChart3, MapPin, Shield, MessageSquare, LogOut, ChevronLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import SettingsLink from '../components/SettingsLink';
import AdminApprovalsPane from './AdminApprovalsPane';

function DetailItem({ label, value }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function StatCard({ label, value, subtitle }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-lg font-extrabold text-slate-800 mt-1">{value}</p>
      <p className="text-[9px] text-slate-400 mt-0.5">{subtitle}</p>
    </div>
  );
}

export default function SettingsView() {
  const navigate = useNavigate();
  const { user, org, loadUser, logout, setIsChatbotOpen } = useAuthStore();
  const [dlNumber, setDlNumber] = useState(user?.drivingLicense || '');
  const [dlSubmitting, setDlSubmitting] = useState(false);
  const [subView, setSubView] = useState('profile'); // 'profile' or 'approvals'

  const handleDlSubmit = async (e) => {
    e.preventDefault();
    if (!dlNumber.trim()) return;
    setDlSubmitting(true);
    try {
      await api.patch('/users/profile', { drivingLicense: dlNumber });
      await loadUser();
      toast.success('Driving license updated successfully! Awaiting Admin verification.');
    } catch (err) {
      toast.error('Failed to save driving license');
    } finally {
      setDlSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
      {/* Left Column: Quick Navigation Links */}
      <div className="md:col-span-1 bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit space-y-6">
        <div>
          <h2 className="font-bold text-lg text-slate-800">Settings</h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">Control panel & quick links</p>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-100 rounded overflow-hidden">
          <SettingsLink label="Profile Settings" icon={User} onClick={() => setSubView('profile')} isHighlight={subView === 'profile'} />
          <SettingsLink label="My Trips" icon={Clock} onClick={() => navigate('/trips')} />
          <SettingsLink label="My Vehicle" icon={Car} onClick={() => navigate('/vehicle')} />
          <SettingsLink label="Payment Method" icon={Wallet} onClick={() => navigate('/wallet')} />
          <SettingsLink label="Ride History" icon={BarChart3} onClick={() => navigate('/history')} />
          <SettingsLink label="Saved Places" icon={MapPin} onClick={() => toast('Feature coming soon! 🚧')} />
          {user?.role === 'admin' && (
            <SettingsLink label="Driver Approvals" icon={Shield} onClick={() => setSubView('approvals')} isHighlight={subView === 'approvals'} />
          )}
          <SettingsLink label="Help & Support" icon={MessageSquare} onClick={() => setIsChatbotOpen(true)} />
          <SettingsLink label="Log Out" icon={LogOut} onClick={logout} isDanger={true} />
        </div>
      </div>

      {/* Right Column: Dynamic Sub-view Render */}
      <div className="md:col-span-3 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        {subView === 'approvals' && user?.role === 'admin' ? (
          <AdminApprovalsPane />
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <ChevronLeft className="w-5 h-5 text-[#e85d4a] cursor-pointer" onClick={() => navigate('/')} />
                <h3 className="font-bold text-slate-800 text-sm">Profile & Details</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#e85d4a]/10 text-[#e85d4a] uppercase">
                {org?.name || 'Odoo Pvt Ltd'}
              </span>
            </div>

            {/* Profile Header Block */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="w-20 h-20 bg-[#e85d4a] rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center text-2xl font-bold text-white uppercase">
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.slice(0, 2)
                )}
              </div>
              <div className="text-center sm:text-left space-y-1.5 flex-1">
                <h4 className="text-lg font-bold text-slate-800">{user?.name}</h4>
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-xs text-slate-500">
                  <span className="bg-slate-200 px-2 py-0.5 rounded font-medium capitalize">{user?.role}</span>
                  <span>•</span>
                  <span className="font-medium">{user?.department || 'General'} Department</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    ★ {user?.trustScore?.toFixed(1) || '5.0'} Trust
                  </span>
                </div>
              </div>
              <div className="bg-white px-4 py-3 rounded-lg border border-slate-100 text-center shadow-2xs min-w-32">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Wallet Balance</p>
                <p className="text-lg font-extrabold text-slate-800">₹{user?.walletBalance}</p>
              </div>
            </div>

            {/* Corporate Details Grid */}
            <div className="space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Corporate Coordinates</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border border-slate-100 rounded-xl p-6 bg-white">
                <DetailItem label="Full Name" value={user?.name} />
                <DetailItem label="Work Email" value={user?.email} />
                <DetailItem label="Mobile Number" value={user?.mobile || 'Not provided'} />
                <DetailItem label="Department" value={user?.department || 'Not provided'} />
                <DetailItem label="Reporting Manager" value={user?.manager || 'Not assigned'} />
                <DetailItem label="Office Seat / Desk" value={user?.officeLocation || 'Not assigned'} />
              </div>
            </div>

            {/* ESG & Commute Stats */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="CO2 Saved" value={`${user?.co2SavedKg?.toFixed(1) || '0.0'} kg`} subtitle="Net savings" />
              <StatCard label="Rides Offered" value={user?.totalRidesOffered || 0} subtitle="As Driver" />
              <StatCard label="Rides Taken" value={user?.totalRides || 0} subtitle="As Passenger" />
            </div>

            {/* Driving License Registration */}
            <div className="border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-[#e85d4a]/10 rounded-lg text-[#e85d4a] shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-sm text-slate-800">Driver Verification Status</h5>
                  <p className="text-xs text-slate-400">
                    Register or update your driving license to offer and host carpool pools. This is required for safety and insurance.
                  </p>
                </div>
              </div>

              {user?.drivingLicenseStatus === 'approved' ? (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Verified Driver Profile Active</span>
                  </div>
                  <p className="text-[11px] text-emerald-600 font-medium">
                    Registered Driving License: <b className="font-bold font-mono bg-emerald-100/50 px-1.5 py-0.5 rounded">{user.drivingLicense}</b>
                  </p>
                </div>
              ) : user?.drivingLicenseStatus === 'pending' ? (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                    <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                    <span>Awaiting Admin Verification</span>
                  </div>
                  <p className="text-[11px] text-amber-600 font-medium">
                    Submitted License: <b className="font-bold font-mono bg-amber-100/50 px-1.5 py-0.5 rounded">{user.drivingLicense}</b>
                  </p>
                </div>
              ) : (
                <>
                  {user?.drivingLicenseStatus === 'rejected' ? (
                    <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded font-semibold">
                      ⚠ Previous verification attempt was rejected. Please re-enter correct details.
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full text-[10px] text-rose-600 font-bold">
                      ⚠ No driving license registered. You cannot offer rides.
                    </div>
                  )}
                  <form onSubmit={handleDlSubmit} className="flex flex-col sm:flex-row gap-3 pt-2">
                    <input
                      type="text"
                      required
                      placeholder="Enter Driving License (e.g. DL-IND-9992388)"
                      value={dlNumber}
                      onChange={(e) => setDlNumber(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#e85d4a] focus:bg-white flex-1 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={dlSubmitting}
                      className="bg-[#e85d4a] hover:bg-[#d94d3a] disabled:opacity-50 text-white text-xs font-semibold px-6 py-2.5 rounded-lg shadow-sm transition-all"
                    >
                      {dlSubmitting ? 'Saving...' : 'Verify & Save'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
