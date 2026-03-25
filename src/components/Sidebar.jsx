import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Compass, 
  Video, 
  MessageCircle, 
  Heart, 
  Plus, 
  Settings,
  Bookmark,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    <aside className="w-[280px] h-screen fixed left-0 top-0 border-r border-border-soft bg-white flex flex-col p-10 z-[110]">
      {/* Profile Section */}
      <div 
        className="flex items-center gap-4 mb-12 cursor-pointer group"
        onClick={() => navigate('/profile')}
      >
        <div className="w-14 h-14 rounded-full overflow-hidden border border-border-soft shrink-0 shadow-sm">
           <img 
             src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=user`} 
             alt="User" 
             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
           />
        </div>
        <div className="flex flex-col truncate">
           <span className="font-extrabold text-[15px] text-text-main truncate">Alexandra M.</span>
           <span className="text-text-muted text-[12px] font-bold truncate">@alexandra_m</span>
        </div>
      </div>

      <nav className="flex-grow flex flex-col gap-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            className={({ isActive }) => 
              `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-[14px]
               ${isActive ? 'bg-bg-app text-text-main shadow-sm' : 'text-text-secondary hover:text-text-main hover:bg-bg-app/50'}`
            }
          >
            <item.icon size={22} strokeWidth={2.5} />
            <span>{item.name}</span>
          </NavLink>
        ))}
        
        <button 
          onClick={onCreateClick} 
          className="bg-accent text-white w-full mt-8 flex items-center justify-center gap-3 py-4 rounded-2xl border-0 cursor-pointer shadow-lg shadow-accent/20 hover:bg-accent/90 hover:scale-[1.02] transition-all"
        >
          <Plus size={22} strokeWidth={3} />
          <span className="font-black text-[14px] uppercase tracking-[0.2em]">Create</span>
        </button>
      </nav>

      <div className="mt-8 border-t border-border-soft pt-8 flex flex-col gap-2">
         <button 
           onClick={toggleTheme} 
           className="flex items-center gap-4 px-4 py-3 text-text-muted hover:text-text-main transition-colors border-0 bg-transparent cursor-pointer font-bold text-[13px]"
         >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
         </button>

         <button 
           onClick={signOut} 
           className="flex items-center gap-4 px-4 py-3 text-red-400 hover:text-red-600 transition-colors border-0 bg-transparent cursor-pointer font-bold text-[13px]"
         >
            <LogOut size={18} />
            <span>Logout</span>
         </button>
      </div>
    </aside>
  );
};

export default Sidebar;

