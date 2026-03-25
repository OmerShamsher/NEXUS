import React from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Compass, 
  Video, 
  Heart, 
  MessageCircle, 
  Bell,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Explore', icon: Compass, path: '/explore' },
    { name: 'Reels', icon: Video, path: '/reels' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-[72px] bg-white border-b border-border-soft flex items-center px-8 z-[100] shadow-sm">
      <div className="flex items-center justify-between w-full max-w-[1400px] mx-auto gap-4">
        
        {/* Left: Logo & Core Nav */}
        <div className="flex items-center gap-10">
           {/* Spectrum Logo */}
           <div 
             className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer overflow-hidden shadow-inner"
             style={{ background: 'conic-gradient(from 0deg, #ff4545, #ffeb3b, #4caf50, #2196f3, #9c27b0, #ff4545)' }}
             onClick={() => navigate('/')}
           >
              <div className="w-4 h-4 bg-white/20 rounded-full blur-[4px]"></div>
           </div>
           
           <nav className="hidden lg:flex items-center gap-10 h-[72px]">
              {navItems.map((item) => (
                <NavLink 
                  key={item.name}
                  to={item.path} 
                  className="h-full"
                >
                  {({ isActive }) => (
                    <div className={`
                      flex items-center gap-2.5 h-full relative text-[13px] font-black uppercase tracking-widest transition-all
                      ${isActive ? 'text-accent' : 'text-text-secondary hover:text-text-main'}
                    `}>
                      <item.icon size={19} strokeWidth={isActive ? 3 : 2} />
                      <span>{item.name}</span>
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-[3.5px] bg-accent rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.4)]"></div>
                      )}
                    </div>
                  )}
                </NavLink>
              ))}
           </nav>
        </div>

        {/* Center: Brand */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
           <span className="text-accent text-2xl font-light group-hover:scale-110 transition-transform">[</span>
           <span className="text-text-main text-2xl font-black tracking-tighter uppercase italic">myAPP</span>
           <span className="text-accent text-2xl font-light group-hover:scale-110 transition-transform">]</span>
        </div>

        {/* Right: Personal Actions */}
        <div className="flex items-center gap-6">
           <NavLink to="/notifications" className={({isActive}) => `flex items-center gap-2.5 text-[13px] font-black uppercase tracking-widest transition-all ${isActive ? 'text-accent' : 'text-text-secondary hover:text-text-main'}`}>
              <Heart size={20} strokeWidth={2} />
              <span className="hidden xl:block">Notifications</span>
           </NavLink>
           
           <NavLink to="/messages" className={({isActive}) => `flex items-center gap-2.5 text-[13px] font-black uppercase tracking-widest transition-all ${isActive ? 'text-accent' : 'text-text-secondary hover:text-text-main'}`}>
              <MessageCircle size={20} strokeWidth={2} />
              <span className="hidden xl:block">Messages</span>
           </NavLink>

           <div className="w-px h-6 bg-border mx-2"></div>

           <button className="p-2 text-text-secondary hover:text-accent transition-colors">
              <Bell size={22} />
           </button>
           
           <div 
             className="w-10 h-10 rounded-full overflow-hidden border-2 border-border-soft cursor-pointer hover:border-accent transition-colors shadow-sm ml-2"
             onClick={() => navigate('/profile')}
           >
              <img 
                src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username}`} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
           </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
