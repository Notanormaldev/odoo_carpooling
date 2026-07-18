import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, ChevronLeft, Download } from 'lucide-react';
import api from '../api/axios';
import { jsPDF } from 'jspdf';

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
    doc.text(new Date(trip.completedAt || trip.createdAt).toLocaleString(), 50, 60);

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
