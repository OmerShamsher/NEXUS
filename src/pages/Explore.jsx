import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Play, Heart, MessageCircle, Sparkles, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Explore = () => {
  const { session } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  const categories = ['All', 'Architecture', 'Nature', 'Fashion', 'Tech', 'Travel', 'Art', 'Sports'];

  const fetchExplorePosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`*, profiles:user_id (id, username, avatar_url)`)
        .order('created_at', { ascending: false })
        .limit(24);
      
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) fetchExplorePosts();
  }, [session]);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      {/* Search & Categories */}
      <div className="flex flex-col gap-10 mb-12">
        <div className="flex flex-col gap-2">
           <h1 className="text-4xl font-black tracking-tighter text-text-main italic uppercase">Discovery</h1>
           <p className="text-text-secondary text-[14px] font-bold uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} className="text-accent" /> Explore the nexus global feed
           </p>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3.5 rounded-2xl text-[12px] font-black tracking-widest uppercase transition-all border-0 cursor-pointer whitespace-nowrap ${
                activeCategory === cat 
                ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                : 'bg-bg-card border border-border-soft text-text-muted hover:text-text-main hover:border-text-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Explore Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
          <Loader2 className="animate-spin text-accent" size={48} />
          <span className="text-[11px] font-black tracking-[0.3em] text-text-muted uppercase italic">Gathering Intel...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 text-center gap-6 bg-bg-card rounded-[40px] border border-border-soft">
           <Compass size={64} className="text-text-muted opacity-20" strokeWidth={1} />
           <div className="flex flex-col gap-2">
              <h2 className="font-black text-2xl text-text-main uppercase tracking-tighter italic">Sector Empty</h2>
              <p className="text-text-secondary font-bold text-[12px] tracking-wide max-w-[280px] uppercase mt-2">No signals detected in this sector. Try another category.</p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {posts.map((post, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              key={post.id}
              className="aspect-square relative group cursor-pointer overflow-hidden rounded-[32px] bg-bg-card border border-border-soft hover:shadow-2xl transition-all duration-700"
              onClick={() => navigate(`/profile/${post.user_id}`)}
            >
              {post.type === 'video' ? (
                <>
                  <video src={post.content_url} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" muted loop playsInline autoPlay />
                  <div className="absolute top-5 right-5 z-10 text-white drop-shadow-lg">
                    <Play size={20} fill="white" />
                  </div>
                </>
              ) : (
                <img src={post.content_url} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" alt="" />
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-6 transition-all backdrop-blur-[2px]">
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2 text-white font-black"><Heart size={24} fill="white" /> --</div>
                   <div className="flex items-center gap-2 text-white font-black"><MessageCircle size={24} fill="white" /> --</div>
                </div>
                <div className="flex items-center gap-2">
                   <img src={post.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.profiles?.username}`} className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                   <span className="text-white text-[12px] font-black uppercase tracking-tight">@{post.profiles?.username}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
