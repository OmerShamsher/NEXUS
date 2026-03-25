import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
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

  return (
    <header className="fixed top-0 left-0 right-0 h-[80px] bg-navbar border-b border-border-soft flex items-center px-8 z-[60] glass">
      <div className="flex items-center gap-12 w-full max-w-[1400px] mx-auto">
        {/* Left: Search & Navigation */}
        <div className="flex items-center gap-10 flex-1">
           <div 
             className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center cursor-pointer shadow-lg"
             onClick={() => navigate('/')}
           >
              <div className="w-5 h-5 bg-white rounded-full opacity-30 blur-[2px]"></div>
           </div>
           
           <nav className="hidden lg:flex items-center gap-8">
              <NavLink to="/" className={({isActive}) => `flex items-center gap-2 text-[14px] font-black uppercase tracking-widest ${isActive ? 'text-accent' : 'text-text-secondary hover:text-text-main'} transition-colors`}>
                <Home size={18} /> Home
              </NavLink>
              <NavLink to="/explore" className={({isActive}) => `flex items-center gap-2 text-[14px] font-black uppercase tracking-widest ${isActive ? 'text-accent' : 'text-text-secondary hover:text-text-main'} transition-colors`}>
                <Compass size={18} /> Explore
              </NavLink>
              <NavLink to="/reels" className={({isActive}) => `flex items-center gap-2 text-[14px] font-black uppercase tracking-widest ${isActive ? 'text-accent' : 'text-text-secondary hover:text-text-main'} transition-colors`}>
                <Video size={18} /> Reels
              </NavLink>
           </nav>
        </div>

        {/* Center: App Identity */}
        <div className="flex-1 flex justify-center">
           <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <span className="text-text-muted text-xl font-light">[</span>
              <span className="text-text-main text-2xl font-black tracking-tighter uppercase italic">myAPP</span>
              <span className="text-text-muted text-xl font-light">]</span>
           </div>
        </div>

        {/* Right: Actions */}
        <div className="flex-1 flex items-center justify-end gap-6">
           <div className="hidden md:flex relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-bg-app border-none rounded-full py-2.5 ps-11 pe-6 text-sm w-[200px] focus:w-[260px] transition-all outline-none"
              />
           </div>

           <div className="flex items-center gap-4">
              <button onClick={() => navigate('/notifications')} className="p-2 text-text-secondary hover:text-accent transition-colors relative">
                 <Heart size={22} />
                 <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-navbar"></div>
              </button>
              <button onClick={() => navigate('/messages')} className="p-2 text-text-secondary hover:text-accent transition-colors">
                 <MessageCircle size={22} />
              </button>
              <button className="p-2 text-text-secondary hover:text-accent transition-colors">
                 <Bell size={22} />
              </button>
              
              <div 
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-border-soft cursor-pointer hover:border-accent transition-colors ml-2"
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
      </div>
    </header>
  );
};

export default Navbar;
