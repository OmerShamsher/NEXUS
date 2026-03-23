import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Grid, Bookmark, Tag, SquarePlus, CheckCircle, Loader2, Heart, MessageCircle, MapPin, Link as LinkIcon, Calendar, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
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
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = !id || (session?.user?.id === id);
  const targetUserId = id || session?.user?.id;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Profile Info
      if (isOwnProfile) {
        setTargetProfile(currentUserProfile);
      } else {
        const { data: pData } = await supabase.from('profiles').select('*').eq('id', targetUserId).single();
        setTargetProfile(pData);
      }

      // Posts
      const { data: pData } = await supabase.from('posts').select('*').eq('user_id', targetUserId).order('created_at', { ascending: false });
      setPosts(pData || []);
      setReelsPosts((pData || []).filter(p => p.type === 'video'));

      // Saved (only own)
      if (isOwnProfile) {
        const { data: sData } = await supabase.from('saves').select('post_id').eq('user_id', targetUserId);
        if (sData?.length > 0) {
          const { data: spData } = await supabase.from('posts').select('*').in('id', sData.map(s => s.post_id));
          setSavedPosts(spData || []);
        }
      }

      // Follows
      const { count: followers } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', targetUserId);
      const { count: following } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', targetUserId);
      setFollowersCount(followers || 0);
      setFollowingCount(following || 0);

      if (!isOwnProfile && session?.user?.id) {
        const { data: fc } = await supabase.from('follows').select('created_at').eq('follower_id', session.user.id).eq('following_id', targetUserId).maybeSingle();
        setIsFollowing(!!fc);
      }
    } catch {
      // Setup error but ignore safely
    } finally {
      setLoading(false);
    }
  }, [isOwnProfile, targetUserId, currentUserProfile, session?.user?.id]);

  useEffect(() => {
    if (targetUserId) {
      fetchData();
    }
  }, [targetUserId, fetchData]);

  const handleFollow = async () => {
    if (followLoading || isOwnProfile) return;
    setFollowLoading(true);
    const next = !isFollowing;
    setIsFollowing(next);
    setFollowersCount(prev => next ? prev + 1 : prev - 1);
    try {
      if (next) await supabase.from('follows').insert({ follower_id: session.user.id, following_id: targetUserId });
      else await supabase.from('follows').delete().eq('follower_id', session.user.id).eq('following_id', targetUserId);
    } catch {
      setIsFollowing(!next);
      setFollowersCount(prev => !next ? prev + 1 : prev - 1);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin text-accent" size={48} strokeWidth={1.5} />
      <span className="text-sm font-bold tracking-widest text-white/20 uppercase">Building Profile...</span>
    </div>
  );

  if (!targetProfile) return <div className="p-20 text-center text-muted">User not found.</div>;

  return (
    <div className="max-w-[1000px] mx-auto py-12 px-6 pb-24">
      {/* Premium Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[40px] p-8 md:p-12 border border-white/5 mb-16 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-secondary/5 blur-[100px] rounded-full -ml-20 -mb-20"></div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-12 relative z-10">
          {/* Avatar Section */}
          <div className="relative group shrink-0">
             <div className="absolute inset-[-10px] bg-gradient-neon rounded-full blur-[20px] opacity-10 group-hover:opacity-30 transition-opacity duration-700"></div>
             <div className="relative w-36 h-36 md:w-48 md:h-48 p-1.5 bg-gradient-to-tr from-accent to-accent-secondary rounded-full">
                <div className="w-full h-full rounded-full border-[6px] border-[#0c0c0c] overflow-hidden bg-zinc-900 ring-1 ring-white/10">
                   <img src={targetProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetProfile.username}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                </div>
                <div className="absolute bottom-4 right-4 w-7 h-7 bg-green-500 rounded-full border-[4px] border-[#0c0c0c] shadow-lg"></div>
             </div>
          </div>

          <div className="flex-grow flex flex-col gap-6 text-center md:text-left pt-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-2.5">
                    <h1 className="text-3xl font-black tracking-tighter text-white m-0 uppercase">{targetProfile.username}</h1>
                    <CheckCircle size={22} fill="var(--accent)" color="white" className="drop-shadow-[0_0_8px_var(--accent-glow)]" />
                 </div>
                 <span className="text-accent font-bold text-xs tracking-[0.2em] uppercase opacity-70">Nexus Verified Elite</span>
               </div>

               <div className="flex items-center gap-3">
                  {isOwnProfile ? (
                    <>
                      <button className="premium-btn py-3 px-8 text-xs font-black tracking-widest uppercase">Edit Profile</button>
                      <button className="w-11 h-11 flex items-center justify-center glass hover:bg-white/10 rounded-2xl transition-all text-white p-0 border-0 cursor-pointer"><Settings size={22} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleFollow} className={`premium-btn py-3.5 px-10 text-xs font-black tracking-widest uppercase ${isFollowing ? 'bg-white/5 shadow-none border border-white/10' : ''}`}>
                        {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
                      </button>
                      <button onClick={() => navigate('/messages', { state: { directUserId: targetProfile.id, directUsername: targetProfile.username, directAvatar: targetProfile.avatar_url } })} className="w-12 h-12 flex items-center justify-center glass hover:bg-white/10 rounded-2xl transition-all text-white p-0 border-0 cursor-pointer"><MessageCircle size={22} /></button>
                    </>
                  )}
               </div>
            </div>

            {/* Stats Block */}
            <div className="flex items-center justify-center md:justify-start gap-12 lg:gap-16">
               <div className="flex flex-col">
                  <span className="text-2xl font-black text-white leading-none">{posts.length}</span>
                  <span className="text-[11px] font-bold text-white/40 tracking-widest uppercase mt-1">Posts</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-2xl font-black text-white leading-none">{followersCount.toLocaleString()}</span>
                  <span className="text-[11px] font-bold text-white/40 tracking-widest uppercase mt-1">Followers</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-2xl font-black text-white leading-none">{followingCount.toLocaleString()}</span>
                  <span className="text-[11px] font-bold text-white/40 tracking-widest uppercase mt-1">Following</span>
               </div>
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-4 mt-2">
               <div className="flex flex-col gap-1">
                  <span className="font-extrabold text-[15px] text-white tracking-tight">{targetProfile.full_name || 'Nexus Premium Member'}</span>
                  <p className="text-zinc-400 text-[14px] leading-relaxed max-w-lg m-0 font-medium">
                    {targetProfile.bio || 'Designing the digital frontier. Exploring the space between reality and the interface. 🚀'}
                  </p>
               </div>
               
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white/40"><MapPin size={14} /> New York, NY</div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-accent"><LinkIcon size={14} /> <span className="hover:underline cursor-pointer">nexus.elite/vip</span></div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white/40"><Calendar size={14} /> Joined March 2024</div>
               </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-col gap-8">
        <div className="flex justify-center border-b border-white/[0.03]">
           {[
             { id: 'posts', icon: Grid, label: 'FEED' },
             { id: 'reels', icon: SquarePlus, label: 'REELS' },
             { id: 'saved', icon: Bookmark, label: 'SAVED' },
             { id: 'tagged', icon: Tag, label: 'TAGGED' }
           ].map(tab => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`px-10 py-5 flex items-center gap-2.5 border-0 bg-transparent cursor-pointer transition-all relative group overflow-hidden ${activeTab === tab.id ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
             >
                {activeTab === tab.id && (
                  <motion.div layoutId="profile-tab-active" className="absolute top-0 left-0 right-0 h-[3px] bg-accent shadow-[0_0_15px_var(--accent-glow)] rounded-full" />
                )}
                <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 1.5} className="group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-black tracking-[0.1em] uppercase">{tab.label}</span>
             </button>
           ))}
        </div>

        {/* Content Grid */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-8"
          >
             {(() => {
                const gridData = activeTab === 'posts' ? posts : activeTab === 'reels' ? reelsPosts : activeTab === 'saved' ? savedPosts : [];
                
                if (gridData.length === 0) return (
                  <div className="col-span-3 flex flex-col items-center justify-center py-32 text-center gap-6">
                     <div className="w-24 h-24 rounded-[40px] bg-white/[0.02] border border-white/5 flex items-center justify-center shadow-inner">
                        <Grid size={40} className="text-white/10" strokeWidth={1} />
                     </div>
                     <div className="flex flex-col gap-1">
                        <h3 className="font-extrabold text-xl text-white uppercase tracking-tight italic">No active moments</h3>
                        <p className="text-white/40 font-bold text-[12px] tracking-wide max-w-[280px] uppercase mt-2">When sharing begins, the magic will happen right here.</p>
                     </div>
                  </div>
                );

                return gridData.map((post, i) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={post.id}
                    className="aspect-square relative group cursor-pointer overflow-hidden rounded-3xl sm:rounded-[32px] bg-zinc-900 border border-transparent hover:border-white/20 transition-all duration-700 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                  >
                     {post.type === 'video' ? (
                        <>
                          <video src={post.content_url} className="w-full h-full object-cover transition-all duration-[1.5s] group-hover:scale-110" muted loop playsInline />
                          <div className="absolute top-4 right-4 z-10">
                            <Play size={20} fill="white" className="drop-shadow-lg opacity-80" />
                          </div>
                        </>
                     ) : (
                        <img src={post.content_url} className="w-full h-full object-cover transition-all duration-[1.5s] group-hover:scale-110" alt="" />
                     )}
                     
                     <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-8 transition-all duration-500 backdrop-blur-[2px] z-20">
                        <div className="flex flex-col items-center gap-1.5 text-white font-black group/icon">
                           <Heart size={24} fill="white" className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] group-hover/icon:scale-110 transition-transform" /> 
                           <span className="text-sm">--</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 text-white font-black group/icon">
                           <MessageCircle size={24} fill="white" className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] group-hover/icon:scale-110 transition-transform" /> 
                           <span className="text-sm">--</span>
                        </div>
                     </div>
                  </motion.div>
                ));
             })()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;
