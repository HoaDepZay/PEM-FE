import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { CameraWidget } from '../components/ui/CameraWidget';
import { ICON_MAP } from '../utils/icons';
import { Tag } from 'lucide-react';

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

export const Locker: React.FC = () => {
  const { user, token } = useAuth();
  
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
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
          // Take top 3 most recent
          setRecentExpenses(expData.data.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', { 
      day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(date);
  };

  return (
    <div className="pt-8 px-5 pb-24 space-y-8">


      {/* Embedded Camera */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4 px-1 flex items-center gap-2">
          <span className="w-2 h-6 bg-slate-200 rounded-full"></span>
          Chụp hóa đơn mới
        </h3>
        <CameraWidget />
      </div>

      {/* Recent Transactions Placeholder */}
      <div>
        <div className="flex justify-between items-center mb-4 mt-8 px-1">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2 h-6 bg-white0 rounded-full"></span>
            Giao dịch gần đây
          </h3>
          <Link to="/history" className="text-sm font-semibold text-slate-400 hover:text-slate-100">Xem tất cả</Link>
        </div>
        
        {isLoading ? (
           <div className="flex justify-center py-5">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
           </div>
        ) : recentExpenses.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
               <span className="text-2xl opacity-50">📭</span>
            </div>
            <p className="text-slate-900/60 font-medium">Chưa có giao dịch nào được ghi nhận.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentExpenses.map((exp) => {
              const cat = categories[exp.category_id];
              const IconComponent = cat && cat.icon ? ICON_MAP[cat.icon] || Tag : Tag;
              const color = cat?.color || '#5D7B6F';
              
              return (
                <div key={exp.expense_id} className="bg-white border border-slate-200 shadow-sm p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${color}15`, color: color }}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{cat?.name || 'Chưa phân loại'}</h4>
                      <p className="text-xs text-slate-900/60">{formatDate(exp.expense_date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">{formatCurrency(exp.amount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
