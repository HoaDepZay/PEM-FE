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
      {/* Header */}
      <div className="flex justify-between items-center bg-brand-50 p-5 rounded-3xl shadow-sm border border-brand-400/30">
        <div>
          <p className="text-brand-700/60 text-sm font-medium">Xin chào,</p>
          <h1 className="text-2xl font-black bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent">{user?.username}</h1>
        </div>
        <div className="w-14 h-14 bg-gradient-to-tr from-brand-500 to-brand-400 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-brand-400/30">
          {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>

      {/* Embedded Camera */}
      <div>
        <h3 className="text-lg font-bold text-brand-700 mb-4 px-1 flex items-center gap-2">
          <span className="w-2 h-6 bg-brand-400 rounded-full"></span>
          Chụp hóa đơn mới
        </h3>
        <CameraWidget />
      </div>

      {/* Recent Transactions Placeholder */}
      <div>
        <div className="flex justify-between items-center mb-4 mt-8 px-1">
          <h3 className="text-lg font-bold text-brand-700 flex items-center gap-2">
            <span className="w-2 h-6 bg-brand-500 rounded-full"></span>
            Giao dịch gần đây
          </h3>
          <Link to="/history" className="text-sm font-semibold text-brand-400 hover:text-brand-100">Xem tất cả</Link>
        </div>
        
        {isLoading ? (
           <div className="flex justify-center py-5">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
           </div>
        ) : recentExpenses.length === 0 ? (
          <div className="bg-brand-50 border border-brand-400/30 rounded-3xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-3">
               <span className="text-2xl opacity-50">📭</span>
            </div>
            <p className="text-brand-700/60 font-medium">Chưa có giao dịch nào được ghi nhận.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentExpenses.map((exp) => {
              const cat = categories[exp.category_id];
              const IconComponent = cat && cat.icon ? ICON_MAP[cat.icon] || Tag : Tag;
              const color = cat?.color || '#5D7B6F';
              
              return (
                <div key={exp.expense_id} className="bg-brand-50 border border-brand-400/30 shadow-sm p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${color}15`, color: color }}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-700">{cat?.name || 'Chưa phân loại'}</h4>
                      <p className="text-xs text-brand-700/60">{formatDate(exp.expense_date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-brand-700">{formatCurrency(exp.amount)}</span>
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
