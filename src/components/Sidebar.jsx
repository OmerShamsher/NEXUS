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
    <aside className="sidebar shadow-2xl glass border-0 backdrop-blur-3xl">
      <div className="sidebar-logo flex items-center gap-3 cursor-pointer mb-8 py-2 px-3" onClick={() => navigate('/')}>
        <Instagram size={32} className="text-accent fill-current drop-shadow-lg" strokeWidth={1.5} />
        <span className="nav-text fs-3 fw-black tracking-tighter gradient-text">NEXUS</span>
      </div>

      <nav className="flex-grow flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            className={({ isActive }) => `nav-link group transition-all duration-300 ${isActive ? 'active bg-white/5' : 'opacity-60 hover:opacity-100 hover:bg-white/5'}`}
          >
            <item.icon className={`nav-icon group-hover:scale-110 transition-transform ${item.path === '/search' ? 'animate-pulse' : ''}`} />
            <span className="nav-text text-sm fw-bold tracking-tight">{item.name}</span>
          </NavLink>
        ))}
        
        <button 
          onClick={onCreateClick} 
          className="nav-link border-0 w-full text-left bg-transparent cursor-pointer group opacity-60 hover:opacity-100 hover:bg-white/5 transition-all"
        >
          <PlusSquare className="nav-icon group-hover:scale-110 transition-transform" />
          <span className="nav-text text-sm fw-bold tracking-tight">Create</span>
        </button>

        <NavLink 
          to="/profile" 
          className={({ isActive }) => `nav-link group transition-all duration-300 ${isActive ? 'active bg-white/5' : 'opacity-60 hover:opacity-100 hover:bg-white/5'}`}
        >
          <User className="nav-icon group-hover:scale-110 transition-transform" />
          <span className="nav-text text-sm fw-bold tracking-tight">Profile</span>
        </NavLink>
      </nav>

      <div className="mt-auto border-t border-white/5 pt-4 flex flex-col gap-1">
         <button 
           onClick={toggleTheme} 
           className="nav-link border-0 w-full text-left bg-transparent cursor-pointer group opacity-60 hover:opacity-100 hover:bg-white/5 transition-all"
         >
            {theme === 'dark' ? <Sun size={22} className="nav-icon" /> : <Moon size={22} className="nav-icon" />}
            <span className="nav-text text-sm fw-bold">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
         </button>

         <button onClick={signOut} className="nav-link border-0 w-full text-left bg-transparent cursor-pointer group opacity-60 hover:opacity-100 hover:bg-white/5 transition-all">
            <LogOut size={22} className="nav-icon text-muted group-hover:text-red-500 transition-colors" />
            <span className="nav-text text-sm fw-bold">Logout</span>
         </button>
      </div>
    </aside>
  );
};

export default Sidebar;
