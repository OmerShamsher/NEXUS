import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Hexagon, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden select-none">
      {/* Ultra-Premium Ambient Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-white opacity-[0.03] blur-[120px] rounded-full mix-blend-screen animate-pulse pointer-events-none" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-zinc-600 opacity-[0.05] blur-[150px] rounded-full mix-blend-screen pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] z-10 p-8 sm:p-12 rounded-[2rem] border border-white/[0.08] backdrop-blur-3xl bg-black/40 shadow-2xl relative"
      >
        <div className="absolute inset-0 rounded-[2rem] border border-white/[0.02] pointer-events-none"></div>
        
        <div className="mb-10 text-center flex flex-col items-center">
          <motion.div 
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2, type: 'spring' }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
          >
             <Hexagon size={32} className="text-white fill-white/10" strokeWidth={1} />
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Welcome Back.</h1>
          <p className="text-zinc-500 text-sm font-medium tracking-wide">Enter your credentials to access the nexus.</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="relative group">
            <input 
              type="email" 
              placeholder="Email address" 
              className="w-full bg-zinc-900/50 border border-white/5 focus:border-white/20 rounded-xl px-5 py-4 text-white text-sm outline-none transition-all duration-300 placeholder:text-zinc-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="relative group">
            <input 
              type={showPass ? 'text' : 'password'} 
              placeholder="Password" 
              className="w-full bg-zinc-900/50 border border-white/5 focus:border-white/20 rounded-xl px-5 py-4 text-white text-sm outline-none transition-all duration-300 placeholder:text-zinc-600 pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button" 
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors border-0 bg-transparent p-1 cursor-pointer"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-red-400 text-xs text-center font-bold bg-red-500/10 py-2 rounded-lg border border-red-500/20"
            >
              {error}
            </motion.p>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="group w-full mt-2 bg-white text-black font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (
               <>Login securely <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-8">
          <span className="text-zinc-500 text-xs font-medium tracking-wide">NEW TO NEXUS? </span>
          <Link to="/signup" className="text-white text-xs font-bold tracking-wide hover:underline decoration-white/30 underline-offset-4 ml-1">CREATE ACCOUNT</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
