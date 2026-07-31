import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Calendar } from 'lucide-react';

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

  // MinIO host mapping (for local development)
  // Assuming frontend is running locally, we need to point to MinIO's IP
  const MINIO_URL = import.meta.env.VITE_MINIO_URL || 'http://100.109.65.2:9000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        
        // Fetch Categories
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

        // Fetch Expenses
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

  return (
    <div className="pt-8 px-4 pb-24 bg-transparent min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-700">Lịch sử giao dịch</h1>
        <p className="text-brand-700/70 text-sm mt-1">Xem lại các khoản chi tiêu gần đây của bạn</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div>
        </div>
      ) : expenses.length === 0 ? (
        <div className="bg-brand-50 rounded-2xl p-8 text-center border border-brand-400/30 shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-brand-100/50 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-brand-700/70 font-medium">Chưa có giao dịch nào.</p>
          <p className="text-brand-700/50 text-sm mt-1">Hãy tạo giao dịch đầu tiên của bạn!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => {
            const category = categories[expense.category_id];
            
            return (
              <div 
                key={expense.expense_id} 
                className="bg-brand-50 rounded-2xl p-4 shadow-sm border border-brand-400/30 flex gap-4 transition-all hover:shadow-md"
              >
                {/* Image Thumbnail */}
                <div className="w-20 h-24 shrink-0 rounded-xl overflow-hidden bg-brand-100 border border-brand-400/30 relative">
                  {expense.image_url ? (
                    <img 
                      src={`${MINIO_URL}${expense.image_url}`} 
                      alt="Receipt" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="%23cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-6 h-6 text-slate-300" />
                    </div>
                  )}
                </div>

                {/* Expense Details */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        {category && (
                          <div 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: category.color || '#3b82f6' }}
                          />
                        )}
                        <h3 className="font-semibold text-brand-700 line-clamp-1">
                          {category ? category.name : 'Chưa phân loại'}
                        </h3>
                      </div>
                      <span className="font-bold text-rose-600 whitespace-nowrap ml-2">
                        -{formatCurrency(expense.amount)}
                      </span>
                    </div>
                    
                    {expense.note && (
                      <p className="text-sm text-brand-700/70 line-clamp-2 mt-1">
                        {expense.note}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center text-xs text-brand-700/50 mt-2 font-medium">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {formatDate(expense.expense_date)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
