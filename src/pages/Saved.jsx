import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Loader2, Bookmark, FolderArchive } from 'lucide-react';
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
          commentsTotal: 0, // In a real app we'd fetch actual counts here
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
    <div className="max-w-[630px] mx-auto py-12 px-4 pb-32 min-h-screen relative">
      <div className="absolute top-[10%] right-[-20%] w-[300px] h-[300px] bg-accent/5 blur-[100px] rounded-full pointer-events-none"></div>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase text-white flex items-center gap-4">
             <div className="w-12 h-12 rounded-[18px] bg-white/5 border border-white/10 flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                <Bookmark size={24} strokeWidth={1.5} />
             </div>
             Archive
          </h1>
          <p className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase mt-2">Saved Transmissions & Signals</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center glass shadow-[0_0_15px_var(--accent-glow)]">
          <FolderArchive size={20} className="text-accent" />
        </div>
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
           <div className="relative">
              <div className="absolute inset-0 bg-accent rounded-full blur-[30px] opacity-20 animate-pulse"></div>
              <Loader2 size={48} className="text-accent animate-spin" strokeWidth={1.5} />
           </div>
           <span className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase">Retrieving Archive...</span>
        </div>
      ) : emptyState ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-center gap-6">
          <div className="relative group">
             <div className="absolute inset-0 bg-white/10 rounded-full blur-[40px] opacity-10"></div>
             <div className="w-24 h-24 rounded-[40px] bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto relative z-10 glass">
               <Bookmark size={40} className="text-white/20" strokeWidth={1} />
             </div>
          </div>
          <div>
            <h2 className="font-extrabold text-2xl text-white tracking-tight uppercase italic mb-2">Archive is Empty</h2>
            <p className="text-muted text-sm max-w-[280px] font-medium tracking-wide mx-auto cursor-default opacity-80">
              Preserve important signals by tapping the bookmark icon on any transmission.
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-10">
          <AnimatePresence>
            {savedPosts.map((post, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={post.postId}
              >
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
