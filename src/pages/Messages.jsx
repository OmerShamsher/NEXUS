import React, { useState } from 'react';
import { Send, Search, Info, Phone, Video, Edit, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  
  const chats = [
    { id: 1, name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=alex', lastMessage: 'Yoo! Did you see the new nexus update?', time: '2m', unread: 2 },
    { id: 2, name: 'Sarah Miller', avatar: 'https://i.pravatar.cc/150?u=sarah', lastMessage: 'The photoshoot looks insane!! 🔥', time: '1h', unread: 0 },
    { id: 3, name: 'Devin Kiro', avatar: 'https://i.pravatar.cc/150?u=devin', lastMessage: 'Sent a reel', time: '4h', unread: 1 },
    { id: 4, name: 'Luna Stark', avatar: 'https://i.pravatar.cc/150?u=luna', lastMessage: 'Lets meet next week for coffee.', time: '1d', unread: 0 },
    { id: 5, name: 'Design Team', avatar: 'https://i.pravatar.cc/150?u=team', lastMessage: 'The new logo is ready in FIGMA.', time: '2d', unread: 0 }
  ];

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessage('');
    // Real-time integration would go here
  };

  return (
    <div className="flex h-[calc(100vh-2px)] bg-black overflow-hidden m-0 p-0 border border-white/5 rounded-3xl relative backdrop-blur-3xl">
      {/* Sidebar List */}
      <div className={`w-full md:w-[350px] flex flex-col border-r border-white/5 bg-black/40 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 flex items-center justify-between">
          <h2 className="fs-3 fw-black tracking-tight flex items-center gap-3">
             <div className="w-2 h-8 bg-accent rounded-full"></div>
             Direct
          </h2>
          <button className="p-2 hover:bg-white/5 rounded-xl border-0 bg-transparent text-white"><Edit size={20} /></button>
        </div>
        
        <div className="px-6 mb-6">
          <div className="relative">
             <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
             <input type="text" placeholder="Search direct messages" className="premium-input w-full ps-11 bg-white/5 border-0 rounded-2xl" />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto no-scrollbar scrollbar-hide flex flex-col gap-1 px-3">
           {chats.map(chat => (
             <button 
               key={chat.id} 
               onClick={() => setSelectedChat(chat)}
               className={`p-4 rounded-2xl border-0 w-full text-left bg-transparent flex items-center gap-4 transition-all duration-300 hover:bg-white/5 group ${selectedChat?.id === chat.id ? 'bg-white/5 border border-white/10' : ''}`}
             >
               <div className={`avatar w-14 h-14 shrink-0 transition-transform group-hover:scale-105 ${chat.unread ? 'p-1 bg-gradient-to-r from-accent to-purple-600' : 'p-0'}`}>
                  <img src={chat.avatar} className="rounded-full w-full h-full object-cover" alt="" />
               </div>
               <div className="flex-grow overflow-hidden flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="fw-bold text-sm tracking-wide">{chat.name}</span>
                    <span className="text-[10px] text-muted">{chat.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-xs text-muted text-truncate w-[90%] m-0 ${chat.unread ? 'fw-bold text-white' : ''}`}>{chat.lastMessage}</p>
                    {chat.unread > 0 && <div className="w-2 h-2 bg-accent rounded-full shadow-lg shadow-accent/50"></div>}
                  </div>
               </div>
             </button>
           ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-grow flex flex-col bg-black/60 relative ${selectedChat ? 'flex' : 'hidden md:flex items-center justify-center'}`}>
        <AnimatePresence mode="wait">
          {selectedChat ? (
            <motion.div 
              key={selectedChat.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full w-full"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between glass z-10">
                <div className="flex items-center gap-4">
                  <button className="md:hidden p-2 text-white border-0 bg-transparent" onClick={() => setSelectedChat(null)}><ChevronLeft size={24} /></button>
                  <div className="avatar w-10 h-10 border-0 p-0">
                    <img src={selectedChat.avatar} className="rounded-full h-full w-full" alt="" />
                  </div>
                  <div className="flex flex-col">
                    <span className="fw-black text-sm">{selectedChat.name}</span>
                    <span className="text-[10px] text-green-400 fw-bold">Active now</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <Phone size={20} className="text-muted cursor-pointer hover:text-white" />
                   <Video size={20} className="text-muted cursor-pointer hover:text-white" />
                   <Info size={20} className="text-muted cursor-pointer hover:text-white" />
                </div>
              </div>

              {/* Body */}
              <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-4 no-scrollbar">
                <div className="flex flex-col gap-1 items-start max-w-[80%]">
                   <div className="glass px-4 py-3 rounded-2xl rounded-tl-none text-sm leading-relaxed border-0 bg-white/5">Hey there! How is the project going?</div>
                   <span className="text-[9px] text-muted self-end">11:00 AM</span>
                </div>
                <div className="flex flex-col gap-1 items-end self-end max-w-[80%]">
                   <div className="bg-gradient-to-r from-accent to-purple-600 px-4 py-3 rounded-2xl rounded-tr-none text-sm fw-medium shadow-xl shadow-accent/10 border-0">Nexus project is looking crazy good. Integrating the reels now.</div>
                   <span className="text-[9px] text-muted">11:05 AM</span>
                </div>
                <div className="flex flex-col gap-1 items-start max-w-[80%]">
                   <div className="glass px-4 py-3 rounded-2xl rounded-tl-none text-sm leading-relaxed border-0 bg-white/5">That's amazing to hear! Can't wait to see the final UI.</div>
                   <span className="text-[9px] text-muted">11:06 AM</span>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/5">
                <form onSubmit={handleSend} className="relative group">
                  <input 
                    type="text" 
                    placeholder="Message..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="premium-input w-full ps-6 pe-16 bg-white/5 border-white/10 focus:border-accent rounded-3xl"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 px-4 rounded-2xl bg-accent text-white border-0 transition-all hover:scale-105 fw-black text-xs">
                     <Send size={16} />
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-6 text-center max-w-sm px-10">
               <div className="p-8 rounded-full bg-white/5 ring-1 ring-white/10 group animate-pulse">
                  <Send size={56} className="text-white opacity-20 group-hover:opacity-100 transition-opacity" />
               </div>
               <div>
                 <h1 className="fw-black fs-2 tracking-tighter mb-2">Your Messages</h1>
                 <p className="text-muted text-sm fs-5 leading-loose">Send private photos and messages to a friend or group. Your conversations are end-to-end encrypted.</p>
               </div>
               <button className="premium-btn px-10">Send Message</button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Messages;
