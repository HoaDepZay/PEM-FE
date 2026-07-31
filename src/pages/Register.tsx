import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';

export const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const apiUrl = import.meta.env.VITE_API_URL;

  const validatePassword = (pwd: string) => {
    if (pwd.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
    if (!/[A-Z]/.test(pwd)) return 'Mật khẩu phải có ít nhất 1 ký tự in hoa';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full bg-brand-50 shadow-xl border border-brand-400/30 rounded-2xl p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-brand-700">Đăng ký thành công!</h2>
          <p className="text-brand-700/70">
            Chúng tôi đã gửi một email xác thực đến <span className="text-brand-700 font-medium">{email}</span>. 
            Vui lòng kiểm tra hộp thư đến (và thư mục rác) để kích hoạt tài khoản của bạn.
          </p>
          <Link
            to="/login"
            className="inline-block w-full py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-brand-700 hover:bg-blue-700 transition-all"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-brand-50 shadow-xl border border-brand-400/30 rounded-2xl p-8 space-y-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-100 rounded-full filter blur-2xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-100 rounded-full filter blur-2xl opacity-60 animate-blob animation-delay-2000"></div>

        <div className="text-center relative z-10">
          <h2 className="text-3xl font-bold text-brand-700 tracking-tight">Tạo tài khoản mới</h2>
          <p className="text-brand-700/70 mt-2">Bắt đầu quản lý tài chính thông minh</p>
        </div>

        <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-brand-700/50" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-xl relative block w-full pl-10 px-3 py-3 border border-brand-400/30 bg-brand-50 text-brand-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:text-sm transition-all"
                placeholder="Tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-brand-700/50" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-xl relative block w-full pl-10 px-3 py-3 border border-brand-400/30 bg-brand-50 text-brand-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:text-sm transition-all"
                placeholder="Địa chỉ Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-brand-700/50" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                className="appearance-none rounded-xl relative block w-full pl-10 pr-10 px-3 py-3 border border-brand-400/30 bg-brand-50 text-brand-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:text-sm transition-all"
                placeholder="Mật khẩu (ít nhất 6 ký tự)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-700/50 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-brand-700 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all overflow-hidden disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5 text-white" />
              ) : (
                <span className="flex items-center">
                  Đăng ký
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-brand-700/70 relative z-10">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-medium text-brand-700 hover:text-brand-500 transition-colors">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};
