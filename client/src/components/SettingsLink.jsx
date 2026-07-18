import React from 'react';
import { Clock } from 'lucide-react';

export default function SettingsLink({ label, onClick, icon: Icon, isDanger, isHighlight }) {
  return (
    <div 
      onClick={onClick}
      className={`p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all ${
        isHighlight ? 'bg-[#e85d4a]/5 border-l-4 border-[#e85d4a]' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 rounded flex items-center justify-center ${
          isDanger ? 'bg-rose-50 text-rose-500' : isHighlight ? 'bg-[#e85d4a]/10 text-[#e85d4a]' : 'bg-slate-100 text-slate-500'
        }`}>
          {Icon ? <Icon className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
        </div>
        <span className={`text-sm font-semibold ${
          isDanger ? 'text-rose-600' : isHighlight ? 'text-[#e85d4a]' : 'text-slate-700'
        }`}>{label}</span>
      </div>
    </div>
  );
}
