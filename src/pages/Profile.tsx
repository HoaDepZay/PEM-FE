import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Settings, Tags } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="pt-8 px-4 pb-24">
      <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>
      
      <div className="glassmorphism rounded-3xl p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-black shadow-lg">
          {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{user?.username}</h2>
          <p className="text-gray-400">{user?.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <Link to="/categories" className="w-full glassmorphism flex items-center gap-4 p-4 rounded-2xl text-white hover:bg-white/10 transition-colors">
          <Tags className="w-6 h-6 text-gray-300" />
          <span className="font-medium">Quản lý danh mục</span>
        </Link>

        <button className="w-full glassmorphism flex items-center gap-4 p-4 rounded-2xl text-white hover:bg-white/10 transition-colors">
          <User className="w-6 h-6 text-gray-300" />
          <span className="font-medium">Chỉnh sửa thông tin</span>
        </button>

        <button className="w-full glassmorphism flex items-center gap-4 p-4 rounded-2xl text-white hover:bg-white/10 transition-colors">
          <Settings className="w-6 h-6 text-gray-300" />
          <span className="font-medium">Cài đặt ứng dụng</span>
        </button>

        <button 
          onClick={logout}
          className="w-full glassmorphism flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-6 h-6" />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};
