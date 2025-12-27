import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Scan, Utensils } from 'lucide-react';

const Layout = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col relative">
      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-3 px-8 flex justify-between items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {/* Home */}
        <Link to="/" className="flex flex-col items-center gap-1">
          <Home 
            size={24} 
            className={isActive('/') ? 'text-green-500' : 'text-gray-400'} 
            strokeWidth={isActive('/') ? 2.5 : 2}
          />
          <span className={`text-xs font-medium ${isActive('/') ? 'text-green-500' : 'text-gray-400'}`}>
            首页
          </span>
        </Link>

        {/* Scan (Center Button) */}
        <Link to="/upload" className="relative -top-6">
          <div className="bg-green-500 rounded-full p-4 shadow-lg hover:bg-green-600 transition-colors border-4 border-white">
            <Scan size={28} className="text-white" />
          </div>
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-400">
            拍一拍
          </span>
        </Link>

        {/* Plan / Cat (Renamed to Plan to match image, but we could link to cat) */}
        <Link to="/cat" className="flex flex-col items-center gap-1">
          <Utensils 
            size={24} 
            className={isActive('/cat') ? 'text-green-500' : 'text-gray-400'} 
            strokeWidth={isActive('/cat') ? 2.5 : 2}
          />
          <span className={`text-xs font-medium ${isActive('/cat') ? 'text-green-500' : 'text-gray-400'}`}>
            小猫
          </span>
        </Link>
      </nav>
    </div>
  );
};

export default Layout;
