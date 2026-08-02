import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Tag, X, type LucideIcon } from 'lucide-react';
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
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    if (onClick) onClick();
    setIsModalOpen(true);
  };

  return (
    <>
      <div 
        onClick={handleClick}
        className={`group bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex gap-4 transition-all hover:shadow-md cursor-pointer active:scale-[0.98]`}
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

      {/* Modal Chi tiết */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            
            {/* Nút đóng */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-20 p-2.5 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Phần Hình ảnh */}
            <div className="relative w-full bg-slate-100 flex items-center justify-center" style={{ height: expense.image_url ? '400px' : '120px' }}>
              {expense.image_url ? (
                <>
                  {/* Ảnh nền mờ */}
                  <img 
                    src={`${minioUrl}${expense.image_url}`} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover opacity-30 blur-xl scale-110" 
                  />
                  {/* Ảnh hiển thị đầy đủ */}
                  <img 
                    src={`${minioUrl}${expense.image_url}`} 
                    alt="Receipt Full" 
                    className="relative z-10 w-full h-full object-contain p-4 rounded-3xl"
                  />
                </>
              ) : (
                <div 
                  className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner"
                  style={{ backgroundColor: `${color}15`, color: color }}
                >
                  <IconComponent size={40} strokeWidth={2} />
                </div>
              )}
            </div>

            {/* Thông tin Chi tiết */}
            <div className="p-6 bg-white space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15`, color: color }}>
                  <IconComponent size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{category ? category.name : 'Chưa phân loại'}</h3>
                  <p className="text-sm font-medium text-slate-400">{formatDate(expense.expense_date)}</p>
                </div>
              </div>

              <div className="py-4 border-y border-slate-100 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Số tiền</span>
                <span className="text-2xl font-bold text-rose-600">-{formatCurrency(expense.amount)}</span>
              </div>

              {expense.note && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">Ghi chú</h4>
                  <p className="text-slate-600 bg-slate-50 p-4 rounded-xl whitespace-pre-wrap">{expense.note}</p>
                </div>
              )}
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
};
