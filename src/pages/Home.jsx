import React, { useEffect, useState } from 'react';
import Post from '../components/Post';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Camera, ChevronRight, Hash, Facebook, Twitter, Youtube, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (id, username, avatar_url, full_name)
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
        fetchPosts(); 
      })
      .subscribe();

    const handleRefresh = () => fetchPosts();
    window.addEventListener('refresh-feed', handleRefresh);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('refresh-feed', handleRefresh);
    };
  }, []);

  const stories = [
    { name: 'Emma', img: 'https://i.pravatar.cc/150?u=emma', unread: true },
    { name: 'Jason', img: 'https://i.pravatar.cc/150?u=jason', unread: true },
    { name: 'TravelNow', img: 'https://i.pravatar.cc/150?u=travel', unread: false },
    { name: 'FoodieLover', img: 'https://i.pravatar.cc/150?u=food', unread: false },
    { name: 'Creative', img: 'https://i.pravatar.cc/150?u=art', unread: true },
  ];

  return (
    <div className="feed-grid">
      {/* Left Main Feed */}
      <div className="flex flex-col">
        {/* Stories Section */}
        <div className="bg-bg-card border border-border-soft rounded-[32px] p-6 mb-8 shadow-sm flex items-center gap-6 overflow-x-auto no-scrollbar scrollbar-hide">
             {/* Your Story */}
             <div className="flex flex-col items-center gap-2 group cursor-pointer shrink-0" onClick={() => window.dispatchEvent(new CustomEvent('open-create-post'))}>
                <div className="relative">
                   <div className="w-[72px] h-[72px] rounded-full border-2 border-border p-1">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=me`} className="w-full h-full rounded-full object-cover" alt="Your Story" />
                   </div>
                   <div className="absolute bottom-0 right-0 w-6 h-6 bg-accent rounded-full border-4 border-white flex items-center justify-center text-white text-[18px] font-black pb-0.5 shadow-md">
                      +
                   </div>
                </div>
                <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Your Story</span>
             </div>

             {/* Dynamic Stories */}
             {stories.map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer shrink-0">
                   <div className={`avatar-ring ${s.unread ? 'story-unread' : ''}`}>
                      <div className="w-[66px] h-[66px] rounded-full border-2 border-white overflow-hidden bg-bg-app">
                         <img src={s.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={s.name} />
                      </div>
                   </div>
                   <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">{s.name}</span>
                </div>
             ))}
        </div>

        {/* FEED SECTION */}
        <div className="flex flex-col gap-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6 bg-bg-card rounded-[40px] border border-border-soft">
              <Loader2 className="animate-spin text-accent" size={48} />
              <span className="text-[10px] font-black tracking-[0.3em] text-text-muted uppercase italic">Syncing Network...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center gap-8 bg-bg-card rounded-[40px] border border-border-soft">
               <Camera size={64} className="text-text-muted opacity-20" strokeWidth={1} />
               <div className="flex flex-col gap-2">
                 <h2 className="font-black text-3xl tracking-tighter text-text-main uppercase italic">Void Detected</h2>
                 <p className="text-text-secondary font-bold text-[13px] tracking-wide max-w-[320px] leading-relaxed uppercase">Start the transmission by sharing your first moment.</p>
               </div>
               <button onClick={() => window.dispatchEvent(new CustomEvent('open-create-post'))} className="premium-btn px-12 py-5">
                  TRANSMIT SIGNAL
               </button>
            </div>
          ) : (
            posts.map((post) => (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} key={post.postId}>
                <Post {...post} />
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="flex flex-col gap-8 sticky top-28 h-fit">
         {/* Suggested for you */}
         <div className="card-premium p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-[14px] font-black uppercase tracking-widest text-text-main">Suggested for you</h3>
               <button className="text-[11px] font-black text-accent uppercase tracking-widest hover:underline border-0 bg-transparent cursor-pointer">View All</button>
            </div>
            
            <div className="flex flex-col gap-6">
               {[
                 { name: 'Wanderlust_Jen', handle: 'Gommeng', img: 'https://i.pravatar.cc/150?u=jen' },
                 { name: 'Mike_Travels', handle: 'Gommeng', img: 'https://i.pravatar.cc/150?u=mike' },
                 { name: 'Healthy_Bites', handle: 'Commaing', img: 'https://i.pravatar.cc/150?u=foodie' },
               ].map((user, i) => (
                 <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <img src={user.img} className="w-11 h-11 rounded-full border border-border-soft" alt="" />
                       <div className="flex flex-col">
                          <span className="font-extrabold text-[13px] text-text-main">{user.name}</span>
                          <span className="text-[11px] font-medium text-text-muted">{user.handle}</span>
                       </div>
                    </div>
                    <button className="secondary-btn text-[11px] py-1.5 px-4 font-black uppercase text-accent border-accent/20 hover:bg-accent/5">Follow</button>
                 </div>
               ))}
            </div>
         </div>

         {/* Trending Topics */}
         <div className="card-premium p-8">
            <h3 className="text-[14px] font-black uppercase tracking-widest text-text-main mb-8">Trending Topics</h3>
            <div className="flex flex-col gap-4">
               {['#TravelGoals', '#FoodieAdventures', '#FitnessInspiration', '#TechTrends', '#ArtisticSoul'].map((tag, i) => (
                 <div key={i} className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-bg-app flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all">
                       <Hash size={16} strokeWidth={3} />
                    </div>
                    <span className="text-[13px] font-bold text-text-secondary group-hover:text-accent transition-colors">{tag}</span>
                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 text-accent transition-all" />
                 </div>
               ))}
            </div>
         </div>

         {/* Follow US & Footer */}
         <div className="card-premium p-8">
            <h3 className="text-[14px] font-black uppercase tracking-widest text-text-main mb-8 text-center">Follow us</h3>
            <div className="flex items-center justify-center gap-6 mb-8">
               <button className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-all border-0 cursor-pointer shadow-lg shadow-blue-600/30">
                  <Facebook fill="currentColor" size={20} />
               </button>
               <button className="w-12 h-12 rounded-full bg-sky-400 text-white flex items-center justify-center hover:scale-110 transition-all border-0 cursor-pointer shadow-lg shadow-sky-400/30">
                  <Twitter fill="currentColor" size={20} />
               </button>
               <button className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center hover:scale-110 transition-all border-0 cursor-pointer shadow-lg shadow-red-600/30">
                  <Youtube fill="currentColor" size={20} />
               </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] font-black uppercase text-text-muted tracking-widest">
               <span className="hover:text-accent cursor-pointer">About</span>
               <span className="hover:text-accent cursor-pointer">Help</span>
               <span className="hover:text-accent cursor-pointer">Privacy</span>
               <span className="hover:text-accent cursor-pointer">Terms</span>
               <span className="hover:text-accent cursor-pointer">Locations</span>
            </div>
            <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mt-6 opacity-40">© 2026 NEXUS FROM MYAPP</p>
         </div>
      </div>
    </div>
  );
};

export default Home;
