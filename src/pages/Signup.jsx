import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Instagram, Eye, EyeOff, Loader2 } from 'lucide-react';

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
      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username,
          full_name: fullName,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }
      
      alert("Registration successful! Check your email for confirmation (if enabled).");
      navigate('/login');
    }
  };

  return (
    <div className="auth-wrapper bg-black">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="auth-card glass"
      >
        <div className="auth-header">
           <div className="flex justify-center mb-6">
            <Instagram size={56} className="gradient-text gradient-insta border-1 rounded-2xl" strokeWidth={1} />
          </div>
          <h1 className="auth-logo gradient-text">NEXUS</h1>
          <p className="text-muted text-sm fs-5">Join the Elite Community</p>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-3">
          <input 
            type="email" 
            placeholder="Email address" 
            className="premium-input w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="text" 
            placeholder="Full Name" 
            className="premium-input w-full"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input 
            type="text" 
            placeholder="Username" 
            className="premium-input w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <div className="relative">
            <input 
              type={showPass ? 'text' : 'password'} 
              placeholder="Create Password" 
              className="premium-input w-full"
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
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign Up'}
          </button>
        </form>

        <div className="text-center text-sm mt-8 border-t border-white/5 pt-6">
          <span className="text-muted">Already have an account? </span>
          <Link to="/login" className="text-white fw-bold hover:underline no-underline decoration-white">Sign In</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
