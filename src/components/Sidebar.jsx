import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Compass, 
  Video, 
  MessageCircle, 
  Heart, 
  PlusSquare, 
  User, 
  LogOut,
  Instagram
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ onCreateClick }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Search', icon: Search, path: '/search' },
    { name: 'Explore', icon: Compass, path: '/explore' },
    { name: 'Reels', icon: Video, path: '/reels' },
    { name: 'Messages', icon: MessageCircle, path: '/messages' },
    { name: 'Notifications', icon: Heart, path: '/notifications' },
  ];

  return (
    <aside className="sidebar shadow-2xl">
      <div className="sidebar-logo flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        <Instagram size={28} className="text-white fill-current" />
        <span className="nav-text fs-4 fw-black tracking-tighter">NEXUS</span>
      </div>

      <nav className="flex-grow">
        {navItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <item.icon className="nav-icon" />
            <span className="nav-text">{item.name}</span>
          </NavLink>
        ))}
        
        <button 
          onClick={onCreateClick} 
          className="nav-link border-0 w-full text-left bg-transparent cursor-pointer"
        >
          <PlusSquare className="nav-icon" />
          <span className="nav-text">Create</span>
        </button>

        <NavLink 
          to="/profile" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <User className="nav-icon" />
          <span className="nav-text">Profile</span>
        </NavLink>
      </nav>

      <div className="mt-auto">
         <button onClick={signOut} className="nav-link border-0 w-full text-left bg-transparent cursor-pointer group">
            <LogOut className="nav-icon text-muted group-hover:text-red-500 transition-colors" />
            <span className="nav-text">Logout</span>
         </button>
      </div>
    </aside>
  );
};

export default Sidebar;
