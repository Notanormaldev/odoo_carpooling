import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader, Car } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function MyVehicleView() {
  const [vehicles, setVehicles] = useState([]);
  const [model, setModel] = useState('');
  const [regNum, setRegNum] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles/my-vehicles');
      setVehicles(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vehicles', {
        model,
        registrationNumber: regNum,
        seatingCapacity: Number(capacity),
      });
      toast.success('Vehicle submitted for Admin approval.');
      setModel('');
      setRegNum('');
      setShowAddForm(false);
      fetchVehicles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
      {/* Left Title side pane */}
      <div className="md:col-span-1 bg-white border border-slate-200 p-6 rounded-lg shadow-sm h-fit">
        <h2 className="font-bold text-lg text-slate-800">My Vehicle</h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">Vehicle info</p>
      </div>

      {/* Main content pane */}
      <div className="md:col-span-3 bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-5 h-5 text-[#e85d4a] cursor-pointer" onClick={() => navigate(-1)} />
            <h3 className="font-bold text-slate-800 text-sm">My Vehicle</h3>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="border border-[#e85d4a] text-[#e85d4a] hover:bg-[#e85d4a] hover:text-white transition-all text-xs font-semibold px-4 py-2 rounded cursor-pointer"
          >
            {showAddForm ? 'View Vehicles' : 'Add Vehicle'}
          </button>
        </div>

        {showAddForm ? (
          <form onSubmit={handleRegister} className="space-y-4 max-w-md mx-auto">
            <div>
              <label className="block text-xs text-slate-400 mb-2 font-medium">Model Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Swift Dzire"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#e85d4a]"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2 font-medium">Registration Number</label>
              <input
                type="text"
                required
                placeholder="e.g. GJ01AB1234"
                value={regNum}
                onChange={(e) => setRegNum(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#e85d4a]"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2 font-medium">Seating Capacity</label>
              <input
                type="number"
                min="2"
                max="8"
                required
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#e85d4a]"
              />
            </div>

            <button type="submit" className="w-full bg-[#e85d4a] hover:bg-[#d94d3a] text-white py-2.5 rounded text-sm font-semibold transition-colors shadow-sm cursor-pointer">
              Register Vehicle
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            {loading ? (
              <Loader className="w-6 h-6 animate-spin text-[#e85d4a] mx-auto" />
            ) : vehicles.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No registered vehicles found. Add one above!</div>
            ) : (
              vehicles.map(v => (
                <div key={v._id} className="border border-slate-100 rounded p-4 flex items-center justify-between hover:bg-slate-50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
                      <Car className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">{v.model}</h4>
                      <p className="text-xs text-slate-400">{v.registrationNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
                      v.status === 'active' ? 'bg-emerald-50 text-accent-emerald' : 'bg-amber-50 text-accent-amber'
                    }`}>{v.status}</span>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-800">Driver</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
