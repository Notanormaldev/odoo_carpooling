import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Loader } from 'lucide-react';
import api from '../api/axios';
import { jsPDF } from 'jspdf';

export default function ReportsView() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await api.get('/reports');
      setReport(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReportPDF = () => {
    if (!report) return;
    const doc = new jsPDF();

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
    doc.setFontSize(18);
    doc.text('FINANCIAL & FLEET REPORT', 20, 26);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Enterprise Carpooling Platform', 145, 26);

    // Reset Text Color
    doc.setTextColor(...darkGray);

    // Metadata
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Report Generated:', 20, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleString(), 55, 55);

    doc.setFont('helvetica', 'bold');
    doc.text('Scope:', 20, 62);
    doc.setFont('helvetica', 'normal');
    doc.text('All Active Organization Vehicles & Trips', 55, 62);

    // Section 1: Executive Summary
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Executive Summary', 20, 78);

    // Draw three metrics boxes
    doc.setFillColor(...lightGray);
    doc.rect(20, 84, 52, 20, 'F');
    doc.rect(79, 84, 52, 20, 'F');
    doc.rect(138, 84, 52, 20, 'F');

    // Box 1
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text('TOTAL REVENUE', 24, 91);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text(`Rs. ${report.metrics?.totalRevenue || 0}`, 24, 98);

    // Box 2
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('FUEL COST SAVED', 83, 91);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(34, 197, 94); // Green
    doc.text(`Rs. ${report.metrics?.totalFuelCostSavedAmount || 0}`, 83, 98);

    // Box 3
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL DISTANCE', 142, 91);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...darkGray);
    doc.text(`${report.metrics?.totalDistance || 0} km`, 142, 98);

    // Reset Text Color
    doc.setTextColor(...darkGray);

    // Section 2: Detailed Monthly Financial Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Detailed Monthly Financials', 20, 120);

    // Table Header
    doc.setFillColor(...lightGray);
    doc.rect(20, 126, 170, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Month', 24, 132);
    doc.text('Revenue', 60, 132);
    doc.text('Fuel Cost Saved', 95, 132);
    doc.text('Total Trips', 135, 132);
    doc.text('Net Profit', 165, 132);

    doc.setDrawColor(...borderGray);
    doc.line(20, 136, 190, 136);

    let y = 144;
    if (report.financialSummary && report.financialSummary.length > 0) {
      report.financialSummary.forEach((f) => {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...darkGray);
        doc.text(f.month, 24, y);
        doc.text(`Rs. ${f.revenue}`, 60, y);
        doc.text(`Rs. ${f.fuelCostSaved}`, 95, y);
        doc.text(`${report.metrics?.totalTrips || 0}`, 135, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(34, 197, 94);
        doc.text(`Rs. ${f.netProfit}`, 165, y);

        doc.line(20, y + 4, 190, y + 4);
        y += 12;
      });
    } else {
      doc.setFont('helvetica', 'normal');
      doc.text('No financial summary data available', 24, y);
      doc.line(20, y + 4, 190, y + 4);
    }

    // Footer
    doc.setDrawColor(...borderGray);
    doc.line(20, 260, 190, 260);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Confidential - Internal Corporate Commute Analytics Report', 105, 270, { align: 'center' });

    doc.save('carpooling_financial_report.pdf');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-6 h-6 animate-spin text-[#e85d4a]" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
      <div className="md:col-span-1 bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit">
        <h2 className="font-bold text-lg text-slate-800">Report</h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">Dashboard Analytics</p>
      </div>

      <div className="md:col-span-3 bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-5 h-5 text-[#e85d4a] cursor-pointer" onClick={() => navigate(-1)} />
            <h3 className="font-bold text-slate-800 text-sm">Report</h3>
          </div>
          <button 
            onClick={handleDownloadReportPDF}
            className="bg-[#e85d4a] hover:bg-[#d94d3a] text-white text-xs font-semibold px-4 py-2 rounded flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF Report
          </button>
        </div>

        {/* Analytics Pills with real live data */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="border border-emerald-500/30 bg-emerald-50/50 rounded-full px-4 py-2 text-xs font-semibold text-slate-700">
            Total Revenue: <span className="font-bold text-[#e85d4a]">Rs. {report?.metrics?.totalRevenue || 0}</span>
          </div>
          <div className="border border-emerald-500/30 bg-emerald-50/50 rounded-full px-4 py-2 text-xs font-semibold text-slate-700">
            Fuel Cost Saved: <span className="font-bold text-emerald-600">Rs. {report?.metrics?.totalFuelCostSavedAmount || 0}</span>
          </div>
          <div className="border border-emerald-500/30 bg-emerald-50/50 rounded-full px-4 py-2 text-xs font-semibold text-slate-700">
            Total Distance: <span className="font-bold text-slate-800">{report?.metrics?.totalDistance || 0} km</span>
          </div>
          <div className="border border-emerald-500/30 bg-emerald-50/50 rounded-full px-4 py-2 text-xs font-semibold text-slate-700">
            Total Trips: <span className="font-bold text-slate-800">{report?.metrics?.totalTrips || 0}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Dynamic charts using database values */}
          <div className="border border-slate-100 rounded-lg p-5 space-y-4 shadow-sm bg-slate-50">
            <h4 className="font-bold text-xs text-slate-700">Fuel Efficiency Trend (km/L)</h4>
            <div className="h-40 flex items-end justify-around px-4 pb-2 border-b border-slate-200">
              {report?.fuelTrend && report.fuelTrend.length > 0 ? (
                report.fuelTrend.map((t, idx) => {
                  const maxVal = Math.max(...report.fuelTrend.map(x => x.avgDistance), 10);
                  const pct = (t.avgDistance / maxVal) * 100;
                  return (
                    <div key={idx} className="flex flex-col items-center justify-end h-full">
                      <span className="text-[8px] text-slate-500 mb-1 font-bold">{t.avgDistance}</span>
                      <div className="bg-[#e85d4a] w-8 rounded-t transition-all duration-500" style={{ height: `${Math.max(pct, 15)}%` }}></div>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-400 text-xs py-10 w-full text-center">No trend data available</div>
              )}
            </div>
            <div className="flex justify-around text-[10px] text-slate-400 font-bold mt-1">
              {report?.fuelTrend?.map((t, idx) => <span key={idx}>{t.month}</span>)}
            </div>
          </div>

          <div className="border border-slate-100 rounded-lg p-5 space-y-4 shadow-sm bg-slate-50">
            <h4 className="font-bold text-xs text-slate-700">Top 5 Costliest Vehicles</h4>
            <div className="h-40 flex items-end justify-around px-4 pb-2 border-b border-slate-200">
              {report?.topCostlyVehicles && report.topCostlyVehicles.length > 0 ? (
                report.topCostlyVehicles.map((v, idx) => {
                  const maxCost = Math.max(...report.topCostlyVehicles.map(x => x.estimatedCost), 10);
                  const pct = (v.estimatedCost / maxCost) * 100;
                  return (
                    <div key={idx} className="flex flex-col items-center justify-end h-full">
                      <span className="text-[8px] text-slate-500 mb-1 font-mono">₹{v.estimatedCost}</span>
                      <div className="bg-slate-400 hover:bg-[#e85d4a] w-8 rounded-t transition-all duration-500" style={{ height: `${Math.max(pct, 15)}%` }}></div>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-400 text-xs py-10 w-full text-center">No vehicle data available</div>
              )}
            </div>
            <div className="flex justify-around text-[8px] text-slate-400 font-mono mt-1">
              {report?.topCostlyVehicles?.map((v, idx) => (
                <span key={idx} title={`${v.model} (${v.registrationNumber})`}>{v.registrationNumber.slice(-6)}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-xs text-slate-700">Financial Summary of Month</h4>
          <div className="border border-slate-100 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Revenue</th>
                  <th className="px-4 py-3">Fuel Cost Saved</th>
                  <th className="px-4 py-3">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {report?.financialSummary && report.financialSummary.length > 0 ? (
                  report.financialSummary.map((f, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 font-semibold text-slate-800">{f.month}</td>
                      <td className="px-4 py-3">Rs. {f.revenue}</td>
                      <td className="px-4 py-3 text-emerald-600">Rs. {f.fuelCostSaved}</td>
                      <td className="px-4 py-3 text-accent-emerald font-bold">Rs. {f.netProfit}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-3 text-center text-slate-400 py-6">No financial data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
