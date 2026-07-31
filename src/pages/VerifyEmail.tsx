import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Không tìm thấy mã xác thực hợp lệ.');
      return;
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    const verifyToken = async () => {
      try {
        const response = await fetch(`${apiUrl}/auth/verify?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Xác thực thất bại');
        }

        setStatus('success');
        setMessage(data.message || 'Tài khoản của bạn đã được xác thực thành công!');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message);
      }
    };

    verifyToken();
  }, [token, apiUrl]);

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-brand-50 shadow-xl border border-brand-400/30 rounded-2xl p-8 text-center space-y-6">
        
        {status === 'loading' && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 text-brand-7000 animate-spin" />
            <h2 className="text-xl font-semibold text-brand-700">Đang xác thực...</h2>
            <p className="text-brand-700/70">Vui lòng đợi trong giây lát</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-brand-700">Thành công!</h2>
            <p className="text-brand-700/70">{message}</p>
            <Link
              to="/login"
              className="mt-4 inline-block w-full py-3 px-4 rounded-xl text-white bg-brand-700 hover:bg-blue-700 transition-all font-medium"
            >
              Đăng nhập ngay
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-brand-700">Xác thực thất bại</h2>
            <p className="text-brand-700/70">{message}</p>
            <Link
              to="/register"
              className="mt-4 inline-block w-full py-3 px-4 rounded-xl text-slate-700 bg-brand-100 hover:bg-slate-200 border border-brand-400/30 transition-all font-medium"
            >
              Quay lại trang Đăng ký
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};
