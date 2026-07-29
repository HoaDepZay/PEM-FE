import React from 'react';
import { useAuth } from '../context/AuthContext';

import { CameraWidget } from '../components/ui/CameraWidget';

export const Locker: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="pt-8 px-4 pb-24 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-400 text-sm">Xin chào,</p>
          <h1 className="text-2xl font-bold text-white">{user?.username}</h1>
        </div>
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl font-bold text-black shadow-lg">
          {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>


      {/* Embedded Camera */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Chụp hóa đơn mới</h3>
        <CameraWidget />
      </div>

      {/* Recent Transactions Placeholder */}
      <div>
        <div className="flex justify-between items-center mb-4 mt-6">
          <h3 className="text-lg font-bold text-white">Giao dịch gần đây</h3>
          <button className="text-sm font-medium text-gray-400 hover:text-white">Xem tất cả</button>
        </div>
        <div className="glassmorphism rounded-2xl p-6 text-center text-gray-400">
          Chưa có giao dịch nào được ghi nhận.
        </div>
      </div>
    </div>
  );
};
