import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  color?: 'gold' | 'blue' | 'emerald' | 'rose' | 'navy';
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  icon,
  color = 'navy',
  description,
}) => {
  const getColorStyles = () => {
    switch (color) {
      case 'gold':
        return {
          border: 'border-gold-500/20 hover:border-gold-500/40',
          bg: 'bg-gold-500/5',
          iconBg: 'bg-gold-500/10 text-gold-400',
          value: 'text-gold-400',
        };
      case 'blue':
        return {
          border: 'border-blue-500/20 hover:border-blue-500/40',
          bg: 'bg-blue-500/5',
          iconBg: 'bg-blue-500/10 text-blue-400',
          value: 'text-blue-400',
        };
      case 'emerald':
        return {
          border: 'border-emerald-500/20 hover:border-emerald-500/40',
          bg: 'bg-emerald-500/5',
          iconBg: 'bg-emerald-500/10 text-emerald-400',
          value: 'text-emerald-400',
        };
      case 'rose':
        return {
          border: 'border-rose-500/20 hover:border-rose-500/40',
          bg: 'bg-rose-500/5',
          iconBg: 'bg-rose-500/10 text-rose-400',
          value: 'text-rose-400',
        };
      case 'navy':
      default:
        return {
          border: 'border-navy-800 hover:border-navy-700',
          bg: 'bg-navy-900/30',
          iconBg: 'bg-navy-950 text-navy-300 border border-navy-850',
          value: 'text-white',
        };
    }
  };

  const styles = getColorStyles();

  return (
    <div className={cn(
      "p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] flex items-center justify-between gap-4",
      styles.border,
      styles.bg
    )}>
      <div className="space-y-1">
        <span className="text-xs font-semibold text-navy-400 uppercase tracking-wider block">
          {label}
        </span>
        <div className={cn("text-2xl sm:text-3xl font-black tracking-tight", styles.value)}>
          {value}
        </div>
        {description && (
          <span className="text-[11px] text-navy-400 block mt-1">
            {description}
          </span>
        )}
      </div>

      <div className={cn("rounded-xl p-3 shrink-0 flex items-center justify-center", styles.iconBg)}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
