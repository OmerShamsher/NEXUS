import React, { useEffect, useState } from 'react';
import Post from '../components/Post';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for the "Sexy" demo feel if DB is empty
  const mockPosts = [
    {
      id: 1,
      username: 'iam_omer',
      avatar: 'https://i.pravatar.cc/150?u=omer',
      mediaUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop',
      caption: 'Chasing sunsets in the digital dimension. ✨ #VibeCheck #NextLevel',
      likesTotal: 4208,
      commentsTotal: 89
    },
    {
      id: 2,
      username: 'nexus_elite',
      avatar: 'https://i.pravatar.cc/150?u=nexus',
      mediaUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop',
      caption: 'The future of social interaction is here. Join the revolution. 🚀',
      likesTotal: 12500,
      commentsTotal: 432
    },
    {
      id: 3,
      username: 'zara_studio',
      avatar: 'https://i.pravatar.cc/150?u=zara',
      mediaUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop',
      caption: 'Minimalism is the ultimate sophistication. 🖤 #Aesthetic',
      likesTotal: 892,
      commentsTotal: 24
    }
  ];

  useEffect(() => {
    fetchPosts();
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
      
      if (data && data.length > 0) {
        setPosts(data.map(p => ({
          id: p.id,
          username: p.profiles.username,
          avatar: p.profiles.avatar_url,
          mediaUrl: p.content_url,
          caption: p.caption,
          likesTotal: 0, // In real app, fetch from likes table
          commentsTotal: 0
        })));
      } else {
        setPosts(mockPosts); // Fallback to mocks for beauty
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setPosts(mockPosts);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feed-container px-4">
      {/* Stories - Premium Style */}
      <div className="flex gap-4 mb-10 overflow-x-auto py-4 scrollbar-hide no-scrollbar">
        {['Your Story', 'Alex', 'Sarah', 'Devin', 'Luna', 'Kiro', 'Neon'].map((name, i) => (
          <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer transition-transform hover:scale-105">
            <div className="avatar w-16 h-16 ring-2 ring-offset-2 ring-transparent ring-offset-black group-hover:ring-accent transition-all duration-500">
               <div className="avatar-inner">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt={name} />
               </div>
            </div>
            <span className="text-xs fw-medium text-muted group-hover:text-white transition-colors">{name}</span>
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
        <div className="text-center py-20">
           <Sparkles size={48} className="text-white/20 mx-auto mb-4" />
           <p className="text-muted">No posts found. Start making history!</p>
        </div>
      )}
    </div>
  );
};

export default Home;
