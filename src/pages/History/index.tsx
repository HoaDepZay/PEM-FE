import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ExpensePostCard } from '../../components/ui/ExpensePostCard';
import { getCategoryFromMap } from '../../utils/uuid';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { vi } from 'date-fns/locale';

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
  const [filterCategoryId, setFilterCategoryId] = useState<string>('');
  const [filterMinAmount, setFilterMinAmount] = useState<string>('');
  const [filterMaxAmount, setFilterMaxAmount] = useState<string>('');
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);

  const MINIO_URL = import.meta.env.VITE_MINIO_URL || 'http://100.109.65.2:9000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        
        const catRes = await fetch(`${apiUrl}/categories/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const catData = await catRes.json();
        const catMap: Record<string, Category> = {};
        if (catData.data) {
          catData.data.forEach((c: Category) => {
            catMap[c.category_id] = c;
          });
        }
        setCategories(catMap);

        const expRes = await fetch(`${apiUrl}/expenses/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
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
    
    if (filterDate) {
      const expDate = new Date(expense.expense_date);
      if (expDate.toDateString() !== filterDate.toDateString()) return false;
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
      {showFilters && (
        <div className="mb-6 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-6 animate-in slide-in-from-top-4 fade-in">
          {/* Category Filter */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Danh mục</h3>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setFilterCategoryId('')} 
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${filterCategoryId === '' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                Tất cả
              </button>
              {Object.values(categories).map(cat => (
                <button 
                  key={cat.category_id} 
                  onClick={() => setFilterCategoryId(cat.category_id)} 
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border flex items-center gap-2 ${filterCategoryId === cat.category_id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  <span className="text-lg leading-none" dangerouslySetInnerHTML={{ __html: cat.icon }}></span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
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
              {filterDate && (
                <button onClick={() => setFilterDate(undefined)} className="text-xs text-rose-500 font-medium px-2 py-1 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors">
                  Xóa ngày
                </button>
              )}
            </div>
            <div className="flex justify-center bg-slate-50 p-4 rounded-2xl border border-slate-200 overflow-hidden">
              <DayPicker 
                mode="single" 
                selected={filterDate} 
                onSelect={setFilterDate} 
                locale={vi}
                className="custom-calendar scale-90 sm:scale-100 origin-top"
              />
            </div>
          </div>
        </div>
      )}

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
