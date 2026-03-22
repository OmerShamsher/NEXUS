import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const Post = ({ postId, userId, username, avatar, mediaUrl, caption, commentsTotal = 0 }) => {
  const { session } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user && postId) {
      fetchLikes();
    }
  }, [session, postId]);

  const fetchLikes = async () => {
    try {
      // Get all likes for this post to count them
      const { count, error } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (!error) setLikesCount(count || 0);

      // Check if current user liked it
      const { data, error: userError } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', session.user.id)
        .maybeSingle();
        
      if (!userError && data) {
        setLiked(true);
      }
    } catch (err) {
      console.error("Error fetching likes", err);
    }
  };

  const handleLike = async () => {
    if (loading || !session?.user) return;
    
    // Optimistic UI update
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
    
    if (!liked) {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }

    setLoading(true);
    try {
      if (!liked) {
        // Insert like
        await supabase.from('likes').insert({ post_id: postId, user_id: session.user.id });
      } else {
        // Remove like
        await supabase.from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', session.user.id);
      }
    } catch (err) {
      console.error("Error updating like", err);
      // Revert if error
      setLiked(liked);
      setLikesCount(prev => liked ? prev + 1 : prev - 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-3xl overflow-hidden border border-white/5 transition-all duration-500 hover:border-white/10 group mb-6 bg-black/40"
    >
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
        <Link to={`/profile/${userId}`} className="flex items-center gap-3 no-underline decoration-transparent hover:opacity-80 transition-opacity">
          <div className="avatar w-10 h-10 p-0.5 ring-2 ring-transparent group-hover:ring-accent/50 transition-all rounded-full overflow-hidden">
             <div className="avatar-inner w-full h-full rounded-full overflow-hidden bg-black">
                <img src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} className="w-full h-full object-cover" alt={username} />
             </div>
          </div>
          <div className="flex flex-col">
            <span className="fw-black text-sm text-white tracking-tight">{username}</span>
            <span className="text-xs text-accent fw-bold flex items-center gap-1">Nexus Member</span>
          </div>
        </Link>
        <button className="p-2 hover:bg-white/10 rounded-full border-0 bg-transparent text-muted transition-colors"><MoreHorizontal size={20} /></button>
      </div>

      <div className="relative cursor-pointer bg-black/50 aspect-square overflow-hidden flex items-center justify-center" onDoubleClick={handleLike}>
        <img src={mediaUrl} className="w-full h-full object-contain" alt="Post content" loading="lazy" />
        
        <AnimatePresence>
          {showHeart && (
            <motion.div 
              initial={{ scale: 0, opacity: 0, y: 50 }}
              animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0], y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            >
              <Heart size={100} fill="rgba(255,0,85,0.9)" color="rgba(255,255,255,0.5)" className="drop-shadow-2xl" strokeWidth={1} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <button 
                 onClick={handleLike} 
                 className={`p-0 border-0 bg-transparent transition-transform hover:scale-110 active:scale-90 ${liked ? 'text-accent' : 'text-white'}`}
               >
                  <Heart size={28} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 1.5} />
               </button>
               <button className="p-0 border-0 bg-transparent text-white transition-transform hover:scale-110 active:scale-90"><MessageCircle size={28} strokeWidth={1.5} /></button>
               <button className="p-0 border-0 bg-transparent text-white transition-transform hover:scale-110 active:scale-90"><Send size={28} strokeWidth={1.5} /></button>
            </div>
            <button className="p-0 border-0 bg-transparent text-white transition-transform hover:scale-110 active:scale-90"><Bookmark size={28} strokeWidth={1.5} /></button>
        </div>

        <div>
           <span className="fw-black text-sm">{likesCount.toLocaleString()} likes</span>
        </div>

        <div className="text-sm">
          <Link to={`/profile/${userId}`} className="fw-black me-2 text-white no-underline hover:underline">{username}</Link>
          <span className="text-white/80 leading-relaxed">{caption}</span>
        </div>
        
        {commentsTotal > 0 && (
          <button className="text-muted border-0 bg-transparent p-0 text-sm fw-medium text-left hover:text-white transition-colors">
            View all {commentsTotal} comments
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default Post;
