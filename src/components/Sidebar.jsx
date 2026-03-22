import React from 'react';
import { NavLink } from 'react-router-dom';
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

const Sidebar = () => {
  const { signOut, profile } = useAuth();
  
  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Search', icon: Search, path: '/search' },
    { name: 'Explore', icon: Compass, path: '/explore' },
    { name: 'Reels', icon: Video, path: '/reels' },
    { name: 'Messages', icon: MessageCircle, path: '/messages' },
    { name: 'Notifications', icon: Heart, path: '/notifications' },
    { name: 'Create', icon: PlusSquare, path: '/create' },
    { name: 'Profile', icon: User, path: '/profile' }
  ];

  return (
    <aside className="sidebar shadow-2xl">
      <div className="sidebar-logo flex items-center gap-3">
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
      </nav>

      <div className="mt-auto">
         <button onClick={signOut} className="nav-link border-0 w-full text-left bg-transparent cursor-pointer">
            <LogOut className="nav-icon" />
            <span className="nav-text">Logout</span>
         </button>
      </div>
    </aside>
  );
};

export default Sidebar;
