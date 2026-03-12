import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <FileText size={20} />, label: 'Daily Reports', path: '/reports' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="h-screen w-64 bg-white border-r border-slate-200 flex flex-col p-6 shadow-sm sticky top-0 shrink-0">
      {/* Branding */}
      <div className="flex items-center gap-3 mb-12 px-2 text-blue-600">
        <ShieldCheck size={28} fill="currentColor" fillOpacity={0.2} />
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">FatigueGuard AI</h1>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <NavLink 
            key={item.label} 
            to={item.path}
            className={({ isActive }) => `
              w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-semibold
              ${isActive 
                ? 'bg-blue-50 text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}
            `}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-slate-100 pt-6 mb-2">
        <div className="flex items-center gap-3 px-4 py-2 mb-2">
          {/* Avatar with User's Initial */}
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold uppercase shadow-inner shrink-0">
            {user?.username?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-slate-800 truncate">
              {user?.username || user?.email?.split('@')[0] || 'Member'}
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-green-500 font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Active
            </span>
          </div>
        </div>
        
        {/* Logout Button */}
        <button 
          onClick={() => {
            if(window.confirm("Are you sure you want to sign out?")) {
              logout();
            }
          }}
          className="w-full mt-2 flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-semibold group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
