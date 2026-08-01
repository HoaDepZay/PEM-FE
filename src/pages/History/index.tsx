import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ExpenseCard } from '../../components/ui/ExpenseCard';

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

  return (
    <div className="pt-8 px-4 pb-24 bg-transparent min-h-screen">
      <PageHeader 
        title="Lịch sử giao dịch" 
        subtitle="Xem lại các khoản chi tiêu gần đây của bạn" 
      />

      {isLoading ? (
        <Spinner />
      ) : expenses.length === 0 ? (
        <EmptyState 
          icon={Calendar} 
          message="Chưa có giao dịch nào. Hãy tạo giao dịch đầu tiên của bạn!" 
        />
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <ExpenseCard 
              key={expense.expense_id}
              expense={expense}
              category={categories[expense.category_id]}
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
