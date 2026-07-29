import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { History, PieChart, Camera, Target, User } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { name: 'History', path: '/history', icon: History },
    { name: 'Analytics', path: '/analytics', icon: PieChart },
    { name: 'Locker', path: '/', icon: Camera },
    { name: 'Budget', path: '/budget', icon: Target },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="w-full min-h-screen bg-black text-white relative">
      {/* Main Content Area */}
      <main className="h-full overflow-y-auto pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 w-full z-40 bg-black/80 backdrop-blur-xl border-t border-white/10 pb-safe">
        <div className="flex justify-around items-center h-20 px-4 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className="relative flex flex-col items-center justify-center gap-1 w-16 group"
              >
                {/* Dấu chấm tròn báo hiệu tab đang active */}
                <div 
                  className={`absolute -top-3 w-1.5 h-1.5 rounded-full bg-white transition-all duration-300 ease-out ${
                    isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                  }`}
                ></div>
                
                {/* Icon có hiệu ứng nảy lên và đổi nền */}
                <div 
                  className={`p-2 rounded-2xl transition-all duration-300 ease-out ${
                    isActive 
                      ? 'bg-white/20 text-white -translate-y-1 shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <item.icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} />
                </div>

                {/* Chữ text */}
                <span 
                  className={`text-[10px] font-medium transition-all duration-300 ease-out ${
                    isActive ? 'text-white opacity-100' : 'text-gray-500 opacity-70'
                  }`}
                >
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};
