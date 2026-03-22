import React, { useEffect, useState } from 'react';
import Post from '../components/Post';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Camera } from 'lucide-react';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    
    // Subscribe to new posts
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
        fetchPosts(); // Refresh on new post
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setPosts(data.map(p => ({
          id: p.id,
          username: p.profiles?.username || 'Unknown',
          avatar: p.profiles?.avatar_url,
          mediaUrl: p.content_url,
          caption: p.caption,
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

  return (
    <div className="feed-container px-4">
      {/* Stories - Premium Style */}
      <div className="flex gap-4 mb-10 overflow-x-auto py-4 scrollbar-hide no-scrollbar scrollbar-width-none h-[120px]">
        {['Your Story', 'Nexus', 'Designer', 'Coder', 'Gamer', 'Explorer', 'Artist'].map((name, i) => (
          <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer shrink-0 transition-transform hover:scale-105">
            <div className="avatar w-16 h-16 ring-2 ring-offset-2 ring-transparent ring-offset-black group-hover:ring-accent transition-all duration-500">
               <div className="avatar-inner">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt={name} />
               </div>
            </div>
            <span className="text-[10px] fw-black tracking-widest text-muted group-hover:text-white transition-colors">{name.toUpperCase()}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-accent" size={40} />
          </div>
        ) : (
          posts.map((post) => (
            <Post key={post.id} {...post} />
          ))
        )}
      </div>

      {posts.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-32 text-center gap-6">
           <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 glass">
              <Camera size={40} className="text-white/20" />
           </div>
           <div>
             <h2 className="fw-black fs-2 mb-2">Feed is Empty</h2>
             <p className="text-muted fs-5 max-w-[280px]">Be the first to share a moment with the community.</p>
           </div>
           <button 
             onClick={() => window.dispatchEvent(new CustomEvent('open-create-post'))}
             className="premium-btn px-10 text-xs tracking-widest fw-black"
           >
              START POSTING
           </button>
        </div>
      )}
    </div>
  );
};

export default Home;
