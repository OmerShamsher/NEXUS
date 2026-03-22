import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Search as SearchIcon, UserPlus, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[600px] mx-auto py-12 px-6">
      <div className="mb-10">
        <h1 className="fs-1 fw-black tracking-tighter mb-6">Search</h1>
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
          <input 
            type="text" 
            placeholder="Search accounts..." 
            className="premium-input w-full ps-12 bg-white/5 border-white/10 focus:border-accent rounded-2xl h-14"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full border-0 bg-transparent text-muted"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-accent" size={32} />
          </div>
        ) : (
          <AnimatePresence>
            {results.map((user, i) => (
              <motion.div 
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="avatar w-12 h-12 p-0.5">
                    <div className="avatar-inner">
                      <img src={user.avatar_url} alt={user.username} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="fw-bold text-sm">{user.username}</span>
                    <span className="text-muted text-xs">{user.full_name}</span>
                  </div>
                </div>
                <button className="premium-btn py-1.5 px-5 text-xs tracking-tight bg-accent hover:bg-white/10 border-0 outline-none">
                  Follow
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-20 text-muted">
             <p className="fs-5">No results found for "{query}"</p>
          </div>
        )}

        {!query && (
          <div className="py-20 text-center">
             <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                <SearchIcon size={32} className="opacity-20" />
             </div>
             <p className="text-muted fs-5">Find people you know on Nexus</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
