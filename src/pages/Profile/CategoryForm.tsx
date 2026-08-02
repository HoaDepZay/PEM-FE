import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { 
  ArrowLeft, Tag, ShoppingCart, Coffee, Utensils, Car, Home,
  Heart, Bus, Plane, Book, GraduationCap,
  Music, Film, Smartphone, Gift, Briefcase, Check
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { apiFetch } from '../../utils/api';

const AVAILABLE_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];

const ICON_MAP: Record<string, LucideIcon> = {
  Tag, ShoppingCart, Coffee, Utensils, Car, Home,
  Heart, Bus, Plane, Book, GraduationCap,
  Music, Film, Smartphone, Gift, Briefcase
};
const AVAILABLE_ICONS = Object.keys(ICON_MAP);

export const CategoryForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { type, data, groupId } = location.state as { type: 'group' | 'sub', data?: any, groupId?: string } || { type: 'group' };

  // Common State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group State
  const [groupData, setGroupData] = useState<{name: string, icon: string, color: string}>({ 
    name: data?.name || '', 
    icon: data?.icon || 'Tag', 
    color: data?.color || '#3B82F6', 
  });

  // SubCategory State
  const [subData, setSubData] = useState<{name: string, budget_type: string, budget_amount: string | number}>({
    name: data?.name || '',
    budget_type: data?.budget_type || 'DAILY',
    budget_amount: data?.budget_amount || ''
  });

  const handleSubmitGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupData.name.trim()) return;
    setIsSubmitting(true);
    
    const method = data ? 'PUT' : 'POST';
    const endpoint = data ? `/categories/groups/${data.group_id}` : `/categories/groups`;

    try {
      const res = await apiFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData)
      });
      if (res.ok) {
        navigate('/categories', { replace: true });
      } else {
        alert('Có lỗi xảy ra khi lưu nhóm danh mục');
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subData.name.trim()) return;
    setIsSubmitting(true);
    
    const method = data ? 'PUT' : 'POST';
    const endpoint = data ? `/categories/${data.category_id}` : `/categories/`;

    const payload = {
      group_id: groupId,
      name: subData.name,
      budget_type: subData.budget_type,
      budget_amount: subData.budget_amount !== '' ? Number(subData.budget_amount) : 0
    };

    try {
      const res = await apiFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        navigate('/categories', { replace: true });
      } else {
        alert('Có lỗi xảy ra khi lưu danh mục con');
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 p-5 pb-24">
      {/* Header */}
      <div className="flex items-center mb-6 gap-4">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight">
          {data ? 'Sửa' : 'Thêm'} {type === 'group' ? 'Nhóm danh mục' : 'Danh mục con'}
        </h1>
      </div>

      {type === 'group' ? (
        <form onSubmit={handleSubmitGroup} className="bg-white border border-slate-200 shadow-md p-6 rounded-3xl space-y-6">
          <div>
            <label className="block text-slate-700 font-bold mb-3 text-sm uppercase tracking-wider">Tên nhóm</label>
            <input 
              type="text" 
              value={groupData.name}
              onChange={(e) => setGroupData({...groupData, name: e.target.value})}
              required
              placeholder="VD: Ăn uống, Nhà cửa..."
              className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-lg font-bold px-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100 transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-3 text-sm uppercase tracking-wider">Biểu tượng</label>
            <div className="flex gap-3 flex-wrap">
              {AVAILABLE_ICONS.map(iconName => {
                const IconComp = ICON_MAP[iconName];
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setGroupData({...groupData, icon: iconName})}
                    className={`w-14 h-14 rounded-2xl transition-all shadow-sm flex items-center justify-center ${
                      groupData.icon === iconName 
                        ? 'bg-slate-900 text-white ring-4 ring-slate-200 scale-105' 
                        : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <IconComp className="w-6 h-6" strokeWidth={2.5} />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-3 text-sm uppercase tracking-wider">Màu sắc</label>
            <div className="flex gap-4 flex-wrap">
              {AVAILABLE_COLORS.map(color => (
                <button 
                  key={color} 
                  type="button"
                  onClick={() => setGroupData({...groupData, color})}
                  className={`w-12 h-12 flex items-center justify-center rounded-full transition-all shadow-sm ${
                    groupData.color === color 
                      ? 'ring-4 ring-offset-2 ring-slate-900 scale-110' 
                      : 'hover:scale-110 border border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {groupData.color === color && <Check className="w-6 h-6 text-white drop-shadow-md" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" fullWidth onClick={() => navigate(-1)} disabled={isSubmitting}>Hủy</Button>
            <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmitSub} className="bg-white border border-slate-200 shadow-md p-6 rounded-3xl space-y-6">
          <div>
            <label className="block text-slate-700 font-bold mb-3 text-sm uppercase tracking-wider">Tên danh mục con</label>
            <input 
              type="text" 
              value={subData.name}
              onChange={(e) => setSubData({...subData, name: e.target.value})}
              required
              placeholder="VD: Ăn sáng, Cà phê..."
              className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-lg font-bold px-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100 transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-3 text-sm uppercase tracking-wider">Loại ngân sách</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'DAILY', label: 'Ngày' },
                { value: 'WEEKLY', label: 'Tuần' },
                { value: 'MONTHLY', label: 'Tháng' },
                { value: 'YEARLY', label: 'Năm' }
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSubData({...subData, budget_type: opt.value})}
                  className={`py-3 px-4 rounded-xl font-bold transition-all ${
                    subData.budget_type === opt.value
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-3 text-sm uppercase tracking-wider">Số tiền ngân sách</label>
            <input 
              type="text" 
              value={subData.budget_amount ? Number(subData.budget_amount).toLocaleString('vi-VN') : ''}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setSubData({...subData, budget_amount: val});
              }}
              required
              placeholder="VD: 100.000"
              className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-lg font-bold px-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100 transition-all shadow-sm"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" fullWidth onClick={() => navigate(-1)} disabled={isSubmitting}>Hủy</Button>
            <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
