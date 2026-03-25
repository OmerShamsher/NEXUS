import React, { useEffect, useState } from 'react';
import Post from '../components/Post';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Camera, Loader2, ChevronRight, Hash, Facebook, Twitter, Youtube, Plus } from 'lucide-react';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
          likesCount: '12,384', 
          commentsTotal: '568'
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
    window.addEventListener('refresh-feed', fetchPosts);
    return () => window.removeEventListener('refresh-feed', fetchPosts);
  }, []);

  const stories = [
    { name: 'Emma', img: 'https://i.pravatar.cc/150?u=emma', unread: true },
    { name: 'Jason', img: 'https://i.pravatar.cc/150?u=jason', unread: true },
    { name: 'TravelNow', img: 'https://i.pravatar.cc/150?u=travel', unread: true },
    { name: 'FoodieLover', img: 'https://i.pravatar.cc/150?u=food', unread: true },
  ];

  return (
    <div className="feed-grid">
      {/* Left Main Feed */}
      <div className="flex flex-col">
        {/* Stories Section */}
        <div className="bg-white border border-border-soft rounded-[32px] p-8 mb-10 shadow-sm flex items-center gap-8 overflow-x-auto no-scrollbar scrollbar-hide">
             {/* Your Story */}
             <div className="flex flex-col items-center gap-3 group cursor-pointer shrink-0" onClick={() => window.dispatchEvent(new CustomEvent('open-create-post'))}>
                <div className="relative">
                   <div className="w-[84px] h-[84px] rounded-full border-[3px] border-accent/20 p-1 bg-white">
                      <div className="w-full h-full rounded-full overflow-hidden bg-bg-app flex items-center justify-center">
                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=me`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="Me" />
                      </div>
                   </div>
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-11 h-11 bg-accent rounded-full border-[4px] border-white flex items-center justify-center text-white shadow-2xl z-20 group-hover:scale-110 transition-transform">
                      <Plus size={26} strokeWidth={4} />
                   </div>
                   <div className="absolute bottom-0 right-1 w-6 h-6 bg-red-500 rounded-lg border-[3px] border-white text-[10px] font-black flex items-center justify-center text-white shadow-lg z-30">5</div>
                </div>
                <span className="text-[11px] font-black text-text-main uppercase tracking-widest mt-1">Your Story</span>
             </div>

             {/* Dynamic Stories */}
             {stories.map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-3 group cursor-pointer shrink-0">
                   <div className="p-1 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]">
                      <div className="w-[70px] h-[70px] rounded-full border-2 border-white overflow-hidden bg-white">
                         <img src={s.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={s.name} />
                      </div>
                   </div>
                   <span className="text-[11px] font-black text-text-secondary uppercase tracking-widest group-hover:text-text-main transition-colors">{s.name}</span>
                </div>
             ))}
        </div>

        {/* FEED SECTION */}
        <div className="flex flex-col">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[40px] border border-border-soft">
              <Loader2 className="animate-spin text-accent" size={48} />
              <span className="text-[11px] font-black tracking-[0.3em] text-text-muted uppercase italic">Broadcasting Network...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center gap-8 bg-white rounded-[40px] border border-border-soft">
               <Camera size={72} className="text-text-muted opacity-10" strokeWidth={1} />
               <h2 className="font-black text-3xl tracking-tighter text-text-main uppercase italic">Signal Lost</h2>
               <button onClick={() => window.dispatchEvent(new CustomEvent('open-create-post'))} className="premium-btn px-12 py-5">
                  INITIATE TRANSMISSION
               </button>
            </div>
          ) : (
            posts.map((post) => (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} key={post.postId}>
                <Post {...post} />
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="flex flex-col gap-10 sticky top-[100px] h-fit">
         {/* Suggested for you */}
         <div className="bg-white border border-border-soft rounded-[32px] p-8 shadow-sm">
            <h3 className="text-[14px] font-black uppercase tracking-widest text-text-main mb-8">Suggested for you</h3>
            <div className="flex flex-col gap-8">
               {[
                 { name: 'Wanderlust_Jen', handle: 'Gommeng', img: 'https://i.pravatar.cc/150?u=jen' },
                 { name: 'Mike_Travels', handle: 'Gommeng', img: 'https://i.pravatar.cc/150?u=mike' },
                 { name: 'Healthy_Bites', handle: 'Commaing', img: 'https://i.pravatar.cc/150?u=foodie' },
               ].map((user, i) => (
                 <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <img src={user.img} className="w-12 h-12 rounded-full border border-border-soft shrink-0" alt="" />
                       <div className="flex flex-col truncate">
                          <span className="font-extrabold text-[13px] text-text-main truncate">{user.name}</span>
                          <span className="text-[11px] font-medium text-text-muted truncate">{user.handle}</span>
                       </div>
                    </div>
                    <button className="text-[11px] py-2 px-5 font-black uppercase text-accent border border-accent/20 rounded-xl hover:bg-accent hover:text-white transition-all cursor-pointer">Follow</button>
                 </div>
               ))}
            </div>
         </div>

         {/* Trending Topics */}
         <div className="bg-white border border-border-soft rounded-[32px] p-8 shadow-sm">
            <h3 className="text-[14px] font-black uppercase tracking-widest text-text-main mb-8">Trending Topics</h3>
            <div className="flex flex-col gap-5 border-t border-border-soft pt-6">
               {['#TravelGoals', '#FoodieAdventures', '#FitnessInspiration'].map((tag, i) => (
                 <div key={i} className="flex items-center gap-3 group cursor-pointer hover:translate-x-1 transition-all">
                    <span className="text-[11px] font-black text-accent opacity-50">•</span>
                    <span className="text-[14px] font-black text-accent tracking-tight">{tag}</span>
                 </div>
               ))}
            </div>
         </div>

         {/* Follow US */}
         <div className="bg-white border border-border-soft rounded-[32px] p-8 shadow-sm">
            <h3 className="text-[14px] font-black uppercase tracking-widest text-text-main mb-8">Follow us</h3>
            <div className="flex items-center gap-4">
               <button className="w-11 h-11 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition-all border-0 cursor-pointer"><Facebook fill="currentColor" size={20} /></button>
               <button className="w-11 h-11 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:scale-110 transition-all border-0 cursor-pointer"><Twitter fill="currentColor" size={20} /></button>
               <button className="w-11 h-11 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:scale-110 transition-all border-0 cursor-pointer"><Youtube fill="currentColor" size={20} /></button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Home;
