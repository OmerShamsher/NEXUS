import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Loader2, Heart, MessageCircle, Bell, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const myPostIdsRef = useRef(new Set());
  const refreshTimerRef = useRef(null);
  const refreshInFlightRef = useRef(false);

  const fetchNotifications = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);

      const { data: myPosts, error: postsErr } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', session.user.id);

      if (postsErr) throw postsErr;

      const postIds = (myPosts || []).map((p) => p.id);

      myPostIdsRef.current = new Set(postIds);

      if (postIds.length === 0) {
        setItems([]);
        if (!silent) setLoading(false);
        return;
      }

      const { data: postMeta, error: postMetaErr } = await supabase
        .from('posts')
        .select('id, content_url, type')
        .in('id', postIds);

      if (postMetaErr) throw postMetaErr;

      const postMetaById = new Map(
        (postMeta || []).map((p) => [p.id, { url: p.content_url, type: p.type }])
      );

      const { data: likesData, error: likesErr } = await supabase
        .from('likes')
        .select(`
          created_at,
          user_id,
          post_id,
          profiles:user_id (username, avatar_url)
        `)
        .in('post_id', postIds)
        .order('created_at', { ascending: false })
        .limit(30);

      if (likesErr) throw likesErr;

      const { data: commentsData, error: commentsErr } = await supabase
        .from('comments')
        .select(`
          created_at,
          user_id,
          post_id,
          content,
          profiles:user_id (username, avatar_url)
        `)
        .in('post_id', postIds)
        .order('created_at', { ascending: false })
        .limit(30);

      if (commentsErr) throw commentsErr;

      const likeItems = (likesData || []).map((l) => ({
        id: `like-${l.post_id}-${l.user_id}-${l.created_at}`,
        kind: 'like',
        actorName: l.profiles?.username || 'Someone',
        actorId: l.user_id,
        actorAvatar: l.profiles?.avatar_url,
        postId: l.post_id,
        thumbUrl: postMetaById.get(l.post_id)?.url,
        thumbType: postMetaById.get(l.post_id)?.type,
        createdAt: l.created_at,
      }));

      const commentItems = (commentsData || []).map((c) => ({
        id: `comment-${c.post_id}-${c.user_id}-${c.created_at}`,
        kind: 'comment',
        actorName: c.profiles?.username || 'Someone',
        actorId: c.user_id,
        actorAvatar: c.profiles?.avatar_url,
        postId: c.post_id,
        thumbUrl: postMetaById.get(c.post_id)?.url,
        thumbType: postMetaById.get(c.post_id)?.type,
        createdAt: c.created_at,
        commentText: c.content,
      }));

      const merged = [...likeItems, ...commentItems].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setItems(merged.slice(0, 40));
    } catch (err) {
      console.error('Notifications fetch error:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const scheduleRefresh = () => {
    if (refreshInFlightRef.current) return;
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(async () => {
      try {
        refreshInFlightRef.current = true;
        await fetchNotifications({ silent: true });
      } finally {
        refreshInFlightRef.current = false;
      }
    }, 400);
  };

  useEffect(() => {
    if (!session?.user) return;

    fetchNotifications();

    const channelLikes = supabase
      .channel(`notifications:likes:${session.user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'likes' },
        (payload) => {
          const postId = payload?.new?.post_id;
          if (postId && myPostIdsRef.current.has(postId)) scheduleRefresh();
        }
      )
      .subscribe();

    const channelComments = supabase
      .channel(`notifications:comments:${session.user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        (payload) => {
          const postId = payload?.new?.post_id;
          if (postId && myPostIdsRef.current.has(postId)) scheduleRefresh();
        }
      )
      .subscribe();

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      supabase.removeChannel(channelLikes);
      supabase.removeChannel(channelComments);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const emptyState = useMemo(() => !loading && items.length === 0, [loading, items.length]);

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

  return (
    <div className="max-w-[700px] mx-auto py-12 px-4 pb-24 relative min-h-screen">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 blur-[120px] rounded-full pointer-events-none"></div>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase text-white flex items-center gap-4">
           <div className="w-12 h-12 rounded-[18px] bg-white/5 border border-white/10 flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <Bell size={24} className="animate-bounce-once" strokeWidth={1.5} />
           </div>
           Signals
        </h1>
        <div className="flex items-center gap-3">
           <span className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">Network Activity Monitor</span>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
           <div className="relative">
              <div className="absolute inset-0 bg-accent rounded-full blur-[30px] opacity-20 animate-pulse"></div>
              <Loader2 size={48} className="text-accent animate-spin" strokeWidth={1.5} />
           </div>
           <span className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase">Syncing Events...</span>
        </div>
      ) : emptyState ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-center gap-6">
          <div className="relative group">
             <div className="absolute inset-0 bg-white/10 rounded-full blur-[40px] opacity-10"></div>
             <div className="w-24 h-24 rounded-[40px] bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto relative z-10 glass">
                <Bell size={40} className="text-white/20" strokeWidth={1} />
             </div>
          </div>
          <div className="flex flex-col gap-2">
             <h2 className="font-extrabold text-2xl text-white tracking-tight uppercase italic">No incoming signals</h2>
             <p className="text-muted text-sm max-w-[320px] font-medium tracking-wide">
               When the void speaks back, you will be notified here.
             </p>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {items.map((n, i) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={n.id}
              >
                <Link
                  to={`/profile/${n.actorId}`}
                  className="group relative flex items-center gap-5 glass rounded-[28px] p-5 px-6 border border-white/5 hover:border-white/20 hover:bg-white/[0.03] transition-all cursor-pointer overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="relative shrink-0">
                    <div className="w-[52px] h-[52px] rounded-full overflow-hidden border-2 border-white/10 group-hover:border-accent/50 transition-colors bg-zinc-900">
                      <img
                        src={n.actorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.actorName}`}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    {/* Activity Badge */}
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-[3px] border-[#0c0c0c] flex items-center justify-center shadow-lg ${n.kind === 'like' ? 'bg-accent' : 'bg-accent-secondary'}`}>
                       {n.kind === 'like' ? <Heart size={10} fill="white" color="white" /> : <MessageCircle size={10} fill="white" color="white" />}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 z-10">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-black text-white text-[15px] group-hover:text-accent transition-colors truncate">{n.actorName}</span>
                      <span className="text-[10px] font-black text-white/30 tracking-widest uppercase">{timeAgo(n.createdAt)}</span>
                    </div>

                    {n.kind === 'like' ? (
                      <div className="flex items-center gap-2 text-[13px] text-white/70 font-medium">
                        Resonated with your signal
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[13px] text-white/70 font-medium truncate">
                        Transmitted: <span className="text-white font-bold truncate">"{n.commentText}"</span>
                      </div>
                    )}
                  </div>

                  {n.thumbUrl && (
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 shrink-0 relative z-10 group-hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(0,0,0,0.3)]">
                      {n.thumbType === 'video' ? (
                        <video src={n.thumbUrl} className="w-full h-full object-cover" muted playsInline />
                      ) : (
                        <img src={n.thumbUrl} className="w-full h-full object-cover" alt="" />
                      )}
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Notifications;
