import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';
import { Spinner } from '../../components/ui/Spinner';
import { ChevronDown } from 'lucide-react';
import { startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, startOfDay, endOfDay, getDaysInMonth, isWithinInterval, parseISO } from 'date-fns';

import { OverviewCard } from '../../components/ui/OverviewCard';
import { BudgetAlerts } from '../../components/ui/BudgetAlerts';
import { SpendingChart } from '../../components/ui/SpendingChart';

type TimeRange = 'today' | 'this_week' | 'this_month' | 'last_month';

interface Expense {
  expense_id: string;
  amount: number;
  expense_date: string;
  category_id: string;
}

interface CategoryGroup {
  group_id: string;
  name: string;
  icon: string;
  color: string;
  total_budget?: number;
  categories: {
    category_id: string;
    name: string;
    budget_type: string;
    budget_amount: number;
    status: string;
    over_budget_amount: number;
  }[];
}

export const Analytics: React.FC = () => {
  const { token } = useAuth();
  
  const [timeRange, setTimeRange] = useState<TimeRange>('this_month');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const [expRes, catRes] = await Promise.all([
          apiFetch(`/expenses/`),
          apiFetch(`/categories/`)
        ]);
        const [expData, catData] = await Promise.all([
          expRes.json(),
          catRes.json()
        ]);
        
        if (expData.data) setExpenses(expData.data);
        if (catData.data) setGroups(catData.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Lọc chi tiêu theo khoảng thời gian
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    let start: Date, end: Date;

    if (timeRange === 'today') {
      start = startOfDay(now);
      end = endOfDay(now);
    } else if (timeRange === 'this_month') {
      start = startOfMonth(now);
      end = endOfMonth(now);
    } else if (timeRange === 'last_month') {
      const lastMonth = subMonths(now, 1);
      start = startOfMonth(lastMonth);
      end = endOfMonth(lastMonth);
    } else {
      start = startOfWeek(now, { weekStartsOn: 1 });
      end = endOfWeek(now, { weekStartsOn: 1 });
    }

    return expenses.filter(exp => {
      if (!exp.expense_date) return false;
      const expDate = parseISO(exp.expense_date);
      return isWithinInterval(expDate, { start, end });
    });
  }, [expenses, timeRange]);

  const totalSpent = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [filteredExpenses]);

  // Tính toán dữ liệu cho biểu đồ Donut
  const chartData = useMemo(() => {
    const dataMap: Record<string, { name: string, value: number, color: string }> = {};
    
    // Map category_id to group
    const catToGroup: Record<string, { name: string, color: string }> = {};
    groups.forEach(g => {
      g.categories?.forEach(c => {
        catToGroup[c.category_id] = { name: g.name, color: g.color || '#3b82f6' };
      });
    });

    filteredExpenses.forEach(exp => {
      const group = catToGroup[exp.category_id] || { name: 'Khác', color: '#94a3b8' };
      if (!dataMap[group.name]) {
        dataMap[group.name] = { name: group.name, value: 0, color: group.color };
      }
      dataMap[group.name].value += exp.amount;
    });

    return Object.values(dataMap).sort((a, b) => b.value - a.value); // Sort descending
  }, [filteredExpenses, groups]);

  // Tính toán Tổng Ngân sách tương ứng với timeRange
  const totalBudget = useMemo(() => {
    let total = 0;
    const now = new Date();
    const daysInCurrentMonth = getDaysInMonth(now);
    
    let rangeDays = daysInCurrentMonth;
    if (timeRange === 'today') {
      rangeDays = 1;
    } else if (timeRange === 'this_week') {
      rangeDays = 7;
    } else if (timeRange === 'last_month') {
      rangeDays = getDaysInMonth(subMonths(now, 1));
    }

    groups.forEach(g => {
      g.categories?.forEach(c => {
        const amount = c.budget_amount || 0;
        if (amount > 0) {
           let dailyAmount = 0;
           switch (c.budget_type) {
             case 'DAILY': dailyAmount = amount; break;
             case 'WEEKLY': dailyAmount = amount / 7; break;
             case 'MONTHLY': dailyAmount = amount / daysInCurrentMonth; break;
             case 'YEARLY': dailyAmount = amount / 365; break;
             default: dailyAmount = amount / daysInCurrentMonth;
           }
           total += dailyAmount * rangeDays;
        }
      });
    });
    return Math.round(total);
  }, [groups, timeRange]);

  const overBudgetCats = useMemo(() => {
    const cats: any[] = [];
    groups.forEach(g => {
      g.categories?.forEach(c => {
        if (c.status === 'VƯỢT NGÂN SÁCH') {
          cats.push({ ...c, groupName: g.name, color: g.color });
        }
      });
    });
    // Sort by over_budget_amount descending
    return cats.sort((a, b) => b.over_budget_amount - a.over_budget_amount);
  }, [groups]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + 'đ';
  };

  const getRangeLabel = () => {
    if (timeRange === 'today') return 'Hôm nay';
    if (timeRange === 'this_month') return 'Tháng này';
    if (timeRange === 'last_month') return 'Tháng trước';
    return 'Tuần này';
  };

  if (loading) {
    return <div className="pt-8 px-4 flex justify-center"><Spinner /></div>;
  }

  return (
    <div className="pt-8 px-5 pb-24 min-h-screen bg-transparent space-y-6">
      
      {/* Header & Filter */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Phân tích</h1>
        
        <div className="relative z-20">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 text-sm font-semibold active:scale-95 transition-all"
          >
            {getRangeLabel()}
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>
          
          {isDropdownOpen && (
            <>
              <div className="fixed inset-0" onClick={() => setIsDropdownOpen(false)}></div>
              <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden text-sm font-medium">
                <button onClick={() => {setTimeRange('today'); setIsDropdownOpen(false)}} className={`w-full text-left px-4 py-3 hover:bg-slate-50 ${timeRange === 'today' ? 'text-blue-600 bg-blue-50' : 'text-slate-700'}`}>Hôm nay</button>
                <button onClick={() => {setTimeRange('this_week'); setIsDropdownOpen(false)}} className={`w-full text-left px-4 py-3 hover:bg-slate-50 ${timeRange === 'this_week' ? 'text-blue-600 bg-blue-50' : 'text-slate-700'}`}>Tuần này</button>
                <button onClick={() => {setTimeRange('this_month'); setIsDropdownOpen(false)}} className={`w-full text-left px-4 py-3 hover:bg-slate-50 ${timeRange === 'this_month' ? 'text-blue-600 bg-blue-50' : 'text-slate-700'}`}>Tháng này</button>
                <button onClick={() => {setTimeRange('last_month'); setIsDropdownOpen(false)}} className={`w-full text-left px-4 py-3 hover:bg-slate-50 ${timeRange === 'last_month' ? 'text-blue-600 bg-blue-50' : 'text-slate-700'}`}>Tháng trước</button>
              </div>
            </>
          )}
        </div>
      </div>

      <OverviewCard 
        totalSpent={totalSpent}
        totalBudget={totalBudget}
        rangeLabel={getRangeLabel()}
        formatCurrency={formatCurrency}
      />

      <BudgetAlerts 
        overBudgetCats={overBudgetCats}
        formatCurrency={formatCurrency}
      />

      <SpendingChart 
        chartData={chartData}
        totalSpent={totalSpent}
        formatCurrency={formatCurrency}
      />

    </div>
  );
};
