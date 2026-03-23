import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Reels from './pages/Reels';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Explore from './pages/Explore';
import Notifications from './pages/Notifications';
import Saved from './pages/Saved';

// Components
import Sidebar from './components/Sidebar';
import CreatePost from './components/CreatePost';

const ProtectedLayout = ({ children, theme, toggleTheme }) => {
  const { session, loading } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleOpen = () => setIsCreateOpen(true);
    window.addEventListener('open-create-post', handleOpen);
    return () => window.removeEventListener('open-create-post', handleOpen);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-8">
      <div className="relative">
         <div className="absolute inset-0 bg-accent rounded-full blur-[40px] opacity-20 animate-pulse"></div>
         <div className="w-20 h-20 border-[3px] border-white/5 border-t-accent rounded-full animate-spin relative z-10 shadow-[0_0_20px_var(--accent-glow)]"></div>
      </div>
      <div className="flex flex-col items-center gap-2">
         <span className="text-[12px] font-black tracking-[0.4em] text-white uppercase italic">NEXUS</span>
         <span className="text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase">Syncing Reality...</span>
      </div>
    </div>
  );

  if (!session) return <Navigate to="/login" replace />;
  
  return (
    <div className="flex min-h-screen overflow-x-hidden relative transition-all duration-700 bg-background text-foreground" style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>
      {/* Premium Ambient Architecture */}
      <div className="ambient-container pointer-events-none fixed inset-0 overflow-hidden z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vh] bg-accent/5 blur-[120px] rounded-full animate-pulse transition-all duration-[3s]"></div>
          <div className="absolute bottom-[-15%] left-[-5%] w-[70vw] h-[70vh] bg-accent-secondary/5 blur-[150px] rounded-full animate-pulse transition-all duration-[4s]"></div>
          <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-white/[0.02] blur-[100px] rounded-full"></div>
      </div>
      
      <Sidebar onCreateClick={() => setIsCreateOpen(true)} theme={theme} toggleTheme={toggleTheme} />
      
      <main className="main-wrapper flex-grow relative z-10 w-full overflow-y-auto no-scrollbar scrollbar-hide">
         <AnimatePresence mode="wait">
            <motion.div 
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.99, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.01, filter: 'blur(10px)' }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="h-full"
            >
              {children}
            </motion.div>
         </AnimatePresence>
      </main>

      <AnimatePresence>
        {isCreateOpen && (
          <CreatePost 
            isOpen={isCreateOpen} 
            onClose={() => setIsCreateOpen(false)} 
            onRefresh={() => {
              // Smooth refresh or state update
              setIsCreateOpen(false);
              // Trigger a custom event for Home.jsx to refresh feed
              window.dispatchEvent(new CustomEvent('refresh-feed'));
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const AppRoutes = () => {
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem('nexus-theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.className = theme === 'dark' ? 'dark-mode' : 'light-mode';
    localStorage.setItem('nexus-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <Routes location={location} key="nexus-root-routes">
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/" element={<ProtectedLayout theme={theme} toggleTheme={toggleTheme}><Home /></ProtectedLayout>} />
      <Route path="/search" element={<ProtectedLayout theme={theme} toggleTheme={toggleTheme}><Search /></ProtectedLayout>} />
      <Route path="/explore" element={<ProtectedLayout theme={theme} toggleTheme={toggleTheme}><Explore /></ProtectedLayout>} />
      <Route path="/reels" element={<ProtectedLayout theme={theme} toggleTheme={toggleTheme}><Reels /></ProtectedLayout>} />
      <Route path="/messages" element={<ProtectedLayout theme={theme} toggleTheme={toggleTheme}><Messages /></ProtectedLayout>} />
      <Route path="/notifications" element={<ProtectedLayout theme={theme} toggleTheme={toggleTheme}><Notifications /></ProtectedLayout>} />
      <Route path="/saved" element={<ProtectedLayout theme={theme} toggleTheme={toggleTheme}><Saved /></ProtectedLayout>} />
      <Route path="/profile" element={<ProtectedLayout theme={theme} toggleTheme={toggleTheme}><Profile /></ProtectedLayout>} />
      <Route path="/profile/:id" element={<ProtectedLayout theme={theme} toggleTheme={toggleTheme}><Profile /></ProtectedLayout>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
