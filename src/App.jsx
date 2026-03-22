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

// Components
import Sidebar from './components/Sidebar';
import CreatePost from './components/CreatePost';

const ProtectedLayout = ({ children }) => {
  const { session, loading } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleOpen = () => setIsCreateOpen(true);
    window.addEventListener('open-create-post', handleOpen);
    return () => window.removeEventListener('open-create-post', handleOpen);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!session) return <Navigate to="/login" replace />;
  
  return (
    <div className="flex bg-black min-h-screen overflow-x-hidden relative">
      <div className="ambient-blob pointer-events-none fixed top-[-20%] right-[-10%] w-[50vw] h-[50vh] bg-purple-900/10 blur-[150px] rounded-full z-0"></div>
      <div className="ambient-blob pointer-events-none fixed bottom-[-20%] left-[-10%] w-[50vw] h-[50vh] bg-accent/10 blur-[150px] rounded-full z-0"></div>
      
      <Sidebar onCreateClick={() => setIsCreateOpen(true)} />
      
      <main className="main-wrapper flex-grow relative z-10 w-full overflow-y-auto no-scrollbar scrollbar-hide">
         <AnimatePresence mode="wait">
            <motion.div 
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
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
            onRefresh={() => window.location.reload()} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const AppRoutes = () => {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      {/* PUBLIC ROUTES */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* PROTECTED ROUTES */}
      <Route path="/" element={<ProtectedLayout><Home /></ProtectedLayout>} />
      <Route path="/reels" element={<ProtectedLayout><Reels /></ProtectedLayout>} />
      <Route path="/messages" element={<ProtectedLayout><Messages /></ProtectedLayout>} />
      <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
      
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
