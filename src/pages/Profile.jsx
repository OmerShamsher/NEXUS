import React, { useState, useEffect } from 'react';
import { Settings, Grid, Bookmark, Tag, SquarePlus, Edit, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';

const Profile = () => {
  const { profile: currentUserProfile, session } = useAuth();
  const { id } = useParams();
  
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [targetProfile, setTargetProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // If no ID in URL, we are viewing our own profile. 
  // If ID matches session.user.id, it's also our own profile.
  const isOwnProfile = !id || (session?.user?.id === id);
  const targetUserId = id || session?.user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchData();
    }
  }, [targetUserId]);

  const fetchData = async () => {
    setLoading(true);
    
    // 1. Fetch Profile Data
    if (isOwnProfile) {
      setTargetProfile(currentUserProfile);
    } else {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();
      
      setTargetProfile(profileData);
    }

    // 2. Fetch User's Posts
    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    if (postsData) {
      setPosts(postsData);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  if (!targetProfile) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh] text-muted">
        <h3>User not found.</h3>
      </div>
    );
  }

  return (
    <div className="max-w-[935px] mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-12 mb-16">
        <div className="avatar w-32 h-32 md:w-44 md:h-44 p-1 md:p-1.5 bg-gradient-to-r from-accent to-purple-600 transition-transform hover:rotate-3">
           <div className="avatar-inner">
             <img src={targetProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetProfile.username}`} className="rounded-full w-full h-full object-cover bg-black" alt="" />
           </div>
        </div>
        
        <div className="flex-grow flex flex-col gap-6 w-full md:w-auto text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <h1 className="fs-3 fw-bold flex items-center gap-2 m-0">
               {targetProfile.username || 'Nexus User'}
               <CheckCircle size={18} className="text-blue-500 fill-current" />
            </h1>
            <div className="flex items-center gap-2 w-full md:w-auto">
               {isOwnProfile ? (
                 <>
                   <button className="premium-btn py-2 px-6 text-sm flex-grow md:flex-grow-0 bg-white/5 border border-white/10 hover:bg-white/10 text-white">Edit Profile</button>
                   <button className="premium-btn py-2 px-6 text-sm flex-grow md:flex-grow-0 bg-white/5 border border-white/10 hover:bg-white/10 text-white">View Archive</button>
                   <button className="p-2 hover:bg-white/5 rounded-xl border-0 bg-transparent text-white"><Settings size={22} /></button>
                 </>
               ) : (
                 <>
                   <button className="premium-btn py-2 px-8 text-sm flex-grow md:flex-grow-0 border-0 outline-none text-white">Follow</button>
                   <button className="premium-btn py-2 px-8 text-sm flex-grow md:flex-grow-0 bg-white/5 border border-white/10 hover:bg-white/10 text-white">Message</button>
                   <button className="p-2 hover:bg-white/5 rounded-xl border-0 bg-transparent text-white"><Settings size={22} /></button>
                 </>
               )}
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-10">
             <div className="flex items-center gap-1.5"><span className="fw-black text-lg">{posts.length}</span><span className="text-muted text-sm fs-5">posts</span></div>
             <div className="flex items-center gap-1.5 cursor-pointer hover:text-accent transition-colors"><span className="fw-black text-lg">1.2K</span><span className="text-muted text-sm fs-5">followers</span></div>
             <div className="flex items-center gap-1.5 cursor-pointer hover:text-accent transition-colors"><span className="fw-black text-lg">840</span><span className="text-muted text-sm fs-5">following</span></div>
          </div>

          <div className="flex flex-col gap-1">
             <span className="fw-black text-sm">{targetProfile.full_name || 'Premium Nexus Member'}</span>
             <p className="text-muted text-sm leading-relaxed max-w-md fs-5 m-0 mb-1">{targetProfile.bio || 'Digital architect crafting the next generation of social aesthetics. 🚀✨ #NexusElite'}</p>
             <a href="#" className="text-accent text-sm fw-bold no-underline decoration-accent hover:underline">nexus.social/{targetProfile.username}</a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="flex justify-center gap-16">
          {[
            { id: 'posts', icon: Grid, label: 'POSTS' },
            { id: 'reels', icon: SquarePlus, label: 'REELS' },
            { id: 'saved', icon: Bookmark, label: 'SAVED' },
            { id: 'tagged', icon: Tag, label: 'TAGGED' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 flex items-center gap-2 border-0 bg-transparent cursor-pointer transition-all duration-300 relative outline-none ${activeTab === tab.id ? 'text-white' : 'text-muted hover:text-white'}`}
            >
               {activeTab === tab.id && <motion.div layoutId="tab-active" className="absolute top-0 left-0 right-0 h-0.5 bg-accent" />}
               <tab.icon size={14} className={activeTab === tab.id ? 'text-accent' : ''} />
               <span className="text-xs fw-black tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-1 md:gap-7 py-8">
           {posts.length > 0 ? posts.map((post) => (
             <motion.div 
               whileHover={{ scale: 1.02 }}
               key={post.id} 
               className="aspect-square relative group cursor-pointer overflow-hidden rounded-xl border border-white/5 bg-black"
             >
                {post.type === 'video' ? (
                  <video src={post.content_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                ) : (
                  <img src={post.content_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-8 transition-opacity">
                   <div className="flex items-center gap-2 text-white fw-black"><Grid size={20} fill="white" /> -- </div>
                   <div className="flex items-center gap-2 text-white fw-black"><Bookmark size={20} fill="white" /> -- </div>
                </div>
             </motion.div>
           )) : (
             <div className="col-span-3 text-center py-20 text-muted">
               <Grid size={48} className="opacity-20 mx-auto mb-4" />
               <h3 className="fw-bold">No Posts Yet</h3>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
