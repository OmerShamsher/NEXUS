import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Search as SearchIcon, Loader2, X, CheckCircle, TrendingUp, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();
  const [following, setFollowing] = useState(() => new Set());
  const [toggleLoadingId, setToggleLoadingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchFollowingForResults = async () => {
      if (!session?.user || results.length === 0) {
        setFollowing(new Set());
        return;
      }
      const ids = results.map((r) => r.id);
      try {
        const { data, error } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', session.user.id)
          .in('following_id', ids);
        if (error) throw error;
        setFollowing(new Set((data || []).map((f) => f.following_id)));
      } catch (err) {
        console.error('Error fetching follow state:', err);
      }
    };
    fetchFollowingForResults();
  }, [results, session?.user?.id]);

  const handleToggleFollow = async (e, targetUserId) => {
    e.stopPropagation();
    if (!session?.user || toggleLoadingId) return;
    setToggleLoadingId(targetUserId);

    const isCurrentlyFollowing = following.has(targetUserId);
    const next = !isCurrentlyFollowing;
    
    setFollowing((prev) => {
      const n = new Set(prev);
      if (next) n.add(targetUserId);
      else n.delete(targetUserId);
      return n;
    });

    try {
      if (next) await supabase.from('follows').insert({ follower_id: session.user.id, following_id: targetUserId });
      else await supabase.from('follows').delete().eq('follower_id', session.user.id).eq('following_id', targetUserId);
    } catch (err) {
      setFollowing((prev) => {
        const n = new Set(prev);
        if (next) n.delete(targetUserId);
        else n.add(targetUserId);
        return n;
      });
    } finally {
      setToggleLoadingId(null);
    }
  };

  return (
    <div className="max-w-[700px] mx-auto py-12 px-6 pb-24">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter mb-8 uppercase text-white">Discovery</h1>
        <div className="relative group">
          <div className="absolute inset-[-2px] bg-gradient-neon rounded-3xl blur-[10px] opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
          <div className="relative glass rounded-[24px] overflow-hidden border border-white/10 flex items-center h-16 px-6 focus-within:border-accent/50 transition-all">
            <SearchIcon className="text-muted group-focus-within:text-accent transition-colors" size={22} />
            <input 
              type="text" 
              placeholder="Deep search NEXUS elite..." 
              className="bg-transparent border-none outline-none w-full h-full text-lg ps-4 text-white placeholder:text-white/20 font-medium"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <AnimatePresence>
              {query && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setQuery('')}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-xl border-0 bg-transparent text-muted cursor-pointer"
                >
                  <X size={18} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-accent" size={36} />
            <span className="text-[10px] font-black tracking-widest text-white/20 uppercase">Scanning Network...</span>
          </div>
        ) : (
          <AnimatePresence>
            <div className="flex flex-col gap-3">
              {results.map((user, i) => (
                <motion.div 
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/profile/${user.id}`)}
                  className="glass flex items-center justify-between p-5 px-6 rounded-[28px] border-white/5 hover:border-white/20 transition-all group cursor-pointer hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-neon rounded-full blur-[8px] opacity-0 group-hover:opacity-40 transition-opacity"></div>
                      <div className="relative w-14 h-14 p-0.5 bg-gradient-insta rounded-full">
                         <div className="w-full h-full rounded-full border-[3px] border-[#080808] overflow-hidden bg-zinc-900">
                           <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt={user.username} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                         </div>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[15px] group-hover:text-accent transition-colors">{user.username}</span>
                        <CheckCircle size={14} className="text-accent" fill="currentColor" color="white" />
                      </div>
                      <span className="text-muted text-xs font-bold uppercase tracking-tight">{user.full_name || 'NEXUS MEMBER'}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleToggleFollow(e, user.id)}
                    disabled={toggleLoadingId === user.id}
                    className={`premium-btn py-2.5 px-6 text-[10px] tracking-widest uppercase border-0 outline-none ${
                      following.has(user.id) ? 'bg-white/5 text-white shadow-none border border-white/10' : ''
                    }`}
                  >
                    {following.has(user.id) ? 'FOLLOWING' : 'FOLLOW'}
                  </button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        {!loading && query && results.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
             <div className="text-muted font-black text-lg uppercase tracking-widest opacity-20">No matching signals found</div>
             <p className="text-muted text-xs mt-2 font-medium">Try searching for a different frequency.</p>
          </motion.div>
        )}

        {!query && !loading && (
          <div className="flex flex-col gap-12 mt-4">
             {/* Suggestions Section */}
             <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-white/[0.03] pb-4">
                   <h3 className="text-[11px] font-black tracking-[0.2em] text-white/30 uppercase m-0 flex items-center gap-2 italic">
                     <TrendingUp size={14} /> Trending Signals
                   </h3>
                   <span className="text-[10px] font-black text-accent cursor-pointer hover:underline">REFRESH</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                   {['Modernist', 'Visionary', 'Minimalist', 'Nexus_HQ', 'Elite_Club', 'Future_Now'].map((tag, i) => (
                      <div key={i} onClick={() => setQuery(tag)} className="glass p-4 rounded-2xl flex items-center gap-3 hover:bg-white/5 transition-all cursor-pointer border-white/5 group">
                         <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-accent transition-colors">#</div>
                         <span className="text-xs font-bold text-white/50 group-hover:text-white transition-colors">{tag}</span>
                      </div>
                   ))}
                </div>
             </div>

             <div className="py-20 text-center flex flex-col items-center gap-6">
                <div className="relative group">
                   <div className="absolute inset-0 bg-accent rounded-full blur-[40px] opacity-10"></div>
                   <div className="w-24 h-24 rounded-[40px] bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto relative z-10">
                      <Users size={40} className="text-white/10" strokeWidth={1} />
                   </div>
                </div>
                <div className="flex flex-col gap-2">
                   <h4 className="text-xl font-extrabold text-white tracking-tight m-0 uppercase italic">Connect the Void</h4>
                   <p className="text-muted text-xs font-medium tracking-wide max-w-[240px] mx-auto opacity-60 uppercase">Search for users and communities across the Nexus Network</p>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
