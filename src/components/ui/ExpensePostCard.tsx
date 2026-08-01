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

interface ExpensePostCardProps {
  expense: Expense;
  category?: Category;
  minioUrl?: string;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  onClick?: () => void;
}

export const ExpensePostCard: React.FC<ExpensePostCardProps> = ({ 
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
      className={`group bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md flex flex-col ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}`}
    >
      {/* Header */}
      <div className="p-4 pb-3 flex justify-between items-center bg-white">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}15`, color: color }}
          >
            <IconComponent size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-base line-clamp-1 leading-tight">
              {category ? category.name : 'Chưa phân loại'}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {formatDate(expense.expense_date)}
            </p>
          </div>
        </div>
        <span className="font-bold text-rose-600 text-lg whitespace-nowrap">
          -{formatCurrency(expense.amount)}
        </span>
      </div>

      {/* Image (Big Post Style) */}
      {expense.image_url && (
        <div className="w-full aspect-square bg-slate-100 border-y border-slate-100 relative overflow-hidden">
          <img 
            src={`${minioUrl}${expense.image_url}`} 
            alt="Receipt" 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="%23cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
            }}
          />
        </div>
      )}
      
      {/* Footer / Note */}
      {expense.note && (
        <div className="p-4 pt-3 bg-white">
          <p className="text-sm text-slate-700 leading-relaxed">
            <span className="font-semibold text-slate-900 mr-2">{category ? category.name : 'Chi tiêu'}</span>
            {expense.note}
          </p>
        </div>
      )}
    </div>
  );
};
