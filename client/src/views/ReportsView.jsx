import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Loader } from 'lucide-react';
import api from '../api/axios';

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

  const handleDownloadReportCSV = () => {
    const csvContent = `Month,Revenue,Fuel Cost,Maintenance,Net Profit
July 2026,Rs. 1.2L,Rs. 6L,Rs. 2L,Rs. 4L
August 2026,Rs. 1.5L,Rs. 5.8L,Rs. 1.8L,Rs. 4.5L`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'carpooling_financial_report.csv';
    link.click();
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
            onClick={handleDownloadReportCSV}
            className="bg-[#e85d4a] hover:bg-[#d94d3a] text-white text-xs font-semibold px-4 py-2 rounded flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Download CSV Report
          </button>
        </div>

        {/* Analytics Pills exactly like wireframe drawing */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="border border-emerald-500/30 bg-emerald-50/50 rounded-full px-4 py-2 text-xs font-semibold text-accent-emerald">
            Total Fuel Cost: <span className="font-bold text-[#e85d4a]">Rs. 2.6 L</span>
          </div>
          <div className="border border-emerald-500/30 bg-emerald-50/50 rounded-full px-4 py-2 text-xs font-semibold text-accent-emerald">
            Fleet ROI: <span className="font-bold">+12.5%</span>
          </div>
          <div className="border border-emerald-500/30 bg-emerald-50/50 rounded-full px-4 py-2 text-xs font-semibold text-accent-emerald">
            Utilization Rate: <span className="font-bold">62%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mock charts showing layout structure */}
          <div className="border border-slate-100 rounded-lg p-5 space-y-4 shadow-sm bg-slate-50">
            <h4 className="font-bold text-xs text-slate-700">Fuel Efficiency Trend (km/L)</h4>
            <div className="h-40 flex items-end justify-between px-4 pb-2 border-b border-slate-200">
              <div className="bg-slate-300 w-8 h-10 rounded-t"></div>
              <div className="bg-[#e85d4a] w-8 h-28 rounded-t"></div>
              <div className="bg-slate-300 w-8 h-16 rounded-t"></div>
              <div className="bg-slate-300 w-8 h-24 rounded-t"></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>Jan</span>
              <span>Jun</span>
              <span>Sep</span>
              <span>Dec</span>
            </div>
          </div>

          <div className="border border-slate-100 rounded-lg p-5 space-y-4 shadow-sm bg-slate-50">
            <h4 className="font-bold text-xs text-slate-700">Top 5 Costliest Vehicles</h4>
            <div className="h-40 flex items-end justify-between px-4 pb-2 border-b border-slate-200">
              <div className="bg-slate-300 w-8 h-14 rounded-t"></div>
              <div className="bg-[#e85d4a] w-8 h-32 rounded-t"></div>
              <div className="bg-slate-300 w-8 h-20 rounded-t"></div>
              <div className="bg-slate-300 w-8 h-26 rounded-t"></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>VAN-01</span>
              <span>TRK-02</span>
              <span>TRK-01</span>
              <span>CAR-01</span>
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
                  <th className="px-4 py-3">Fuel Cost</th>
                  <th className="px-4 py-3">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-800">July 2026</td>
                  <td className="px-4 py-3">Rs. 1.2L</td>
                  <td className="px-4 py-3">Rs. 6L</td>
                  <td className="px-4 py-3 text-accent-emerald font-bold">Rs. 4L</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
