import React from 'react';
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

// components
import Sidebar from './components/Sidebar';

const ProtectedRoute = ({ children }) => {
  const { session, loading } = useAuth();
  
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
      
      <Sidebar />
      <main className="main-wrapper flex-grow relative z-10 w-full overflow-y-auto no-scrollbar scrollbar-hide">
         {children}
      </main>
    </div>
  );
};

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* PROTECTED ROUTES */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/reels" element={<ProtectedRoute><Reels /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        
        {/* FALLBACKS */}
        <Route path="/search" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
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
