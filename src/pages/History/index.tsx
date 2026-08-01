import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar as CalendarIcon, Filter, X, ChevronDown, Check } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ExpensePostCard } from '../../components/ui/ExpensePostCard';
import { getCategoryFromMap } from '../../utils/uuid';
import { ICON_MAP } from '../../utils/icons';
import { Tag } from 'lucide-react';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/style.css';
import { vi } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../utils/api';

interface Expense {
  expense_id: string;
  amount: number;
  note: string;
  image_url: string;
  expense_date: string;
  category_id: string;
}

interface Category {
  category_id: string;
  name: string;
  icon: string;
  color: string;
}

export const History: React.FC = () => {
  const { token } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filterCategoryId, setFilterCategoryId] = useState<string>('');
  const [filterMinAmount, setFilterMinAmount] = useState<string>('');
  const [filterMaxAmount, setFilterMaxAmount] = useState<string>('');
  const [filterDateRange, setFilterDateRange] = useState<DateRange | undefined>(undefined);

  const MINIO_URL = import.meta.env.VITE_MINIO_URL || 'http://100.109.65.2:9000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await apiFetch(`/categories/`);
        const catData = await catRes.json();
        const catMap: Record<string, Category> = {};
        if (catData.data) {
          catData.data.forEach((c: Category) => {
            catMap[c.category_id] = c;
          });
        }
        setCategories(catMap);

        const expRes = await apiFetch(`/expenses/`);
        const expData = await expRes.json();
        if (expData.data) {
          setExpenses(expData.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Filter logic
  const filteredExpenses = expenses.filter(expense => {
    if (filterCategoryId && getCategoryFromMap(expense.category_id, categories)?.category_id !== filterCategoryId) {
      return false;
    }
    
    if (filterMinAmount) {
      const min = Number(filterMinAmount.replace(/\D/g, ''));
      if (expense.amount < min) return false;
    }
    if (filterMaxAmount) {
      const max = Number(filterMaxAmount.replace(/\D/g, ''));
      if (expense.amount > max) return false;
    }
    
    if (filterDateRange?.from) {
      const expDate = new Date(expense.expense_date);
      // set to start of day for accurate comparison
      const expTime = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate()).getTime();
      const fromTime = new Date(filterDateRange.from.getFullYear(), filterDateRange.from.getMonth(), filterDateRange.from.getDate()).getTime();
      
      if (expTime < fromTime) return false;
      
      if (filterDateRange.to) {
        const toTime = new Date(filterDateRange.to.getFullYear(), filterDateRange.to.getMonth(), filterDateRange.to.getDate()).getTime();
        if (expTime > toTime) return false;
      }
    }
    
    return true;
  });

  return (
    <div className="pt-8 px-4 pb-24 bg-transparent min-h-screen">
      <PageHeader 
        title="Lịch sử giao dịch" 
        subtitle="Xem lại các khoản chi tiêu gần đây của bạn" 
        rightContent={
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-full transition-colors ${showFilters ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border border-slate-200 shadow-sm'}`}
          >
            {showFilters ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
          </button>
        }
      />

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-6 mb-6">
              
              {/* Category Filter */}
              <div className="relative">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Danh mục</h3>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                    isDropdownOpen ? 'bg-white border-slate-900 ring-4 ring-slate-100 shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {filterCategoryId === '' ? (
                      <span className="font-bold text-slate-900">Tất cả danh mục</span>
                    ) : (
                      (() => {
                        const cat = Object.values(categories).find(c => c.category_id === filterCategoryId);
                        if (!cat) return null;
                        const Icon = ICON_MAP[cat.icon] || Tag;
                        return (
                          <>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                              <Icon size={18} strokeWidth={2.5} />
                            </div>
                            <span className="font-bold text-slate-900">{cat.name}</span>
                          </>
                        );
                      })()
                    )}
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-900 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-900 rounded-xl shadow-xl overflow-hidden z-20"
                    >
                      <div className="max-h-60 overflow-y-auto overscroll-contain">
                        <button
                          onClick={() => { setFilterCategoryId(''); setIsDropdownOpen(false); }}
                          className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors border-b border-slate-100 ${filterCategoryId === '' ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                        >
                          <span className={`font-bold ${filterCategoryId === '' ? 'text-slate-900' : 'text-slate-700'}`}>Tất cả danh mục</span>
                          {filterCategoryId === '' && <Check className="w-5 h-5 text-slate-900" />}
                        </button>
                        {Object.values(categories).map(cat => {
                          const Icon = ICON_MAP[cat.icon] || Tag;
                          return (
                            <button
                              key={cat.category_id}
                              onClick={() => { setFilterCategoryId(cat.category_id); setIsDropdownOpen(false); }}
                              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors border-b border-slate-100 last:border-0 ${filterCategoryId === cat.category_id ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                                  <Icon size={18} strokeWidth={2.5} />
                                </div>
                                <span className={`font-bold ${filterCategoryId === cat.category_id ? 'text-slate-900' : 'text-slate-700'}`}>{cat.name}</span>
                              </div>
                              {filterCategoryId === cat.category_id && <Check className="w-5 h-5 text-slate-900" />}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Backdrop to close dropdown */}
                {isDropdownOpen && (
                  <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                )}
              </div>
              
              {/* Amount Filter */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Số tiền</h3>
                <div className="flex items-center gap-3">
                  <input 
                    type="text" 
                    placeholder="Từ..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-900 transition-colors"
                    value={filterMinAmount} 
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFilterMinAmount(val ? Number(val).toLocaleString('vi-VN') : '');
                    }} 
                  />
                  <span className="text-slate-400 font-bold">-</span>
                  <input 
                    type="text" 
                    placeholder="Đến..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-900 transition-colors"
                    value={filterMaxAmount} 
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFilterMaxAmount(val ? Number(val).toLocaleString('vi-VN') : '');
                    }} 
                  />
                </div>
              </div>

              {/* Date Filter */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-slate-900">Ngày giao dịch</h3>
                  {filterDateRange && (
                    <button onClick={() => setFilterDateRange(undefined)} className="text-xs text-rose-500 font-medium px-2 py-1 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors">
                      Xóa ngày
                    </button>
                  )}
                </div>
                <div className="flex justify-center bg-slate-50 p-4 rounded-2xl border border-slate-200 overflow-hidden">
                  <DayPicker 
                    mode="range" 
                    selected={filterDateRange} 
                    onSelect={setFilterDateRange} 
                    locale={vi}
                    className="custom-calendar scale-90 sm:scale-100 origin-top"
                  />
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <Spinner />
      ) : filteredExpenses.length === 0 ? (
        <EmptyState 
          icon={CalendarIcon} 
          message={showFilters ? "Không tìm thấy giao dịch nào phù hợp với bộ lọc!" : "Chưa có giao dịch nào. Hãy tạo giao dịch đầu tiên của bạn!"} 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExpenses.map((expense) => (
            <ExpensePostCard 
              key={expense.expense_id}
              expense={expense}
              category={getCategoryFromMap(expense.category_id, categories)}
              minioUrl={MINIO_URL}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
};
