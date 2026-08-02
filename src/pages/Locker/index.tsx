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
  created_at?: string;
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
          catData.data.forEach((group: any) => {
            if (group.categories) {
              group.categories.forEach((sub: any) => {
                catMap[sub.category_id] = {
                  category_id: sub.category_id,
                  name: `${group.name} - ${sub.name}`,
                  icon: group.icon,
                  color: group.color
                };
              });
            }
          });
        }
        setCategories(catMap);

        const expRes = await apiFetch(`/expenses/`);
        const expData = await expRes.json();
        if (expData.data) {
          const today = new Date();
          const todaysExpenses = expData.data.filter((e: Expense) => {
            if (!e.expense_date) return false;
            const expDate = new Date(e.expense_date);
            return expDate.getDate() === today.getDate() &&
                   expDate.getMonth() === today.getMonth() &&
                   expDate.getFullYear() === today.getFullYear();
          }).sort((a: Expense, b: Expense) => {
            if (a.created_at && b.created_at) {
              const timeDiff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
              if (timeDiff !== 0) return timeDiff;
            }
            const timeA = new Date(a.expense_date).getTime();
            const timeB = new Date(b.expense_date).getTime();
            return timeB - timeA;
          });
          setRecentExpenses(todaysExpenses.slice(0, 5));
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
