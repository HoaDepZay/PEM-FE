import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { CameraWidget } from '../../components/ui/CameraWidget';
import { Inbox } from 'lucide-react';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ExpenseCard } from '../../components/ui/ExpenseCard';
import { getCategoryFromMap } from '../../utils/uuid';
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

export const Locker: React.FC = () => {
  const { token } = useAuth();
  
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [isLoading, setIsLoading] = useState(true);

  const MINIO_URL = import.meta.env.VITE_MINIO_URL || 'http://100.109.65.2:9000';

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
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
          <Spinner />
        ) : recentExpenses.length === 0 ? (
          <EmptyState 
            icon={Inbox} 
            message="Chưa có giao dịch nào" 
          />
        ) : (
          <div className="space-y-3">
            {recentExpenses.map((expense) => (
              <ExpenseCard 
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
    </div>
  );
};
