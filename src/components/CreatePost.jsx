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
  UploadCloud
} from 'lucide-react';

const CreatePost = ({ isOpen, onClose, onRefresh }) => {
  const { session, profile } = useAuth();
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('image'); // image or video
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Select, 2: Preview & Caption
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
          created_at: new Date()
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
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass w-full max-w-[600px] rounded-3xl overflow-hidden relative border border-white/10"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
           <h3 className="fw-black fs-4 tracking-tighter m-0 flex items-center gap-2">
              <PlusSquare className="text-accent" /> Create {fileType === 'video' ? 'Reel' : 'Post'}
           </h3>
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full border-0 bg-transparent text-white"><X size={24} /></button>
        </div>

        <div className="p-8">
           <AnimatePresence mode="wait">
             {step === 1 && (
               <motion.div 
                 key="s1"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 1.05 }}
                 className="flex flex-col items-center justify-center gap-8 py-12"
               >
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="w-48 h-48 rounded-full border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-accent group transition-all"
                  >
                     <UploadCloud size={48} className="text-white/20 group-hover:text-accent transition-colors" />
                     <span className="text-xs fw-bold text-muted group-hover:text-white">Choose Files</span>
                  </div>
                  <input ref={fileInputRef} type="file" hidden accept="image/*,video/*" onChange={handleFileChange} />
                  <div className="flex gap-4">
                     <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl text-xs fw-bold"><ImageIcon size={14} /> Images</div>
                     <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl text-xs fw-bold"><VideoIcon size={14} /> Reels</div>
                  </div>
               </motion.div>
             )}

             {step === 2 && (
               <motion.div 
                 key="s2"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="row g-6"
               >
                 <div className="col-md-6">
                    <div className="aspect-square rounded-2xl overflow-hidden border border-white/5 bg-black">
                       {fileType === 'video' ? (
                         <video src={preview} controls className="w-full h-full object-cover" />
                       ) : (
                         <img src={preview} className="w-full h-full object-cover" />
                       )}
                    </div>
                 </div>
                 <div className="col-md-6 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                       <div className="avatar w-8 h-8 p-0.5"><div className="avatar-inner"><img src={profile?.avatar_url} /></div></div>
                       <span className="fw-bold text-sm">{profile?.username}</span>
                    </div>
                    <textarea 
                       placeholder="Write a caption..." 
                       className="premium-input bg-white/5 border-0 w-full h-[120px] resize-none fs-6"
                       value={caption}
                       onChange={(e) => setCaption(e.target.value)}
                    />
                    <div className="flex items-center gap-3 text-muted">
                        <Hash size={16} />
                        <span className="text-xs fw-bold">Tags and locations</span>
                    </div>
                    <button 
                      onClick={handleUpload} 
                      disabled={loading}
                      className="premium-btn w-full mt-auto flex items-center justify-center gap-2"
                    >
                       {loading ? <Loader2 className="animate-spin" size={20} /> : <>Post Now <ArrowRight size={18} /></>}
                    </button>
                    <button onClick={() => setStep(1)} className="btn btn-link text-muted fs-6 no-underline bg-transparent border-0 hover:text-white">Start Over</button>
                 </div>
               </motion.div>
             )}

             {step === 3 && (
               <motion.div 
                 key="s3"
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex flex-col items-center justify-center gap-6 py-20"
               >
                  <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                     <CheckCircle size={48} className="text-green-500" />
                  </div>
                  <div className="text-center">
                    <h2 className="fw-black fs-3">Success!</h2>
                    <p className="text-muted fs-5">Your masterpiece is now live on Nexus.</p>
                  </div>
                  <Sparkles size={32} className="text-accent animate-pulse" />
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default CreatePost;
