import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusSquare, 
  X, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Hash, 
  Loader2, 
  CheckCircle,
  Sparkles,
  ArrowRight,
  UploadCloud,
  MapPin,
  Smile
} from 'lucide-react';

const CreatePost = ({ isOpen, onClose, onRefresh }) => {
  const { session, profile } = useAuth();
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('image'); // image or video
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Select, 2: Preview & Caption, 3: Success
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const isVideo = selectedFile.type.startsWith('video');
      setFileType(isVideo ? 'video' : 'image');
      setPreview(URL.createObjectURL(selectedFile));
      setStep(2);
    }
  };

  const handleUpload = async () => {
    if (!file || !session) return;
    setLoading(true);

    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts_content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('posts_content')
        .getPublicUrl(filePath);

      // 3. Save to Database
      const { error: dbError } = await supabase
        .from('posts')
        .insert({
          user_id: session.user.id,
          content_url: publicUrl,
          caption: caption,
          type: fileType,
          created_at: new Date().toISOString()
        });

      if (dbError) throw dbError;

      setStep(3); // Success step
      setTimeout(() => {
        onClose();
        onRefresh();
        reset();
      }, 2000);

    } catch (error) {
      console.error("Upload failed:", error);
      alert("Error: " + (error.message || "Failed to upload post."));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setCaption('');
    setStep(1);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-3xl"
      />
      
      {/* Modal Container */}
      <motion.div 
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        className="glass w-full max-w-[850px] rounded-[40px] overflow-hidden relative border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] bg-[#050505]/60"
      >
        {/* Animated Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-secondary/10 blur-[100px] rounded-full -ml-32 -mb-32"></div>

        <div className="flex items-center justify-between p-6 px-10 border-b border-white/[0.05] relative z-10">
           <div className="flex flex-col">
              <h3 className="font-black text-xl tracking-tighter m-0 flex items-center gap-3 text-white uppercase">
                 <div className="w-10 h-10 rounded-xl bg-gradient-neon flex items-center justify-center text-white">
                    <PlusSquare size={22} strokeWidth={2.5} />
                 </div>
                 New {fileType === 'video' ? 'Reel' : 'Post'}
              </h3>
              <span className="text-[10px] text-accent font-bold tracking-[0.2em] mt-1">NEXUS CREATIVE STUDIO</span>
           </div>
           <button onClick={onClose} className="w-11 h-11 flex items-center justify-center hover:bg-white/10 rounded-2xl transition-all border-0 bg-transparent text-white cursor-pointer"><X size={24} /></button>
        </div>

        <div className="p-0 relative z-10">
           <AnimatePresence mode="wait">
             {step === 1 && (
               <motion.div 
                 key="s1"
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 1.02 }}
                 className="flex flex-col items-center justify-center gap-10 py-24 sm:py-32"
               >
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="relative group cursor-pointer"
                  >
                     <div className="absolute inset-[-20px] bg-gradient-neon rounded-full blur-[40px] opacity-10 group-hover:opacity-30 transition-all duration-700"></div>
                     <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 bg-white/[0.02] group-hover:border-accent transition-all duration-500 scale-95 group-hover:scale-100 group-hover:rotate-6">
                        <UploadCloud size={64} className="text-white/20 group-hover:text-accent transition-all group-hover:-translate-y-2" strokeWidth={1} />
                        <div className="flex flex-col items-center gap-1">
                           <span className="text-[11px] font-black text-white/40 tracking-widest uppercase group-hover:text-white">SELECT CONTENT</span>
                           <span className="text-[10px] font-bold text-white/20 tracking-wide uppercase">JPG, MP4, PNG</span>
                        </div>
                     </div>
                  </div>
                  <input ref={fileInputRef} type="file" hidden accept="image/*,video/*" onChange={handleFileChange} />
                  
                  <div className="flex gap-6">
                     <div className="flex items-center gap-3 px-6 py-2.5 bg-white/5 border border-white/5 rounded-2xl text-[11px] font-black tracking-widest uppercase text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-default">
                        <ImageIcon size={16} strokeWidth={1.5} /> Post
                     </div>
                     <div className="flex items-center gap-3 px-6 py-2.5 bg-white/5 border border-white/5 rounded-2xl text-[11px] font-black tracking-widest uppercase text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-default">
                        <VideoIcon size={16} strokeWidth={1.5} /> Reel
                     </div>
                  </div>
               </motion.div>
             )}

             {step === 2 && (
               <motion.div 
                 key="s2"
                 initial={{ opacity: 0, x: 50 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -50 }}
                 className="flex flex-col lg:flex-row h-full lg:h-[550px]"
               >
                  {/* Media Preview Area */}
                  <div className="lg:w-[500px] border-r border-white/[0.05] bg-zinc-950/50 flex items-center justify-center max-h-[400px] lg:max-h-none">
                     <div className="w-full h-full relative group">
                        {fileType === 'video' ? (
                          <video src={preview} controls className="w-full h-full object-cover" />
                        ) : (
                          <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                        )}
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-black tracking-widest text-white uppercase">
                           PREVIEW MODE
                        </div>
                     </div>
                  </div>

                  {/* Caption & Controls Area */}
                  <div className="flex-grow p-10 flex flex-col gap-8 bg-[#080808]/80">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-accent p-0.5 shadow-[0_0_15px_rgba(255,0,85,0.3)]">
                           <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=user`} className="w-full h-full rounded-full object-cover" alt="me" />
                        </div>
                        <div className="flex flex-col">
                           <span className="font-black text-sm text-white tracking-tight uppercase leading-none">{profile?.username}</span>
                           <span className="text-[10px] font-bold text-muted tracking-widest uppercase mt-1">Creator</span>
                        </div>
                     </div>

                     <div className="flex flex-col gap-4 flex-grow">
                        <div className="relative">
                           <textarea 
                              placeholder="Captivate your audience..." 
                              className="bg-transparent border-none outline-none w-full h-[180px] resize-none text-[15px] text-white/90 placeholder:text-white/20 font-medium leading-relaxed no-scrollbar"
                              value={caption}
                              onChange={(e) => setCaption(e.target.value)}
                           />
                           <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                              <div className="flex items-center gap-4 text-white/20">
                                 <Smile size={20} className="hover:text-accent cursor-pointer transition-colors" />
                                 <Hash size={20} className="hover:text-accent cursor-pointer transition-colors" />
                                 <MapPin size={20} className="hover:text-accent cursor-pointer transition-colors" />
                              </div>
                              <span className="text-[10px] font-black text-white/10">{caption.length} / 2200</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-col gap-4 mt-auto">
                        <button 
                          onClick={handleUpload} 
                          disabled={loading}
                          className="premium-btn py-4 w-full flex items-center justify-center gap-3 group text-xs font-black tracking-[0.2em] uppercase"
                        >
                           {loading ? <Loader2 className="animate-spin" size={20} strokeWidth={3} /> : <>SHARE MASTERPIECE <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" /> </>}
                        </button>
                        <button onClick={() => setStep(1)} className="text-[10px] font-black tracking-widest text-white/30 hover:text-white transition-all bg-transparent border-0 cursor-pointer uppercase">Back to Selection</button>
                     </div>
                  </div>
               </motion.div>
             )}

             {step === 3 && (
               <motion.div 
                 key="s3"
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex flex-col items-center justify-center gap-10 py-32 sm:py-48 relative"
               >
                  <div className="relative">
                     <div className="absolute inset-0 bg-green-500 rounded-full blur-[60px] opacity-20 animate-pulse"></div>
                     <motion.div 
                       initial={{ scale: 0 }}
                       animate={{ scale: 1 }}
                       transition={{ type: "spring", stiffness: 200, damping: 10 }}
                       className="relative w-32 h-32 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center"
                     >
                        <CheckCircle size={64} className="text-green-500" strokeWidth={1} />
                     </motion.div>
                  </div>
                  <div className="flex flex-col items-center gap-3 text-center">
                    <h2 className="font-black text-3xl tracking-tighter text-white m-0 uppercase drop-shadow-[0_0_15px_rgba(0,0,0,1)]">Transmission Complete</h2>
                    <p className="text-muted font-bold text-sm tracking-wide">Your creative spirit is now part of the Nexus.</p>
                  </div>
                  <div className="flex gap-2">
                     <Sparkles size={24} className="text-accent animate-spin" style={{ animationDuration: '3s' }} />
                     <Sparkles size={18} className="text-accent-secondary animate-pulse" />
                  </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default CreatePost;
