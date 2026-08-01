import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { 
  ArrowLeft, Plus, Edit2, Trash2, Tag,
  ShoppingCart, Coffee, Utensils, Car, Home,
  Heart, Bus, Plane, Book, GraduationCap,
  Music, Film, Smartphone, Gift, Briefcase
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Category {
  category_id: string;
  name: string;
  icon: string;
  color: string;
  user_id?: string;
}

const AVAILABLE_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];

const ICON_MAP: Record<string, LucideIcon> = {
  Tag, ShoppingCart, Coffee, Utensils, Car, Home,
  Heart, Bus, Plane, Book, GraduationCap,
  Music, Film, Smartphone, Gift, Briefcase
};
const AVAILABLE_ICONS = Object.keys(ICON_MAP);


export const Categories: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', icon: 'Tag', color: '#3B82F6' });

  const fetchCategories = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/categories/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.data || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const apiUrl = import.meta.env.VITE_API_URL;
    const url = editingId ? `${apiUrl}/categories/${editingId}` : `${apiUrl}/categories/`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsFormOpen(false);
        setEditingId(null);
        setFormData({ name: '', icon: 'Tag', color: '#3B82F6' });
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      await fetch(`${apiUrl}/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.category_id);
    setFormData({ name: cat.name, icon: cat.icon || 'Tag', color: cat.color || '#3B82F6' });
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 p-5 pb-24">
      {/* Header */}
      <div className="flex items-center mb-6 gap-4">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Danh mục</h1>
      </div>

      {!isFormOpen ? (
        <>
          <Button 
            fullWidth
            onClick={() => { setEditingId(null); setFormData({ name: '', icon: 'Tag', color: '#3B82F6' }); setIsFormOpen(true); }}
            className="mb-6"
          >
            <Plus className="w-5 h-5" /> Thêm danh mục mới
          </Button>

          {loading ? (
            <Spinner />
          ) : (
            <div className="space-y-3">
              {categories.map(cat => {
                const IconComponent = ICON_MAP[cat.icon] || Tag;
                return (
                  <div key={cat.category_id} className="bg-white border border-slate-200 shadow-sm p-4 rounded-2xl flex justify-between items-center transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-inner" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                         <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="font-semibold text-lg text-slate-900">{cat.name}</span>
                    </div>
                  {cat.user_id && (
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(cat)} className="p-2 text-slate-9000 bg-white rounded-xl hover:bg-blue-100 transition-colors"><Edit2 className="w-5 h-5"/></button>
                      <button onClick={() => handleDelete(cat.category_id)} className="p-2 text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"><Trash2 className="w-5 h-5"/></button>
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          )}
        </>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 shadow-md p-6 rounded-3xl space-y-6">
          <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
          
          <div>
            <label className="block text-slate-600 font-medium mb-2">Tên danh mục</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              placeholder="VD: Ăn sáng, Cà phê..."
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-3">Biểu tượng</label>
            <div className="flex gap-2 flex-wrap">
              {AVAILABLE_ICONS.map(iconName => {
                const IconComp = ICON_MAP[iconName];
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setFormData({...formData, icon: iconName})}
                    className={`p-3 rounded-xl border-2 transition-all shadow-sm flex items-center justify-center ${formData.icon === iconName ? 'border-slate-800 bg-white text-slate-900' : 'border-slate-200 bg-white text-slate-900/70 hover:border-slate-300'}`}
                  >
                    <IconComp className="w-6 h-6" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-3">Màu sắc</label>
            <div className="flex gap-3 flex-wrap">
              {AVAILABLE_COLORS.map(color => (
                <button 
                  key={color} 
                  type="button"
                  onClick={() => setFormData({...formData, color})}
                  className={`w-10 h-10 rounded-full border-2 transition-all shadow-sm ${formData.color === color ? 'border-slate-900 scale-110' : 'border-transparent scale-100 hover:scale-110'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" fullWidth onClick={() => setIsFormOpen(false)}>Hủy</Button>
            <Button type="submit" variant="primary" fullWidth>Lưu</Button>
          </div>
        </form>
      )}
    </div>
  );
};
