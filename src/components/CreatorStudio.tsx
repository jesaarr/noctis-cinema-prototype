import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';
import CreatorStats from '../pages/CreatorStats';
import type { Movie } from '../types/cinema';

interface CreatorStudioProps {
  session: Session;
  onSignalBroadcasted: () => void;
}

const extractYouTubeId = (url: string): string => {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]{11})|^([a-zA-Z0-9_-]{11})$/;
  const match = url.match(regex);
  return match ? (match[1] || match[2]) : '';
};

export default function CreatorStudio({ session, onSignalBroadcasted }: CreatorStudioProps) {
  const [activeTab, setActiveTab] = useState<'broadcast' | 'signals' | 'analytics'>('broadcast');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [promptLore, setPromptLore] = useState('');
  const [aiTools, setAiTools] = useState('');

  const [mySignals, setMySignals] = useState<Movie[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const [creatorCheckLoading, setCreatorCheckLoading] = useState(true);

  useEffect(() => {
    checkCreatorStatus();
  }, [session]);

  const checkCreatorStatus = async () => {
    try {
      setCreatorCheckLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('is_creator')
        .eq('id', session.user.id)
        .single();

      if (error) {
        const localCreator = localStorage.getItem(`creator_status_${session.user.id}`);
        setIsCreator(localCreator === 'true');
      } else {
        setIsCreator(data?.is_creator ?? false);
      }
      await loadMySignals();
    } catch (err) {
      setIsCreator(false);
    } finally {
      setCreatorCheckLoading(false);
    }
  };

  const loadMySignals = async () => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('director_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMySignals(data || []);
    } catch (e) {
      const localSignals = JSON.parse(localStorage.getItem('noctis_local_signals') || '[]') as Movie[];
      const filtered = localSignals.filter((sig) => sig.director_id === session.user.id);
      setMySignals(filtered);
    }
  };

  const handleInitializeChannel = async () => {
    setLoading(true);
    try {
      await supabase
        .from('profiles')
        .update({ is_creator: true })
        .eq('id', session.user.id);

      localStorage.setItem(`creator_status_${session.user.id}`, 'true');
      setIsCreator(true);
    } catch (err) {
      setIsCreator(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');
    setIsError(false);

    const extractedId = extractYouTubeId(youtubeUrl);
    if (!title.trim() || !description.trim() || !extractedId || !coverUrl.trim()) {
      setIsError(true);
      setStatusMessage('Operational error: All required parameters must be populated.');
      setLoading(false);
      return;
    }

    const director = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Anonymous';
    const newSignal: Movie = {
      id: `signal-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      director,
      director_id: session.user.id,
      youtube_id: extractedId,
      cover_url: coverUrl.trim(),
      prompt_lore: promptLore.trim(),
      ai_tools: aiTools.split(',').map(t => t.trim()).filter(Boolean),
      created_at: new Date().toISOString()
    };

    try {
      const localSignals = JSON.parse(localStorage.getItem('noctis_local_signals') || '[]') as Movie[];
      localSignals.unshift(newSignal);
      localStorage.setItem('noctis_local_signals', JSON.stringify(localSignals));
      setMySignals(prev => [newSignal, ...prev]);
      setStatusMessage('Success: Signal indexed into local database pipeline.');

      await supabase.from('movies').insert([newSignal]);
      resetForm();

      setTimeout(() => {
        onSignalBroadcasted();
        setStatusMessage('');
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSignal = async (id: string) => {
    if (!window.confirm('Are you absolute sure you want to purge this data signal?')) return;
    try {
      const localSignals = JSON.parse(localStorage.getItem('noctis_local_signals') || '[]') as Movie[];
      const updated = localSignals.filter(sig => sig.id !== id);
      localStorage.setItem('noctis_local_signals', JSON.stringify(updated));

      setMySignals(prev => prev.filter(sig => sig.id !== id));
      await supabase.from('movies').delete().eq('id', id);
      onSignalBroadcasted();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setYoutubeUrl('');
    setCoverUrl('');
    setPromptLore('');
    setAiTools('');
  };

  if (creatorCheckLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-[10px] font-mono text-noctis-muted tracking-widest animate-pulse">
        VALIDATING UPLINK DATA...
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="py-12 px-4 max-w-md mx-auto text-center space-y-6">
        <div className="w-12 h-12 rounded-full border border-noctis-gold/10 flex items-center justify-center mx-auto text-noctis-gold font-mono text-xs animate-pulse">
          //
        </div>
        <h3 className="text-xs font-light tracking-[0.3em] text-noctis-platinum uppercase">TRANSMISSION OFFLINE</h3>
        <p className="text-[10px] text-noctis-muted font-mono uppercase tracking-wider leading-relaxed">
          Your creative broadcasting tower is currently inactive. Initialize your frequency mapping to sync signals.
        </p>
        <button
          onClick={handleInitializeChannel}
          disabled={loading}
          className="w-full py-3 bg-transparent border border-noctis-gold/20 hover:border-noctis-gold text-noctis-gold rounded-xl text-[9px] tracking-widest uppercase font-mono transition-all duration-500"
        >
          {loading ? 'INITIALIZING TOWERS...' : 'ACTIVATE BROADCAST FREQUENCY'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-6 border-b border-white/[0.05] pb-3 font-mono text-[9px]">
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`pb-2 tracking-wider uppercase transition-colors ${activeTab === 'broadcast' ? 'text-noctis-gold border-b border-noctis-gold' : 'text-noctis-muted hover:text-gray-300'}`}
        >
          [BROADCAST]
        </button>
        <button
          onClick={() => setActiveTab('signals')}
          className={`pb-2 tracking-wider uppercase transition-colors ${activeTab === 'signals' ? 'text-noctis-gold border-b border-noctis-gold' : 'text-noctis-muted hover:text-gray-300'}`}
        >
          MY SIGNALS ({mySignals.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-2 tracking-wider uppercase transition-colors ${activeTab === 'analytics' ? 'text-noctis-gold border-b border-noctis-gold' : 'text-noctis-muted hover:text-gray-300'}`}
        >
          [ANALYTICS]
        </button>
      </div>

      {statusMessage && (
        <div className={`text-[10px] p-3 rounded-xl border font-mono ${isError ? 'text-red-400 bg-red-950/10 border-red-900/20' : 'text-noctis-gold bg-noctis-card/5 border-noctis-gold/20'}`}>
          {statusMessage}
        </div>
      )}

      {activeTab === 'broadcast' && (
        <form onSubmit={handleBroadcast} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative border-b border-white/[0.05] focus-within:border-noctis-gold transition-colors pb-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder=" "
                className="peer w-full bg-transparent text-gray-200 text-xs outline-none pt-4 pb-1 font-light placeholder-transparent"
                required
              />
              <label className="absolute left-0 top-4 text-[8px] uppercase tracking-widest text-noctis-muted pointer-events-none transition-all duration-300 font-mono peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-[8px] peer-focus:text-noctis-gold">
                Signal Title *
              </label>
            </div>

            <div className="relative border-b border-white/[0.05] focus-within:border-noctis-gold transition-colors pb-2">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder=" "
                className="peer w-full bg-transparent text-gray-200 text-xs outline-none pt-4 pb-1 font-light placeholder-transparent"
                required
              />
              <label className="absolute left-0 top-4 text-[8px] uppercase tracking-widest text-noctis-muted pointer-events-none transition-all duration-300 font-mono peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-[8px] peer-focus:text-noctis-gold">
                Synopsis / Brief Logline *
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative border-b border-white/[0.05] focus-within:border-noctis-gold transition-colors pb-2">
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder=" "
                className="peer w-full bg-transparent text-gray-200 text-xs outline-none pt-4 pb-1 font-mono placeholder-transparent"
                required
              />
              <label className="absolute left-0 top-4 text-[8px] uppercase tracking-widest text-noctis-muted pointer-events-none transition-all duration-300 font-mono peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-[8px] peer-focus:text-noctis-gold">
                YouTube Source Link / ID *
              </label>
            </div>

            <div className="relative border-b border-white/[0.05] focus-within:border-noctis-gold transition-colors pb-2">
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder=" "
                className="peer w-full bg-transparent text-gray-200 text-xs outline-none pt-4 pb-1 font-light placeholder-transparent"
                required
              />
              <label className="absolute left-0 top-4 text-[8px] uppercase tracking-widest text-noctis-muted pointer-events-none transition-all duration-300 font-mono peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-[8px] peer-focus:text-noctis-gold">
                Cover Art URL *
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-transparent border border-noctis-gold/20 hover:border-noctis-gold text-noctis-gold font-mono text-[9px] tracking-widest uppercase rounded-xl transition-all duration-500 disabled:opacity-50"
          >
            {loading ? 'BROADCASTING DATA...' : 'TRANSMIT SIGNAL'}
          </button>
        </form>
      )}

      {activeTab === 'signals' && (
        <div className="space-y-4">
          {mySignals.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/[0.05] rounded-3xl text-noctis-muted text-[10px] font-mono uppercase tracking-widest">
              No recorded signals in this tower database.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mySignals.map((signal) => (
                <div key={signal.id} className="bg-noctis-card border border-white/[0.05] p-4 rounded-2xl group flex flex-col justify-between">
                  <div>
                    <h5 className="text-xs text-gray-200 truncate">{signal.title}</h5>
                    <p className="text-[10px] text-noctis-muted line-clamp-2 mt-1">{signal.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteSignal(signal.id)}
                    className="mt-4 text-[8px] font-mono tracking-widest text-red-400/80 hover:text-red-400 text-left uppercase"
                  >
                    // PURGE FREQUENCY [X]
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && <CreatorStats session={session} mySignals={mySignals} />}
    </div>
  );
}