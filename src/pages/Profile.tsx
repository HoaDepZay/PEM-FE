import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Settings, Tags, Camera, KeyRound, Loader2, Edit2, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { user, token, logout, updateUser } = useAuth();
  
  // Avatar state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const MINIO_URL = import.meta.env.VITE_MINIO_URL || 'http://100.109.65.2:9000';

  // Password modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdMessage, setPwdMessage] = useState('');
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Info modal state
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [infoError, setInfoError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/profile/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success && user) {
        updateUser({ ...user, avatar_url: data.data.avatar_url });
      } else {
        alert(data.message || 'Lỗi upload ảnh');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setIsUploading(false);
    }
  };

  const validatePassword = (pwd: string) => {
    if (pwd.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
    if (!/[A-Z]/.test(pwd)) return 'Mật khẩu phải có ít nhất 1 ký tự in hoa';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt';
    return '';
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdMessage('');

    const pwdErrorStr = validatePassword(newPassword);
    if (pwdErrorStr) {
      setPwdError(pwdErrorStr);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('Mật khẩu nhập lại không khớp');
      return;
    }

    setIsChangingPwd(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setPwdMessage('Đổi mật khẩu thành công');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setIsPasswordModalOpen(false), 2000);
      } else {
        setPwdError(data.message || 'Lỗi đổi mật khẩu');
      }
    } catch (err) {
      setPwdError('Lỗi kết nối máy chủ');
    } finally {
      setIsChangingPwd(false);
    }
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoError('');
    setInfoMessage('');

    if (!newUsername || newUsername.length < 3) {
      setInfoError('Tên hiển thị phải có ít nhất 3 ký tự');
      return;
    }

    setIsUpdatingInfo(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/profile/info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: newUsername })
      });
      const data = await res.json();
      if (data.success && user) {
        setInfoMessage('Cập nhật thông tin thành công');
        updateUser({ ...user, username: newUsername });
        setTimeout(() => setIsInfoModalOpen(false), 1500);
      } else {
        setInfoError(data.message || 'Lỗi cập nhật thông tin');
      }
    } catch (err) {
      setInfoError('Lỗi kết nối máy chủ');
    } finally {
      setIsUpdatingInfo(false);
    }
  };

  return (
    <div className="pt-8 px-5 pb-24 min-h-screen bg-transparent relative">
      <h1 className="text-3xl font-bold text-brand-50 mb-8 tracking-tight">Hồ sơ cá nhân</h1>
      
      <div className="bg-brand-50 border border-brand-400/30 rounded-3xl p-6 mb-8 flex items-center gap-5 shadow-sm relative">
        <div 
          className="relative w-20 h-20 rounded-full cursor-pointer group shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          {user?.avatar_url ? (
            <img 
              src={`${MINIO_URL}${user.avatar_url}`} 
              alt="Avatar" 
              className="w-full h-full rounded-full object-cover border-2 border-brand-400/30"
            />
          ) : (
            <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-brand-700 border-2 border-brand-400/30">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Camera className="w-6 h-6 text-white" />
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarChange} 
            className="hidden" 
            accept="image/*"
          />
        </div>
        
        <div className="flex-1 overflow-hidden">
          <h2 className="text-xl font-bold text-brand-700 truncate">{user?.username}</h2>
          <p className="text-brand-700/70 truncate">{user?.email}</p>
        </div>

        <button 
          onClick={() => {
            setNewUsername(user?.username || '');
            setIsInfoModalOpen(true);
          }}
          className="p-2 text-brand-700/50 hover:text-brand-700 hover:bg-brand-50 rounded-full transition-colors"
        >
          <Edit2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        <Link to="/categories" className="w-full bg-brand-50 border border-brand-400/30 flex items-center gap-4 p-4 rounded-2xl text-brand-700 hover:bg-brand-100/50 transition-all active:scale-95 shadow-sm">
          <div className="p-2 bg-brand-50 rounded-xl">
            <Tags className="w-6 h-6 text-brand-700" />
          </div>
          <span className="font-medium text-lg">Quản lý danh mục</span>
        </Link>

        <button 
          onClick={() => setIsPasswordModalOpen(true)}
          className="w-full bg-brand-50 border border-brand-400/30 flex items-center gap-4 p-4 rounded-2xl text-brand-700 hover:bg-brand-100/50 transition-all active:scale-95 shadow-sm"
        >
          <div className="p-2 bg-purple-50 rounded-xl">
            <KeyRound className="w-6 h-6 text-brand-700" />
          </div>
          <span className="font-medium text-lg">Đổi mật khẩu</span>
        </button>

        <button className="w-full bg-brand-50 border border-brand-400/30 flex items-center gap-4 p-4 rounded-2xl text-brand-700 hover:bg-brand-100/50 transition-all active:scale-95 shadow-sm">
          <div className="p-2 bg-brand-100 rounded-xl">
            <Settings className="w-6 h-6 text-slate-600" />
          </div>
          <span className="font-medium text-lg">Cài đặt ứng dụng</span>
        </button>

        <button 
          onClick={logout}
          className="w-full bg-brand-50 border border-rose-100 flex items-center gap-4 p-4 rounded-2xl text-rose-600 hover:bg-rose-50 transition-all active:scale-95 shadow-sm mt-4"
        >
          <div className="p-2 bg-rose-50 rounded-xl">
            <LogOut className="w-6 h-6" />
          </div>
          <span className="font-medium text-lg">Đăng xuất</span>
        </button>
      </div>

      {/* Change Info Modal */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 bg-opacity-50 backdrop-blur-sm">
          <div className="bg-brand-50 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsInfoModalOpen(false)}
              className="absolute top-4 right-4 text-brand-700/50 hover:text-slate-600"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold text-brand-700 mb-6">Chỉnh sửa thông tin</h3>
            
            {infoError && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg mb-4">{infoError}</div>}
            {infoMessage && <div className="text-emerald-600 text-sm bg-emerald-50 p-3 rounded-lg mb-4">{infoMessage}</div>}

            <form onSubmit={handleUpdateInfo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên hiển thị</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-brand-400/30 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <button
                type="submit"
                disabled={isUpdatingInfo}
                className="w-full bg-brand-700 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 mt-4"
              >
                {isUpdatingInfo ? 'Đang cập nhật...' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 bg-opacity-50 backdrop-blur-sm">
          <div className="bg-brand-50 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute top-4 right-4 text-brand-700/50 hover:text-slate-600"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold text-brand-700 mb-6">Đổi mật khẩu</h3>
            
            {pwdError && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg mb-4">{pwdError}</div>}
            {pwdMessage && <div className="text-emerald-600 text-sm bg-emerald-50 p-3 rounded-lg mb-4">{pwdMessage}</div>}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  placeholder="Mật khẩu hiện tại"
                  required
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full px-4 pr-10 py-3 rounded-xl border border-brand-400/30 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-700/50 hover:text-slate-600 focus:outline-none"
                >
                  {showOldPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Mật khẩu mới"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 pr-10 py-3 rounded-xl border border-brand-400/30 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-700/50 hover:text-slate-600 focus:outline-none"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 pr-10 py-3 rounded-xl border border-brand-400/30 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-700/50 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <button
                type="submit"
                disabled={isChangingPwd}
                className="w-full bg-brand-700 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 mt-4"
              >
                {isChangingPwd ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
