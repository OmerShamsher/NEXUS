import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Hexagon, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          full_name: fullName
        }
      }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      alert("Registration successful! Welcome to the nexus.");
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden select-none py-10">
      {/* Background Orbs */}
      <div className="absolute top-[0%] left-[-20%] w-[60vw] h-[60vw] bg-white opacity-[0.02] blur-[140px] rounded-full mix-blend-screen animate-pulse pointer-events-none" style={{ animationDuration: '10s' }}></div>
      <div className="absolute bottom-[0%] right-[-20%] w-[60vw] h-[60vw] bg-zinc-700 opacity-[0.04] blur-[160px] rounded-full mix-blend-screen pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] z-10 p-8 sm:p-12 rounded-[2rem] border border-white/[0.08] backdrop-blur-3xl bg-black/40 shadow-2xl relative"
      >
        <div className="absolute inset-0 rounded-[2rem] border border-white/[0.02] pointer-events-none"></div>
        
        <div className="mb-10 text-center flex flex-col items-center">
          <motion.div 
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2, type: 'spring' }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-bl from-zinc-800 to-black border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(255,255,255,0.05)]"
          >
             <Hexagon size={32} className="text-white fill-white/10" strokeWidth={1} />
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Join Nexus.</h1>
          <p className="text-zinc-500 text-sm font-medium tracking-wide">Shape the future of digital identity.</p>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input 
            type="email" 
            placeholder="Email Address" 
            className="w-full bg-zinc-900/50 border border-white/5 focus:border-white/20 rounded-xl px-5 py-4 text-white text-sm outline-none transition-all duration-300 placeholder:text-zinc-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="text" 
            placeholder="Full Name" 
            className="w-full bg-zinc-900/50 border border-white/5 focus:border-white/20 rounded-xl px-5 py-4 text-white text-sm outline-none transition-all duration-300 placeholder:text-zinc-600"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input 
            type="text" 
            placeholder="Unique Username" 
            className="w-full bg-zinc-900/50 border border-white/5 focus:border-white/20 rounded-xl px-5 py-4 text-white text-sm outline-none transition-all duration-300 placeholder:text-zinc-600"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <div className="relative group">
            <input 
              type={showPass ? 'text' : 'password'} 
              placeholder="Secure Password" 
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
            className="group w-full mt-4 bg-white text-black font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (
               <>Create Account <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-8">
          <span className="text-zinc-500 text-xs font-medium tracking-wide">ALREADY INITIATED? </span>
          <Link to="/login" className="text-white text-xs font-bold tracking-wide hover:underline decoration-white/30 underline-offset-4 ml-1">SIGN IN</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
