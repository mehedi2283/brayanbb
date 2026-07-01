import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '../lib/utils';

interface MetricCardProps {
  title: string;
  value: number;
  trend: number;
}

export function MetricCard({ title, value, trend }: MetricCardProps) {
  const isPositive = trend > 0;
  const isNegative = trend < 0;
  const isNeutral = trend === 0;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-24">
      <div className="text-xs font-semibold text-slate-500 uppercase">{title}</div>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold">{value}</div>
        <div
          className={cn(
            "text-xs font-bold flex items-center",
            isPositive && "text-emerald-600",
            isNegative && "text-rose-600",
            isNeutral && "text-slate-400"
          )}
        >
          {isPositive && <ArrowUp className="w-3 h-3 mr-0.5" />}
          {isNegative && <ArrowDown className="w-3 h-3 mr-0.5" />}
          {isNeutral && <Minus className="w-3 h-3 mr-0.5" />}
          {Math.abs(trend)}%
        </div>
      </div>
    </div>
  );
}
