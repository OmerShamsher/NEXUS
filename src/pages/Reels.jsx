import React, { useEffect, useState } from 'react';
import Reel from '../components/Reel';
import { supabase } from '../lib/supabaseClient';
import { Loader2, Music, TrendingUp, PlaySquare } from 'lucide-react';

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReels();

    const channel = supabase
      .channel('public:reels')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts', filter: "type=eq.video" }, (payload) => {
        fetchReels();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchReels = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq('type', 'video')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setReels(data.map(r => ({
          id: r.id,
          username: r.profiles?.username || 'Nexus Member',
          avatar: r.profiles?.avatar_url,
          videoUrl: r.content_url,
          caption: r.caption,
          likes: '0',
          comments: '0'
        })));
      }
    } catch (err) {
      console.error("Error fetching reels:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-black overflow-hidden py-4 sm:py-8">
      <div className="flex items-center gap-6 mb-8 mt-2 glass p-4 rounded-3xl w-full max-w-[480px]">
         <div className="flex items-center gap-2 text-accent">
            <TrendingUp size={20} />
            <span className="fw-black text-xs">TRENDING</span>
         </div>
         <div className="h-4 w-px bg-white/10"></div>
         <div className="flex items-center gap-2 text-white/50">
            <Music size={16} />
            <span className="text-xs">Original Audio</span>
         </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-[80vh]">
          <Loader2 className="animate-spin text-accent" size={48} />
        </div>
      ) : reels.length > 0 ? (
        <div className="reel-container">
          {reels.map((reel) => (
            <Reel key={reel.id} {...reel} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center gap-6 px-10">
           <PlaySquare size={80} className="text-white/10" />
           <div>
             <h2 className="fw-black fs-2 mb-2">No Reels Yet</h2>
             <p className="text-muted fs-5 leading-relaxed max-w-sm">Share your story in motion. Upload your first reel and influence the community.</p>
           </div>
           <button 
             onClick={() => window.dispatchEvent(new CustomEvent('open-create-post'))}
             className="premium-btn px-10"
           >
              CREATE REEL
           </button>
        </div>
      )}
    </div>
  );
};

export default Reels;
