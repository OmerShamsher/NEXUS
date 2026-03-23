import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const Post = ({
  postId,
  userId,
  username,
  avatar,
  mediaUrl,
  caption,
  type = 'image',
  commentsTotal = 0,
}) => {
  const { session } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [commentsCount, setCommentsCount] = useState(commentsTotal || 0);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const timeAgo = (iso) => {
    const t = new Date(iso).getTime();
    const now = Date.now();
    const diffMs = Math.max(0, now - t);
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'now';
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d`;
  };

  useEffect(() => {
    if (session?.user && postId) {
      fetchAll();
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

  const fetchSaved = async () => {
    try {
      const { data, error } = await supabase
        .from('saves')
        .select('created_at')
        .eq('post_id', postId)
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (!error) setSaved(!!data);
    } catch (err) {
      // If the table isn't created yet, just don't show saved state.
      console.warn('Saves lookup failed (did you run SUPABASE_SETUP.sql?)', err);
    }
  };

  const fetchComments = async () => {
    try {
      const { count, data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id (username, avatar_url)
        `, { count: 'exact' })
        .eq('post_id', postId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error) {
        setCommentsCount(count || 0);
        setComments(
          (data || []).map((c) => ({
            id: c.id,
            content: c.content,
            createdAt: c.created_at,
            username: c.profiles?.username || 'Unknown',
            avatar: c.profiles?.avatar_url,
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching comments', err);
    }
  };

  const fetchAll = async () => {
    await Promise.all([fetchLikes(), fetchSaved(), fetchComments()]);
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

  const handleToggleSave = async () => {
    if (saving || !session?.user) return;
    setSaving(true);
    const next = !saved;
    setSaved(next); // optimistic
    try {
      if (next) {
        await supabase.from('saves').insert({ user_id: session.user.id, post_id: postId });
      } else {
        await supabase.from('saves')
          .delete()
          .eq('user_id', session.user.id)
          .eq('post_id', postId);
      }
    } catch (err) {
      console.error('Error toggling save', err);
      setSaved(!next);
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentDraft.trim() || !session?.user) return;
    const text = commentDraft.trim();
    setCommentDraft('');

    // Optimistic prepend (without actor avatar/username, refetch after)
    setComments((prev) => [
      {
        id: Date.now(),
        content: text,
        createdAt: new Date().toISOString(),
        username: 'You',
        avatar: null,
      },
      ...prev,
    ]);
    setCommentsCount((c) => c + 1);

    try {
      await supabase.from('comments').insert({
        user_id: session.user.id,
        post_id: postId,
        content: text,
      });
      await fetchComments();
    } catch (err) {
      console.error('Error adding comment', err);
      await fetchComments();
    }
  };

  useEffect(() => {
    if (!showComments || !postId) return;

    const channel = supabase
      .channel(`post-comments:${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          setCommentsCount((c) => c + 1);
          fetchComments();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComments, postId]);

  const startDirectMessage = () => {
    navigate('/messages', {
      state: {
        directUserId: userId,
        directUsername: username,
        directAvatar: avatar,
      },
    });
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

      <div
        className="relative cursor-pointer bg-black/50 aspect-square overflow-hidden flex items-center justify-center"
        onDoubleClick={handleLike}
      >
        {type === 'video' ? (
          <video src={mediaUrl} className="w-full h-full object-contain" muted playsInline preload="metadata" />
        ) : (
          <img src={mediaUrl} className="w-full h-full object-contain" alt="Post content" loading="lazy" />
        )}
        
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
               <button
                 onClick={startDirectMessage}
                 className="p-0 border-0 bg-transparent text-white transition-transform hover:scale-110 active:scale-90 cursor-pointer"
               >
                 <MessageCircle size={28} strokeWidth={1.5} />
               </button>
               <button className="p-0 border-0 bg-transparent text-white transition-transform hover:scale-110 active:scale-90"><Send size={28} strokeWidth={1.5} /></button>
            </div>
            <button
              onClick={handleToggleSave}
              disabled={saving}
              className={`p-0 border-0 bg-transparent transition-transform hover:scale-110 active:scale-90 cursor-pointer ${
                saved ? 'text-accent' : 'text-white'
              }`}
            >
              <Bookmark size={28} fill={saved ? 'currentColor' : 'none'} strokeWidth={1.5} />
            </button>
        </div>

        <div>
           <span className="fw-black text-sm">{likesCount.toLocaleString()} likes</span>
        </div>

        <div className="text-sm">
          <Link to={`/profile/${userId}`} className="fw-black me-2 text-white no-underline hover:underline">{username}</Link>
          <span className="text-white/80 leading-relaxed">{caption}</span>
        </div>

        {commentsCount > 0 && (
          <button
            onClick={() => setShowComments((v) => !v)}
            className="text-muted border-0 bg-transparent p-0 text-sm fw-medium text-left hover:text-white transition-colors cursor-pointer"
          >
            {showComments ? 'Hide comments' : `View all ${commentsCount} comments`}
          </button>
        )}

        {showComments && (
          <div className="mt-2 flex flex-col gap-3">
            <form onSubmit={handleAddComment} className="flex items-center gap-2">
              <input
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                placeholder="Add a comment..."
                className="premium-input bg-white/5 border border-white/10 focus:border-accent flex-grow text-sm py-3 px-4 rounded-2xl outline-none"
              />
              <button
                type="submit"
                disabled={!commentDraft.trim()}
                className="premium-btn py-3 px-6 text-xs tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Comment
              </button>
            </form>

            <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-muted text-sm">Be the first to comment.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-black">
                      <img
                        src={c.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.username}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="fw-bold text-sm text-white">{c.username}</span>
                        <span className="text-muted text-xs">{timeAgo(c.createdAt)}</span>
                      </div>
                      <p className="text-white/80 text-sm leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Post;
