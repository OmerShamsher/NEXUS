import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, Info, Phone, Video, Edit, ChevronLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const Messages = () => {
  const { session, profile: currentUser } = useAuth();
  const location = useLocation();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!session?.user) return;
    fetchChats();

    // Check if we came from a profile via "Message" button
    if (location.state?.directUserId) {
      handleSelectChat({
        id: location.state.directUserId,
        name: location.state.directUsername,
        avatar: location.state.directAvatar
      });
    }
  }, [session, location]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      // Real-time subscription for messages
      const channel = supabase
        .channel(`messages:${selectedChat.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `sender_id=eq.${selectedChat.id}` // Only listen to incoming messages from selected user
        }, payload => {
          setMessages(prev => [...prev, payload.new]);
          scrollToBottom();
        })
        .subscribe();
      return () => supabase.removeChannel(channel);
    }
  }, [selectedChat]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const fetchChats = async () => {
    // For simplicity, we just fetch all users we follow or who follow us to populate the chat sidebar
    // A robust app would query unique sender/receiver in messages table
    const { data: followsData } = await supabase
      .from('follows')
      .select('following_id, profiles!follows_following_id_fkey(id, username, avatar_url)')
      .eq('follower_id', session.user.id);
      
    if (followsData) {
      const uniqueChats = followsData.map(f => ({
        id: f.profiles.id,
        name: f.profiles.username,
        avatar: f.profiles.avatar_url,
        lastMessage: 'Tap to chat',
        unread: 0
      }));
      setChats(uniqueChats);
    }
    setLoading(false);
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${selectedChat.id}),and(sender_id.eq.${selectedChat.id},receiver_id.eq.${session.user.id})`)
      .order('created_at', { ascending: true });
      
    setMessages(data || []);
    scrollToBottom();
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    const newMsg = {
      sender_id: session.user.id,
      receiver_id: selectedChat.id,
      content: message
    };

    // Optimistic UI
    setMessage('');
    setMessages(prev => [...prev, { ...newMsg, id: Date.now(), created_at: new Date().toISOString() }]);
    scrollToBottom();

    await supabase.from('messages').insert(newMsg);
  };

  return (
    <div className="flex h-screen bg-[color:var(--bg-primary)] overflow-hidden relative selection:bg-accent/20">
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-white opacity-[0.02] blur-[100px] rounded-full pointer-events-none"></div>

      {/* Sidebar List */}
      <div className={`w-full md:w-[400px] flex flex-col border-r border-[color:var(--border)]/40 bg-[color:var(--bg-secondary)]/70 backdrop-blur-3xl z-10 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-8 flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tighter flex items-center gap-3 text-main m-0">
             {currentUser?.username}
          </h2>
          <button className="p-3 hover:bg-white/5 rounded-2xl border border-[color:var(--border)]/40 bg-[color:var(--bg-secondary)]/70 text-main transition-all cursor-pointer"><Edit size={20} /></button>
        </div>
        
        <div className="px-8 mb-6">
          <div className="relative group">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-main transition-colors" />
             <input type="text" placeholder="Search messages..." className="w-full bg-[color:var(--bg-secondary)]/70 border border-[color:var(--border)]/60 focus:border-[color:var(--accent)]/70 rounded-2xl ps-12 py-3.5 text-main text-sm outline-none transition-all placeholder:text-muted" />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto no-scrollbar scrollbar-hide flex flex-col px-4">
          <span className="px-4 text-xs font-black tracking-widest text-muted mb-4 mt-2">MESSAGES</span>
           
           {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-muted" size={24} /></div>
           ) : chats.length === 0 ? (
            <p className="text-muted text-sm text-center p-10 font-medium">Follow someone to start messaging.</p>
           ) : (
             chats.map(chat => (
               <button 
                 key={chat.id} 
                 onClick={() => handleSelectChat(chat)}
                className={`p-4 rounded-3xl border-0 w-full text-left bg-transparent flex items-center gap-4 transition-all duration-300 hover:bg-white/5 outline-none cursor-pointer group ${selectedChat?.id === chat.id ? 'bg-[color:var(--bg-primary)]/40' : ''}`}
               >
                <div className="w-16 h-16 shrink-0 rounded-full border border-[color:var(--border)]/60 overflow-hidden bg-[color:var(--bg-secondary)]">
                    <img src={chat.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.name}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                 </div>
                 <div className="flex-grow overflow-hidden flex flex-col justify-center">
                    <span className="font-bold text-sm tracking-wide text-main mb-1">{chat.name}</span>
                    <p className="text-xs text-muted truncate m-0 font-medium">{chat.lastMessage}</p>
                 </div>
               </button>
             ))
           )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-grow flex flex-col bg-[color:var(--bg-primary)] relative z-0 p-4 md:p-6 ${selectedChat ? 'flex' : 'hidden md:flex items-center justify-center'}`}>
        <AnimatePresence mode="wait">
          {selectedChat ? (
            <motion.div 
              key={selectedChat.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col h-full w-full rounded-3xl overflow-hidden border border-[color:var(--border)]/60 bg-[color:var(--bg-secondary)]/40 backdrop-blur-2xl"
            >
              {/* Header */}
              <div className="p-5 md:p-6 border-b border-[color:var(--border)]/40 flex items-center justify-between bg-[color:var(--bg-secondary)]/70 backdrop-blur-xl z-10">
                <div className="flex items-center gap-4">
                  <button className="md:hidden p-2 text-main border-0 bg-transparent cursor-pointer" onClick={() => setSelectedChat(null)}><ChevronLeft size={28} /></button>
                  <div className="w-12 h-12 rounded-full border border-[color:var(--border)]/60 overflow-hidden bg-[color:var(--bg-secondary)]">
                    <img src={selectedChat.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChat.name}`} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-main text-base tracking-tight">{selectedChat.name}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                       <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Active now</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button className="p-3 text-muted hover:text-main hover:bg-white/5 border border-transparent hover:border-[color:var(--border)]/60 rounded-full transition-all bg-transparent cursor-pointer"><Phone size={22} /></button>
                   <button className="p-3 text-muted hover:text-main hover:bg-white/5 border border-transparent hover:border-[color:var(--border)]/60 rounded-full transition-all bg-transparent cursor-pointer"><Video size={24} /></button>
                   <button className="p-3 text-muted hover:text-main hover:bg-white/5 border border-transparent hover:border-[color:var(--border)]/60 rounded-full transition-all bg-transparent cursor-pointer hidden sm:block"><Info size={22} /></button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-grow overflow-y-auto p-4 md:p-8 flex flex-col gap-6 no-scrollbar relative min-h-0">
                <div className="flex flex-col items-center justify-center py-10 mt-auto">
                   <div className="w-24 h-24 rounded-full border border-[color:var(--border)]/60 overflow-hidden bg-[color:var(--bg-secondary)] mb-6">
                      <img src={selectedChat.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChat.name}`} className="w-full h-full object-cover" alt="" />
                   </div>
                   <h3 className="font-black text-xl text-main mb-2">{selectedChat.name}</h3>
                   <span className="text-muted text-sm font-medium">Nexus Member • Established 2026</span>
                   <button className="mt-6 px-6 py-2 bg-white/5 border border-[color:var(--border)]/60 hover:bg-white/10 text-main font-bold rounded-full text-sm transition-colors cursor-pointer">View Profile</button>
                </div>

                {messages.map((msg, idx) => {
                  const isMe = msg.sender_id === session.user.id;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id || idx} 
                      className={`flex flex-col gap-1.5 max-w-[85%] md:max-w-[70%] ${isMe ? 'items-end self-end' : 'items-start self-start'}`}
                    >
                       <div className={`px-5 py-3.5 text-[15px] leading-relaxed shadow-xl border ${
                         isMe 
                           ? 'bg-[color:var(--bg-primary)] text-[color:var(--text-main)] rounded-3xl rounded-tr-sm border-transparent' 
                           : 'bg-[color:var(--bg-secondary)] text-main rounded-3xl rounded-tl-sm border-[color:var(--border)]/40'
                       }`}>
                          {msg.content}
                       </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Footer */}
              <div className="p-4 md:p-6 bg-[color:var(--bg-secondary)]">
                <form onSubmit={handleSend} className="relative group">
                  <input 
                    type="text" 
                    placeholder="Message..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[color:var(--bg-secondary)] border border-[color:var(--border)]/60 focus:border-accent/60 focus:ring-2 focus:ring-accent/30 rounded-[2rem] ps-6 pe-16 py-4 text-main outline-none transition-all placeholder:text-muted text-[15px]"
                  />
                  <button type="submit" disabled={!message.trim()} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 px-5 rounded-full bg-[color:var(--accent)] text-white font-black text-sm border-0 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed">
                     Send
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-8 text-center max-w-sm px-10">
               <div className="p-8 rounded-full bg-[color:var(--bg-secondary)] border border-[color:var(--border)]/60 relative">
                  <Send size={56} className="text-main relative z-10" strokeWidth={1} />
               </div>
               <div>
                 <h1 className="text-3xl font-black tracking-tighter text-main mb-3">Your Messages</h1>
                 <p className="text-muted text-[15px] leading-relaxed font-medium">Send private photos and messages to a friend or group. Your conversations are end-to-end encrypted.</p>
               </div>
               <button className="bg-[color:var(--accent)] text-white font-bold text-sm py-3.5 px-10 rounded-xl hover:opacity-90 transition-colors border-0 cursor-pointer">Start a new message</button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Messages;
