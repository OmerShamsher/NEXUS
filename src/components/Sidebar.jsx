import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Compass, 
  Video, 
  MessageCircle, 
  Heart, 
  PlusSquare, 
  User, 
  Settings,
  Bookmark,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Sidebar = ({ onCreateClick, theme, toggleTheme }) => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  
  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Explore', icon: Compass, path: '/explore' },
    { name: 'Reels', icon: Video, path: '/reels' },
    { name: 'Messages', icon: MessageCircle, path: '/messages' },
    { name: 'Notifications', icon: Heart, path: '/notifications' },
    { name: 'Saved', icon: Bookmark, path: '/saved' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="w-[280px] h-screen fixed left-0 top-0 border-r border-border bg-sidebar flex flex-col p-8 z-50">
      {/* Profile Section */}
      <div 
        className="flex items-center gap-4 mb-10 cursor-pointer group hover:opacity-80 transition-all"
        onClick={() => navigate('/profile')}
      >
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-border p-0.5">
           <img 
             src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username}`} 
             alt="User Avatar" 
             className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform duration-500" 
           />
        </div>
        <div className="flex flex-col overflow-hidden">
           <span className="font-extrabold text-[15px] text-text-main truncate">{profile?.full_name || profile?.username}</span>
           <span className="text-text-secondary text-[12px] font-medium truncate">@{profile?.username}</span>
        </div>
      </div>

      <nav className="flex-grow flex flex-col gap-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            className={({ isActive }) => 
              `sidebar-link group ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="transition-transform group-hover:scale-110" strokeWidth={2.5} />
            <span>{item.name}</span>
          </NavLink>
        ))}
        
        <button 
          onClick={onCreateClick} 
          className="premium-btn w-full mt-6 flex items-center justify-center gap-3 py-4 rounded-2xl"
        >
          <PlusSquare size={20} />
          <span className="font-black text-[14px] uppercase tracking-wider">Create</span>
        </button>
      </nav>

      <div className="mt-6 border-t border-border-soft pt-6 flex flex-col gap-2">
         <button 
           onClick={toggleTheme} 
           className="sidebar-link border-0 w-full text-left bg-transparent cursor-pointer"
         >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
         </button>

         <button 
           onClick={signOut} 
           className="sidebar-link border-0 w-full text-left bg-transparent cursor-pointer text-red-500 hover:bg-red-50"
         >
            <LogOut size={20} />
            <span>Logout</span>
         </button>
      </div>
    </aside>
  );
};

export default Sidebar;

