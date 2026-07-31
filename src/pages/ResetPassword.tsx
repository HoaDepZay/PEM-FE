import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (pwd: string) => {
    if (pwd.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
    if (!/[A-Z]/.test(pwd)) return 'Mật khẩu phải có ít nhất 1 ký tự in hoa';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt';
    return '';
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset_token: token, new_password: newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Đổi mật khẩu thành công! Tự động chuyển đến đăng nhập...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Lỗi đổi mật khẩu');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center text-slate-900 border border-slate-200">
          Token không hợp lệ hoặc đã hết hạn.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">
            Tạo mật khẩu mới
          </h2>
          <p className="mt-2 text-center text-sm text-slate-900/70">
            Vui lòng nhập mật khẩu mới của bạn
          </p>
        </div>

        {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</div>}
        {message && <div className="text-emerald-600 text-sm text-center bg-emerald-50 p-3 rounded-lg">{message}</div>}

        <form className="mt-8 space-y-6" onSubmit={handleReset}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="relative">
              <label htmlFor="new-password" className="sr-only">Mật khẩu mới</label>
              <input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                required
                className="appearance-none rounded-xl relative block w-full pl-3 pr-10 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-slate-800 sm:text-sm"
                placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-900/50 hover:text-slate-600 focus:outline-none"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <div className="relative">
              <label htmlFor="confirm-password" className="sr-only">Nhập lại mật khẩu</label>
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                required
                className="appearance-none rounded-xl relative block w-full pl-3 pr-10 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-slate-800 sm:text-sm"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-900/50 hover:text-slate-600 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-slate-900 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-300 active:scale-95"
            >
              Đổi mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
