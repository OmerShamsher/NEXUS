import React, { useState, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const Post = ({ postId, userId, username, avatar, mediaUrl, caption, type = 'image', commentsTotal = 0 }) => {
  const { session } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [localCommentsCount, setLocalCommentsCount] = useState(commentsTotal);
  
  // Video playback
  const [isPlaying, setIsPlaying] = useState(true);

  const fetchInitialData = useCallback(async () => {
    try {
      // Fetch Likes
      const { count: lCount, error: lError } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);
      if (!lError) setLikesCount(lCount || 0);

      const { data: userLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (userLike) setLiked(true);

      // Fetch Saved
      const { data: userSave } = await supabase
        .from('saves')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (userSave) setSaved(true);

      // Fetch Comments Count
      const { count: cCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);
      setLocalCommentsCount(cCount || 0);

    } catch (err) {
      console.error("Error fetching post data");
    }
  }, [postId, session?.user?.id]);

  useEffect(() => {
    if (session?.user && postId) {
      fetchInitialData();
    }
  }, [session, postId, fetchInitialData]);

  const handleLike = async () => {
    if (loading || !session?.user) return;
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount(prev => nextLiked ? prev + 1 : prev - 1);
    
    if (nextLiked) {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
    
    setLoading(true);
    try {
      if (nextLiked) {
        await supabase.from('likes').insert({ post_id: postId, user_id: session.user.id });
      } else {
        await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', session.user.id);
      }
    } catch (err) {
      console.error("Error updating like");
      setLiked(!nextLiked);
      setLikesCount(prev => !nextLiked ? prev + 1 : prev - 1);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (saving || !session?.user) return;
    const nextSaved = !saved;
    setSaved(nextSaved);
    setSaving(true);
    try {
      if (nextSaved) {
        await supabase.from('saves').insert({ post_id: postId, user_id: session.user.id });
      } else {
        await supabase.from('saves').delete().eq('post_id', postId).eq('user_id', session.user.id);
      }
    } catch (err) {
      setSaved(!nextSaved);
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentDraft.trim() || !session?.user) return;
    const text = commentDraft.trim();
    setCommentDraft('');
    try {
      const { data, error } = await supabase.from('comments').insert({
        post_id: postId,
        user_id: session.user.id,
        content: text
      }).select(`
        *,
        profiles:user_id (username, avatar_url)
      `).single();

      if (!error && data) {
        setLocalCommentsCount(prev => prev + 1);
        if (showComments) {
           setComments(prev => [data, ...prev]);
        }
      }
    } catch (err) {
      console.error("Comment error");
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      const { data } = await supabase
        .from('comments')
        .select(`*, profiles:user_id (username, avatar_url)`)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
      setComments(data || []);
    }
    setShowComments(!showComments);
  };

  const toggleVideoPlay = (e) => {
    if (type !== 'video') return;
    const video = e.currentTarget;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="glass rounded-[32px] overflow-hidden border border-white/5 mb-8 hover:border-white/20 transition-all duration-700 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] bg-black/40 relative">
      <div className="absolute top-0 right-0 w-[400px] h-full bg-accent/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 px-6 border-b border-white/[0.03] relative z-10">
        <Link to={`/profile/${userId}`} className="flex items-center gap-3 no-underline group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-neon rounded-full blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative w-11 h-11 p-[2px] bg-gradient-insta rounded-full group-hover:rotate-[10deg] transition-transform">
              <div className="w-full h-full rounded-full border-2 border-[#050505] overflow-hidden bg-zinc-900">
                 <img src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={username} />
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[14px] text-white tracking-tight leading-tight group-hover:text-accent transition-colors">{username}</span>
            <div className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
               <span className="text-[11px] text-muted font-medium uppercase tracking-[0.05em]">Nexus Elite</span>
            </div>
          </div>
        </Link>
        <button className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-colors text-muted bg-transparent border-0 cursor-pointer">
          <MoreHorizontal size={22} />
        </button>
      </div>

      {/* Media */}
      <div className="relative flex justify-center items-center aspect-[4/5] bg-zinc-950 overflow-hidden group/media relative z-10">
        {type === 'video' ? (
           <>
              <video 
                src={mediaUrl} 
                className="w-full h-full object-cover cursor-pointer" 
                onClick={toggleVideoPlay} 
                onDoubleClick={handleLike}
                autoPlay 
                loop 
                muted 
                playsInline 
              />
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-2xl">
                     <Play size={24} fill="currentColor" className="ml-1" />
                  </div>
                </div>
              )}
           </>
        ) : (
          <img 
            src={mediaUrl} 
            className="w-full h-full object-cover transition-transform duration-[2s] ease-out hover:scale-105" 
            alt="Post content" 
            loading="lazy" 
            onDoubleClick={handleLike}
          />
        )}
        
        <AnimatePresence>
          {showHeart && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.3, 1], opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <div className="bg-black/20 backdrop-blur-md rounded-full p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-accent/20 blur-[20px]"></div>
                <Heart size={70} fill="#ff0055" color="#ff0055" className="filter drop-shadow-[0_0_20px_rgba(255,0,85,0.8)] relative z-10" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions & Meta */}
      <div className="p-6 pt-5 flex flex-col gap-4 relative z-10">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
               <button onClick={handleLike} className={`group flex items-center gap-2 p-0 border-0 bg-transparent cursor-pointer transition-all ${liked ? 'text-accent' : 'text-white hover:text-accent'}`}>
                  <Heart size={28} fill={liked ? 'currentColor' : 'none'} strokeWidth={1.5} className={liked ? 'animate-bounce-once' : 'group-hover:scale-110 transition-transform'} />
                  {likesCount > 0 && <span className="text-sm font-black tracking-tight">{likesCount.toLocaleString()}</span>}
               </button>
               <button onClick={toggleComments} className="group text-white hover:text-accent transition-all flex items-center gap-2 bg-transparent border-0 cursor-pointer">
                 <MessageCircle size={28} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                 {localCommentsCount > 0 && <span className="text-sm font-black tracking-tight">{localCommentsCount.toLocaleString()}</span>}
               </button>
               <button className="group text-white hover:text-accent transition-all bg-transparent border-0 cursor-pointer">
                 <Send size={28} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
               </button>
            </div>
            <button onClick={handleSave} className={`group p-0 border-0 bg-transparent cursor-pointer transition-all ${saved ? 'text-accent' : 'text-white hover:text-accent'}`}>
              <Bookmark size={28} fill={saved ? 'currentColor' : 'none'} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
            </button>
        </div>

        <div className="flex flex-col gap-1.5 mt-1">
          <div className="text-[14px] leading-relaxed">
            <Link to={`/profile/${userId}`} className="font-extrabold text-[15px] mr-2 text-white no-underline hover:text-accent transition-colors tracking-tight">{username}</Link>
            <span className="text-white/80 font-medium tracking-wide">{caption}</span>
          </div>
          
          <div className="flex items-center gap-3 mt-1.5 opacity-60">
             <span className="text-[10px] font-black uppercase tracking-widest text-white">Transmission Sync</span>
             <span className="w-1 h-1 bg-white rounded-full"></span>
             <span className="text-[10px] text-accent font-black tracking-widest uppercase hover:underline cursor-pointer transition-all">Verified Entry</span>
          </div>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-4 pt-5 mt-2 border-t border-white/[0.05]">
              <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                {comments.map((c, i) => (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} key={c.id || i} className="flex items-start gap-4 group/comment">
                    <img src={c.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.profiles?.username}`} className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0" alt="" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-bold text-white tracking-tight">{c.profiles?.username}</span>
                      <span className="text-[13px] text-white/80 leading-relaxed font-medium">{c.content}</span>
                    </div>
                  </motion.div>
                ))}
                {comments.length === 0 && (
                  <div className="flex items-center justify-center p-6 text-[12px] font-black tracking-widest uppercase text-white/30 truncate">
                    No signals detected. Inject the first message.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comment Input */}
        <div className="mt-3 pt-5 border-t border-white/[0.05] flex items-center gap-4">
           <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 shrink-0 group hover:border-accent/50 transition-colors cursor-pointer">
              <img src={session?.user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=user`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="me" />
           </div>
           <form onSubmit={handleAddComment} className="flex-grow flex items-center gap-3">
             <input value={commentDraft} onChange={(e) => setCommentDraft(e.target.value)} placeholder="Inject thought into the feed..." className="bg-transparent border-none outline-none text-[13px] font-medium text-white placeholder-white/30 w-full" />
             <button type="submit" disabled={!commentDraft.trim()} className="text-accent font-black tracking-widest uppercase text-[11px] opacity-60 hover:opacity-100 transition-opacity bg-transparent border-0 cursor-pointer disabled:hidden">Post</button>
           </form>
        </div>
      </div>
    </div>
  );
};

export default Post;
