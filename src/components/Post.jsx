import React, { useState, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Play, Camera, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const Post = ({ postId, userId, username, avatar, mediaUrl, caption, type = 'image', commentsTotal = 0 }) => {
  const { session } = useAuth();
  const navigate = useNavigate();
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
  
  const [isPlaying, setIsPlaying] = useState(true);

  const fetchInitialData = useCallback(async () => {
    try {
      const { count: lCount } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('post_id', postId);
      setLikesCount(lCount || 0);

      const { data: userLike } = await supabase.from('likes').select('id').eq('post_id', postId).eq('user_id', session.user.id).maybeSingle();
      if (userLike) setLiked(true);

      const { data: userSave } = await supabase.from('saves').select('user_id').eq('post_id', postId).eq('user_id', session.user.id).maybeSingle();
      if (userSave) setSaved(true);

      const { count: cCount } = await supabase.from('comments').select('*', { count: 'exact', head: true }).eq('post_id', postId);
      setLocalCommentsCount(cCount || 0);
    } catch (err) {
      console.error("Error fetching post data", err);
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
      if (nextLiked) await supabase.from('likes').insert({ post_id: postId, user_id: session.user.id });
      else await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', session.user.id);
    } catch {
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
      if (nextSaved) await supabase.from('saves').insert({ post_id: postId, user_id: session.user.id });
      else await supabase.from('saves').delete().eq('post_id', postId).eq('user_id', session.user.id);
    } catch {
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
      }).select(`*, profiles:user_id (username, avatar_url)`).single();

      if (!error && data) {
        setLocalCommentsCount(prev => prev + 1);
        if (showComments) setComments(prev => [data, ...prev]);
      }
    } catch (err) {
      console.error("Comment error", err);
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      const { data } = await supabase.from('comments').select(`*, profiles:user_id (username, avatar_url)`).eq('post_id', postId).order('created_at', { ascending: false });
      setComments(data || []);
    }
    setShowComments(!showComments);
  };

  const formatCaption = (text) => {
    if (!text) return '';
    return text.split(' ').map((word, i) => (
      word.startsWith('#') ? <span key={i} className="text-accent cursor-pointer hover:underline">{word} </span> : word + ' '
    ));
  };

  return (
    <article className="card-premium mb-10 group overflow-visible">
      {/* Header */}
      <div className="flex items-center justify-between p-6 px-7">
        <div className="flex items-center gap-4">
          <Link to={`/profile/${userId}`} className="w-12 h-12 rounded-full border-2 border-border-soft p-0.5 overflow-hidden">
             <img src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} className="w-full h-full rounded-full object-cover" alt="" />
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => navigate(`/profile/${userId}`)}>
              <span className="font-extrabold text-[15px] text-text-main">{username}</span>
              <div className="w-3.5 h-3.5 bg-accent rounded-full flex items-center justify-center text-white p-0.5">
                 <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
              </div>
              <span className="text-text-muted text-[13px] font-medium ml-1">@{username} • 2h</span>
            </div>
            <span className="text-text-secondary text-[12px] font-bold">Banff National Park</span>
          </div>
        </div>
        <button className="p-2 text-text-muted hover:bg-bg-app rounded-full transition-all border-0 bg-transparent cursor-pointer">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Media */}
      <div className="relative group/media overflow-hidden">
        <div className="flex flex-col px-7 pb-4">
           <p className="text-[15px] font-bold text-text-main leading-relaxed mb-4">
              {formatCaption(caption)}
           </p>
        </div>

        <div className="relative aspect-[16/10] sm:aspect-[4/5] bg-bg-app cursor-pointer overflow-hidden rounded-[24px] mx-7" onDoubleClick={handleLike}>
          {type === 'video' ? (
            <video 
              src={mediaUrl} 
              className="w-full h-full object-cover" 
              autoPlay loop muted playsInline 
            />
          ) : (
            <img src={mediaUrl} className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-[3s]" alt="" />
          )}

          <AnimatePresence>
            {showHeart && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1.2 }} exit={{ scale: 0 }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <Heart size={100} fill="#fff" className="drop-shadow-2xl" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stats and Actions */}
      <div className="p-7">
        <div className="flex items-center justify-between mb-6">
           {/* Stats left side */}
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <Heart size={20} fill="#ef4444" className="text-[#ef4444]" />
                 <span className="text-[14px] font-black text-text-main">{likesCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                 <MessageCircle size={20} className="text-text-muted" />
                 <span className="text-[14px] font-black text-text-main">{localCommentsCount.toLocaleString()}</span>
              </div>
              <Send size={20} className="text-text-muted cursor-pointer hover:text-accent transition-colors" />
              <Bookmark size={20} className="text-text-muted cursor-pointer hover:text-accent transition-colors" />
           </div>

           {/* Engagement right side */}
           <div className="flex items-center gap-4">
              <button 
                onClick={handleLike} 
                className={`p-2.5 rounded-full ${liked ? 'bg-red-50 text-red-500' : 'bg-bg-app text-text-main'} border-0 transition-all hover:scale-110 cursor-pointer`}
              >
                 <Heart size={22} fill={liked ? 'currentColor' : 'none'} />
              </button>
              <button onClick={toggleComments} className="p-2.5 rounded-full bg-bg-app text-text-main border-0 transition-all hover:scale-110 cursor-pointer">
                 <MessageCircle size={22} />
              </button>
              <button onClick={handleSave} className={`p-2.5 rounded-full ${saved ? 'bg-accent/10 text-accent' : 'bg-bg-app text-text-main'} border-0 transition-all hover:scale-110 cursor-pointer`}>
                 <Bookmark size={22} fill={saved ? 'currentColor' : 'none'} />
              </button>
           </div>
        </div>

        {/* Social Proof */}
        <div className="flex items-center gap-2 mb-4">
           <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <img key={i} src={`https://i.pravatar.cc/100?u=${i+10}`} className="w-6 h-6 rounded-full border-2 border-white object-cover" alt="" />
              ))}
           </div>
           <p className="text-[13px] text-text-secondary font-bold">
              Liked by <span className="text-text-main font-black">adventure_life</span> and others
           </p>
        </div>

        {/* Comments section */}
        <div className="flex flex-col gap-4 mt-6">
           {showComments && comments.map((c, i) => (
             <div key={i} className="flex gap-3 items-start animate-fade-in">
                <img src={c.profiles?.avatar_url || `https://i.pravatar.cc/100?u=${c.profiles?.username}`} className="w-8 h-8 rounded-full border border-border-soft" alt="" />
                <div className="flex flex-col">
                   <div className="flex items-center gap-2">
                      <span className="text-[13px] font-black text-text-main">@{c.profiles?.username}</span>
                      <p className="text-[13px] font-medium text-text-secondary">{c.content} 😍</p>
                      <span className="text-[11px] text-text-muted font-bold uppercase ml-2">2h</span>
                   </div>
                   <button className="text-[11px] font-black text-text-muted uppercase border-0 bg-transparent cursor-pointer mt-1 hover:text-accent">Reply</button>
                </div>
             </div>
           ))}
        </div>

        {/* Add comment input */}
        <div className="mt-8 pt-6 border-t border-border-soft flex items-center gap-4">
           <div className="w-10 h-10 rounded-full border border-border-soft p-0.5 overflow-hidden">
              <img src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=user`} className="w-full h-full rounded-full object-cover" alt="" />
           </div>
           <form onSubmit={handleAddComment} className="flex-grow relative flex items-center">
              <input 
                 value={commentDraft}
                 onChange={(e) => setCommentDraft(e.target.value)}
                 placeholder="Add a comment..." 
                 className="w-full bg-bg-app border-none rounded-full py-3.5 px-6 pr-14 text-sm font-medium outline-none focus:ring-2 ring-accent/20 transition-all"
              />
              <div className="absolute right-4 flex items-center gap-3 text-text-muted">
                 <Smile size={18} className="hover:text-accent cursor-pointer transition-colors" />
                 <Camera size={18} className="hover:text-accent cursor-pointer transition-colors" />
              </div>
           </form>
        </div>
      </div>
    </article>
  );
};

export default Post;
