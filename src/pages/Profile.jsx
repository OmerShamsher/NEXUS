import React, { useState, useEffect } from 'react';
import { Settings, Grid, Bookmark, Tag, SquarePlus, CheckCircle, Loader2, ArrowRight, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';

const Profile = () => {
  const { profile: currentUserProfile, session } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [reelsPosts, setReelsPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [targetProfile, setTargetProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Follow State
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = !id || (session?.user?.id === id);
  const targetUserId = id || session?.user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchData();
    }
  }, [targetUserId]);

  const fetchData = async () => {
    setLoading(true);
    
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

    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    if (postsData) {
      setPosts(postsData);
      setReelsPosts((postsData || []).filter((p) => p.type === 'video'));
    } else {
      setPosts([]);
      setReelsPosts([]);
    }

    // Saved posts (only for own profile)
    if (isOwnProfile) {
      const { data: savesData, error: savesErr } = await supabase
        .from('saves')
        .select('post_id, created_at')
        .eq('user_id', targetUserId);

      if (!savesErr && savesData && savesData.length > 0) {
        const postIds = savesData.map((s) => s.post_id);
        const saveCreatedAtByPostId = new Map(savesData.map((s) => [s.post_id, s.created_at]));

        const { data: savedPostsData } = await supabase
          .from('posts')
          .select('*')
          .in('id', postIds);

        const sorted = (savedPostsData || []).sort((a, b) => {
          const at = saveCreatedAtByPostId.get(a.id);
          const bt = saveCreatedAtByPostId.get(b.id);
          return new Date(bt).getTime() - new Date(at).getTime();
        });
        setSavedPosts(sorted);
      } else {
        setSavedPosts([]);
      }
    } else {
      setSavedPosts([]);
    }

    // Fetch Follow Data
    const { count: followers } = await supabase.from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', targetUserId);
      
    const { count: following } = await supabase.from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', targetUserId);

    setFollowersCount(followers || 0);
    setFollowingCount(following || 0);

    if (!isOwnProfile && session?.user?.id) {
      const { data: followCheck } = await supabase.from('follows')
        .select('created_at')
        .eq('follower_id', session.user.id)
        .eq('following_id', targetUserId)
        .maybeSingle();

      if (followCheck) setIsFollowing(true);
      else setIsFollowing(false);
    }
    
    setLoading(false);
  };

  const handleFollowToggle = async () => {
    if (followLoading || !session?.user || isOwnProfile) return;
    setFollowLoading(true);

    try {
      if (isFollowing) {
        await supabase.from('follows')
          .delete()
          .eq('follower_id', session.user.id)
          .eq('following_id', targetUserId);
        setFollowersCount(p => p - 1);
        setIsFollowing(false);
      } else {
        await supabase.from('follows')
          .insert({ follower_id: session.user.id, following_id: targetUserId });
        setFollowersCount(p => p + 1);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  const startMessage = () => {
    if (!targetProfile) return;
    // Simple redirect passing state so Messages can open a chat tab
    navigate('/messages', { state: { directUserId: targetProfile.id, directUsername: targetProfile.username, directAvatar: targetProfile.avatar_url } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <Loader2 className="animate-spin text-white" size={40} />
      </div>
    );
  }

  if (!targetProfile) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh] text-zinc-500">
        <h3>User not found.</h3>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto py-12 px-6 lg:px-10">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-10 lg:gap-16 mb-16">
        <div className="relative group shrink-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-zinc-800 to-zinc-400 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <div className="avatar w-32 h-32 md:w-44 md:h-44 p-1 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-300 relative z-10">
             <div className="w-full h-full rounded-full border-4 border-black overflow-hidden bg-black">
               <img src={targetProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetProfile.username}`} className="w-full h-full object-cover" alt="" />
             </div>
          </div>
        </div>
        
        <div className="flex-grow flex flex-col gap-6 w-full md:w-auto text-center md:text-left pt-2">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <h1 className="text-2xl font-black flex items-center gap-2 m-0 tracking-tight text-white">
               {targetProfile.username || 'Nexus User'}
               <CheckCircle size={18} className="text-white fill-current opacity-80" />
            </h1>
            <div className="flex items-center gap-3 w-full md:w-auto">
               {isOwnProfile ? (
                 <>
                   <button className="bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-bold text-sm py-2 px-6 rounded-xl transition-colors flex-grow md:flex-grow-0 cursor-pointer">Edit Profile</button>
                   <button className="bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-bold text-sm py-2 px-6 rounded-xl transition-colors flex-grow md:flex-grow-0 cursor-pointer">Archive</button>
                   <button className="p-2 hover:bg-zinc-900 rounded-xl transition-colors text-white cursor-pointer"><Settings size={22} /></button>
                 </>
               ) : (
                 <>
                   <button 
                     onClick={handleFollowToggle}
                     disabled={followLoading}
                     className={`${isFollowing ? 'bg-zinc-900 hover:bg-zinc-800 border-white/10 border' : 'bg-white hover:bg-zinc-200 text-black border-transparent'} font-bold text-sm py-2 px-8 rounded-xl transition-colors flex-grow md:flex-grow-0 cursor-pointer`}
                   >
                     {isFollowing ? 'Following' : 'Follow'}
                   </button>
                   <button onClick={startMessage} className="bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-bold text-sm py-2 px-8 rounded-xl transition-colors flex-grow md:flex-grow-0 cursor-pointer">Message</button>
                   <button className="p-2 hover:bg-zinc-900 rounded-xl transition-colors text-white cursor-pointer"><Settings size={22} /></button>
                 </>
               )}
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-8 lg:gap-12">
             <div className="flex items-center gap-2"><span className="font-black text-lg text-white">{posts.length}</span><span className="text-zinc-500 font-medium text-sm">posts</span></div>
             <div className="flex items-center gap-2"><span className="font-black text-lg text-white">{followersCount.toLocaleString()}</span><span className="text-zinc-500 font-medium text-sm">followers</span></div>
             <div className="flex items-center gap-2"><span className="font-black text-lg text-white">{followingCount.toLocaleString()}</span><span className="text-zinc-500 font-medium text-sm">following</span></div>
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
             <span className="font-black text-sm text-white">{targetProfile.full_name || 'Premium Member'}</span>
             <p className="text-zinc-400 text-sm leading-relaxed max-w-lg m-0">{targetProfile.bio || 'Designing the future of human connection. Redefining what it means to be social. 🚀'}</p>
             <a href="#" className="font-bold text-xs mt-1 text-white hover:underline underline-offset-4 opacity-70 hover:opacity-100 transition-opacity">nexus.social/{targetProfile.username}</a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.05]">
        <div className="flex justify-center gap-12 lg:gap-16">
          {[
            { id: 'posts', icon: Grid, label: 'POSTS' },
            { id: 'reels', icon: SquarePlus, label: 'REELS' },
            { id: 'saved', icon: Bookmark, label: 'SAVED' },
            { id: 'tagged', icon: Tag, label: 'TAGGED' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-5 flex items-center gap-2 border-0 bg-transparent cursor-pointer transition-colors relative outline-none ${activeTab === tab.id ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
               {activeTab === tab.id && <motion.div layoutId="profile-tab" className="absolute top-0 left-0 right-0 h-px bg-white" />}
               <tab.icon size={14} className={activeTab === tab.id ? 'text-white' : ''} />
               <span className="text-xs font-black tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-1 md:gap-[28px] py-4">
           {(() => {
             const gridPosts =
               activeTab === 'posts'
                 ? posts
                 : activeTab === 'reels'
                   ? reelsPosts
                   : activeTab === 'saved'
                     ? savedPosts
                     : [];

             if (activeTab === 'tagged') {
               return (
                 <div className="col-span-3 flex flex-col items-center justify-center py-24 text-zinc-600">
                   <div className="w-20 h-20 rounded-full border border-zinc-800 flex items-center justify-center mb-4">
                     <Tag size={32} strokeWidth={1.5} />
                   </div>
                   <h3 className="font-black text-xl text-white mb-2">Tagged photos</h3>
                   <p className="text-sm font-medium">
                     This demo does not include tagged media yet.
                   </p>
                 </div>
               );
             }

             if (gridPosts.length === 0) {
               return (
                 <div className="col-span-3 flex flex-col items-center justify-center py-24 text-zinc-600">
                   <div className="w-20 h-20 rounded-full border border-zinc-800 flex items-center justify-center mb-4">
                     <Grid size={32} strokeWidth={1.5} />
                   </div>
                   <h3 className="font-black text-xl text-white mb-2">
                     {activeTab === 'saved' ? 'No Saved Posts' : 'No Posts Yet'}
                   </h3>
                   <p className="text-sm font-medium">
                     {activeTab === 'saved'
                       ? 'Bookmark posts and reels to see them here.'
                       : 'When they share photos or reels, they will appear here.'}
                   </p>
                 </div>
               );
             }

             return gridPosts.map((post) => (
             <motion.div 
               whileHover={{ scale: 1.01 }}
               key={post.id} 
               className="aspect-square relative group cursor-pointer overflow-hidden bg-zinc-900 border border-transparent hover:border-white/10 transition-colors"
             >
                {post.type === 'video' ? (
                  <video src={post.content_url} className="w-full h-full object-cover transition-transform duration-700" />
                ) : (
                  <img src={post.content_url} className="w-full h-full object-cover transition-transform duration-700" alt="" />
                )}
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-6 transition-all duration-300 backdrop-blur-sm">
                   <div className="flex items-center gap-2 text-white font-black"><Heart size={20} fill="white" /> -- </div>
                   <div className="flex items-center gap-2 text-white font-black"><MessageCircle size={20} fill="white" /> -- </div>
                </div>
             </motion.div>
             ));
           })()}
        </div>
      </div>
    </div>
  );
};

export default Profile;
