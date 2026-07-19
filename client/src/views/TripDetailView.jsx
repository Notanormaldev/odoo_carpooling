import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, ChevronLeft, Download, Send, X, Star } from 'lucide-react';
import * as maptilersdk from '@maptiler/sdk';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import { io } from 'socket.io-client';
import { jsPDF } from 'jspdf';

maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY || 'RL13CDEQU2gZu8sIcdc0';

export default function TripDetailView() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [showQR, setShowQR] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const simIntervalRef = useRef(null);
  const navigate = useNavigate();
  const [isSimulating, setIsSimulating] = useState(false);

  // Safety, Demo and Rating states
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [boardCodeInput, setBoardCodeInput] = useState('');
  const [boardingSubmit, setBoardingSubmit] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const tripId = id || window.location.pathname.split('/').pop();

  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

  useEffect(() => {
    if (!tripId) return;

    const token = localStorage.getItem('accessToken');
    const socketUrl = window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : `${window.location.protocol}//${window.location.hostname}:5000`;

    // Connect socket
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    // Join room
    socket.emit('join_chat_room', { tripId });
    socket.emit('join_tracking_room', { tripId });

    // Listen for history
    socket.on('chat_history', (history) => {
      setChatMessages(history);
    });

    // Listen for new messages
    socket.on('new_message', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    // Listen for driver location tracking
    socket.on('location_update', (loc) => {
      const { lat, lng } = loc;
      if (mapRef.current) {
        if (driverMarkerRef.current) {
          driverMarkerRef.current.setLngLat([lng, lat]);
        } else {
          driverMarkerRef.current = new maptilersdk.Marker({ color: "#2563eb" })
            .setLngLat([lng, lat])
            .setPopup(new maptilersdk.Popup().setHTML("<b>Driver Current Location</b>"))
            .addTo(mapRef.current)
            .togglePopup();
        }
        mapRef.current.panTo([lng, lat]);
      }
    });

    socket.on('status_updated', ({ status }) => {
      fetchTripDetails();
    });

    socket.on('chat_error', (err) => {
      console.error('Socket chat error:', err.message);
      toast.error(err.message || 'Chat error occurred');
    });

    // Cleanup on unmount
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      socket.emit('leave_chat_room', { tripId });
      socket.emit('leave_tracking_room', { tripId });
      socket.disconnect();
    };
  }, [tripId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchTripDetails = async () => {
    try {
      const res = await api.get(`/trips/${tripId}`);
      const tripData = res.data.data;
      setTrip(tripData);

      // Auto trigger rating popup for passenger if trip is completed and not rated
      const isPassenger = user._id === tripData.passengerId?._id;
      const isCompletedStatus = ['completed', 'completed_paid', 'payment_pending'].includes(tripData.status);
      if (isPassenger && isCompletedStatus && !tripData.passengerRating) {
        setShowRatingModal(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!trip) return;
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.error('Error removing old map in TripDetail:', e);
        }
        mapRef.current = null;
      }
      try {
        const startLat = trip.rideId?.startLocation?.lat || 23.0225;
        const startLng = trip.rideId?.startLocation?.lng || 72.5714;
        const destLat = trip.rideId?.destination?.lat || 23.1974;
        const destLng = trip.rideId?.destination?.lng || 72.6326;

        mapRef.current = new maptilersdk.Map({
          container: mapContainerRef.current,
          style: maptilersdk.MapStyle.STREETS,
          center: [startLng, startLat],
          zoom: 11,
        });

        // Add Start marker (Green)
        new maptilersdk.Marker({ color: "#22c55e" })
          .setLngLat([startLng, startLat])
          .setPopup(new maptilersdk.Popup().setHTML(`<b>Start:</b> ${trip.rideId?.startLocation?.address || 'Pickup Point'}`))
          .addTo(mapRef.current);

        // Add Destination marker (Coral Red)
        new maptilersdk.Marker({ color: "#e85d4a" })
          .setLngLat([destLng, destLat])
          .setPopup(new maptilersdk.Popup().setHTML(`<b>Destination:</b> ${trip.rideId?.destination?.address || 'Destination'}`))
          .addTo(mapRef.current);

        mapRef.current.on('load', () => {
          if (!mapRef.current) return;
          mapRef.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [startLng, startLat],
                  [destLng, destLat]
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

          const bounds = new maptilersdk.LngLatBounds();
          bounds.extend([startLng, startLat]);
          bounds.extend([destLng, destLat]);
          mapRef.current.fitBounds(bounds, { padding: 50 });
        });
      } catch (err) {
        console.error('Trip Detail Map initialization error:', err);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      driverMarkerRef.current = null;
    };
  }, [trip]);


  const handleDownloadInvoice = () => {
    const doc = new jsPDF();

    // Color Palette
    const primaryColor = [232, 93, 74]; // #e85d4a
    const darkGray = [51, 65, 85];     // #334155
    const lightGray = [241, 245, 249];  // #f1f5f9
    const borderGray = [226, 232, 240]; // #e2e8f0

    // Header Band
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');

    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('COMMUTE RIDE INVOICE', 20, 26);

    // Platform Name
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Enterprise Carpooling Platform', 145, 26);

    // Reset Text Color
    doc.setTextColor(...darkGray);

    // Invoice Meta Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Date:', 20, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(trip.createdAt).toLocaleString(), 50, 60);

    doc.setFont('helvetica', 'bold');
    doc.text('Trip ID:', 20, 68);
    doc.setFont('helvetica', 'normal');
    doc.text(trip._id.toString(), 50, 68);

    doc.setFont('helvetica', 'bold');
    doc.text('Status:', 20, 76);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94); // Green
    doc.text('PAID & SETTLED', 50, 76);
    doc.setTextColor(...darkGray);

    // Horizontal Rule
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.5);
    doc.line(20, 85, 190, 85);

    // Passenger / Driver Details Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Ride Details', 20, 95);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Driver:', 20, 105);
    doc.setFont('helvetica', 'normal');
    doc.text(trip.driverId?.name || 'N/A', 55, 105);

    doc.setFont('helvetica', 'bold');
    doc.text('Vehicle:', 20, 113);
    doc.setFont('helvetica', 'normal');
    doc.text('Swift Dzire (GJ01AB1234)', 55, 113);

    doc.setFont('helvetica', 'bold');
    doc.text('Seats Booked:', 20, 121);
    doc.setFont('helvetica', 'normal');
    doc.text(trip.seatsBooked.toString(), 55, 121);

    // Route info
    doc.setFont('helvetica', 'bold');
    doc.text('Pickup Address:', 20, 129);
    doc.setFont('helvetica', 'normal');
    doc.text(trip.rideId?.startLocation?.address || 'N/A', 55, 129, { maxWidth: 130 });

    doc.setFont('helvetica', 'bold');
    doc.text('Drop Address:', 20, 143);
    doc.setFont('helvetica', 'normal');
    doc.text(trip.rideId?.destination?.address || 'N/A', 55, 143, { maxWidth: 130 });

    // Table Header
    doc.setFillColor(...lightGray);
    doc.rect(20, 160, 170, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 25, 166);
    doc.text('Amount (INR)', 150, 166);

    // Table Row
    doc.setFont('helvetica', 'normal');
    doc.text(`Commute Fare (Seats x ${trip.seatsBooked})`, 25, 178);
    doc.text(`Rs. ${trip.fare.toFixed(2)}`, 150, 178);

    // Table Border
    doc.line(20, 170, 190, 170);
    doc.line(20, 185, 190, 185);

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total Charged:', 110, 198);
    doc.text(`Rs. ${trip.fare.toFixed(2)}`, 150, 198);

    // Footer
    doc.setDrawColor(...borderGray);
    doc.line(20, 260, 190, 260);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // light gray
    doc.text('Thank you for commuting with us! Have a safe journey.', 105, 270, { align: 'center' });

    // Save PDF
    doc.save(`invoice_${trip._id.slice(-6)}.pdf`);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !socketRef.current) return;
    socketRef.current.emit('send_message', { tripId, text: typedMessage });
    setTypedMessage('');
  };

  const handleToggleSimulation = () => {
    if (isSimulating) {
      clearInterval(simIntervalRef.current);
      setIsSimulating(false);
      toast.success('Simulation stopped');
    } else {
      setIsSimulating(true);
      toast.success('Starting driver simulation...');

      const startLat = trip.rideId?.startLocation?.lat || 23.0225;
      const startLng = trip.rideId?.startLocation?.lng || 72.5714;
      const destLat = trip.rideId?.destination?.lat || 23.1974;
      const destLng = trip.rideId?.destination?.lng || 72.6326;

      let step = 0;
      const totalSteps = 10;

      // Broadcast start coordinate immediately
      if (socketRef.current) {
        socketRef.current.emit('update_driver_location', {
          tripId,
          lat: startLat,
          lng: startLng,
          speed: 45,
          bearing: 0
        });
      }

      simIntervalRef.current = setInterval(() => {
        step += 1;
        if (step > totalSteps) {
          clearInterval(simIntervalRef.current);
          setIsSimulating(false);
          toast.success('Simulation finished! Arrived at destination. Click "Complete Trip" to end the ride.');
          return;
        }

        const ratio = step / totalSteps;
        const currentLat = startLat + (destLat - startLat) * ratio;
        const currentLng = startLng + (destLng - startLng) * ratio;

        if (socketRef.current) {
          socketRef.current.emit('update_driver_location', {
            tripId,
            lat: currentLat,
            lng: currentLng,
            speed: 55,
            bearing: 90
          });
        }
      }, 2000); // 2-second updates
    }
  };

  const handleBoardSubmit = async () => {
    if (!boardCodeInput.trim()) return;
    setBoardingSubmit(true);
    try {
      const isOtp = boardCodeInput.trim().length === 6 && /^\d+$/.test(boardCodeInput.trim());
      const payload = isOtp
        ? { otpCode: boardCodeInput.trim(), tripId }
        : { qrCode: boardCodeInput.trim(), tripId };
      await api.post('/trips/verify-qr', payload);
      toast.success('Passenger successfully verified and boarded!');
      setShowBoardModal(false);
      setBoardCodeInput('');
      fetchTripDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed. Try again.');
    } finally {
      setBoardingSubmit(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await api.patch(`/trips/${tripId}/status`, { status: newStatus });
      toast.success(`Trip status updated to ${newStatus}`);
      fetchTripDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update trip status');
    }
  };

  const handleRatingSubmit = async () => {
    setSubmittingRating(true);
    try {
      await api.post(`/trips/${tripId}/rate`, { rating: ratingStars, comment: ratingComment });
      toast.success('Thank you for rating your commute!');
      setShowRatingModal(false);
      fetchTripDetails();
    } catch (err) {
      toast.error('Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader className="w-6 h-6 animate-spin text-[#e85d4a]" /></div>;
  }

  if (!trip) {
    return <div className="p-8 text-center text-slate-400">Trip not found.</div>;
  }

  const isDriver = user._id === trip.driverId._id;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
      <div className="md:col-span-1 bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit">
        <h2 className="font-bold text-lg text-slate-800">My Trips</h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">Commute Detail</p>
      </div>

      <div className="md:col-span-3 bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-5 h-5 text-[#e85d4a] cursor-pointer" onClick={() => navigate(-1)} />
            <h3 className="font-bold text-slate-800 text-sm">Trip Detail</h3>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadInvoice}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Invoice
            </button>

            {isDriver && (trip.status === 'started' || trip.status === 'in_progress') && (
              <button
                onClick={handleToggleSimulation}
                className={`text-xs font-semibold px-4 py-2 rounded cursor-pointer transition-all ${isSimulating ? 'bg-slate-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                {isSimulating ? 'Stop Simulation' : 'Simulate Drive 🚗'}
              </button>
            )}
            {!isDriver && trip.status === 'booked' && (
              <div className="flex items-center gap-2">
                <div className="bg-slate-50 border border-slate-200 text-[#e85d4a] text-xs font-bold px-3 py-2 rounded select-all">
                  Board OTP: {trip.verificationOtp || 'N/A'}
                </div>
              </div>
            )}
            {isDriver && trip.status === 'booked' && (
              <button onClick={() => setShowBoardModal(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded cursor-pointer">
                Board Passenger (Verify)
              </button>
            )}
            {isDriver && trip.status === 'started' && (
              <div className="flex gap-2">
                <button onClick={() => handleUpdateStatus('in_progress')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded flex items-center gap-2 cursor-pointer">
                  Commence Route
                </button>
                <button onClick={() => handleUpdateStatus('completed')} className="bg-[#e85d4a] hover:bg-[#d84d3a] text-white text-xs font-semibold px-4 py-2 rounded cursor-pointer">
                  Complete Trip (End)
                </button>
              </div>
            )}
            {isDriver && trip.status === 'in_progress' && (
              <button onClick={() => handleUpdateStatus('completed')} className="bg-[#e85d4a] hover:bg-[#d84d3a] text-white text-xs font-semibold px-4 py-2 rounded cursor-pointer">
                Complete Trip
              </button>
            )}
          </div>
        </div>



        {/* Boarding Modal */}
        {showBoardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="bg-white border border-slate-100 rounded-xl p-6 max-w-sm w-full shadow-xl space-y-4">
              <h4 className="font-bold text-slate-800 text-base">Board Passenger</h4>
              <p className="text-xs text-slate-400">Enter passenger's 6-digit OTP code or verification QR code string manually.</p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP or QR code..."
                  value={boardCodeInput}
                  onChange={(e) => setBoardCodeInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#e85d4a]"
                />
                <button
                  onClick={handleBoardSubmit}
                  disabled={boardingSubmit}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded text-xs font-semibold transition-colors cursor-pointer"
                >
                  {boardingSubmit ? 'Verifying...' : 'Confirm Boarding'}
                </button>
                <button
                  onClick={() => {
                    setShowBoardModal(false);
                    setBoardCodeInput('');
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-1.5 rounded text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rating Review Modal */}
        {showRatingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
              <div className="text-center space-y-1">
                <div className="text-3xl">⭐</div>
                <h4 className="font-bold text-slate-800 text-base">How was your ride?</h4>
                <p className="text-xs text-slate-400">Rate your commute with <b>{trip.driverId?.name}</b></p>
              </div>

              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    onClick={() => setRatingStars(star)}
                    className={`w-9 h-9 cursor-pointer transition-all duration-150 hover:scale-110 ${star <= ratingStars ? 'fill-amber-400 text-amber-400 scale-110' : 'text-slate-200 hover:text-amber-300'
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
                  onChange={(e) => setRatingComment(e.target.value)}
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
                  onClick={() => setShowRatingModal(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info card matching wireframe screenshot */}
        <div className="border border-slate-100 rounded-lg p-5 bg-slate-50 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-700">
                {trip.driverId?.name?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">{trip.driverId?.name}</h4>
                <p className="text-[10px] text-slate-400">Route Commute</p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>{new Date(trip.rideId?.dateTime || trip.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
            <div>
              <p className="text-slate-400 uppercase font-bold text-[9px]">Vehicle</p>
              <p className="font-bold text-slate-800">Swift Dzire</p>
              <p className="text-slate-400">GJ01AB1234</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase font-bold text-[9px]">Route Points</p>
              <p><b>Pick UP:</b> {trip.rideId?.startLocation?.address}</p>
              <p><b>Drop:</b> {trip.rideId?.destination?.address}</p>
            </div>
          </div>
        </div>

        {/* Map and Chat section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div ref={mapContainerRef} className="md:col-span-2 h-72 bg-slate-100 rounded border border-slate-200 relative overflow-hidden"></div>

          <div className="border border-slate-200 rounded flex flex-col h-72 bg-white shadow-2xs">
            <div className="p-3 border-b border-slate-200 font-bold text-xs text-slate-700 bg-slate-50">Live Chat</div>
            <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs min-h-0">
              {chatMessages.map((m, i) => {
                const isMe = m.senderId === user?._id;
                return (
                  <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] text-slate-400 font-bold mb-0.5 px-1">{m.senderName}</span>
                    <p className={`p-2.5 rounded-xl max-w-[85%] shadow-2xs break-words ${isMe
                      ? 'bg-[#e85d4a] text-white rounded-tr-none font-medium'
                      : 'bg-slate-100 text-slate-700 rounded-tl-none font-medium'
                      }`}>
                      {m.message}
                    </p>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-200 flex gap-2 bg-slate-50">
              <input
                type="text"
                placeholder="Type message..."
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                className="bg-white border border-slate-200 px-3 py-2 text-xs rounded-lg focus:outline-none focus:border-[#e85d4a] flex-1 shadow-2xs"
              />
              <button type="submit" className="bg-[#e85d4a] hover:bg-[#d94d3a] text-white p-2.5 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
