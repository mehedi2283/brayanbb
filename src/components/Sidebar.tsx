import { Phone, Settings, Building } from 'lucide-react';
import { Location } from '../types';

interface SidebarProps {
  currentView: 'call-logs' | 'sub-accounts' | 'settings';
  onViewChange: (view: 'call-logs' | 'sub-accounts' | 'settings') => void;
  locations: Location[];
  selectedLocationId: string;
  onLocationChange: (id: string) => void;
  isClientMode: boolean;
}

export function Sidebar({ currentView, onViewChange, locations, selectedLocationId, onLocationChange, isClientMode }: SidebarProps) {
  return (
    <aside className="w-[240px] bg-[#0F172A] flex flex-col h-full shrink-0">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
          V
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">Voice.AI</span>
      </div>
      
      <div className="px-6 mb-4">
        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
          Sub-Account
        </label>
        <select
          className="w-full bg-[#1E293B] border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          value={selectedLocationId}
          onChange={(e) => onLocationChange(e.target.value)}
          disabled={isClientMode}
        >
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
          {locations.length === 0 && selectedLocationId && (
            <option value={selectedLocationId}>Loading...</option>
          )}
        </select>
      </div>

      <nav className="mt-2 flex-1">
        <div className="px-6 mb-2 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
          Main Menu
        </div>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); onViewChange('call-logs'); }}
          className={`flex items-center px-6 py-3 group ${currentView === 'call-logs' ? 'bg-blue-600/10 border-r-4 border-blue-500 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
        >
          <Phone className="w-5 h-5 mr-3" />
          <span className="text-sm font-medium">Call Logs</span>
        </a>
        {!isClientMode && (
          <>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onViewChange('sub-accounts'); }}
              className={`flex items-center px-6 py-3 group ${currentView === 'sub-accounts' ? 'bg-blue-600/10 border-r-4 border-blue-500 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
            >
              <Building className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">Sub-Accounts</span>
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onViewChange('settings'); }}
              className={`flex items-center px-6 py-3 group ${currentView === 'settings' ? 'bg-blue-600/10 border-r-4 border-blue-500 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
            >
              <Settings className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">Settings</span>
            </a>
          </>
        )}
      </nav>
      <div className="p-6 border-t border-slate-800 flex items-center justify-between">
        <div className="text-slate-400 text-xs italic">
          GHL Admin v2.5
        </div>
      </div>
    </aside>
  );
}
