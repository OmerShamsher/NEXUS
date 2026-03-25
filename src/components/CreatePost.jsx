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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts_content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('posts_content')
        .getPublicUrl(filePath);

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

      setStep(3); 
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
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
      />
      
      {/* Modal Container */}
      <motion.div 
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        className="bg-white w-full max-w-[850px] rounded-[48px] overflow-hidden relative border border-border-soft shadow-2xl"
      >
        <div className="flex items-center justify-between p-8 px-10 border-b border-border-soft relative z-10">
           <div className="flex flex-col">
              <h3 className="font-black text-2xl tracking-tighter m-0 flex items-center gap-4 text-text-main uppercase italic">
                 <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-white">
                    <PlusSquare size={24} strokeWidth={3} />
                 </div>
                 New {fileType === 'video' ? 'Reel' : 'Post'}
              </h3>
              <span className="text-[10px] text-accent font-black tracking-[0.3em] mt-2 uppercase italic">Nexus Creative Engine</span>
           </div>
           <button onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-bg-app rounded-2xl transition-all border-0 bg-transparent text-text-main cursor-pointer"><X size={28} /></button>
        </div>

        <div className="p-0 relative z-10">
           <AnimatePresence mode="wait">
             {step === 1 && (
               <motion.div 
                 key="s1"
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 1.02 }}
                 className="flex flex-col items-center justify-center gap-12 py-24 sm:py-32"
               >
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="relative group cursor-pointer"
                  >
                     <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-[48px] border-4 border-dashed border-border-soft flex flex-col items-center justify-center gap-6 bg-bg-app group-hover:border-accent group-hover:bg-accent/5 transition-all duration-500">
                        <UploadCloud size={64} className="text-text-muted group-hover:text-accent transition-all group-hover:-translate-y-2" strokeWidth={1.5} />
                        <div className="flex flex-col items-center gap-2">
                           <span className="text-[12px] font-black text-text-main tracking-widest uppercase">Select Media</span>
                           <span className="text-[10px] font-bold text-text-muted tracking-wide uppercase">JPG, MP4, PNG</span>
                        </div>
                     </div>
                  </div>
                  <input ref={fileInputRef} type="file" hidden accept="image/*,video/*" onChange={handleFileChange} />
                  
                  <div className="flex gap-6">
                     <div className="flex items-center gap-3 px-8 py-3.5 bg-bg-app border border-border-soft rounded-2xl text-[11px] font-black tracking-widest uppercase text-text-muted cursor-default">
                        <ImageIcon size={18} strokeWidth={2} /> Static Image
                     </div>
                     <div className="flex items-center gap-3 px-8 py-3.5 bg-bg-app border border-border-soft rounded-2xl text-[11px] font-black tracking-widest uppercase text-text-muted cursor-default">
                        <VideoIcon size={18} strokeWidth={2} /> Motion Reel
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
                 className="flex flex-col lg:flex-row h-full lg:h-[580px]"
               >
                  {/* Media Preview Area */}
                  <div className="lg:w-[480px] border-r border-border-soft bg-bg-app flex items-center justify-center max-h-[400px] lg:max-h-none overflow-hidden">
                     <div className="w-full h-full relative group">
                        {fileType === 'video' ? (
                          <video src={preview} controls className="w-full h-full object-cover" />
                        ) : (
                          <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                        )}
                        <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-md px-5 py-2 rounded-full border border-border-soft text-[10px] font-black tracking-widest text-text-main uppercase shadow-sm">
                           PREVIEW READY
                        </div>
                     </div>
                  </div>

                  {/* Caption & Controls Area */}
                  <div className="flex-grow p-12 flex flex-col gap-10 bg-white">
                     <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl border-2 border-accent p-0.5 shadow-xl">
                           <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=user`} className="w-full h-full rounded-[14px] object-cover" alt="me" />
                        </div>
                        <div className="flex flex-col">
                           <span className="font-black text-[15px] text-text-main tracking-tight uppercase italic">{profile?.username}</span>
                           <span className="text-[10px] font-black text-accent tracking-[0.2em] uppercase mt-1">Prime Creator</span>
                        </div>
                     </div>

                     <div className="flex flex-col gap-4 flex-grow">
                        <div className="relative">
                           <textarea 
                              placeholder="Draft your story..." 
                              className="bg-transparent border-none outline-none w-full h-[200px] resize-none text-[16px] text-text-main placeholder:text-text-muted font-medium leading-relaxed no-scrollbar"
                              value={caption}
                              onChange={(e) => setCaption(e.target.value)}
                           />
                           <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-soft">
                              <div className="flex items-center gap-6 text-text-muted">
                                 <Smile size={22} className="hover:text-accent cursor-pointer transition-colors" />
                                 <Hash size={22} className="hover:text-accent cursor-pointer transition-colors" />
                                 <MapPin size={22} className="hover:text-accent cursor-pointer transition-colors" />
                              </div>
                              <span className="text-[11px] font-black text-text-muted opacity-50 uppercase tracking-widest">{caption.length} / 2200</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-col gap-4 mt-auto">
                        <button 
                          onClick={handleUpload} 
                          disabled={loading}
                          className="premium-btn py-5 w-full flex items-center justify-center gap-4 group text-[11px] font-black tracking-[0.3em] uppercase"
                        >
                           {loading ? <Loader2 className="animate-spin" size={20} /> : <>INITIATE BROADCAST <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" /> </>}
                        </button>
                        <button onClick={() => setStep(1)} className="text-[10px] font-black tracking-[0.2em] text-text-muted hover:text-text-main transition-all bg-transparent border-0 cursor-pointer uppercase italic">Return to terminal</button>
                     </div>
                  </div>
               </motion.div>
             )}

             {step === 3 && (
               <motion.div 
                 key="s3"
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex flex-col items-center justify-center gap-12 py-32 sm:py-48 relative"
               >
                  <div className="relative">
                     <motion.div 
                       initial={{ scale: 0 }}
                       animate={{ scale: 1 }}
                       transition={{ type: "spring", stiffness: 200, damping: 15 }}
                       className="relative w-40 h-40 rounded-[48px] bg-accent/5 border border-accent/20 flex items-center justify-center shadow-inner"
                     >
                        <CheckCircle size={80} className="text-accent" strokeWidth={1} />
                     </motion.div>
                  </div>
                  <div className="flex flex-col items-center gap-4 text-center">
                    <h2 className="font-black text-4xl tracking-tighter text-text-main m-0 uppercase italic">Signal Broadcasted</h2>
                    <p className="text-text-secondary font-bold text-[15px] tracking-wide max-w-[320px] uppercase">Your creation is now live across the Nexus network.</p>
                  </div>
                  <div className="flex gap-4">
                     <Sparkles size={28} className="text-accent animate-pulse" />
                     <Sparkles size={20} className="text-purple-500 animate-bounce" />
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
