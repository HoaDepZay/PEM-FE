import React from 'react';
import { Tag, type LucideIcon } from 'lucide-react';
import { ICON_MAP } from '../../utils/icons';

interface Category {
  category_id: string;
  name: string;
  icon: string;
  color: string;
}

interface Expense {
  expense_id: string;
  amount: number;
  note: string;
  expense_date: string;
  category_id: string;
  image_url?: string;
}

interface ExpenseCardProps {
  expense: Expense;
  category?: Category;
  minioUrl?: string;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  onClick?: () => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ 
  expense, 
  category, 
  minioUrl,
  formatCurrency, 
  formatDate,
  onClick 
}) => {
  const IconComponent: LucideIcon = category && category.icon ? ICON_MAP[category.icon] || Tag : Tag;
  const color = category?.color || '#5D7B6F';

  return (
    <div 
      onClick={onClick}
      className={`group bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex gap-4 transition-all hover:shadow-md ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}`}
    >
      {expense.image_url ? (
        <div className="w-20 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
          <img 
            src={`${minioUrl}${expense.image_url}`} 
            alt="Receipt" 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="%23cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
            }}
          />
        </div>
      ) : (
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm shrink-0 transition-transform group-hover:scale-105"
          style={{ backgroundColor: `${color}15`, color: color }}
        >
          <IconComponent size={24} strokeWidth={2.5} />
        </div>
      )}
      
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-2">
              {category && !expense.image_url && (
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: color }}
                />
              )}
              <h3 className="font-semibold text-slate-900 line-clamp-1">
                {category ? category.name : 'Chưa phân loại'}
              </h3>
            </div>
            <span className="font-bold text-rose-600 whitespace-nowrap ml-2">
              -{formatCurrency(expense.amount)}
            </span>
          </div>
          
          {expense.note && (
            <p className="text-sm text-slate-900/70 line-clamp-2 mt-1">
              {expense.note}
            </p>
          )}
        </div>
        
        <div className="flex items-center text-xs text-slate-900/50 mt-2 font-medium">
          <p>{formatDate(expense.expense_date)}</p>
        </div>
      </div>
    </div>
  );
};
