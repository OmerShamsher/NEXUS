import React, { useRef, useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, MoreVertical, Music, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Reel = ({ username, avatar, videoUrl, caption, likes, comments }) => {
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play();
            setPlaying(true);
          } else {
            videoRef.current?.pause();
            setPlaying(false);
          }
        });
      },
      { threshold: 0.8 }
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="reel-card group relative">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover cursor-pointer"
        onClick={togglePlay}
        loop
        playsInline
        muted
      />
      
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-white/20 p-6 rounded-full backdrop-blur-sm">
             <Heart size={48} className="text-white" fill="white" />
          </motion.div>
        </div>
      )}

      <div className="reel-info-pill">
        <div className="flex flex-col items-center gap-1 group/btn">
           <button onClick={() => setLiked(!liked)} className={`p-3 rounded-full hover:bg-white/10 transition-colors ${liked ? 'text-red-500' : 'text-white'}`}>
             <Heart size={32} fill={liked ? 'red' : 'none'} color={liked ? 'red' : 'white'} />
           </button>
           <span className="text-white text-xs fw-bold drop-shadow-md">{likes}</span>
        </div>
        <div className="flex flex-col items-center gap-1 group/btn">
           <button className="p-3 rounded-full hover:bg-white/10 transition-colors text-white">
             <MessageCircle size={32} />
           </button>
           <span className="text-white text-xs fw-bold drop-shadow-md">{comments}</span>
        </div>
        <button className="p-3 rounded-full hover:bg-white/10 transition-colors text-white">
           <Share2 size={28} />
        </button>
        <button className="p-3 rounded-full hover:bg-white/10 transition-colors text-white">
           <MoreVertical size={24} />
        </button>
      </div>

      <div className="reel-content">
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar w-9 h-9 border-0 p-0">
             <img src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} className="rounded-full w-full h-full" alt="" />
          </div>
          <span className="fw-black text-white text-shadow-lg">{username}</span>
          <button className="px-3 py-1 border border-white rounded-lg text-white text-xs fw-bold glass hover:bg-white/20">Follow</button>
        </div>
        
        <p className="text-white text-sm mb-4 line-clamp-2 drop-shadow-md">{caption}</p>
        
        <div className="flex items-center gap-2 overflow-hidden w-2/3">
           <Music size={14} className="text-white shrink-0" />
           <div className="marquee overflow-hidden">
              <span className="text-xs text-white whitespace-nowrap animate-marquee">Audio from {username} • Original Audio</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Reel;
