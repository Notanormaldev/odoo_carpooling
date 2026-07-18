import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, ChevronLeft, Download, Send, X } from 'lucide-react';
import * as maptilersdk from '@maptiler/sdk';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import api from '../api/axios';

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
  const navigate = useNavigate();

  const tripId = id || window.location.pathname.split('/').pop();

  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      const res = await api.get(`/trips/${tripId}`);
      setTrip(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!trip) return;
    const timer = setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return;
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
    };
  }, [trip]);

  const handleUpdateStatus = async (status) => {
    try {
      await api.patch(`/trips/${tripId}/status`, { status });
      toast.success('Trip status updated');
      fetchTripDetails();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDownloadInvoice = () => {
    const content = `===========================================
          COMMUTE RIDE INVOICE          
===========================================
Trip ID: ${trip._id}
Date: ${new Date(trip.createdAt).toLocaleString()}
Driver: ${trip.driverId?.name}
Vehicle: Swift Dzire (GJ01AB1234)
Route: ${trip.rideId?.startLocation?.address} to ${trip.rideId?.destination?.address}
Seats: ${trip.seatsBooked}
Fare Charged: ₹${trip.fare}
CO2 Savings: 0.96 kg
Payment Status: PAID & SETTLED
===========================================
Thank you for reducing corporate carbon footprint!
===========================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `invoice_${trip._id.slice(-6)}.txt`;
    link.click();
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    setChatMessages([...chatMessages, { _id: Date.now().toString(), senderName: user.name, message: typedMessage }]);
    setTypedMessage('');
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

            {!isDriver && trip.status === 'booked' && (
              <button onClick={() => setShowQR(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-4 py-2 rounded cursor-pointer">
                Show QR
              </button>
            )}
            {isDriver && trip.status === 'booked' && (
              <button onClick={() => handleUpdateStatus('started')} className="bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded cursor-pointer">
                Board Passenger (Verify)
              </button>
            )}
            {trip.status === 'started' && (
              <button onClick={() => handleUpdateStatus('in_progress')} className="bg-[#e85d4a] text-white text-xs font-semibold px-4 py-2 rounded cursor-pointer">
                Commence Route
              </button>
            )}
            {trip.status === 'in_progress' && (
              <button onClick={() => handleUpdateStatus('completed')} className="bg-[#e85d4a] text-white text-xs font-semibold px-4 py-2 rounded cursor-pointer">
                Complete Trip
              </button>
            )}
          </div>
        </div>

        {showQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white border border-slate-200 rounded-lg p-6 text-center space-y-4">
              <h3 className="font-bold">Trip QR</h3>
              <p className="text-xs text-slate-400">Scan code to verify trip startup.</p>
              <div className="w-40 h-40 bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-mono font-bold text-slate-700 mx-auto">
                {trip.verificationQR?.slice(0, 8).toUpperCase() || 'VERIFY'}
              </div>
              <button onClick={() => setShowQR(false)} className="bg-[#e85d4a] text-white text-xs font-semibold px-4 py-2 rounded w-full cursor-pointer">Close</button>
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
          
          <div className="border border-slate-200 rounded flex flex-col h-72">
            <div className="p-3 border-b border-slate-200 font-bold text-xs text-slate-700 bg-slate-50">Live Chat</div>
            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
              {chatMessages.map((m, i) => (
                <div key={i} className="space-y-1">
                  <span className="font-bold text-[10px] text-slate-500">{m.senderName}:</span>
                  <p className="bg-slate-100 p-2 rounded text-slate-700">{m.message}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-200 flex gap-2">
              <input type="text" placeholder="Type message..." value={typedMessage} onChange={(e) => setTypedMessage(e.target.value)} className="bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs rounded focus:outline-none flex-1" />
              <button type="submit" className="bg-[#e85d4a] text-white p-2 rounded cursor-pointer"><Send className="w-3.5 h-3.5" /></button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
