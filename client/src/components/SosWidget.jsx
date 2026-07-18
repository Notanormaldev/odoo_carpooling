import React, { useState, useEffect } from 'react';
import { ShieldAlert, Phone, X } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function SosWidget() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTripId, setActiveTripId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      findActiveTrip();
    }
  }, [isOpen]);

  const findActiveTrip = async () => {
    try {
      const res = await api.get('/trips/my-trips');
      const active = res.data.data.find(t => ['started', 'in_progress', 'booked'].includes(t.status));
      if (active) {
        setActiveTripId(active._id);
      }
    } catch (err) {
      console.error('Error finding active trip for SOS:', err);
    }
  };

  const handleTriggerSOS = async () => {
    setLoading(true);
    try {
      const tripId = activeTripId || 'global';
      await api.post(`/trips/${tripId}/sos`);
      toast.success('🚨 SOS Priority Alert Dispatched! Admin notified via priority email.');
    } catch (err) {
      toast.error('Failed to trigger SOS online. Calling local authorities recommended.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Pulse Alert SOS Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-red-600 hover:bg-red-700 text-white rounded-full w-14 h-14 shadow-2xl flex items-center justify-center font-black tracking-wider text-xs border border-red-500 cursor-pointer animate-pulse relative hover:scale-105 transition-all"
        title="Emergency SOS Assistance"
      >
        <span className="absolute -inset-1 rounded-full bg-red-600/30 animate-ping"></span>
        SOS
      </button>

      {/* SOS Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-150 relative">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-bold">
                <ShieldAlert className="w-5 h-5 text-red-600 animate-bounce" />
                <span className="text-sm tracking-wide">EMERGENCY ASSISTANCE</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Panic Button */}
            <div className="text-center space-y-4">
              <button
                onClick={handleTriggerSOS}
                disabled={loading}
                className="w-32 h-32 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm border-8 border-red-100 flex flex-col items-center justify-center shadow-lg hover:shadow-red-600/20 active:scale-95 transition-all mx-auto cursor-pointer"
              >
                {loading ? (
                  <span className="text-xs animate-pulse">SENDING...</span>
                ) : (
                  <>
                    <ShieldAlert className="w-6 h-6 mb-1" />
                    <span>TRIGGER SOS</span>
                  </>
                )}
              </button>
              <p className="text-xs text-slate-400 font-medium px-4">
                Clicking the panic button instantly notifies company safety desk via priority email dispatcher with passenger, driver, vehicle and route details.
              </p>
            </div>

            {/* Helplines */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Emergency Services</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a 
                  href="tel:112"
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all font-semibold"
                >
                  <span>Police Helpline</span>
                  <span className="text-red-600 flex items-center gap-1 font-bold">
                    <Phone className="w-3 h-3" /> 112
                  </span>
                </a>
                <a 
                  href="tel:108"
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all font-semibold"
                >
                  <span>Ambulance</span>
                  <span className="text-red-600 flex items-center gap-1 font-bold">
                    <Phone className="w-3 h-3" /> 108
                  </span>
                </a>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="space-y-2 pt-2">
              <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Emergency Contacts</h4>
              {user?.emergencyContacts && user.emergencyContacts.length > 0 ? (
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
              ) : (
                <p className="text-[10px] text-slate-400 bg-amber-50 border border-amber-100 rounded p-2 text-center font-medium">
                  ⚠️ No emergency contacts registered. Add them in Settings.
                </p>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
