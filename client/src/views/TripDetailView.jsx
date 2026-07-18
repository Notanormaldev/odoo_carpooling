import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, ChevronLeft, Download, Send, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import { io } from 'socket.io-client';
import { jsPDF } from 'jspdf';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
  const navigate = useNavigate();

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

    // Listen for history
    socket.on('chat_history', (history) => {
      setChatMessages(history);
    });

    // Listen for new messages
    socket.on('new_message', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socket.on('chat_error', (err) => {
      console.error('Socket chat error:', err.message);
      toast.error(err.message || 'Chat error occurred');
    });

    // Cleanup on unmount
    return () => {
      socket.emit('leave_chat_room', { tripId });
      socket.disconnect();
    };
  }, [tripId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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

        mapRef.current = L.map(mapContainerRef.current).setView([startLat, startLng], 11);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapRef.current);

        const greenIcon = new L.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        const redIcon = new L.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        L.marker([startLat, startLng], { icon: greenIcon })
          .addTo(mapRef.current)
          .bindPopup(`<b>Start:</b> ${trip.rideId?.startLocation?.address || 'Pickup Point'}`);

        L.marker([destLat, destLng], { icon: redIcon })
          .addTo(mapRef.current)
          .bindPopup(`<b>Destination:</b> ${trip.rideId?.destination?.address || 'Destination'}`);

        L.polyline([[startLat, startLng], [destLat, destLng]], {
          color: '#e85d4a',
          weight: 4,
          opacity: 0.8
        }).addTo(mapRef.current);

        const bounds = L.latLngBounds([
          [startLat, startLng],
          [destLat, destLng]
        ]);
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
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
          
          <div className="border border-slate-200 rounded flex flex-col h-72 bg-white shadow-2xs">
            <div className="p-3 border-b border-slate-200 font-bold text-xs text-slate-700 bg-slate-50">Live Chat</div>
            <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs min-h-0">
              {chatMessages.map((m, i) => {
                const isMe = m.senderId === user?._id;
                return (
                  <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] text-slate-400 font-bold mb-0.5 px-1">{m.senderName}</span>
                    <p className={`p-2.5 rounded-xl max-w-[85%] shadow-2xs break-words ${
                      isMe 
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
