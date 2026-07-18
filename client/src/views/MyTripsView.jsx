import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Loader, Star, Car, Ticket } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function MyTripsView() {
  const [activeTab, setActiveTab] = useState('trips'); // 'trips' | 'rides'
  const [trips, setTrips] = useState([]);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  const [ratingTrip, setRatingTrip] = useState(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tripsRes, ridesRes] = await Promise.all([
        api.get('/trips/my-trips'),
        api.get('/rides/my-rides'),
      ]);
      setTrips(tripsRes.data.data || []);
      setRides(ridesRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (!ratingTrip) return;
    setSubmittingRating(true);
    try {
      await api.post(`/trips/${ratingTrip._id}/rate`, { rating: ratingStars, comment: ratingComment });
      toast.success('Thank you for your review!');
      setRatingTrip(null);
      setRatingStars(5);
      setRatingComment('');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      booked: 'bg-blue-50 text-blue-600',
      started: 'bg-emerald-50 text-emerald-600',
      in_progress: 'bg-purple-50 text-purple-600',
      completed: 'bg-green-50 text-green-600',
      completed_paid: 'bg-green-50 text-green-600',
      cancelled: 'bg-red-50 text-red-500',
      payment_pending: 'bg-amber-50 text-amber-600',
      published: 'bg-sky-50 text-sky-600',
      full: 'bg-orange-50 text-orange-500',
    };
    return map[status] || 'bg-slate-50 text-slate-500';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
      {/* Sidebar */}
      <div className="md:col-span-1 bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit">
        <h2 className="font-bold text-lg text-slate-800">My Trips</h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">Commute schedules</p>
      </div>

      {/* Main */}
      <div className="md:col-span-3 bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-5">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
          <ChevronLeft className="w-5 h-5 text-[#e85d4a] cursor-pointer" onClick={() => navigate(-1)} />
          <h3 className="font-bold text-slate-800 text-sm">My Commutes</h3>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('trips')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'trips' ? 'bg-white text-[#e85d4a] shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            Booked Trips
            {trips.length > 0 && (
              <span className="bg-[#e85d4a] text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                {trips.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('rides')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'rides' ? 'bg-white text-[#e85d4a] shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            My Created Rides
            {rides.length > 0 && (
              <span className="bg-slate-400 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                {rides.length}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-6 h-6 animate-spin text-[#e85d4a]" />
          </div>
        ) : (
          <>
            {/* ── BOOKED TRIPS TAB ── */}
            {activeTab === 'trips' && (
              <div>
                {trips.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">No trips booked yet. Find a ride to begin!</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {trips.map(t => {
                      const isPassenger = user?._id === t.passengerId?._id;
                      const isCompleted = ['completed', 'completed_paid', 'payment_pending'].includes(t.status);
                      const canRate = isPassenger && isCompleted && !t.passengerRating;

                      return (
                        <div key={t._id} className="py-4 px-3 hover:bg-slate-50 rounded-lg transition-all">
                          <div className="flex items-center justify-between gap-3">
                            <Link to={`/trips/${t._id}`} className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-800 text-sm truncate">
                                {t.rideId?.startLocation?.address} → {t.rideId?.destination?.address}
                              </h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {new Date(t.rideId?.dateTime || t.createdAt).toLocaleString()}
                              </p>
                              {isCompleted && t.passengerRating && (
                                <div className="flex items-center gap-0.5 mt-1">
                                  {[1,2,3,4,5].map(s => (
                                    <Star key={s} className={`w-3 h-3 ${s <= t.passengerRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                  ))}
                                  <span className="text-[10px] text-slate-400 ml-1">You rated</span>
                                </div>
                              )}
                            </Link>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`text-xs font-semibold px-2 py-1 rounded uppercase whitespace-nowrap ${statusBadge(t.status)}`}>
                                {t.status.replace(/_/g, ' ')}
                              </span>
                              {canRate && (
                                <button
                                  onClick={() => { setRatingTrip(t); setRatingStars(5); setRatingComment(''); }}
                                  className="text-[10px] font-bold px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 transition-all cursor-pointer whitespace-nowrap"
                                >
                                  ⭐ Rate
                                </button>
                              )}
                              {['booked', 'started'].includes(t.status) && isPassenger && (
                                <CancelTripButton
                                  tripId={t._id}
                                  onCancelled={() => {
                                    setTrips(prev => prev.map(x => x._id === t._id ? { ...x, status: 'cancelled' } : x));
                                    toast.success('Trip cancelled successfully');
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── CREATED RIDES TAB ── */}
            {activeTab === 'rides' && (
              <div>
                {rides.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    No rides created yet.{' '}
                    <button onClick={() => navigate('/dashboard')} className="text-[#e85d4a] font-semibold hover:underline cursor-pointer">
                      Offer a ride →
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {rides.map(r => (
                      <div key={r._id} className="py-4 px-3 hover:bg-slate-50 rounded-lg transition-all">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 text-sm truncate">
                              {r.startLocation?.address} → {r.destination?.address}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-[10px] text-slate-400">
                                📅 {new Date(r.dateTime).toLocaleString()}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                💺 {r.availableSeats}/{r.totalSeats} seats
                              </p>
                              <p className="text-[10px] text-slate-400">
                                ₹{r.farePerSeat}/seat
                              </p>
                            </div>
                            {r.vehicleId && (
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                🚗 {r.vehicleId.model} · {r.vehicleId.registrationNumber}
                              </p>
                            )}
                            {r.passengers?.length > 0 && (
                              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                                👥 {r.passengers.length} passenger{r.passengers.length > 1 ? 's' : ''} booked
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded uppercase ${statusBadge(r.status)}`}>
                              {r.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Rating Modal */}
      {ratingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-center space-y-1">
              <div className="text-3xl">⭐</div>
              <h4 className="font-bold text-slate-800 text-base">How was your ride?</h4>
              <p className="text-xs text-slate-400">Rate your commute with <b>{ratingTrip.driverId?.name}</b></p>
            </div>

            <div className="flex items-center justify-center gap-2 py-2">
              {[1,2,3,4,5].map(star => (
                <Star
                  key={star}
                  onClick={() => setRatingStars(star)}
                  className={`w-9 h-9 cursor-pointer transition-all duration-150 hover:scale-110 ${
                    star <= ratingStars ? 'fill-amber-400 text-amber-400 scale-110' : 'text-slate-200 hover:text-amber-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-xs font-semibold text-amber-500">
              {ratingStars === 1 ? 'Poor' : ratingStars === 2 ? 'Fair' : ratingStars === 3 ? 'Good' : ratingStars === 4 ? 'Very Good' : 'Excellent!'}
            </p>

            <div className="space-y-3">
              <textarea
                placeholder="Write an optional review comment..."
                value={ratingComment}
                onChange={e => setRatingComment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs focus:outline-none focus:border-[#e85d4a] h-20 resize-none"
                maxLength={300}
              />
              <button
                onClick={handleRatingSubmit}
                disabled={submittingRating}
                className="w-full bg-[#e85d4a] hover:bg-[#d94d3a] text-white py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              >
                {submittingRating ? 'Submitting...' : '⭐ Submit Review'}
              </button>
              <button
                onClick={() => setRatingTrip(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CancelTripButton({ tripId, onCancelled }) {
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.patch(`/trips/${tripId}/status`, { status: 'cancelled', cancellationReason: 'Cancelled by passenger' });
      onCancelled();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel trip');
    } finally {
      setCancelling(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-slate-500 font-medium">Sure?</span>
        <button onClick={handleCancel} disabled={cancelling} className="text-[10px] font-bold px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white cursor-pointer">
          {cancelling ? '...' : 'Yes'}
        </button>
        <button onClick={() => setConfirming(false)} className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer">
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-[10px] font-bold px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 transition-all cursor-pointer whitespace-nowrap"
    >
      Cancel
    </button>
  );
}
