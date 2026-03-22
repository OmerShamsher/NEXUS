import React, { useEffect, useState } from 'react';
import Reel from '../components/Reel';
import { supabase } from '../lib/supabaseClient';
import { Loader2, Music, TrendingUp } from 'lucide-react';

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  const mockReels = [
    {
      id: 1,
      username: 'iam_omer',
      avatar: 'https://i.pravatar.cc/150?u=omer',
      videoUrl: 'https://cdn.pixabay.com/video/2020/09/24/50766-462376239_large.mp4',
      caption: 'The future of social media is dark. 🕶️ #Luxury #AI #NEXUS',
      likes: '1.2M',
      comments: '4.5K'
    },
    {
      id: 2,
      username: 'nexus_elite',
      avatar: 'https://i.pravatar.cc/150?u=nexus',
      videoUrl: 'https://cdn.pixabay.com/video/2016/09/06/5045-181177659_medium.mp4',
      caption: 'Code with passion. Build with soul. 💻🔥 #DeveloperLife',
      likes: '89K',
      comments: '1.2K'
    },
    {
      id: 3,
      username: 'travel_mode',
      avatar: 'https://i.pravatar.cc/150?u=travel',
      videoUrl: 'https://cdn.pixabay.com/video/2021/04/12/70878-537442111_tiny.mp4',
      caption: 'Exploring the hidden gems of the north. 🏔️ #Adventure',
      likes: '235K',
      comments: '890'
    }
  ];

  useEffect(() => {
    fetchReels();
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
      
      if (data && data.length > 0) {
        setReels(data.map(r => ({
          id: r.id,
          username: r.profiles.username,
          avatar: r.profiles.avatar_url,
          videoUrl: r.content_url,
          caption: r.caption,
          likes: '1.5M',
          comments: '8K'
        })));
      } else {
        setReels(mockReels);
      }
    } catch (err) {
      console.error("Error fetching reels:", err);
      setReels(mockReels);
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
      ) : (
        <div className="reel-container">
          {reels.map((reel) => (
            <Reel key={reel.id} {...reel} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Reels;
