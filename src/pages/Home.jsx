import React, { useEffect, useState } from 'react';
import Post from '../components/Post';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Camera } from 'lucide-react';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (id, username, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setPosts(data.map(p => ({
          postId: p.id,
          userId: p.profiles?.id,
          username: p.profiles?.username || 'Unknown',
          avatar: p.profiles?.avatar_url,
          mediaUrl: p.content_url,
          caption: p.caption,
          type: p.type || 'image',
          likesTotal: 0, 
          commentsTotal: 0
        })));
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    
    // Subscribe to new posts
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
        fetchPosts(); // Refresh on new post
      })
      .subscribe();

    // Listen for custom trigger from CreatePost modal
    const handleRefresh = () => fetchPosts();
    window.addEventListener('refresh-feed', handleRefresh);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('refresh-feed', handleRefresh);
    };
  }, []);

  return (
    <div className="feed-container px-6 max-w-[600px] pb-20 pt-8 sm:pt-12">
      {/* Stories - Masterclass Style */}
      <div className="flex gap-5 mb-14 overflow-x-auto py-2 scrollbar-hide no-scrollbar scrollbar-width-none items-start">
        {/* Your Story */}
        <div className="flex flex-col items-center gap-2.5 group cursor-pointer shrink-0 transition-transform active:scale-95" onClick={() => window.dispatchEvent(new CustomEvent('open-create-post'))}>
          <div className="relative">
             <div className="absolute inset-[-4px] bg-gradient-neon rounded-full blur-[8px] opacity-20 group-hover:opacity-60 transition-opacity"></div>
             <div className="relative w-[76px] h-[76px] p-[3px] bg-gradient-insta rounded-full group-hover:rotate-[10deg] transition-transform duration-500">
                <div className="w-full h-full rounded-full border-[3px] border-[#050505] overflow-hidden bg-zinc-900 flex items-center justify-center relative">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=me`} alt="Your Story" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute inset-0 bg-black/40"></div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-white/50 bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                   <span className="text-white text-xl font-black mb-1">+</span>
                </div>
             </div>
          </div>
          <span className="text-[11px] font-black tracking-widest uppercase text-white/50 group-hover:text-white transition-colors">Your Story</span>
        </div>

        {/* Other Stories */}
        {['Nexus', 'Creative', 'Hacker', 'Design', 'Future', 'Social', 'Global'].map((name, i) => (
          <div key={i} className="flex flex-col items-center gap-2.5 group cursor-pointer shrink-0 transition-transform active:scale-95">
            <div className="relative">
              <div className="absolute inset-[-4px] bg-white/5 rounded-full blur-[4px] group-hover:bg-accent/40 transition-all duration-500"></div>
              <div className="relative w-[76px] h-[76px] p-[3px] bg-gradient-to-tr from-accent to-accent-secondary rounded-full group-hover:scale-105 transition-all duration-500">
                 <div className="w-full h-full rounded-full border-[3px] border-[#050505] overflow-hidden bg-zinc-900 shadow-inner">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name + i}`} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
                 </div>
              </div>
            </div>
            <span className="text-[11px] font-black tracking-widest uppercase text-white/50 group-hover:text-white transition-colors">{name}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative">
               <div className="absolute inset-0 bg-accent rounded-full blur-[30px] opacity-20 animate-pulse"></div>
               <Loader2 className="animate-spin text-accent relative z-10" size={48} strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase">Curating Feed...</span>
          </div>
        ) : (
          posts.map((post) => (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} key={post.postId}>
              <Post {...post} />
            </motion.div>
          ))
        )}
      </div>

      {posts.length === 0 && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-28 text-center gap-8"
        >
           <div className="relative group">
              <div className="absolute inset-0 bg-accent rounded-[40px] blur-[30px] opacity-10 group-hover:opacity-30 transition-opacity"></div>
              <div className="w-32 h-32 rounded-[40px] bg-white/[0.03] border border-white/10 flex items-center justify-center glass group-hover:rotate-[10deg] transition-transform duration-700">
                 <Camera size={44} className="text-white/40 group-hover:text-accent transition-colors" strokeWidth={1} />
              </div>
           </div>
           <div className="flex flex-col gap-2">
             <h2 className="font-black text-3xl tracking-tighter text-white uppercase italic">Echo Chamber Empty</h2>
             <p className="text-white/40 font-bold text-[13px] tracking-wide max-w-[320px] leading-relaxed uppercase">Your feed is waiting for its first masterpiece. Start the trend now.</p>
           </div>
           <button 
             onClick={() => window.dispatchEvent(new CustomEvent('open-create-post'))}
             className="premium-btn px-12 py-5 text-[11px] font-black tracking-[0.3em] uppercase mt-2 group flex items-center gap-3"
           >
              TRANSMIT SIGNAL <Sparkles size={16} className="group-hover:rotate-45 transition-transform" />
           </button>
        </motion.div>
      )}
    </div>
  );
};

export default Home;
