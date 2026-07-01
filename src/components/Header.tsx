import { Calendar } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 gap-4">
      <div className="flex-1"></div>
      <div className="flex items-center space-x-6">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 cursor-pointer">
          <Calendar className="w-4 h-4 text-slate-400 mr-2" />
          <span className="text-sm text-slate-600 font-medium">May 1, 2024 - May 31, 2024</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden ring-2 ring-blue-500 ring-offset-2 shrink-0">
          <img
            src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff"
            alt="Avatar"
          />
        </div>
      </div>
    </header>
  );
}
