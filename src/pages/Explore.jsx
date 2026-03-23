import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Loader2, Heart, MessageCircle, Play, TrendingUp, Flame, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Explore = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  const fetchExplore = async () => {
    try {
      setLoading(true);

      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          id,
          content_url,
          caption,
          type,
          user_id,
          profiles:user_id (username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(60);

      if (error) throw error;

      const postIds = (postsData || []).map((p) => p.id);
      if (postIds.length === 0) {
        setPosts([]);
        return;
      }

      // We still map over likes for ranking (mocking trending algorithm)
      const { data: likesData, error: likesErr } = await supabase
        .from('likes')
        .select('post_id')
        .in('post_id', postIds);

      if (likesErr) throw likesErr;

      const counts = new Map();
      (likesData || []).forEach((l) => {
        counts.set(l.post_id, (counts.get(l.post_id) || 0) + 1);
      });

      const ranked = (postsData || []).map((p) => ({
        id: p.id,
        postId: p.id,
        userId: p.user_id,
        username: p.profiles?.username || 'Nexus Member',
        avatar: p.profiles?.avatar_url,
        contentUrl: p.content_url,
        type: p.type,
        likesCount: counts.get(p.id) || 0,
        // Give videos a 2x weight, or random weight just for UI testing layout
        weight: (counts.get(p.id) || 0) + (p.type === 'video' ? 5 : 0) + Math.random() * 2
      }));

      // Sort by assigned weight to make it dynamic
      ranked.sort((a, b) => b.weight - a.weight);
      setPosts(ranked);
    } catch (err) {
      console.error('Explore fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session?.user) return;
    fetchExplore();
  }, [session?.user?.id]);

  // Generate an asymmetric grid layout dynamically based on index
  const getSpanClass = (index) => {
    // pattern: make every 5th item large (row span 2, col span 2)
    if (index % 10 === 0) return "col-span-2 row-span-2";
    if (index % 7 === 0) return "col-span-1 row-span-2";
    return "col-span-1 row-span-1";
  };

  return (
    <div className="max-w-[1200px] mx-auto py-12 px-2 sm:px-6 lg:px-8 pb-24 relative min-h-screen">
      
      {/* Ambient background for explore */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 blur-[120px] rounded-full pointer-events-none"></div>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 px-2">
        <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase text-white flex items-center gap-4">
           <div className="w-12 h-12 rounded-[18px] bg-white/5 border border-white/10 flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <Compass size={28} strokeWidth={1.5} />
           </div>
           Explore
        </h1>
        <div className="flex flex-wrap items-center gap-3">
           <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent/20 to-transparent border border-accent/20 rounded-full text-accent text-[11px] font-black tracking-widest uppercase cursor-pointer hover:bg-accent/30 transition-colors">
              <Flame size={14} /> Trending Global
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-full text-white/50 text-[11px] font-black tracking-widest uppercase cursor-pointer hover:text-white hover:bg-white/10 transition-colors">
              <TrendingUp size={14} /> For You
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-full text-white/50 text-[11px] font-black tracking-widest uppercase cursor-pointer hover:text-white hover:bg-white/10 transition-colors">
              <Play size={14} /> Reels Only
           </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
           <div className="relative">
              <div className="absolute inset-0 bg-accent rounded-full blur-[30px] opacity-20 animate-pulse"></div>
              <Compass size={48} className="text-accent animate-spin" style={{ animationDuration: '3s' }} strokeWidth={1} />
           </div>
           <span className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase">Discovering Signals...</span>
        </div>
      ) : posts.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-center gap-6">
          <div className="relative group">
             <div className="absolute inset-0 bg-white/10 rounded-full blur-[40px] opacity-10"></div>
             <div className="w-24 h-24 rounded-[40px] bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto relative z-10 glass">
                <Compass size={40} className="text-white/20" strokeWidth={1} />
             </div>
          </div>
          <div className="flex flex-col gap-2">
             <h2 className="font-extrabold text-2xl text-white tracking-tight uppercase italic">The Void is Empty</h2>
             <p className="text-muted text-sm max-w-[320px] font-medium tracking-wide">
               When the network activates, you'll see the top curated signals here.
             </p>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
          className="grid grid-cols-3 md:grid-cols-4 gap-1 sm:gap-4 auto-rows-[120px] sm:auto-rows-[200px]"
        >
          {posts.map((p, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              key={p.postId}
              className={`group relative bg-zinc-900 overflow-hidden sm:rounded-3xl border border-transparent hover:border-white/20 transition-all duration-500 cursor-pointer ${getSpanClass(i)}`}
              onClick={() => window.location.href = `/profile/${p.userId}`}
            >
              {p.type === 'video' ? (
                <>
                   <video src={p.contentUrl} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" muted loop autoPlay playsInline />
                   <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
                      <Play size={18} className="text-white drop-shadow-md" fill="white" />
                   </div>
                </>
              ) : (
                <img src={p.contentUrl} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" alt="" loading="lazy" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 flex flex-col justify-end h-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-white/20">
                      <img src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`} className="w-full h-full object-cover" alt="" />
                   </div>
                   <span className="text-white text-[10px] sm:text-xs font-black tracking-tight uppercase truncate">{p.username}</span>
                </div>
                <div className="flex items-center gap-4 text-white">
                  <div className="flex items-center gap-1.5 font-black text-[11px] sm:text-sm drop-shadow-lg">
                    <Heart size={16} fill="white" />
                    {p.likesCount.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1.5 font-black text-[11px] sm:text-sm drop-shadow-lg">
                    <MessageCircle size={16} fill="white" />
                    --
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Explore;
