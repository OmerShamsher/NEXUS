import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Fingerprint, Eye, EyeOff, Loader2, ArrowRight, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden select-none px-6">
      {/* Nexus Core Architecture - Ambient Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-accent/5 blur-[150px] rounded-full animate-pulse transition-all duration-[5s]"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-accent-secondary/5 blur-[150px] rounded-full animate-pulse transition-all duration-[8s]" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[30%] left-[20%] w-64 h-64 bg-white/5 blur-[100px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-[480px] z-10 glass rounded-[40px] p-10 md:p-14 border-white/[0.08] relative overflow-hidden bg-black/40 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
      >
        {/* Glow effect inside card */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"></div>
        
        <div className="mb-14 text-center flex flex-col items-center relative z-10">
          <motion.div 
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: "circOut" }}
            className="relative group mb-8"
          >
             <div className="absolute inset-[-15px] bg-accent/20 rounded-full blur-[20px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className="w-20 h-20 rounded-[24px] bg-gradient-neon flex items-center justify-center text-white shadow-[0_0_30px_var(--accent-glow)] relative z-10">
                <Fingerprint size={36} strokeWidth={1.5} />
             </div>
          </motion.div>
          <div className="flex flex-col gap-1">
             <h1 className="text-4xl font-black text-white tracking-tighter m-0 uppercase italic">Initiate Nexus</h1>
             <span className="text-[10px] font-black tracking-[0.4em] text-accent uppercase">Verified Access Point</span>
          </div>
          <p className="text-white/30 text-xs font-bold tracking-wide mt-6 uppercase">Authorize your session to re-enter the network.</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6 relative z-10">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-white/20 tracking-widest uppercase ml-4">Terminal ID</span>
            <input 
              type="email" 
              placeholder="Email / Nexus Handle" 
              className="w-full bg-white/5 border border-white/10 focus:border-accent/50 rounded-2xl px-6 py-4.5 text-white text-sm outline-none transition-all duration-500 placeholder:text-white/10 font-bold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-white/20 tracking-widest uppercase ml-4">Access Code</span>
            <div className="relative group">
              <input 
                type={showPass ? 'text' : 'password'} 
                placeholder="Secure Keyphrase" 
                className="w-full bg-white/5 border border-white/10 focus:border-accent/50 rounded-2xl px-6 py-4.5 text-white text-sm outline-none transition-all duration-500 placeholder:text-white/10 pr-14 font-bold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPass(!showPass)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors border-0 bg-transparent p-1 cursor-pointer"
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
             <span className="text-[10px] font-black text-white/20 hover:text-accent cursor-pointer transition-colors tracking-widest uppercase">Encryption Recovery?</span>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="text-red-400 text-[11px] font-black tracking-widest uppercase bg-red-500/10 py-3 rounded-xl border border-red-500/20 text-center flex items-center justify-center gap-2"
            >
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              {error}
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="premium-btn w-full mt-4 py-5 text-xs font-black tracking-[0.3em] uppercase group flex items-center justify-center gap-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} strokeWidth={3} /> : (
               <>AUTHORIZE OPS <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" /></>
            )}
          </button>
        </form>

        <div className="mt-12 text-center border-t border-white/[0.05] pt-10 relative z-10">
          <div className="flex flex-col items-center gap-4">
             <span className="text-white/20 text-[10px] font-black tracking-[0.2em] uppercase">NO SIGNAL RECORDED?</span>
             <Link to="/signup" className="text-white text-[11px] font-black tracking-[0.3em] uppercase hover:text-accent transition-colors flex items-center gap-2 group">
                INJECT IDENTITY <Sparkles size={14} className="group-hover:rotate-45 transition-transform" />
             </Link>
          </div>
        </div>
      </motion.div>
      
      {/* Branding Footer */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center pointer-events-none opacity-20">
         <span className="text-[12px] font-black tracking-[1em] text-white uppercase italic">NEXUS ELITE</span>
      </div>
    </div>
  );
};

export default Login;
