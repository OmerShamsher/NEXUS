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
import Navbar from './components/Navbar';

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
    <div className="min-h-screen bg-bg-app flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xl font-black text-text-main tracking-widest uppercase italic uppercase italic tracking-widest text-[#3772ff]">NEXUS</span>
    </div>
  );

  if (!session) return <Navigate to="/login" replace />;
  
  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg-app">
      <Navbar />
      <Sidebar onCreateClick={() => setIsCreateOpen(true)} theme={theme} toggleTheme={toggleTheme} />
      
      <main className="content-wrapper flex-grow relative z-10 w-full overflow-y-auto no-scrollbar scroll-smooth">
         <div className="ml-[280px] w-full">
            <AnimatePresence mode="wait">
               <motion.div 
                 key={location.pathname}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.99 }}
                 transition={{ duration: 0.4, ease: "easeOut" }}
                 className="p-8 pb-32"
               >
                 {children}
               </motion.div>
            </AnimatePresence>
         </div>
      </main>

      <AnimatePresence>
        {isCreateOpen && (
          <CreatePost 
            isOpen={isCreateOpen} 
            onClose={() => setIsCreateOpen(false)} 
            onRefresh={() => {
              setIsCreateOpen(false);
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
