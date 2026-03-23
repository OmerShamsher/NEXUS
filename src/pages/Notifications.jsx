import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Loader2, Heart, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div className="max-w-[720px] mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="fs-2 fw-black tracking-tighter text-white">Notifications</h1>
        <p className="text-muted text-sm mt-1">Likes and comments on your posts.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-accent" size={42} />
        </div>
      ) : emptyState ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 glass">
            <MessageCircle size={42} className="text-white/30" />
          </div>
          <h2 className="fw-black text-xl text-white">No notifications yet</h2>
          <p className="text-muted max-w-[340px]">
            When someone likes or comments your posts, it will show up here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((n) => (
            <Link
              key={n.id}
              to={`/profile/${n.actorId}`}
              className="group flex items-center gap-3 bg-black/40 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-black/20 shrink-0">
                <img
                  src={n.actorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.actorName}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="fw-bold text-white text-sm group-hover:text-accent truncate">{n.actorName}</span>
                  <span className="text-muted text-xs">{timeAgo(n.createdAt)}</span>
                </div>

                {n.kind === 'like' ? (
                  <div className="flex items-center gap-2 mt-1 text-sm text-white/80">
                    <Heart size={16} className="text-accent" />
                    liked your post
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1 text-sm text-white/80">
                    <MessageCircle size={16} className="text-accent" />
                    commented: <span className="text-white/90 truncate">{n.commentText}</span>
                  </div>
                )}
              </div>

              {n.thumbUrl && (
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/5 bg-black/20 shrink-0">
                  {n.thumbType === 'video' ? (
                    <video src={n.thumbUrl} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    <img src={n.thumbUrl} className="w-full h-full object-cover" alt="" />
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;

