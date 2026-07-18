import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function AdminApprovalsPane() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const res = await api.get('/users/pending-licenses');
      setPendingUsers(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load pending driver approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleVerify = async (userId, status) => {
    try {
      await api.post('/users/verify-license', { userId, status });
      toast.success(`License successfully ${status}!`);
      fetchPending();
    } catch (err) {
      toast.error('Failed to verify license');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h4 className="font-bold text-slate-800 text-sm">Driver Verification Approvals</h4>
        <p className="text-xs text-slate-400 mt-1 font-medium">Verify employee driving licenses to grant ride publishing access</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader className="w-6 h-6 animate-spin text-[#e85d4a]" />
        </div>
      ) : pendingUsers.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm font-medium">No pending driver license verifications found.</div>
      ) : (
        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-white shadow-2xs">
          {pendingUsers.map((u) => (
            <div key={u._id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50 transition-colors">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">{u.name}</p>
                <p className="text-[10px] text-slate-400 font-semibold">{u.email}</p>
                <p className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded w-fit mt-1">DL: {u.drivingLicense}</p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleVerify(u._id, 'approved')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer animate-all"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleVerify(u._id, 'rejected')}
                  className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer animate-all"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
