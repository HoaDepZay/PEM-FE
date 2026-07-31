import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStep(2);
        setMessage('Mã OTP đã được gửi đến email của bạn.');
      } else {
        setError(data.message || 'Lỗi gửi OTP');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp_code: otp }),
      });
      const data = await res.json();
      if (data.success && data.data?.reset_token) {
        // Chuyển hướng sang trang Reset Password mang theo token
        navigate(`/reset-password?token=${data.data.reset_token}`);
      } else {
        setError(data.message || 'Mã OTP không hợp lệ');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-brand-50 p-8 rounded-2xl shadow-xl border border-brand-400/30">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-brand-700">
            Quên mật khẩu
          </h2>
          <p className="mt-2 text-center text-sm text-brand-700/70">
            {step === 1 ? 'Nhập email để nhận mã xác thực' : 'Nhập mã OTP đã được gửi đến email'}
          </p>
        </div>

        {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</div>}
        {message && <div className="text-emerald-600 text-sm text-center bg-emerald-50 p-3 rounded-lg">{message}</div>}

        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={handleSendOTP}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-brand-400/30 placeholder-slate-400 text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  placeholder="Địa chỉ Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-brand-700 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-300 active:scale-95"
              >
                Gửi mã OTP
              </button>
            </div>
            
            <div className="text-center mt-4">
              <Link to="/login" className="text-sm font-medium text-brand-700 hover:text-brand-500">
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="otp" className="sr-only">Mã OTP</label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  maxLength={6}
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-brand-400/30 placeholder-slate-400 text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-center text-2xl tracking-widest sm:text-sm"
                  placeholder="------"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-brand-700 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-300 active:scale-95"
              >
                Xác nhận mã OTP
              </button>
            </div>
            
            <div className="text-center mt-4 flex flex-col space-y-2">
              <button type="button" onClick={() => setStep(1)} className="text-sm font-medium text-brand-700/70 hover:text-slate-700">
                Gửi lại mã
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
