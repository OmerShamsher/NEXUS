import React, { useRef, useState, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark, Music, Send, X } from 'lucide-react';
import { motion } from 'framer-motion';

import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Reel = ({ postId, userId, username, avatar, videoUrl, caption }) => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [loadingLike, setLoadingLike] = useState(false);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentDraft, setCommentDraft] = useState('');
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  const fetchReelLikes = async () => {
    if (!session?.user || !postId) return;
    try {
      const { count, error } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (!error) setLikesCount(count || 0);

      const { data, error: userError } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!userError && data) setLiked(true);
      if (!userError && !data) setLiked(false);
    } catch (err) {
      console.error('Error fetching reel likes:', err);
    }
  };

  const fetchReelCommentsCount = async () => {
    if (!postId) return;
    try {
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (!error) setCommentsCount(count || 0);
    } catch (err) {
      console.error('Error fetching reel comments count:', err);
    }
  };

  const fetchReelSaved = async () => {
    if (!session?.user || !postId) return;
    try {
      const { data, error } = await supabase
        .from('saves')
        .select('created_at')
        .eq('post_id', postId)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!error) setSaved(!!data);
    } catch (err) {
      // If the table isn't created yet, just ignore.
      console.warn('Reel saves lookup failed (did you run SUPABASE_SETUP.sql?)', err);
    }
  };

  const fetchFollowState = async () => {
    if (!session?.user || !userId) return;
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('created_at')
        .eq('follower_id', session.user.id)
        .eq('following_id', userId)
        .maybeSingle();

      if (!error) setIsFollowing(!!data);
    } catch (err) {
      console.error('Error fetching follow state:', err);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play();
            setPlaying(true);
          } else {
            videoRef.current?.pause();
            setPlaying(false);
          }
        });
      },
      { threshold: 0.8 }
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!session?.user || !postId) return;
    fetchReelLikes();
    fetchReelCommentsCount();
    fetchReelSaved();
    fetchFollowState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, postId, userId]);

  const handleLike = async () => {
    if (loadingLike || !session?.user) return;
    setLoadingLike(true);
    const nextLiked = !liked;

    setLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (nextLiked) {
        await supabase.from('likes').insert({ post_id: postId, user_id: session.user.id });
      } else {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', session.user.id);
      }
    } catch (err) {
      console.error('Error toggling reel like:', err);
      setLiked(!nextLiked);
      setLikesCount((prev) => (nextLiked ? Math.max(0, prev - 1) : prev + 1));
    } finally {
      setLoadingLike(false);
    }
  };

  const handleToggleSave = async () => {
    if (saving || !session?.user) return;
    setSaving(true);
    const next = !saved;
    setSaved(next);
    try {
      if (next) {
        await supabase.from('saves').insert({ user_id: session.user.id, post_id: postId });
      } else {
        await supabase
          .from('saves')
          .delete()
          .eq('user_id', session.user.id)
          .eq('post_id', postId);
      }
    } catch (err) {
      console.error('Error toggling reel save:', err);
      setSaved(!next);
    } finally {
      setSaving(false);
    }
  };

  const handleFollowToggle = async () => {
    if (followLoading || !session?.user) return;
    if (!userId || userId === session.user.id) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', session.user.id)
          .eq('following_id', userId);
        setIsFollowing(false);
      } else {
        await supabase.from('follows').insert({ follower_id: session.user.id, following_id: userId });
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Error toggling reel follow:', err);
    } finally {
      setFollowLoading(false);
    }
  };

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

  const fetchReelComments = async () => {
    if (!postId) return;
    try {
      setCommentsLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          profiles:user_id (username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;

      setComments(
        (data || []).map((c) => ({
          id: c.id,
          content: c.content,
          createdAt: c.created_at,
          username: c.profiles?.username || 'Unknown',
          avatar: c.profiles?.avatar_url,
        }))
      );
    } catch (err) {
      console.error('Error fetching reel comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentDraft.trim() || !session?.user) return;
    const text = commentDraft.trim();
    setCommentDraft('');

    // Optimistic UI
    setComments((prev) => [
      { id: Date.now(), content: text, createdAt: new Date().toISOString(), username: 'You', avatar: null },
      ...prev,
    ]);
    setCommentsCount((c) => c + 1);

    try {
      await supabase.from('comments').insert({
        user_id: session.user.id,
        post_id: postId,
        content: text,
      });
      await fetchReelComments();
    } catch (err) {
      console.error('Error adding reel comment:', err);
      await fetchReelComments();
    }
  };

  useEffect(() => {
    if (!showComments || !postId) return;
    fetchReelComments();

    const channel = supabase
      .channel(`reel-comments:${postId}`)
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
          fetchReelComments();
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
    <div className="reel-card group relative">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover cursor-pointer"
        onClick={togglePlay}
        onDoubleClick={handleLike}
        loop
        playsInline
        muted
      />
      
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-white/20 p-6 rounded-full backdrop-blur-sm">
             <Heart size={48} className="text-white" fill="white" />
          </motion.div>
        </div>
      )}

      <div className="reel-info-pill">
        <div className="flex flex-col items-center gap-1 group/btn">
           <button
             onClick={handleLike}
             disabled={loadingLike}
             className={`p-3 rounded-full hover:bg-white/10 transition-colors ${liked ? 'text-accent' : 'text-white'}`}
           >
             <Heart
               size={32}
               fill={liked ? 'currentColor' : 'none'}
               color="currentColor"
             />
           </button>
           <span className="text-white text-xs fw-bold drop-shadow-md">{likesCount.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-center gap-1 group/btn">
           <button
             onClick={() => setShowComments((v) => !v)}
             className="p-3 rounded-full hover:bg-white/10 transition-colors text-white cursor-pointer"
           >
             <MessageCircle size={32} />
           </button>
           <span className="text-white text-xs fw-bold drop-shadow-md">{commentsCount.toLocaleString()}</span>
        </div>
        <button
          onClick={handleToggleSave}
          className={`p-3 rounded-full hover:bg-white/10 transition-colors cursor-pointer ${
            saved ? 'text-accent' : 'text-white'
          }`}
          disabled={saving}
        >
          <Bookmark size={24} fill={saved ? 'currentColor' : 'none'} strokeWidth={1.5} />
        </button>
      </div>

      <div className="reel-content">
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar w-9 h-9 border-0 p-0">
             <img src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} className="rounded-full w-full h-full" alt="" />
          </div>
          <span className="fw-black text-white text-shadow-lg">{username}</span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleFollowToggle}
              disabled={followLoading || userId === session?.user?.id}
              className={`px-3 py-1 border rounded-lg text-white text-xs fw-bold glass transition-colors ${
                isFollowing ? 'bg-zinc-900 hover:bg-zinc-800 border-white/10' : 'border-white hover:bg-white/10'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <button
              onClick={startDirectMessage}
              disabled={!session?.user || userId === session?.user?.id}
              className="p-2 rounded-full border border-white/10 glass hover:bg-white/10 transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        
        <p className="text-white text-sm mb-4 line-clamp-2 drop-shadow-md">{caption}</p>
        
        <div className="flex items-center gap-2 overflow-hidden w-2/3">
           <Music size={14} className="text-white shrink-0" />
           <div className="marquee overflow-hidden">
              <span className="text-xs text-white whitespace-nowrap animate-marquee">Audio from {username} • Original Audio</span>
           </div>
        </div>
      </div>

      {showComments && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute bottom-0 left-0 right-0 z-[70] bg-black/80 backdrop-blur-2xl border-t border-white/10"
        >
          <div className="p-4 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="fw-black text-white tracking-tight">Comments</span>
              <span className="text-muted text-xs">{commentsCount.toLocaleString()} total</span>
            </div>
            <button
              onClick={() => setShowComments(false)}
              className="p-2 rounded-full hover:bg-white/5 border-0 bg-transparent text-muted cursor-pointer"
              aria-label="Close comments"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-4 pb-4">
            <div className="max-h-[38vh] overflow-y-auto flex flex-col gap-4 pr-1 no-scrollbar">
              {commentsLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : comments.length === 0 ? (
                <div className="flex items-center justify-center py-10">
                  <span className="text-muted text-sm fw-medium">Be the first to comment.</span>
                </div>
              ) : (
                comments
                  .slice()
                  .reverse()
                  .map((c) => (
                    <div key={c.id} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-black/20 shrink-0">
                        <img
                          src={c.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.username}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="fw-bold text-white text-sm">{c.username}</span>
                          <span className="text-muted text-xs">{timeAgo(c.createdAt)}</span>
                        </div>
                        <p className="text-white/85 text-sm leading-relaxed">{c.content}</p>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="mt-4 flex items-center gap-2">
              <input
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                placeholder="Add a comment..."
                className="premium-input bg-white/5 border border-white/10 focus:border-accent flex-grow text-sm py-3 px-4 rounded-2xl outline-none"
              />
              <button
                type="submit"
                disabled={!commentDraft.trim() || !session?.user}
                className="premium-btn py-3 px-6 text-xs tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Reel;
