import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface OverviewCardProps {
  totalSpent: number;
  totalBudget: number;
  rangeLabel: string;
  formatCurrency: (val: number) => string;
}

export const OverviewCard: React.FC<OverviewCardProps> = ({ 
  totalSpent, 
  totalBudget, 
  rangeLabel, 
  formatCurrency 
}) => {
  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
      {/* Background blobs for premium feel */}
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-end mb-1">
          <p className="text-slate-400 font-medium text-sm">Đã chi tiêu ({rangeLabel})</p>
          {totalBudget > 0 && (
            <p className="text-xs font-semibold text-slate-500">
              Ngân sách: <span className="text-white">{formatCurrency(totalBudget)}</span>
            </p>
          )}
        </div>
        
        <h2 className="text-4xl font-bold mb-5 tracking-tight flex items-baseline gap-2">
          {formatCurrency(totalSpent)}
        </h2>
        
        {totalBudget > 0 && (
          <div className="space-y-2">
            <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ease-out ${totalSpent > totalBudget ? 'bg-rose-500' : 'bg-emerald-400'}`}
                style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs font-medium text-right">
              {totalSpent > totalBudget ? (
                <span className="text-rose-400 flex items-center justify-end gap-1">
                  <TrendingUp className="w-3 h-3" /> Vượt {formatCurrency(totalSpent - totalBudget)}
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center justify-end gap-1">
                  <TrendingDown className="w-3 h-3" /> Còn lại {formatCurrency(totalBudget - totalSpent)}
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
