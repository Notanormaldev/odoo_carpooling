import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, ChevronLeft, Download } from 'lucide-react';
import api from '../api/axios';

export default function RideHistoryView() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/trips/my-trips');
      setHistory(res.data.data.filter(t => t.status === 'completed_paid'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = (trip) => {
    const content = `===========================================
          COMMUTE RIDE INVOICE          
===========================================
Trip ID: ${trip._id}
Date: ${new Date(trip.completedAt || trip.createdAt).toLocaleString()}
Driver: ${trip.driverId?.name}
Vehicle: Swift Dzire (GJ01AB1234)
Route: ${trip.rideId?.startLocation?.address} to ${trip.rideId?.destination?.address}
Seats: ${trip.seatsBooked}
Fare Charged: ₹${trip.fare}
CO2 Savings: 3.0 kg
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
      {/* Left side title pane */}
      <div className="md:col-span-1 bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit">
        <h2 className="font-bold text-lg text-slate-800">Ride History</h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">History Logs</p>
      </div>

      {/* Main content pane */}
      <div className="md:col-span-3 bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
          <ChevronLeft className="w-5 h-5 text-[#e85d4a] cursor-pointer" onClick={() => navigate(-1)} />
          <h3 className="font-bold text-slate-800 text-sm">Rides History</h3>
        </div>

        {loading ? (
          <Loader className="w-6 h-6 animate-spin text-[#e85d4a] mx-auto" />
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No historical rides found.</div>
        ) : (
          <div className="space-y-3">
            {history.map((tx) => (
              <div key={tx._id} className="border border-slate-100 rounded p-4 flex items-center justify-between hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                    {tx.driverId?.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">{tx.driverId?.name}</h4>
                    <p className="text-xs text-slate-400">Route: {tx.rideId?.startLocation?.address} to {tx.rideId?.destination?.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right text-xs text-slate-500">
                  <div>
                    <p className="font-semibold text-slate-800">GJ01AB1234</p>
                    <p>{tx.completedAt ? new Date(tx.completedAt).toLocaleString() : ''}</p>
                  </div>
                  <button 
                    onClick={() => handleDownloadInvoice(tx)}
                    className="p-2 text-slate-400 hover:text-[#e85d4a] rounded cursor-pointer"
                    title="Download Receipt"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
