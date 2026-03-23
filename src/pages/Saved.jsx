import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Loader2, Camera, Heart } from 'lucide-react';
import Post from '../components/Post';

const Saved = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savedPosts, setSavedPosts] = useState([]);

  const fetchSaved = async () => {
    if (!session?.user) return;
    try {
      setLoading(true);

      const { data: savesData, error: savesErr } = await supabase
        .from('saves')
        .select('post_id, created_at')
        .eq('user_id', session.user.id);

      if (savesErr) throw savesErr;

      const postIds = (savesData || []).map((s) => s.post_id);
      if (postIds.length === 0) {
        setSavedPosts([]);
        return;
      }

      const saveCreatedAtByPostId = new Map(
        (savesData || []).map((s) => [s.post_id, s.created_at])
      );

      const { data: postsData, error: postsErr } = await supabase
        .from('posts')
        .select('id, user_id, content_url, caption, type, profiles:user_id (username, avatar_url)')
        .in('id', postIds);

      if (postsErr) throw postsErr;

      const mapped =
        (postsData || []).map((p) => ({
          postId: p.id,
          userId: p.user_id,
          username: p.profiles?.username || 'Unknown',
          avatar: p.profiles?.avatar_url,
          mediaUrl: p.content_url,
          caption: p.caption,
          type: p.type || 'image',
          commentsTotal: 0,
          saveCreatedAt: saveCreatedAtByPostId.get(p.id) || null,
        })) || [];

      mapped.sort((a, b) => {
        const at = a.saveCreatedAt ? new Date(a.saveCreatedAt).getTime() : 0;
        const bt = b.saveCreatedAt ? new Date(b.saveCreatedAt).getTime() : 0;
        return bt - at;
      });

      setSavedPosts(mapped);
    } catch (err) {
      console.error('Error fetching saved posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session?.user) return;
    fetchSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const emptyState = useMemo(() => !loading && savedPosts.length === 0, [loading, savedPosts.length]);

  return (
    <div className="feed-container px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="fs-2 fw-black tracking-tighter text-white">Saved</h1>
          <p className="text-muted text-sm mt-1">Your saved posts and reels.</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Heart size={20} className="text-accent" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-accent" size={40} />
        </div>
      ) : emptyState ? (
        <div className="flex flex-col items-center justify-center py-32 text-center gap-6">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 glass">
            <Camera size={40} className="text-white/20" />
          </div>
          <div>
            <h2 className="fw-black fs-2 mb-2">Nothing saved yet</h2>
            <p className="text-muted fs-5 max-w-[280px]">
              Tap the bookmark icon on posts or reels to save them here.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {savedPosts.map((post) => (
            <Post key={post.postId} {...post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Saved;

