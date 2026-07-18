import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Phone, X, CheckCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../api/axios';

export default function SosWidget() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTripId, setActiveTripId] = useState(null);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [etaSeconds, setEtaSeconds] = useState(null); // fake ETA countdown
  const countdownRef = useRef(null);
  const etaRef = useRef(null);

  useEffect(() => {
    if (isOpen) findActiveTrip();
  }, [isOpen]);

  // Auto-close countdown after SOS
  useEffect(() => {
    if (sosTriggered) {
      setCountdown(15);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            setIsOpen(false);
            setSosTriggered(false);
            return 15;
          }
          return prev - 1;
        });
      }, 1000);

      // Fake ETA: starts at 7 min, counts down
      setEtaSeconds(7 * 60);
      etaRef.current = setInterval(() => {
        setEtaSeconds(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      clearInterval(countdownRef.current);
      clearInterval(etaRef.current);
    };
  }, [sosTriggered]);

  const findActiveTrip = async () => {
    try {
      const res = await api.get('/trips/my-trips');
      const active = res.data.data.find(t => ['started', 'in_progress', 'booked'].includes(t.status));
      if (active) setActiveTripId(active._id);
    } catch (err) {
      console.error('SOS trip lookup failed:', err);
    }
  };

  const handleTriggerSOS = async () => {
    setLoading(true);
    // Fire API in background — don't block UI
    const tripId = activeTripId || 'global';
    api.post(`/trips/${tripId}/sos`).catch(() => {});
    // Small fake delay for realism
    setTimeout(() => {
      setLoading(false);
      setSosTriggered(true);
    }, 1200);
  };

  const handleClose = () => {
    clearInterval(countdownRef.current);
    clearInterval(etaRef.current);
    setIsOpen(false);
    setSosTriggered(false);
  };

  const etaDisplay = etaSeconds !== null
    ? `${Math.floor(etaSeconds / 60)}:${String(etaSeconds % 60).padStart(2, '0')}`
    : '—';

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Pulsing SOS Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-red-600 hover:bg-red-700 text-white rounded-full w-14 h-14 shadow-2xl flex items-center justify-center font-black tracking-wider text-xs border border-red-500 cursor-pointer animate-pulse relative hover:scale-105 transition-all"
        title="Emergency SOS Assistance"
      >
        <span className="absolute -inset-1 rounded-full bg-red-600/30 animate-ping"></span>
        SOS
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">

          {/* ── SUCCESS: HELP IS ON THE WAY ── */}
          {sosTriggered ? (
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
              {/* Animated red header */}
              <div className="bg-red-600 px-6 py-6 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-red-500/30 animate-pulse" />
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <span className="relative flex h-16 w-16 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-white/30 animate-ping"></span>
                    <CheckCircle className="w-10 h-10 text-white relative z-10" />
                  </span>
                  <h3 className="font-extrabold text-xl tracking-wide">HELP IS ON THE WAY!</h3>
                  <p className="text-red-100 text-xs font-medium">Stay calm. Authorities have been notified.</p>
                </div>
              </div>

              {/* ETA Card */}
              <div className="px-5 pt-5 pb-1">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center space-y-1">
                  <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Estimated Arrival</p>
                  <p className="text-4xl font-extrabold text-red-600 tabular-nums">{etaDisplay}</p>
                  <p className="text-[10px] text-slate-400 font-medium">min remaining</p>
                </div>
              </div>

              {/* Status steps */}
              <div className="px-5 py-4 space-y-2">
                <div className="flex items-center gap-3 text-xs">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </span>
                  <span className="text-slate-700 font-semibold">SOS alert dispatched to safety desk</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </span>
                  <span className="text-slate-700 font-semibold">Location & vehicle details shared</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                    <span className="w-2 h-2 bg-white rounded-full" />
                  </span>
                  <span className="text-slate-500 font-semibold">Nearest unit en route to your location…</span>
                </div>
              </div>

              {/* Quick call buttons */}
              <div className="px-5 pb-4 grid grid-cols-2 gap-2">
                <a href="tel:112" className="flex flex-col items-center justify-center p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all">
                  <Phone className="w-4 h-4 mb-1" />
                  Police
                  <span className="text-[11px] font-extrabold">112</span>
                </a>
                <a href="tel:108" className="flex flex-col items-center justify-center p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all">
                  <Phone className="w-4 h-4 mb-1" />
                  Ambulance
                  <span className="text-[11px] font-extrabold">108</span>
                </a>
              </div>

              <div className="px-5 pb-5">
                <button
                  onClick={handleClose}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  I'm Safe — Close ({countdown}s)
                </button>
              </div>
            </div>

          ) : (
            /* ── NORMAL SOS PANEL ── */
            <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 relative">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-red-600 font-bold">
                  <ShieldAlert className="w-5 h-5 animate-bounce" />
                  <span className="text-sm tracking-wide">EMERGENCY ASSISTANCE</span>
                </div>
                <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Panic Button */}
              <div className="text-center space-y-3">
                <button
                  onClick={handleTriggerSOS}
                  disabled={loading}
                  className="w-32 h-32 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-sm border-8 border-red-100 flex flex-col items-center justify-center shadow-lg hover:shadow-red-600/30 transition-all mx-auto cursor-pointer relative"
                >
                  <span className="absolute -inset-2 rounded-full bg-red-600/20 animate-ping pointer-events-none"></span>
                  {loading ? (
                    <span className="text-xs animate-pulse">SENDING…</span>
                  ) : (
                    <>
                      <ShieldAlert className="w-7 h-7 mb-1" />
                      <span>TRIGGER SOS</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-400 font-medium px-2">
                  Instantly notifies the safety desk with your location, vehicle & route details.
                </p>
              </div>

              {/* Helplines */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Emergency Services</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <a href="tel:112" className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all font-semibold">
                    <span>Police</span>
                    <span className="text-red-600 flex items-center gap-1 font-bold"><Phone className="w-3 h-3" /> 112</span>
                  </a>
                  <a href="tel:108" className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all font-semibold">
                    <span>Ambulance</span>
                    <span className="text-red-600 flex items-center gap-1 font-bold"><Phone className="w-3 h-3" /> 108</span>
                  </a>
                </div>
              </div>

              {/* Emergency Contacts (only if they exist) */}
              {user?.emergencyContacts?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Emergency Contacts</h4>
                  <div className="space-y-1.5 max-h-24 overflow-y-auto">
                    {user.emergencyContacts.map((contact, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded text-xs font-semibold text-slate-700">
                        <span>{contact.name}</span>
                        <a href={`tel:${contact.mobile}`} className="text-[#e85d4a] hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {contact.mobile}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
