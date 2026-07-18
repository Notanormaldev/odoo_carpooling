import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, X, Loader } from 'lucide-react';
import * as maptilersdk from '@maptiler/sdk';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import api from '../api/axios';

maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY || 'RL13CDEQU2gZu8sIcdc0';

const CITIES = [
  { label: 'AHM (AHMEDABAD)', name: 'ahmedabad', lat: 23.0225, lng: 72.5714 },
  { label: 'GND (GANDHINAGAR)', name: 'gandhinagar', lat: 23.2156, lng: 72.6369 },
  { label: 'SUR (SURAT)', name: 'surat', lat: 21.1702, lng: 72.8311 },
  { label: 'BRD (VADODARA)', name: 'vadodara', lat: 22.3072, lng: 73.1812 },
  { label: 'RAJ (RAJKOT)', name: 'rajkot', lat: 22.3039, lng: 70.8022 },
  { label: 'BHN (BHAVNAGAR)', name: 'bhavnagar', lat: 21.7645, lng: 72.1519 },
  { label: 'JAM (JAMNAGAR)', name: 'jamnagar', lat: 22.4707, lng: 70.0577 },
  { label: 'JUN (JUNAGADH)', name: 'junagadh', lat: 21.5222, lng: 70.4579 },
  { label: 'ANND (ANAND)', name: 'anand', lat: 22.5645, lng: 72.9289 },
  { label: 'NVS (NAVSARI)', name: 'navsari', lat: 20.9467, lng: 72.9520 },
  { label: 'VAL (VALSAD)', name: 'valsad', lat: 20.5992, lng: 72.9342 },
  { label: 'BHJ (BHUJ)', name: 'bhuj', lat: 23.2420, lng: 69.6669 },
  { label: 'MSN (MEHSANA)', name: 'mehsana', lat: 23.5880, lng: 72.3693 },
  { label: 'MOR (MORBI)', name: 'morbi', lat: 22.8120, lng: 70.8236 },
  { label: 'PPA (PATAN)', name: 'patan', lat: 23.8493, lng: 72.1266 },
  { label: 'POR (PORBANDAR)', name: 'porbandar', lat: 21.6417, lng: 69.6093 },
  { label: 'GHD (GODHRA)', name: 'godhra', lat: 22.7753, lng: 73.6146 },
  { label: 'PAL (PALANPUR)', name: 'palanpur', lat: 24.1722, lng: 72.4333 },
  { label: 'AMR (AMRELI)', name: 'amreli', lat: 21.6012, lng: 71.2204 },
  { label: 'VAP (VAPI)', name: 'vapi', lat: 20.3718, lng: 72.9090 },
  { label: 'BHRL (BHARUCH)', name: 'bharuch', lat: 21.7051, lng: 72.9959 }
];

const geocodeAddress = (address) => {
  if (!address) return null;
  const clean = address.toLowerCase().trim();

  // Match predefined Gujarat cities
  const matched = CITIES.find(c =>
    clean.includes(c.name) ||
    clean.includes(c.label.toLowerCase()) ||
    (c.label.split(' ')[0] && clean === c.label.split(' ')[0].toLowerCase())
  );
  if (matched) return { lat: matched.lat, lng: matched.lng };

  // No match — return null (caller uses cached coords from suggestion dropdown)
  return null;
};

const nominatimGeocode = async (address) => {
  if (!address) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Gujarat, India')}&limit=1&countrycodes=in`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'odoo-carpooling-app' },
      signal: controller.signal
    });
    clearTimeout(timeout);
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (err) {
    // Timeout or network error - silently skip geocoding
    console.warn('Nominatim geocode skipped:', err.name);
  }
  return null;
};

export default function DashboardView() {
  const { user, loadUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('find');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [seats, setSeats] = useState(1);
  const [rides, setRides] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [fareOffer, setFareOffer] = useState(120);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [showConfirmRoute, setShowConfirmRoute] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);

  const fetchAddressSuggestions = async (query) => {
    if (!query || query.length < 3) return [];
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Gujarat')}&limit=5&countrycodes=in`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'odoo-carpooling-app' }
      });
      const data = await res.json();
      return data.map(item => ({
        label: item.display_name.split(',').slice(0, 3).join(','),
        fullAddress: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      }));
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      return [];
    }
  };

  useEffect(() => {
    const q = pickup.trim();
    if (!q) {
      setPickupSuggestions(CITIES.slice(0, 5));
      return;
    }
    const timer = setTimeout(async () => {
      const localMatched = CITIES.filter(c =>
        c.label.toLowerCase().includes(q.toLowerCase()) ||
        c.name.toLowerCase().includes(q.toLowerCase())
      );
      const remoteMatched = await fetchAddressSuggestions(q);
      const combined = [...localMatched];
      remoteMatched.forEach(rm => {
        if (!combined.some(c => c.label.toLowerCase().includes(rm.label.toLowerCase()))) {
          combined.push({
            label: rm.label,
            name: rm.label.toLowerCase(),
            lat: rm.lat,
            lng: rm.lng
          });
        }
      });
      setPickupSuggestions(combined.slice(0, 6));
    }, 400);
    return () => clearTimeout(timer);
  }, [pickup]);

  useEffect(() => {
    const q = destination.trim();
    if (!q) {
      setDestSuggestions(CITIES.slice(0, 5));
      return;
    }
    const timer = setTimeout(async () => {
      const localMatched = CITIES.filter(c =>
        c.label.toLowerCase().includes(q.toLowerCase()) ||
        c.name.toLowerCase().includes(q.toLowerCase())
      );
      const remoteMatched = await fetchAddressSuggestions(q);
      const combined = [...localMatched];
      remoteMatched.forEach(rm => {
        if (!combined.some(c => c.label.toLowerCase().includes(rm.label.toLowerCase()))) {
          combined.push({
            label: rm.label,
            name: rm.label.toLowerCase(),
            lat: rm.lat,
            lng: rm.lng
          });
        }
      });
      setDestSuggestions(combined.slice(0, 6));
    }, 400);
    return () => clearTimeout(timer);
  }, [destination]);

  const handlePickupChange = (val) => {
    setPickup(val);
    setPickupCoords(null);
  };

  const handleDestChange = (val) => {
    setDestination(val);
    setDestCoords(null);
  };

  const handlePickupFocus = () => {
    setShowPickupSuggestions(true);
  };

  const handleDestFocus = () => {
    setShowDestSuggestions(true);
  };

  const [dlNumber, setDlNumber] = useState('');
  const [dlSubmitting, setDlSubmitting] = useState(false);

  useEffect(() => {
    fetchMyVehicles();
  }, []);

  const fetchMyVehicles = async () => {
    try {
      const res = await api.get('/vehicles/my-vehicles');
      setVehicles(res.data.data.filter(v => v.status === 'active'));
      if (res.data.data.length > 0) {
        setSelectedVehicle(res.data.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      let queryParams = `seats=${seats}`;
      if (date) queryParams += `&date=${date}`;

      // Use coords from suggestion selection (pickupCoords/destCoords) or instant static lookup
      // Never await external APIs here — that blocks the UI
      const startCoords = pickupCoords || geocodeAddress(pickup);
      if (startCoords) queryParams += `&lat=${startCoords.lat}&lng=${startCoords.lng}`;

      const dstCoords = destCoords || geocodeAddress(destination);
      if (dstCoords) queryParams += `&destLat=${dstCoords.lat}&destLng=${dstCoords.lng}`;

      const res = await api.get(`/rides/search?${queryParams}`);
      setRides(res.data.data);
      setMsg(res.data.data.length === 0 ? 'No rides found. Try different locations or dates.' : '');
    } catch (err) {
      console.error('Search error:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      } else {
        setMsg('Error searching for rides. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllRides = async () => {
    setLoading(true);
    try {
      let queryParams = `seats=${seats}`;
      if (date) queryParams += `&date=${date}`;
      const res = await api.get(`/rides/search?${queryParams}`);
      setRides(res.data.data);
      setMsg(res.data.data.length === 0 ? 'No rides available.' : '');
    } catch (err) {
      console.error('View all error:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      } else {
        setMsg('Error loading rides. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDlSubmit = async (e) => {
    e.preventDefault();
    if (!dlNumber.trim()) return;
    setDlSubmitting(true);
    try {
      await api.patch('/users/profile', { drivingLicense: dlNumber });
      await loadUser();
      toast.success('Driving license updated successfully!');
    } catch (err) {
      toast.error('Failed to save driving license');
    } finally {
      setDlSubmitting(false);
    }
  };

  const handleCloseConfirmRoute = () => {
    setShowConfirmRoute(false);
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  };

  const handlePublishClick = (e) => {
    e.preventDefault();
    setShowConfirmRoute(true);
    setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return;
      try {
        const start = pickupCoords || geocodeAddress(pickup, false);
        const dest = destCoords || geocodeAddress(destination, true);
        const startLat = start.lat;
        const startLng = start.lng;
        const destLat = dest.lat;
        const destLng = dest.lng;

        mapRef.current = new maptilersdk.Map({
          container: mapContainerRef.current,
          style: maptilersdk.MapStyle.STREETS,
          center: [startLng, startLat],
          zoom: 11,
        });

        // Add Start marker (Green)
        new maptilersdk.Marker({ color: "#22c55e" })
          .setLngLat([startLng, startLat])
          .addTo(mapRef.current);

        // Add Destination marker (Coral Red)
        new maptilersdk.Marker({ color: "#e85d4a" })
          .setLngLat([destLng, destLat])
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
          mapRef.current.fitBounds(bounds, { padding: 40 });
        });
      } catch (err) {
        console.error('Dashboard Map initialization error:', err);
      }
    }, 200);
  };

  const handleConfirmPublish = async () => {
    setLoading(true);
    try {
      const start = pickupCoords || geocodeAddress(pickup, false);
      const dest = destCoords || geocodeAddress(destination, true);
      const dateTime = new Date(`${date}T08:00:00Z`).toISOString();
      await api.post('/rides', {
        vehicleId: selectedVehicle,
        startLocation: { address: pickup, lat: start.lat, lng: start.lng },
        destination: { address: destination, lat: dest.lat, lng: dest.lng },
        dateTime,
        totalSeats: Number(seats),
        farePerSeat: Number(fareOffer),
      });
      toast.success('Ride published successfully!');
      handleCloseConfirmRoute();
      setPickup('');
      setDestination('');
      setPickupCoords(null);
      setDestCoords(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error publishing ride');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (rideId) => {
    try {
      await api.post('/trips/book', { rideId, seatsBooked: 1 });
      toast.success('Ride booked! Check "My Trips" to manage it.');
      setRides(rides.filter(r => r._id !== rideId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Tab toggle */}
      <div className="flex border-b border-slate-200"
      >
        <button
          onClick={() => { setActiveTab('find'); handleCloseConfirmRoute(); }}
          className={`pb-4 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer ${activeTab === 'find' ? 'border-[#e85d4a] text-[#e85d4a]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Find Ride
        </button>
        <button
          onClick={() => { setActiveTab('offer'); handleCloseConfirmRoute(); }}
          className={`pb-4 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer ${activeTab === 'offer' ? 'border-[#e85d4a] text-[#e85d4a]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Offer Ride
        </button>
      </div>

      {showConfirmRoute ? (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-800">Confirm Route</h2>
            <button onClick={handleCloseConfirmRoute} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
          </div>

          <div ref={mapContainerRef} className="w-full h-80 bg-slate-100 rounded border border-slate-200 relative overflow-hidden"></div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="text-slate-400">Total Route Cost</p>
              <p className="font-bold text-slate-800 text-lg">₹{fareOffer} / Seat</p>
            </div>
            <button
              onClick={handleConfirmPublish}
              disabled={loading}
              className="bg-[#e85d4a] hover:bg-[#d94d3a] text-white text-sm font-semibold px-6 py-2.5 rounded shadow-sm transition-all cursor-pointer"
            >
              {loading ? 'Publishing...' : 'Publish Ride'}
            </button>
          </div>
        </div>
      ) : activeTab === 'find' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit space-y-6">
            <h3 className="font-bold text-slate-800 text-sm">Where are you going?</h3>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-2 font-medium">Start Location</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Pickup point (optional)"
                    value={pickup}
                    onChange={(e) => handlePickupChange(e.target.value)}
                    onFocus={handlePickupFocus}
                    onBlur={() => setShowPickupSuggestions(false)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#e85d4a]"
                  />
                  {showPickupSuggestions && pickupSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto divide-y divide-slate-100">
                      {pickupSuggestions.map((c) => (
                        <div
                          key={`find-pickup-${c.name}`}
                          onMouseDown={() => {
                            setPickup(c.label);
                            setPickupCoords({ lat: c.lat, lng: c.lng });
                            setShowPickupSuggestions(false);
                          }}
                          className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#e85d4a] cursor-pointer transition-colors"
                        >
                          {c.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2 font-medium">Drop/Destination Location</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Drop point (optional)"
                    value={destination}
                    onChange={(e) => handleDestChange(e.target.value)}
                    onFocus={handleDestFocus}
                    onBlur={() => setShowDestSuggestions(false)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#e85d4a]"
                  />
                  {showDestSuggestions && destSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto divide-y divide-slate-100">
                      {destSuggestions.map((c) => (
                        <div
                          key={`find-dest-${c.name}`}
                          onMouseDown={() => {
                            setDestination(c.label);
                            setDestCoords({ lat: c.lat, lng: c.lng });
                            setShowDestSuggestions(false);
                          }}
                          className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#e85d4a] cursor-pointer transition-colors"
                        >
                          {c.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-medium">Date</label>
                  <input
                    type="date"
                    // required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 text-xs focus:outline-none focus:border-[#e85d4a]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-medium">Seats</label>
                   <input
                    type="number"
                    min="1"
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 text-xs focus:outline-none focus:border-[#e85d4a]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="w-full bg-[#e85d4a] hover:bg-[#d94d3a] text-white py-3 rounded text-sm font-semibold transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Searching...
                    </>
                  ) : 'Find Ride'}
                </button>
                <button
                  type="button"
                  onClick={handleViewAllRides}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 py-2.5 rounded text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                >
                  View All Available Rides
                </button>
              </div>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Popular Routes</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { fromLabel: 'AHM (AHMEDABAD)', toLabel: 'GND (GANDHINAGAR)', fromCoords: { lat: 23.0689, lng: 72.6531 }, toCoords: { lat: 23.2156, lng: 72.6369 }, label: 'Ahmedabad ➔ Gandhinagar' },
                  { fromLabel: 'SUR (SURAT)', toLabel: 'BRD (VADODARA)', fromCoords: { lat: 21.1939, lng: 72.8319 }, toCoords: { lat: 22.3178, lng: 73.1780 }, label: 'Surat ➔ Vadodara' },
                  { fromLabel: 'RAJ (RAJKOT)', toLabel: 'AHM (AHMEDABAD)', fromCoords: { lat: 22.3070, lng: 70.7769 }, toCoords: { lat: 23.0060, lng: 72.5100 }, label: 'Rajkot ➔ Ahmedabad' },
                  { fromLabel: 'BHN (BHAVNAGAR)', toLabel: 'AHM (AHMEDABAD)', fromCoords: { lat: 21.7671, lng: 72.1516 }, toCoords: { lat: 23.0156, lng: 72.5698 }, label: 'Bhavnagar ➔ Ahmedabad' },
                  { fromLabel: 'ANND (ANAND)', toLabel: 'AHM (AHMEDABAD)', fromCoords: { lat: 22.5409, lng: 72.9222 }, toCoords: { lat: 23.0341, lng: 72.5630 }, label: 'Anand ➔ Ahmedabad' },
                  { fromLabel: 'MSN (MEHSANA)', toLabel: 'GND (GANDHINAGAR)', fromCoords: { lat: 23.5880, lng: 72.3693 }, toCoords: { lat: 23.2156, lng: 72.6369 }, label: 'Mehsana ➔ Gandhinagar' },
                ].map((route, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPickup(route.fromLabel);
                      setDestination(route.toLabel);
                      setPickupCoords(route.fromCoords);
                      setDestCoords(route.toCoords);
                    }}
                    className="text-[10px] bg-slate-100 hover:bg-[#e85d4a]/10 hover:text-[#e85d4a] text-slate-600 font-bold px-2 py-1.5 rounded transition-all cursor-pointer font-sans"
                  >
                    {route.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Available Pools</h3>
            {rides.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-400 shadow-sm">
                <Search className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">{msg || 'Submit search filters or click a popular route commute to view employee pools.'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rides.map(r => (
                  <div key={r._id} className="bg-white border border-slate-200 p-5 rounded-lg flex items-center justify-between shadow-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold uppercase text-slate-600">
                          {r.driverId?.name?.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{r.driverId?.name}</p>
                          <p className="text-[10px] text-slate-400">{r.dateTime ? new Date(r.dateTime).toLocaleString() : ''}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">Route: {r.startLocation?.address} to {r.destination?.address}</p>
                    </div>

                    <div className="text-right space-y-2">
                      <p className="text-base font-bold text-[#e85d4a]">₹{r.farePerSeat} / Seat</p>
                      <button onClick={() => handleBook(r._id)} className="bg-[#e85d4a] hover:bg-[#d94d3a] text-white text-xs font-bold px-4 py-2 rounded transition-colors shadow-sm cursor-pointer">
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Offer Ride: Check for Driving License first (One-Time Verification) */
        user?.drivingLicenseStatus !== 'approved' ? (
          <div className="bg-white border border-slate-200 p-8 rounded-lg max-w-md mx-auto shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <Shield className="w-10 h-10 text-[#e85d4a] mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">Driving License Verification</h3>
              <p className="text-xs text-slate-400 font-medium">
                {user?.drivingLicenseStatus === 'pending'
                  ? 'Your driving license is awaiting verification by the administrator. We will notify you once approved.'
                  : 'To offer and publish ride pools, register your driving license details for enterprise security.'}
              </p>
            </div>

            {user?.drivingLicenseStatus !== 'pending' && (
              <form onSubmit={handleDlSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2">Driving License Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL-IND-9992388"
                    value={dlNumber}
                    onChange={(e) => setDlNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={dlSubmitting}
                  className="w-full bg-[#e85d4a] hover:bg-[#d94d3a] text-white py-3 rounded text-sm font-semibold transition-colors shadow-sm cursor-pointer"
                >
                  {dlSubmitting ? 'Registering...' : 'Register Driving License'}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 p-8 rounded-lg max-w-xl mx-auto shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Offer Ride Details</h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase bg-slate-50 px-2 py-1 rounded">Verified Driver: {user.drivingLicense}</span>
            </div>

            <form onSubmit={handlePublishClick} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-2 font-medium">Select Vehicle</label>
                {vehicles.length === 0 ? (
                  <div className="w-full bg-amber-50 border border-amber-200 rounded px-4 py-3 text-sm text-amber-700 font-medium">
                    ⚠️ No registered vehicles found.{' '}
                    <a href="/vehicles" className="underline text-[#e85d4a]">Register a vehicle</a> first to offer rides.
                  </div>
                ) : (
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
                  >
                    <option value="" disabled>-- Select a vehicle --</option>
                    {vehicles.map(v => (
                      <option key={v._id} value={v._id}>{v.model} — {v.registrationNumber}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2 font-medium">Pickup Point</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Start Location"
                    value={pickup}
                    onChange={(e) => handlePickupChange(e.target.value)}
                    onFocus={handlePickupFocus}
                    onBlur={() => setShowPickupSuggestions(false)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
                  />
                  {showPickupSuggestions && pickupSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto divide-y divide-slate-100">
                      {pickupSuggestions.map((c) => (
                        <div
                          key={`pub-pickup-${c.name}`}
                          onMouseDown={() => {
                            setPickup(c.label);
                            setPickupCoords({ lat: c.lat, lng: c.lng });
                            setShowPickupSuggestions(false);
                          }}
                          className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#e85d4a] cursor-pointer transition-colors"
                        >
                          {c.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2 font-medium">Destination Point</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Drop point"
                    value={destination}
                    onChange={(e) => handleDestChange(e.target.value)}
                    onFocus={handleDestFocus}
                    onBlur={() => setShowDestSuggestions(false)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
                  />
                  {showDestSuggestions && destSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto divide-y divide-slate-100">
                      {destSuggestions.map((c) => (
                        <div
                          key={`pub-dest-${c.name}`}
                          onMouseDown={() => {
                            setDestination(c.label);
                            setDestCoords({ lat: c.lat, lng: c.lng });
                            setShowDestSuggestions(false);
                          }}
                          className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#e85d4a] cursor-pointer transition-colors"
                        >
                          {c.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-medium">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-medium">Seats</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2 font-medium">Price / Seat (₹)</label>
                <input
                  type="number"
                  min="10"
                  required
                  value={fareOffer}
                  onChange={(e) => setFareOffer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#e85d4a]"
                />
              </div>

              <button type="submit" className="w-full bg-[#e85d4a] hover:bg-[#d94d3a] text-white py-3 rounded text-sm font-semibold transition-colors shadow-sm cursor-pointer">
                Confirm Route & Price
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Recommended Commutes</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { from: 'Ahmedabad (ISKCON Circle)', to: 'Gandhinagar (Infocity)', label: 'Ahmedabad ➔ Gandhinagar' },
                  { from: 'Ahmedabad (C G Road)', to: 'Gandhinagar (Sector 21)', label: 'CG Road ➔ Sector 21' },
                  { from: 'GIFT City, Gandhinagar', to: 'Sargasan, Gandhinagar', label: 'GIFT City ➔ Sargasan' }
                ].map((route, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPickup(route.from);
                      setDestination(route.to);
                      setDate('2026-07-31');
                      toast.success('Commute endpoints pre-filled! 🚗');
                    }}
                    className="text-[10px] bg-slate-100 hover:bg-[#e85d4a]/10 hover:text-[#e85d4a] text-slate-600 font-bold px-2 py-1.5 rounded transition-all cursor-pointer"
                  >
                    {route.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
