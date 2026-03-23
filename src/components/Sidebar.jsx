import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Search as SearchIcon, 
  Compass, 
  Video, 
  MessageCircle, 
  Heart, 
  PlusSquare, 
  User, 
  LogOut,
  Instagram,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Sidebar = ({ onCreateClick, theme, toggleTheme }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Search', icon: SearchIcon, path: '/search' },
    { name: 'Explore', icon: Compass, path: '/explore' },
    { name: 'Reels', icon: Video, path: '/reels' },
    { name: 'Messages', icon: MessageCircle, path: '/messages' },
    { name: 'Notifications', icon: Heart, path: '/notifications' },
  ];

  return (
    <aside className="sidebar glass border-0 flex-shrink-0">
      <div 
        className="sidebar-logo flex items-center gap-3 cursor-pointer group transition-all duration-500 mb-12 hover:scale-[1.02]" 
        onClick={() => navigate('/')}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-accent rounded-xl blur-[10px] opacity-0 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative w-12 h-12 bg-gradient-neon rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-500">
             <Instagram size={30} strokeWidth={1.5} />
          </div>
        </div>
        <span className="nav-text fs-2 font-black tracking-tighter gradient-text group-hover:tracking-normal transition-all duration-700">NEXUS</span>
      </div>

      <nav className="flex-grow flex flex-col gap-2 overflow-y-auto no-scrollbar">
        {navItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            className={({ isActive }) => 
              `nav-link group relative ${isActive ? 'active' : 'opacity-70 hover:opacity-100'}`
            }
          >
            <item.icon className="nav-icon relative z-10 group-hover:scale-110 transition-transform duration-300" />
            <span className="nav-text text-[15px] font-bold tracking-tight relative z-10">{item.name}</span>
            {/* Active Glow Indicator */}
            <NavLink 
              to={item.path}
              className={({ isActive }) => 
                isActive ? "absolute left-0 w-1.5 h-1/2 bg-accent rounded-r-full shadow-[0_0_15px_rgba(255,0,85,0.6)]" : "hidden"
              }
            />
          </NavLink>
        ))}
        
        <button 
          onClick={onCreateClick} 
          className="nav-link border-0 w-full text-left bg-transparent cursor-pointer group opacity-70 hover:opacity-100"
        >
          <div className="relative">
             <div className="absolute inset-0 bg-accent rounded-full blur-[8px] opacity-0 group-hover:opacity-40 transition-opacity"></div>
             <PlusSquare className="nav-icon relative z-10 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="nav-text text-[15px] font-bold tracking-tight">Create</span>
        </button>

        <NavLink 
          to="/profile" 
          className={({ isActive }) => 
            `nav-link group ${isActive ? 'active' : 'opacity-70 hover:opacity-100'}`
          }
        >
          <User className="nav-icon group-hover:scale-110 transition-transform duration-300" />
          <span className="nav-text text-[15px] font-bold tracking-tight">Profile</span>
        </NavLink>
      </nav>

      <div className="mt-auto border-t border-white/[0.03] pt-6 flex flex-col gap-2">
         <button 
           onClick={toggleTheme} 
           className="nav-link border-0 w-full text-left bg-transparent cursor-pointer group opacity-70 hover:opacity-100 hover:bg-white/5"
         >
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center group-hover:bg-accent/10 transition-colors">
               {theme === 'dark' ? <Sun size={22} className="text-white" /> : <Moon size={22} className="text-zinc-900" />}
            </div>
            <span className="nav-text text-[14px] font-bold">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
         </button>

         <button 
           onClick={signOut} 
           className="nav-link border-0 w-full text-left bg-transparent cursor-pointer group opacity-50 hover:opacity-100 hover:text-red-500 hover:bg-red-500/5 transition-all"
         >
            <div className="w-10 h-10 flex items-center justify-center">
               <LogOut size={22} className="group-hover:scale-110 transition-transform" />
            </div>
            <span className="nav-text text-[14px] font-bold">Logout</span>
         </button>
      </div>
    </aside>
  );
};

export default Sidebar;
