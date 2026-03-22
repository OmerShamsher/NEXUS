import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Instagram, Eye, EyeOff, Loader2 } from 'lucide-react';

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
    <div className="auth-wrapper bg-black">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="auth-card glass relative overflow-hidden"
      >
        <div className="auth-header text-center">
          <div className="flex justify-center mb-6">
            <Instagram size={56} className="gradient-text gradient-insta" strokeWidth={1.5} />
          </div>
          <h1 className="auth-logo gradient-text">NEXUS</h1>
          <p className="text-muted text-sm fs-5">Premium Social Experience</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input 
            type="email" 
            placeholder="Phone number, username, or email" 
            className="premium-input w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="relative">
            <input 
              type={showPass ? 'text' : 'password'} 
              placeholder="Password" 
              className="premium-input w-full pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button" 
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted border-0 bg-transparent p-0"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="text-red-500 text-xs text-center fw-bold">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="premium-btn w-full mt-4 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
          </button>
        </form>

        <div className="flex items-center gap-4 my-8 text-muted">
          <div className="h-px bg-white/10 flex-grow"></div>
          <span className="text-xs fw-bold">OR</span>
          <div className="h-px bg-white/10 flex-grow"></div>
        </div>

        <div className="text-center text-sm">
          <span className="text-muted">Don't have an account? </span>
          <Link to="/signup" className="text-white fw-bold hover:underline no-underline decoration-white">Sign Up</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
