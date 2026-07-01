import { useState } from 'react';
import { FileText, MoreVertical, Play, ThumbsDown, ThumbsUp } from 'lucide-react';
import { format } from 'date-fns';
import { CallLog } from '../types';
import { cn } from '../lib/utils';

interface CallsTableProps {
  calls: CallLog[];
  onOpenSummary: (call: CallLog) => void;
}

const statusColors: Record<string, string> = {
  'Human Answered': 'bg-emerald-100 text-emerald-700',
  'Voicemail': 'bg-amber-100 text-amber-700',
  'Failed': 'bg-rose-100 text-rose-700',
  'No Answer': 'bg-slate-100 text-slate-600',
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function CallsTable({ calls, onOpenSummary }: CallsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredCalls = calls.filter(call => 
    call.contactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1 min-h-[300px]">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-4 shrink-0">
        <div className="flex">
          <button className="px-4 py-3 text-sm font-bold border-b-2 border-blue-600 text-blue-600">Attempted</button>
          <button className="px-4 py-3 text-sm font-medium text-slate-400">Unattempted</button>
          <button className="px-4 py-3 text-sm font-medium text-slate-400">Scheduled</button>
        </div>
        <div className="flex items-center space-x-2 py-2">
          <select className="text-xs border border-slate-300 rounded px-2 py-1.5 bg-white outline-none">
            <option>Live & Historical</option>
            <option>Live Only</option>
            <option>Historical Only</option>
          </select>
          <select className="text-xs border border-slate-300 rounded px-2 py-1.5 bg-white outline-none">
            <option>All Actions</option>
            <option>With Actions</option>
          </select>
          <input 
            type="text" 
            placeholder="Search contact..." 
            className="text-xs border border-slate-300 rounded px-3 py-1.5 w-48 outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="px-3 py-1.5 border border-slate-300 rounded text-xs font-medium bg-white">
            Export All
          </button>
        </div>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-left border-collapse table-fixed min-w-[900px]">
          <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase sticky top-0">
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 w-10"><input type="checkbox" /></th>
              <th className="px-4 py-3 w-28">Agent</th>
              <th className="px-4 py-3">Contact Name</th>
              <th className="px-4 py-3 w-32">Status</th>
              <th className="px-4 py-3">Date & Time</th>
              <th className="px-4 py-3 w-20">Duration</th>
              <th className="px-4 py-3">Workflow</th>
              <th className="px-4 py-3 w-24">Actions</th>
              <th className="px-4 py-3 w-32 text-right"></th>
            </tr>
          </thead>
          <tbody className="text-xs text-slate-600 font-medium">
            {filteredCalls.map(call => (
              <tr key={call.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-4 py-2.5"><input type="checkbox" /></td>
                <td className="px-4 py-2.5 flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[10px]">
                    {call.agentName[0]}
                  </div>
                  <span>{call.agentName}</span>
                </td>
                <td className="px-4 py-2.5 font-bold text-slate-900">{call.contactName}</td>
                <td className="px-4 py-2.5">
                  <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold", statusColors[call.status])}>
                    {call.status}
                  </span>
                </td>
                <td className="px-4 py-2.5">{format(new Date(call.createdAt), 'MMM dd, hh:mm a')}</td>
                <td className="px-4 py-2.5 font-mono">{formatDuration(call.duration)}</td>
                <td className="px-4 py-2.5 truncate">{call.workflowName}</td>
                <td className="px-4 py-2.5 font-bold">{call.actionsTriggered}</td>
                <td className="px-4 py-2.5 text-right space-x-1.5 flex items-center justify-end">
                  <button 
                    onClick={() => onOpenSummary(call)}
                    className="px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100 hover:bg-blue-100 transition-colors"
                  >
                    Summary
                  </button>
                  <button className="text-slate-400 hover:text-blue-500"><FileText className="w-3.5 h-3.5" /></button>
                  <button className="text-slate-400 hover:text-blue-500"><Play className="w-3.5 h-3.5" /></button>
                  <button className="text-slate-400 hover:text-emerald-500"><ThumbsUp className="w-3.5 h-3.5" /></button>
                  <button className="text-slate-400 hover:text-rose-500"><ThumbsDown className="w-3.5 h-3.5" /></button>
                  <button className="text-slate-400 hover:text-slate-700"><MoreVertical className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
            {filteredCalls.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-500">No calls found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="h-12 border-t border-slate-200 flex items-center justify-between px-4 shrink-0 bg-slate-50/50">
        <span className="text-xs text-slate-500 font-medium">Showing 1 to {filteredCalls.length} of {filteredCalls.length} results</span>
        <div className="flex space-x-1">
          <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded text-slate-400">&laquo;</button>
          <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded font-bold">1</button>
          <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded text-slate-400">&raquo;</button>
        </div>
      </div>
    </div>
  );
}
