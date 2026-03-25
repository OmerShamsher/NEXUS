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
      if (isOwnProfile) {
        setTargetProfile(currentUserProfile);
      } else {
        const { data: pData } = await supabase.from('profiles').select('*').eq('id', targetUserId).single();
        setTargetProfile(pData);
      }

      const { data: pData } = await supabase.from('posts').select('*').eq('user_id', targetUserId).order('created_at', { ascending: false });
      setPosts(pData || []);
      setReelsPosts((pData || []).filter(p => p.type === 'video'));

      if (isOwnProfile) {
        const { data: sData } = await supabase.from('saves').select('post_id').eq('user_id', targetUserId);
        if (sData?.length > 0) {
          const { data: spData } = await supabase.from('posts').select('*').in('id', sData.map(s => s.post_id));
          setSavedPosts(spData || []);
        }
      }

      const { count: followers } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', targetUserId);
      const { count: following } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', targetUserId);
      setFollowersCount(followers || 0);
      setFollowingCount(following || 0);

      if (!isOwnProfile && session?.user?.id) {
        const { data: fc } = await supabase.from('follows').select('created_at').eq('follower_id', session.user.id).eq('following_id', targetUserId).maybeSingle();
        setIsFollowing(!!fc);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isOwnProfile, targetUserId, currentUserProfile, session?.user?.id]);

  useEffect(() => {
    if (targetUserId) fetchData();
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <Loader2 className="animate-spin text-accent" size={48} />
      <span className="text-[10px] font-black tracking-[0.3em] text-text-muted uppercase italic">Syncing Profile...</span>
    </div>
  );

  if (!targetProfile) return <div className="p-20 text-center text-text-muted font-bold">User session not established.</div>;

  return (
    <div className="max-w-[1000px] mx-auto py-12 px-6 pb-24">
      {/* Premium Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-10 md:p-14 mb-16 relative overflow-hidden bg-white shadow-xl">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-14 relative z-10">
          {/* Avatar Section */}
          <div className="relative group shrink-0">
             <div className="w-40 h-40 md:w-52 md:h-52 p-1.5 bg-gradient-to-tr from-accent to-purple-500 rounded-full shadow-2xl">
                <div className="w-full h-full rounded-full border-[6px] border-white overflow-hidden bg-bg-app">
                   <img src={targetProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetProfile.username}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                </div>
             </div>
          </div>

          <div className="flex-grow flex flex-col gap-8 text-center md:text-left pt-2">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="flex flex-col gap-2">
                 <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-black tracking-tighter text-text-main m-0 italic uppercase">{targetProfile.username}</h1>
                    <CheckCircle size={24} fill="var(--accent)" color="white" className="drop-shadow-lg" />
                 </div>
                 <span className="text-accent font-black text-[11px] tracking-[0.3em] uppercase opacity-80 italic">Nexus Elite Pro</span>
               </div>

               <div className="flex items-center gap-4">
                  {isOwnProfile ? (
                    <>
                      <button className="premium-btn py-4 px-10">Edit Profile</button>
                      <button className="secondary-btn w-14 h-14 flex items-center justify-center rounded-2xl"><Settings size={22} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleFollow} className={`premium-btn py-4 px-12 ${isFollowing ? 'secondary-btn !bg-white !text-text-main' : ''}`}>
                        {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
                      </button>
                      <button onClick={() => navigate('/messages', { state: { directUserId: targetProfile.id, directUsername: targetProfile.username, directAvatar: targetProfile.avatar_url } })} className="secondary-btn w-14 h-14 flex items-center justify-center rounded-2xl"><MessageCircle size={22} /></button>
                    </>
                  )}
               </div>
            </div>

            {/* Stats Block */}
            <div className="flex items-center justify-center md:justify-start gap-16 lg:gap-20">
               <div className="flex flex-col">
                  <span className="text-3xl font-black text-text-main leading-none italic">{posts.length}</span>
                  <span className="text-[10px] font-black text-text-muted tracking-[0.2em] uppercase mt-2">Publications</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-3xl font-black text-text-main leading-none italic">{followersCount.toLocaleString()}</span>
                  <span className="text-[10px] font-black text-text-muted tracking-[0.2em] uppercase mt-2">Followers</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-3xl font-black text-text-main leading-none italic">{followingCount.toLocaleString()}</span>
                  <span className="text-[10px] font-black text-text-muted tracking-[0.2em] uppercase mt-2">Following</span>
               </div>
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-4 mt-2">
               <div className="flex flex-col gap-2">
                  <span className="font-black text-[17px] text-text-main tracking-tight uppercase italic">{targetProfile.full_name || 'Premium Member'}</span>
                  <p className="text-text-secondary text-[15px] leading-relaxed max-w-lg m-0 font-medium">
                    {targetProfile.bio || 'Transcending reality through code and design. Welcome to the Nexus.'}
                  </p>
               </div>
               
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-2">
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-text-muted"><MapPin size={16} className="text-accent" /> San Francisco, CA</div>
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-accent"><LinkIcon size={16} /> <span className="hover:underline cursor-pointer">myapp.bio/nexus</span></div>
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-text-muted"><Calendar size={16} /> Est. Oct 2025</div>
               </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-col gap-10">
        <div className="flex justify-center gap-1">
           {[
             { id: 'posts', icon: Grid, label: 'Feed' },
             { id: 'reels', icon: SquarePlus, label: 'Reels' },
             { id: 'saved', icon: Bookmark, label: 'Saved' },
             { id: 'tagged', icon: Tag, label: 'Tagged' }
           ].map(tab => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`px-12 py-5 flex items-center gap-3 border-0 bg-transparent cursor-pointer transition-all relative ${activeTab === tab.id ? 'text-accent' : 'text-text-muted hover:text-text-main'}`}
             >
                {activeTab === tab.id && (
                  <motion.div layoutId="profile-tab-active" className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent rounded-full" />
                )}
                <tab.icon size={18} strokeWidth={activeTab === tab.id ? 3 : 2} />
                <span className="text-[12px] font-black tracking-widest uppercase">{tab.label}</span>
             </button>
           ))}
        </div>

        {/* Content Grid */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8">
             {(() => {
                const gridData = activeTab === 'posts' ? posts : activeTab === 'reels' ? reelsPosts : activeTab === 'saved' ? savedPosts : [];
                
                if (gridData.length === 0) return (
                  <div className="col-span-3 flex flex-col items-center justify-center py-32 text-center gap-8 bg-bg-card rounded-[40px] border border-border-soft">
                     <div className="w-24 h-24 rounded-[32px] bg-bg-app border border-border-soft flex items-center justify-center">
                        <Grid size={40} className="text-text-muted opacity-20" strokeWidth={1} />
                     </div>
                     <div className="flex flex-col gap-2">
                        <h3 className="font-black text-2xl text-text-main uppercase tracking-tighter italic">No signals recorded</h3>
                        <p className="text-text-secondary font-bold text-[12px] tracking-wide max-w-[280px] uppercase mt-2">The transmission log is currently clear. Start uploading to fill it.</p>
                     </div>
                  </div>
                );

                return gridData.map((post, i) => (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} key={post.id} className="aspect-square relative group cursor-pointer overflow-hidden rounded-[32px] bg-bg-app border border-border-soft hover:shadow-2xl transition-all duration-700">
                     {post.type === 'video' ? (
                        <video src={post.content_url} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" muted loop playsInline />
                     ) : (
                        <img src={post.content_url} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" alt="" />
                     )}
                     <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-8 transition-all backdrop-blur-[2px]">
                        <div className="flex items-center gap-2 text-white font-black"><Heart size={24} fill="white" /> --</div>
                        <div className="flex items-center gap-2 text-white font-black"><MessageCircle size={24} fill="white" /> --</div>
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
