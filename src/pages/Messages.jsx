import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, Info, Phone, Video, Edit, ChevronLeft, Loader2, CheckCircle, Smile, Image as ImageIcon, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const Messages = () => {
  const { session, profile: currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!session?.user) return;
    fetchChats();

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
      const channel = supabase
        .channel(`messages:${selectedChat.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `sender_id=eq.${selectedChat.id}`
        }, () => {
          fetchMessages();
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
    try {
      const { data } = await supabase
        .from('follows')
        .select('following_id, profiles!follows_following_id_fkey(id, username, avatar_url)')
        .eq('follower_id', session.user.id);
        
      if (data) {
        setChats(data.map(f => ({
          id: f.profiles.id,
          name: f.profiles.username,
          avatar: f.profiles.avatar_url,
          lastMessage: 'Nexus network established',
          unread: 0
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
    const text = message.trim();
    setMessage('');
    
    // Pre-append for speed
    setMessages(prev => [...prev, { sender_id: session.user.id, receiver_id: selectedChat.id, content: text, id: Date.now(), created_at: new Date().toISOString() }]);
    scrollToBottom();

    await supabase.from('messages').insert({
      sender_id: session.user.id,
      receiver_id: selectedChat.id,
      content: text
    });
  };

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden relative selection:bg-accent/20">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-secondary/5 blur-[150px] rounded-full pointer-events-none"></div>

      {/* Sidebar - Contacts */}
      <div className={`w-full md:w-[420px] flex flex-col border-r border-white/[0.05] bg-black/40 backdrop-blur-3xl z-10 transition-all duration-500 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-8 pb-6 flex items-center justify-between">
          <div className="flex flex-col">
             <h2 className="text-xl font-black tracking-tighter text-white m-0 uppercase italic">{currentUser?.username}</h2>
             <span className="text-[10px] font-black text-accent tracking-[0.2em] mt-1">DIRECT OPS</span>
          </div>
          <button className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-2xl border border-white/10 bg-white/5 text-white transition-all cursor-pointer"><Edit size={20} /></button>
        </div>
        
        <div className="px-8 mb-8">
          <div className="relative group">
             <div className="absolute inset-0 bg-accent rounded-2xl blur-[10px] opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" />
             <input type="text" placeholder="Search contacts..." className="w-full bg-white/5 border border-white/10 focus:border-accent/40 rounded-2xl ps-12 py-3.5 text-white text-sm outline-none transition-all placeholder:text-white/20 font-medium" />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto no-scrollbar flex flex-col px-4 gap-1">
          <span className="px-6 text-[10px] font-black tracking-[0.2em] text-white/20 mb-4 mt-2">ACTIVE SESSIONS</span>
           
           {loading ? (
            <div className="flex justify-center p-20"><Loader2 className="animate-spin text-accent" size={32} /></div>
           ) : chats.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center gap-4">
               <div className="w-16 h-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/10"><MessageCircle size={32} /></div>
               <p className="text-white/30 text-xs font-bold uppercase tracking-widest leading-relaxed">No active transmissions detected. Establish connections to begin.</p>
            </div>
           ) : (
             chats.map(chat => (
               <button 
                 key={chat.id} 
                 onClick={() => handleSelectChat(chat)}
                 className={`p-4 px-6 rounded-[28px] border-0 w-full text-left bg-transparent flex items-center gap-5 transition-all duration-500 hover:bg-white/[0.03] outline-none cursor-pointer group relative ${selectedChat?.id === chat.id ? 'bg-white/[0.06] border-white/10' : ''}`}
               >
                 <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-gradient-neon rounded-full blur-[8px] opacity-0 group-hover:opacity-40 transition-opacity"></div>
                    <div className="w-[60px] h-[60px] p-0.5 bg-gradient-to-tr from-white/10 to-transparent rounded-full transition-transform duration-500 group-hover:scale-105">
                       <div className="w-full h-full rounded-full border-2 border-[#0c0c0c] overflow-hidden bg-zinc-900">
                          <img src={chat.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.name}`} className="w-full h-full object-cover" alt="" />
                       </div>
                    </div>
                    <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-[3px] border-[#0c0c0c] shadow-lg"></div>
                 </div>
                 <div className="flex-grow overflow-hidden flex flex-col justify-center gap-0.5">
                    <span className="font-extrabold text-[14px] text-white tracking-tight">{chat.name}</span>
                    <p className="text-[12px] text-white/40 truncate m-0 font-medium tracking-tight">Signal: Active Now</p>
                 </div>
                 {selectedChat?.id === chat.id && <motion.div layoutId="chat-indicator" className="absolute right-4 w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_10px_var(--accent-glow)]" />}
               </button>
             ))
           )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-grow flex flex-col bg-[#050505] relative z-0 p-4 md:p-8 ${selectedChat ? 'flex' : 'hidden md:flex items-center justify-center'}`}>
        <AnimatePresence mode="wait">
          {selectedChat ? (
            <motion.div 
              key={selectedChat.id}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              className="flex flex-col h-full w-full rounded-[40px] overflow-hidden border border-white/5 bg-white/[0.02] backdrop-blur-2xl shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
            >
              {/* Chat Header */}
              <div className="p-6 md:px-10 border-b border-white/[0.05] flex items-center justify-between bg-black/20 z-10">
                <div className="flex items-center gap-5">
                  <button className="md:hidden w-10 h-10 flex items-center justify-center text-white border-0 bg-white/5 rounded-xl cursor-pointer" onClick={() => setSelectedChat(null)}><ChevronLeft size={24} /></button>
                  <div onClick={() => navigate(`/profile/${selectedChat.id}`)} className="cursor-pointer flex items-center gap-4 group">
                     <div className="w-12 h-12 rounded-full border-2 border-accent/50 p-0.5 transition-transform group-hover:scale-105">
                       <img src={selectedChat.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChat.name}`} className="w-full h-full rounded-full object-cover" alt="" />
                     </div>
                     <div className="flex flex-col">
                       <div className="flex items-center gap-2">
                          <span className="font-black text-white text-[15px] tracking-tight uppercase">{selectedChat.name}</span>
                          <CheckCircle size={14} className="text-accent" fill="currentColor" color="white" />
                       </div>
                       <div className="flex items-center gap-2 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">TRANSMISSION ACTIVE</span>
                       </div>
                     </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <button className="w-11 h-11 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-2xl transition-all bg-transparent border-0 cursor-pointer"><Phone size={20} /></button>
                   <button className="w-11 h-11 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-2xl transition-all bg-transparent border-0 cursor-pointer"><Video size={22} /></button>
                   <button className="w-11 h-11 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-2xl transition-all bg-transparent border-0 cursor-pointer hidden sm:flex"><Info size={20} /></button>
                </div>
              </div>

              {/* Chat Main */}
              <div className="flex-grow overflow-y-auto p-6 md:p-12 flex flex-col gap-6 no-scrollbar min-h-0 bg-[#080808]/40">
                <div className="flex flex-col items-center justify-center py-16 gap-6">
                   <div className="relative group">
                      <div className="absolute inset-[-10px] bg-gradient-neon rounded-full blur-[20px] opacity-10"></div>
                      <div className="relative w-28 h-28 rounded-full border-[4px] border-white/5 overflow-hidden bg-zinc-900 group-hover:scale-105 transition-transform duration-700">
                         <img src={selectedChat.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChat.name}`} className="w-full h-full object-cover" alt="" />
                      </div>
                   </div>
                   <div className="text-center flex flex-col gap-2">
                      <h3 className="font-black text-2xl text-white uppercase tracking-tighter m-0">{selectedChat.name}</h3>
                      <span className="text-white/20 text-[10px] font-black tracking-[0.2em] uppercase">MEMBER OF NEXUS NETWORK • EST. 2026</span>
                   </div>
                   <button onClick={() => navigate(`/profile/${selectedChat.id}`)} className="mt-4 px-10 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-black tracking-widest uppercase rounded-2xl transition-all cursor-pointer">View Network Node</button>
                </div>

                <div className="flex items-center justify-center py-4 px-10">
                   <div className="h-px bg-white/5 flex-grow"></div>
                   <span className="px-6 text-[10px] font-black text-white/10 tracking-[0.2em] uppercase">Transmission History</span>
                   <div className="h-px bg-white/5 flex-grow"></div>
                </div>

                {messages.map((msg, idx) => {
                  const isMe = msg.sender_id === session.user.id;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, x: isMe ? 20 : -20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      key={msg.id || idx} 
                      className={`flex flex-col gap-2 max-w-[85%] md:max-w-[65%] ${isMe ? 'items-end self-end' : 'items-start self-start'}`}
                    >
                       <div className={`px-6 py-4 text-[14px] font-medium leading-relaxed shadow-2xl relative ${
                         isMe 
                           ? 'bg-gradient-to-tr from-accent to-accent-secondary text-white rounded-[24px] rounded-tr-sm' 
                           : 'bg-white/5 text-white/90 rounded-[24px] rounded-tl-sm border border-white/10'
                       }`}>
                          {msg.content}
                       </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-6 md:px-10 bg-black/40 border-t border-white/[0.05]">
                <form onSubmit={handleSend} className="relative group flex items-center gap-4">
                  <div className="flex-grow relative">
                    <input 
                      type="text" 
                      placeholder="Transmit a signal..." 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-accent/40 rounded-full ps-16 pe-6 py-4 text-white outline-none transition-all placeholder:text-white/10 text-[14px] font-medium"
                    />
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-4 text-white/20">
                       <Smile size={20} className="hover:text-accent transition-colors cursor-pointer" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-white/40">
                     <ImageIcon size={22} className="hover:text-white transition-colors cursor-pointer" />
                     <Heart size={22} className="hover:text-accent transition-colors cursor-pointer" />
                  </div>
                  <button type="submit" disabled={!message.trim()} className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center border-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-20 cursor-pointer shadow-[0_10px_20px_rgba(255,0,85,0.3)]">
                     <Send size={24} className={message.trim() ? 'animate-pulse' : ''} />
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-10 text-center max-w-sm px-10">
               <div className="relative group">
                  <div className="absolute inset-0 bg-accent rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                  <div className="p-12 rounded-[50px] bg-white/[0.02] border border-white/5 relative z-10 transition-transform duration-700 group-hover:rotate-12">
                     <Send size={64} className="text-white opacity-20" strokeWidth={1} />
                  </div>
               </div>
               <div className="flex flex-col gap-3">
                 <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic m-0">Secure Ops</h1>
                 <p className="text-white/30 text-[13px] leading-relaxed font-bold tracking-tight uppercase max-w-[280px]">Encrypted end-to-end transmissions. Secure your digital footprint.</p>
               </div>
               <button onClick={() => navigate('/search')} className="premium-btn py-4 px-12 text-[11px] font-black tracking-[0.2em] uppercase">INITIALIZE CONTACT</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Messages;
