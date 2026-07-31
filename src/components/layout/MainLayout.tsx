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
    <div className="w-full h-[100dvh] overflow-hidden bg-transparent text-slate-900 relative flex flex-col">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 w-full">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 w-full z-40 bg-white/90 backdrop-blur-xl border-t border-slate-200 pb-safe">
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
                  className={`absolute -top-3 w-1.5 h-1.5 rounded-full bg-white0 transition-all duration-300 ease-out ${
                    isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                  }`}
                ></div>
                
                {/* Icon có hiệu ứng nảy lên và đổi nền */}
                <div 
                  className={`p-2 rounded-2xl transition-all duration-300 ease-out ${
                    isActive 
                      ? 'bg-slate-900 text-white -translate-y-1 shadow-md shadow-slate-900/30' 
                      : 'text-slate-900/50 hover:text-slate-900'
                  }`}
                >
                  <item.icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} />
                </div>

                {/* Chữ text */}
                <span 
                  className={`text-[10px] font-medium transition-all duration-300 ease-out ${
                    isActive ? 'text-slate-900 opacity-100' : 'text-slate-900/50 opacity-100'
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
