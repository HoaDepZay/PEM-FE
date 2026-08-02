import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { 
  Plus, Edit2, Trash2, Tag,
  ShoppingCart, Coffee, Utensils, Car, Home,
  Heart, Bus, Plane, Book, GraduationCap,
  Music, Film, Smartphone, Gift, Briefcase, ChevronDown, ChevronRight
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';

export interface SubCategory {
  category_id: string;
  group_id: string;
  name: string;
  budget_type: string;
  budget_amount: number;
  status: string;
  over_budget_amount: number;
}

export interface CategoryGroup {
  group_id: string;
  name: string;
  icon: string;
  color: string;
  total_budget: number;
  categories: SubCategory[];
  user_id?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Tag, ShoppingCart, Coffee, Utensils, Car, Home,
  Heart, Bus, Plane, Book, GraduationCap,
  Music, Film, Smartphone, Gift, Briefcase
};

export const Categories: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const fetchCategories = async () => {
    try {
      const res = await apiFetch(`/categories/`);
      if (res.ok) {
        const data = await res.json();
        setGroups(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [token]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa NHÓM danh mục này? Toàn bộ danh mục con bên trong cũng sẽ bị xóa!')) return;
    try {
      await apiFetch(`/categories/groups/${id}`, { method: 'DELETE' });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      await apiFetch(`/categories/${id}`, { method: 'DELETE' });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const formatBudgetType = (type: string) => {
    switch (type) {
      case 'DAILY': return 'Ngày';
      case 'WEEKLY': return 'Tuần';
      case 'MONTHLY': return 'Tháng';
      case 'YEARLY': return 'Năm';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 p-5 pb-24">
      {/* Header */}
      <div className="flex items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Danh mục</h1>
      </div>

      <div className="flex gap-3 mb-6">
        <Button 
          fullWidth
          variant="outline"
          onClick={() => navigate('/categories/create', { state: { type: 'group' } })}
        >
          <Plus className="w-5 h-5" /> Thêm Nhóm
        </Button>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-4">
          {groups.map(group => {
            const IconComponent = ICON_MAP[group.icon] || Tag;
            const isExpanded = expandedGroups[group.group_id];
            
            return (
              <div key={group.group_id} className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden transition-all">
                {/* Group Header */}
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50"
                  onClick={() => toggleGroup(group.group_id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-inner" style={{ backgroundColor: `${group.color}15`, color: group.color }}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-lg text-slate-900">{group.name}</span>
                      <span className="text-sm font-medium text-slate-500">
                        {group.categories?.length || 0} danh mục con • Tổng ngân sách: {group.total_budget.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {group.user_id && (
                      <div className="flex gap-2 mr-2">
                        <button onClick={(e) => { e.stopPropagation(); navigate('/categories/edit', { state: { type: 'group', data: group } }); }} className="p-2 text-slate-900 bg-white rounded-xl hover:bg-blue-100 transition-colors"><Edit2 className="w-4 h-4"/></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.group_id); }} className="p-2 text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    )}
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>

                {/* Sub-categories */}
                {isExpanded && (
                  <div className="bg-slate-50 p-4 border-t border-slate-100 space-y-3">
                    {group.categories && group.categories.map(cat => (
                      <div key={cat.category_id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-slate-800">{cat.name}</div>
                          <div className="text-xs font-medium text-slate-500 mt-0.5">
                            Ngân sách {formatBudgetType(cat.budget_type)}: {cat.budget_amount.toLocaleString('vi-VN')}đ
                          </div>

                        </div>
                        {group.user_id && (
                          <div className="flex gap-2">
                            <button onClick={() => navigate('/categories/edit', { state: { type: 'sub', data: cat, groupId: group.group_id } })} className="p-1.5 text-slate-700 bg-slate-100 rounded-lg hover:bg-blue-100 transition-colors"><Edit2 className="w-4 h-4"/></button>
                            <button onClick={() => handleDeleteCategory(cat.category_id)} className="p-1.5 text-rose-500 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      fullWidth 
                      className="mt-2 text-sm py-2"
                      onClick={() => navigate('/categories/create', { state: { type: 'sub', groupId: group.group_id } })}
                    >
                      <Plus className="w-4 h-4" /> Thêm danh mục con
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
