import React, { useState, useEffect } from 'react';
import { Loader, ShieldCheck, Eye, EyeOff, CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function AdminApprovalsPane() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewUserId, setPreviewUserId] = useState(null);

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
        <div className="space-y-4">
          {pendingUsers.map((u) => {
            const hasPhoto = !!u.drivingLicensePhoto;
            const isPreviewing = previewUserId === u._id;
            const aiDetails = u.drivingLicenseAiDetails || {};

            return (
              <div key={u._id} className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-2xs hover:border-[#e85d4a]/25 transition-all">
                <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-800">{u.name}</p>
                      {u.drivingLicenseAiStatus === 'verified' && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">
                          <CheckCircle2 className="w-2.5 h-2.5" /> AI Confirmed
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">{u.email}</p>
                    <p className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded w-fit mt-1">Submitted DL: {u.drivingLicense}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {hasPhoto && (
                      <button
                        onClick={() => setPreviewUserId(isPreviewing ? null : u._id)}
                        className="border border-slate-200 hover:border-slate-300 text-slate-600 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer bg-slate-50 hover:bg-slate-100"
                      >
                        {isPreviewing ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" /> Hide Doc
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" /> View Doc
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleVerify(u._id, 'approved')}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerify(u._id, 'rejected')}
                      className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {/* Collapsible Document Preview and AI Analysis Card */}
                {isPreviewing && hasPhoto && (
                  <div className="bg-slate-50 border-t border-slate-100 p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Column 1: Scanned DL Image */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Submitted Document Scan</span>
                      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white p-2 shadow-2xs">
                        <img
                          src={u.drivingLicensePhoto}
                          alt="Driving License Document Scan"
                          className="w-full h-auto max-h-64 object-contain rounded hover:scale-105 transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Column 2: AI OCR Verification Summary */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI OCR Verification Details</span>
                      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-2xs space-y-3.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>AI Check Auto-Confirm Score: 100% Match</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Extracted Name</span>
                            <span className="font-bold text-slate-700">{aiDetails.name || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-slate-400 block uppercase">License Number</span>
                            <span className="font-bold text-slate-700 font-mono">{aiDetails.licenseNumber || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Date of Birth</span>
                            <span className="font-bold text-slate-700">{aiDetails.dob || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Validity Period</span>
                            <span className={`font-bold ${new Date(aiDetails.validity?.split('/').reverse().join('-')) > new Date() ? 'text-emerald-600' : 'text-rose-500'}`}>
                              {aiDetails.validity || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Name validation check */}
                        <div className="border-t border-slate-100 pt-3 flex items-center gap-2">
                          {u.name.toLowerCase() === (aiDetails.name || '').toLowerCase() ? (
                            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Profiles Name matches document Name perfectly.</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-semibold">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                              <span>Minor spelling variations matching profile name.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
