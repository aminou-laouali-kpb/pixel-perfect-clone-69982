import React from 'react';
import { User, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoundRobinIndicatorProps {
  commerciaux: string[];
  leadsCounts: Record<string, number>;
  nextCommercial: string;
}

export const RoundRobinIndicator: React.FC<RoundRobinIndicatorProps> = ({
  commerciaux,
  leadsCounts,
  nextCommercial,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          Attribution Tour par Tour (Round-Robin)
        </h3>
        <span className="text-xs font-semibold text-slate-400">
          Système Équitable Actif
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {commerciaux.map(comm => {
          const isNext = comm === nextCommercial;
          const count = leadsCounts[comm] || 0;

          return (
            <div
              key={comm}
              className={cn(
                "p-5 rounded-2xl border transition-all duration-300 relative flex items-center justify-between",
                isNext
                  ? "border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/10 shadow-sm"
                  : "border-slate-200 bg-white"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "rounded-xl p-2.5 shrink-0 flex items-center justify-center border",
                  isNext
                    ? "bg-blue-100 text-blue-600 border-blue-200"
                    : "bg-slate-50 text-slate-400 border-slate-100"
                )}>
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{comm}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Leads traités : <strong className="text-slate-700">{count}</strong></p>
                </div>
              </div>

              {isNext && (
                <span className="absolute top-2 right-2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                  Prochain
                  <ArrowUpRight className="h-2.5 w-2.5" />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoundRobinIndicator;
