import React from 'react';
import { Tag, AlertTriangle } from 'lucide-react';

interface OverBudgetCategory {
  category_id: string;
  name: string;
  budget_amount: number;
  over_budget_amount: number;
  groupName: string;
  color: string;
}

interface BudgetAlertsProps {
  overBudgetCats: OverBudgetCategory[];
  formatCurrency: (val: number) => string;
}

export const BudgetAlerts: React.FC<BudgetAlertsProps> = ({ overBudgetCats, formatCurrency }) => {
  if (overBudgetCats.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-rose-500" />
        Cảnh báo ngân sách
      </h3>
      
      <div className="flex gap-3 overflow-x-auto pb-4 snap-x pr-5 -mr-5">
        {overBudgetCats.map((cat, idx) => {
          const spent = cat.budget_amount + cat.over_budget_amount;
          const percent = Math.min((spent / cat.budget_amount) * 100, 100);
          
          return (
            <div key={idx} className="bg-white border border-rose-200 rounded-2xl p-4 min-w-[260px] max-w-[280px] shrink-0 snap-start shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-rose-100">
                <div className="h-full bg-rose-500 rounded-r-full" style={{ width: `${percent}%` }}></div>
              </div>
              
              <div className="flex justify-between items-start mt-2">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{cat.groupName}</p>
                  <p className="font-bold text-slate-900 text-lg truncate pr-2">{cat.name}</p>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                  <Tag className="w-4 h-4" />
                </div>
              </div>
              
              <div className="mt-4 flex flex-col gap-1">
                <p className="text-xs font-semibold text-slate-500 flex justify-between">
                  <span>Ngân sách:</span>
                  <span className="text-slate-900">{formatCurrency(cat.budget_amount)}</span>
                </p>
                <p className="text-xs font-semibold text-rose-500 flex justify-between">
                  <span>Đã tiêu (vượt):</span>
                  <span>{formatCurrency(spent)}</span>
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};
