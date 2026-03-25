import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Loader2, Bookmark, FolderArchive, Sparkles } from 'lucide-react';
import Post from '../components/Post';
import { motion, AnimatePresence } from 'framer-motion';

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
    if (session?.user) fetchSaved();
  }, [session]);

  const emptyState = useMemo(() => !loading && savedPosts.length === 0, [loading, savedPosts.length]);

  return (
    <div className="max-w-[700px] mx-auto py-12 px-6 pb-32">
      <div className="mb-12 flex items-center justify-between">
        <div className="flex flex-col gap-2">
           <h1 className="text-4xl font-black tracking-tighter text-text-main italic uppercase flex items-center gap-4">
              <Bookmark size={32} className="text-accent" /> Archive
           </h1>
           <p className="text-text-secondary text-[14px] font-bold uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} className="text-accent" /> Your curated collection
           </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
          <Loader2 className="animate-spin text-accent" size={48} />
          <span className="text-[11px] font-black tracking-[0.3em] text-text-muted uppercase italic">Accessing Archives...</span>
        </div>
      ) : emptyState ? (
        <div className="flex flex-col items-center justify-center py-40 text-center gap-8 bg-bg-card rounded-[40px] border border-border-soft">
           <Bookmark size={64} className="text-text-muted opacity-20" strokeWidth={1} />
           <div className="flex flex-col gap-2">
              <h2 className="font-black text-2xl text-text-main uppercase tracking-tighter italic">Vault Empty</h2>
              <p className="text-text-secondary font-bold text-[12px] tracking-wide max-w-[280px] uppercase mt-2">Save transmissions from the feed to see them here.</p>
           </div>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          <AnimatePresence>
            {savedPosts.map((post, i) => (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={post.postId}>
                 <Post {...post} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Saved;
