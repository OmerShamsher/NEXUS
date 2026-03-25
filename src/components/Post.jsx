import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

const Post = ({ postId, userId, username, avatar, mediaUrl, caption, type = 'image', likesCount = '12,384', commentsTotal = '568' }) => {
  const [liked, setLiked] = useState(false);

  return (
    <article className="bg-white border border-border-soft rounded-[32px] overflow-hidden shadow-sm mb-12">
      {/* Header */}
      <div className="flex items-center justify-between p-6 px-8">
        <div className="flex items-center gap-4">
           <img src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} className="w-12 h-12 rounded-full border border-border-soft object-cover" alt="" />
           <div className="flex flex-col">
              <div className="flex items-center gap-2">
                 <span className="font-black text-[15px] text-text-main">{username || 'NatureVibes'}</span>
                 <div className="w-4 h-4 bg-accent rounded-full flex items-center justify-center text-white">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                 </div>
                 <span className="text-text-muted text-[13px] font-bold">@naturevibes • 2h</span>
              </div>
              <span className="text-text-secondary text-[12px] font-bold">Banff National Park</span>
           </div>
        </div>
        <button className="text-text-muted hover:text-text-main p-2 border-0 bg-transparent cursor-pointer"><MoreHorizontal size={22} /></button>
      </div>

      {/* Body */}
      <div className="px-8 pb-6">
         <p className="text-[16px] font-bold text-text-main leading-relaxed mb-4">
            {caption || "Chasing sunrises in the mountains. 🏔️✨ #NatureLovers #Wanderlust"}
         </p>
         <div className="rounded-[32px] overflow-hidden bg-bg-app border border-border-soft aspect-[4/3] group cursor-pointer">
            {type === 'video' ? (
              <video src={mediaUrl} className="w-full h-full object-cover" controls muted loop />
            ) : (
              <img src={mediaUrl || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" alt="" />
            )}
         </div>
      </div>

      {/* Footer / Interaction */}
      <div className="p-8 pt-0">
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-8">
               <div className="flex items-center gap-2.5 text-text-main">
                  <Heart size={22} fill="#ff4d4d" className="text-[#ff4d4d]" />
                  <span className="text-[14px] font-black">{likesCount}</span>
               </div>
               <div className="flex items-center gap-2.5 text-text-secondary">
                  <MessageCircle size={22} className="text-text-muted" />
                  <span className="text-[14px] font-black">{commentsTotal}</span>
               </div>
               <Send size={22} className="text-text-muted hover:text-accent transition-colors cursor-pointer" />
               <Bookmark size={22} className="text-text-muted hover:text-accent transition-colors cursor-pointer" />
            </div>

            <div className="flex items-center gap-5 text-text-muted opacity-40">
               <Heart size={22} className="cursor-pointer hover:text-red-500 transition-colors" />
               <MessageCircle size={22} className="cursor-pointer hover:text-accent transition-colors" />
               <Bookmark size={22} className="cursor-pointer hover:text-accent transition-colors" />
            </div>
         </div>

         {/* Social Proof */}
         <div className="flex items-center gap-2 mb-6">
            <span className="text-[12px] font-black text-text-muted uppercase tracking-tight flex items-center gap-2">
               <Heart size={12} fill="currentColor" /> Liked by <span className="text-text-main lowercase">adventure_life</span> and <span className="text-text-main">others</span>
            </span>
         </div>

         {/* Individual Comment */}
         <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-start gap-3">
               <img src="https://i.pravatar.cc/150?u=jane" className="w-9 h-9 rounded-full border border-border-soft shrink-0" alt="" />
               <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                     <span className="text-[14px] font-black text-text-main">adventurous_jane</span>
                     <p className="text-[14px] font-bold text-text-main opacity-80">Absolutely breathtaking! 😍</p>
                     <span className="text-text-muted text-[11px] font-black uppercase">2h</span>
                  </div>
                  <button className="text-[11px] font-black text-text-muted hover:text-accent uppercase border-0 bg-transparent cursor-pointer text-left tracking-widest mt-1">Reply</button>
               </div>
            </div>
         </div>

         {/* Input Area */}
         <div className="flex items-center gap-4 pt-6 border-t border-border-soft">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=me" className="w-10 h-10 rounded-full border border-border-soft object-cover shadow-inner" alt="" />
            <div className="flex-grow flex items-center relative">
               <input 
                 type="text" 
                 placeholder="Add a comment..." 
                 className="w-full bg-transparent border-0 outline-none text-[15px] font-bold text-text-main placeholder:text-text-muted py-2"
               />
               <Camera size={22} className="text-text-muted hover:text-accent cursor-pointer transition-colors" />
            </div>
         </div>
      </div>
    </article>
  );
};

export default Post;
