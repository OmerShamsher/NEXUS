import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Post = ({ username, avatar, mediaUrl, caption, commentsTotal, likesTotal }) => {
  const [liked, setLiked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    if (!liked) {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="post-card group"
    >
      <div className="post-header">
        <div className="avatar">
           <div className="avatar-inner">
              <img src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} alt={username} />
           </div>
        </div>
        <div className="flex flex-col">
          <span className="fw-bold fs-6">{username}</span>
          <span className="text-muted small">Sponsored • Original Audio</span>
        </div>
        <button className="action-btn ms-auto bg-transparent border-0 opacity-50"><MoreHorizontal size={20} /></button>
      </div>

      <div className="post-media cursor-pointer select-none relative" onDoubleClick={handleLike}>
        <img src={mediaUrl} className="post-img" alt="Post content" loading="lazy" />
        
        <AnimatePresence>
          {showHeart && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Heart size={80} fill="white" color="white" className="drop-shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="post-actions">
        <button onClick={handleLike} className={`action-btn ${liked ? 'text-red-500 fill-current' : ''}`}>
           <Heart size={26} fill={liked ? 'red' : 'none'} color={liked ? 'red' : 'currentColor'} />
        </button>
        <button className="action-btn"><MessageCircle size={26} /></button>
        <button className="action-btn"><Send size={24} /></button>
        <button className="action-btn ms-auto"><Bookmark size={26} /></button>
      </div>

      <div className="post-body">
        <span className="likes-count">{liked ? likesTotal + 1 : likesTotal} likes</span>
        <div className="caption mb-3">
          <span className="fw-bold me-2">{username}</span>
          <p className="d-inline text-muted fs-6">{caption}</p>
        </div>
        <button className="text-muted border-0 bg-transparent p-0 small cursor-pointer hover:underline">
          View all {commentsTotal} comments
        </button>
      </div>
    </motion.div>
  );
};

export default Post;
