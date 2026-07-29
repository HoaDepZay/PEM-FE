import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Tag, Coffee, ShoppingBag, Car, Home as HomeIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Category {
  category_id: string;
  name: string;
  icon: string;
  color: string;
  user_id?: string;
}

const AVAILABLE_ICONS = [
  { name: 'Coffee', icon: Coffee },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Car', icon: Car },
  { name: 'Home', icon: HomeIcon },
  { name: 'Tag', icon: Tag },
];

const AVAILABLE_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];

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
    <div className="min-h-screen bg-black text-white p-4 pb-24">
      {/* Header */}
      <div className="flex items-center mb-6 gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Quản lý Danh mục</h1>
      </div>

      {!isFormOpen ? (
        <>
          <button 
            onClick={() => { setEditingId(null); setFormData({ name: '', icon: 'Tag', color: '#3B82F6' }); setIsFormOpen(true); }}
            className="w-full bg-white text-black font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 mb-6"
          >
            <Plus className="w-5 h-5" /> Thêm danh mục mới
          </button>

          {loading ? (
            <p className="text-center text-gray-400">Đang tải...</p>
          ) : (
            <div className="space-y-3">
              {categories.map(cat => (
                <div key={cat.category_id} className="glassmorphism p-4 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${cat.color}33`, color: cat.color }}>
                       <Tag className="w-6 h-6" /> {/* Chỗ này có thể map với AVAILABLE_ICONS */}
                    </div>
                    <span className="font-semibold text-lg">{cat.name}</span>
                  </div>
                  {cat.user_id && (
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(cat)} className="p-2 text-blue-400"><Edit2 className="w-5 h-5"/></button>
                      <button onClick={() => handleDelete(cat.category_id)} className="p-2 text-red-400"><Trash2 className="w-5 h-5"/></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <form onSubmit={handleSubmit} className="glassmorphism p-6 rounded-3xl space-y-6">
          <h2 className="text-xl font-bold">{editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
          
          <div>
            <label className="block text-gray-400 mb-2">Tên danh mục</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-black/50 p-4 rounded-xl text-white border border-white/20"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Màu sắc</label>
            <div className="flex gap-3 flex-wrap">
              {AVAILABLE_COLORS.map(color => (
                <button 
                  key={color} 
                  type="button"
                  onClick={() => setFormData({...formData, color})}
                  className={`w-10 h-10 rounded-full border-2 ${formData.color === color ? 'border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-4 rounded-xl bg-white/10 font-semibold">Hủy</button>
            <button type="submit" className="flex-1 py-4 rounded-xl bg-white text-black font-semibold">Lưu</button>
          </div>
        </form>
      )}
    </div>
  );
};
