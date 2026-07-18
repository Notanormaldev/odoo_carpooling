import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Loader } from 'lucide-react';
import api from '../api/axios';

export default function MyTripsView() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
          <ChevronLeft className="w-5 h-5 text-[#e85d4a] cursor-pointer" onClick={() => navigate(-1)} />
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
