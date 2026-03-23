import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Loader2, Heart, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Explore = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  const fetchExplore = async () => {
    try {
      setLoading(true);

      // Grab a pool of recent posts, then rank by like counts client-side.
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
        .limit(40);

      if (error) throw error;

      const postIds = (postsData || []).map((p) => p.id);
      if (postIds.length === 0) {
        setPosts([]);
        return;
      }

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
        caption: p.caption,
        type: p.type,
        likesCount: counts.get(p.id) || 0,
      }));

      ranked.sort((a, b) => b.likesCount - a.likesCount);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const emptyState = useMemo(() => !loading && posts.length === 0, [loading, posts.length]);

  return (
    <div className="max-w-[980px] mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="fs-2 fw-black tracking-tighter text-white">Explore</h1>
          <p className="text-muted text-sm mt-1">Trending posts ranked by real likes.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-accent" size={42} />
        </div>
      ) : emptyState ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 glass">
            <Heart size={42} className="text-white/30" />
          </div>
          <h2 className="fw-black text-xl text-white">No content yet</h2>
          <p className="text-muted max-w-[320px]">
            When people start posting, you will see the best from the community here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {posts.map((p) => (
            <Link
              key={p.postId}
              to={`/profile/${p.userId}`}
              className="group relative aspect-square bg-black/40 rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-all"
            >
              {p.type === 'video' ? (
                <video src={p.contentUrl} className="w-full h-full object-cover" muted playsInline />
              ) : (
                <img src={p.contentUrl} className="w-full h-full object-cover" alt="" loading="lazy" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1 text-white text-xs fw-bold drop-shadow">
                  <Heart size={14} fill="currentColor" />
                  {p.likesCount}
                </div>
                <div className="flex items-center gap-1 text-white/80 text-xs fw-bold drop-shadow">
                  <MessageCircle size={14} />
                  0
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;

