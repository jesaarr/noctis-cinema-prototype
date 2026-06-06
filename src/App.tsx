import React, { useState, useEffect } from 'react';
import Auth from './pages/Auth';
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';

import { useNoctisStorage } from './hooks/useNoctisStorage';
import Sidebar from './components/Sidebar';
import MovieGrid from './components/MovieGrid';
import VideoContainer from './components/VideoContainer';
import UserProfile from './components/UserProfile';
import type { Movie, StoreItem } from './types/cinema';
const AVATAR_MAP: Record<string, string> = {
  'aurora': 'A',
  'director': 'B',
  'observer': 'C',
  'core': 'D',
};

const DEFAULT_MOVIES: Movie[] = [
  {
    id: 'm1',
    title: 'CHRONOS PROTOCOL',
    description: 'Zaman bükülmesi yaşayan distopik bir metropolde, kayıp bir frekansın peşine düşen yalnız bir arşivcinin hikayesi.',
    director: 'Aurora',
    director_id: 'system',
    youtube_id: 'dQw4w9WgXcQ',
    cover_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    prompt_lore: 'Shot on 35mm, cinematic lighting, cyberpunk city, golden hour reflection, unreal engine 5 render, highly detailed.',
    ai_tools: ['Midjourney', 'Runway Gen-2', 'Udio'],
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'm2',
    title: 'SILENT RESONANCE',
    description: 'Yapay zeka zihinlerinin sessizliğe büründüğü büyük çöküş sonrası, insanlığın son analog sinyali arayışı.',
    director: 'Director',
    director_id: 'system',
    youtube_id: 'dQw4w9WgXcQ',
    cover_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80',
    prompt_lore: 'Dystopian landscape, analog signal waves, volumetric amber dust, minimalist cinematic composition, Arri Alexa.',
    ai_tools: ['Sora', 'Stable Diffusion', 'ElevenLabs'],
    created_at: new Date(Date.now() - 172800000).toISOString()
  }
];

// Store items are loaded from Supabase `store_items` table at runtime

// YouTube ID Ayıklayıcı
const extractYouTubeId = (url: string): string => {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]{11})|^([a-zA-Z0-9_-]{11})$/;
  const match = url.match(regex);
  return match ? (match[1] || match[2]) : '';
};

// ============================================
// BİLEŞEN 1: CREATOR STATS (Lüks Analitik Modülü)
// ============================================
interface CreatorStatsProps {
  mySignals: Movie[];
}

function CreatorStats({ mySignals }: CreatorStatsProps) {
  const getDeterministicMetrics = (title: string, index: number) => {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const baseViews = Math.abs((hash % 850) + 150); 
    const baseResonances = Math.abs((hash % 120) + 12);
    return {
      views: baseViews + (index * 42),
      resonances: baseResonances + (index * 8)
    };
  };

  const totalViews = mySignals.reduce((acc, sig, idx) => acc + getDeterministicMetrics(sig.title, idx).views, 0);
  const totalResonances = mySignals.reduce((acc, sig, idx) => acc + getDeterministicMetrics(sig.title, idx).resonances, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-noctis-card border border-white/[0.05] p-5 rounded-2xl text-center">
          <p className="text-[9px] uppercase tracking-widest text-noctis-muted font-mono">ECHO STRENGTH</p>
          <p className="text-2xl font-light text-noctis-gold mt-2">{totalViews}</p>
          <span className="text-[8px] text-noctis-muted font-mono">Toplam İzlenme</span>
        </div>
        <div className="bg-noctis-card border border-white/[0.05] p-5 rounded-2xl text-center">
          <p className="text-[9px] uppercase tracking-widest text-noctis-muted font-mono">RESONANCES</p>
          <p className="text-2xl font-light text-noctis-gold mt-2">{totalResonances}</p>
          <span className="text-[8px] text-noctis-muted font-mono">Etkileşimler</span>
        </div>
        <div className="bg-noctis-card border border-white/[0.05] p-5 rounded-2xl text-center">
          <p className="text-[9px] uppercase tracking-widest text-noctis-muted font-mono">ACTIVE SIGNALS</p>
          <p className="text-2xl font-light text-noctis-gold mt-2">{mySignals.length}</p>
          <span className="text-[8px] text-noctis-muted font-mono">Yayınlanan Film</span>
        </div>
      </div>

      <div className="bg-noctis-card border border-white/[0.05] p-6 rounded-3xl">
        <h4 className="text-[10px] font-mono uppercase tracking-widest text-noctis-gold mb-6">// BROADCAST TIMELINE</h4>
        <div className="flex justify-between items-end h-24 px-4 border-b border-white/[0.05]">
          {[40, 15, 65, 30, 85, 45, 95, 20, 60, 50, 75, 90].map((val, idx) => (
            <div key={idx} className="flex flex-col items-center w-full group">
              <div style={{ height: `${val}%` }} className="w-[3px] bg-gray-800 group-hover:bg-noctis-gold transition-all duration-500 rounded-t-full relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-noctis-gold text-[7px] font-mono px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  %{val}
                </div>
              </div>
              <span className="text-[7px] text-noctis-muted font-mono mt-2">{idx + 1}h</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// BİLEŞEN 2: CREATOR STUDIO (Yayın & Video Yönetimi)
// ============================================
interface CreatorStudioProps {
  session: Session;
  onSignalBroadcasted: () => void;
}

function CreatorStudio({ session, onSignalBroadcasted }: CreatorStudioProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'advanced' | 'analytics'>('general');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Form states
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
        setIsCreator(false);
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
      setMySignals([]);
    }
  };

  const handleInitializeChannel = async () => {
    setLoading(true);
    try {
      await supabase
        .from('profiles')
        .update({ is_creator: true })
        .eq('id', session.user.id);
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
      setStatusMessage('❌ Lütfen tüm zorunlu alanları eksiksiz doldurun.');
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
      const { error } = await supabase.from('movies').insert([newSignal]);
      if (error) throw error;
      setMySignals(prev => [newSignal, ...prev]);
      setStatusMessage('✓ Sinyal merkezi veritabanına işlendi.');

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
      <div className="flex items-center justify-center py-20 text-xs font-mono text-noctis-muted tracking-widest animate-pulse">
        KİMLİK DOĞRULANIYOR...
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="py-12 px-4 max-w-md mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full border border-noctis-gold/20 flex items-center justify-center mx-auto text-2xl animate-pulse">
          ⚡
        </div>
        <h3 className="text-sm font-light tracking-[0.3em] text-noctis-platinum uppercase">TRANSMISSION OFFLINE</h3>
        <p className="text-[10px] text-noctis-muted font-mono uppercase tracking-wider leading-relaxed">
          Kendi yayın kuleleriniz henüz aktif edilmedi. Sinematik yapıtlarınızı NOCTIS evrenine ulaştırmak için kanalınızı tek tıkla başlatın.
        </p>
        <button
          onClick={handleInitializeChannel}
          disabled={loading}
          className="w-full py-3 bg-noctis-gold/10 hover:bg-noctis-gold/10 border border-noctis-gold/20 hover:border-noctis-gold text-noctis-gold rounded-xl text-[10px] tracking-widest uppercase font-mono font-bold transition-all duration-500"
        >
          {loading ? 'KULELER AKTİF EDİLİYOR...' : 'YAYIN FREKANSINI BAŞLAT'}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[240px_1fr] gap-8 min-h-[calc(100vh-4rem)]">
      <aside className="space-y-4 rounded-3xl border border-white/[0.05] bg-noctis-card p-6 shadow-noctis">
        <div className="text-[10px] uppercase tracking-luxury text-noctis-muted mb-6">
          CREATOR STUDIO
        </div>

        <button
          onClick={() => setActiveTab('general')}
          className={`w-full text-left py-4 px-4 rounded-3xl transition-all duration-300 ${activeTab === 'general' ? 'bg-noctis-gold/10 border border-noctis-gold/30 text-noctis-gold' : 'border border-transparent text-noctis-muted hover:bg-white/[0.03]'}`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          className={`w-full text-left py-4 px-4 rounded-3xl transition-all duration-300 ${activeTab === 'advanced' ? 'bg-noctis-gold/10 border border-noctis-gold/30 text-noctis-gold' : 'border border-transparent text-noctis-muted hover:bg-white/[0.03]'}`}
        >
          Advanced
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`w-full text-left py-4 px-4 rounded-3xl transition-all duration-300 ${activeTab === 'analytics' ? 'bg-noctis-gold/10 border border-noctis-gold/30 text-noctis-gold' : 'border border-transparent text-noctis-muted hover:bg-white/[0.03]'}`}
        >
          Analytics
        </button>
      </aside>

      <section className="space-y-6 bg-noctis-bg border border-white/[0.05] rounded-[32px] p-8 shadow-noctis">
        {statusMessage && (
          <div className={`text-[10px] p-4 rounded-3xl border ${isError ? 'text-red-400 bg-red-950/10 border-red-900/20' : 'text-noctis-gold bg-noctis-gold/10 border-noctis-gold/20'}`}>
            {statusMessage}
          </div>
        )}

        {activeTab === 'general' && (
          <form onSubmit={handleBroadcast} className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[0.35em] text-noctis-muted font-mono">Signal Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-noctis-bg border border-white/[0.05] rounded-3xl px-4 py-4 text-sm text-noctis-platinum outline-none transition-colors duration-300 focus:border-noctis-gold"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[0.35em] text-noctis-muted font-mono">Synopsis / Brief Logline *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[160px] resize-none bg-noctis-bg border border-white/[0.05] rounded-3xl px-4 py-4 text-sm text-noctis-platinum outline-none transition-colors duration-300 focus:border-noctis-gold"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[0.35em] text-noctis-muted font-mono">Cover Art URL *</label>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full bg-noctis-bg border border-white/[0.05] rounded-3xl px-4 py-4 text-sm text-noctis-platinum outline-none transition-colors duration-300 focus:border-noctis-gold"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[0.35em] text-noctis-muted font-mono">YouTube Source URL / ID *</label>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full bg-noctis-bg border border-white/[0.05] rounded-3xl px-4 py-4 text-sm text-noctis-platinum outline-none transition-colors duration-300 focus:border-noctis-gold"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 border border-noctis-gold/20 rounded-3xl text-[10px] uppercase tracking-[0.35em] text-noctis-gold font-mono transition-all duration-300 hover:bg-white/[0.02] disabled:opacity-50"
            >
              {loading ? 'TRANSMITTING...' : 'TRANSMIT SIGNAL'}
            </button>
          </form>
        )}

        {activeTab === 'advanced' && (
        <form onSubmit={handleBroadcast} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative border-b border-white/[0.05] focus-within:border-noctis-gold transition-colors pb-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder=" "
                className="peer w-full bg-transparent text-gray-200 text-sm outline-none pt-4 pb-1 font-light placeholder-transparent"
                required
              />
              <label className="absolute left-0 top-4 text-[9px] uppercase tracking-widest text-noctis-muted pointer-events-none transition-all duration-300 font-mono peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-[9px] peer-focus:text-noctis-gold">
                Film Adı *
              </label>
            </div>

            <div className="relative border-b border-white/[0.05] focus-within:border-noctis-gold transition-colors pb-2">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder=" "
                className="peer w-full bg-transparent text-gray-200 text-sm outline-none pt-4 pb-1 font-light placeholder-transparent"
                required
              />
              <label className="absolute left-0 top-4 text-[9px] uppercase tracking-widest text-noctis-muted pointer-events-none transition-all duration-300 font-mono peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-[9px] peer-focus:text-noctis-gold">
                Kısa Özet / Sinopsis *
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
                className="peer w-full bg-transparent text-gray-200 text-sm outline-none pt-4 pb-1 font-mono placeholder-transparent"
                required
              />
              <label className="absolute left-0 top-4 text-[9px] uppercase tracking-widest text-noctis-muted pointer-events-none transition-all duration-300 font-mono peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-[9px] peer-focus:text-noctis-gold">
                YouTube Link veya ID *
              </label>
            </div>

            <div className="relative border-b border-white/[0.05] focus-within:border-noctis-gold transition-colors pb-2">
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder=" "
                className="peer w-full bg-transparent text-gray-200 text-sm outline-none pt-4 pb-1 font-light placeholder-transparent"
                required
              />
              <label className="absolute left-0 top-4 text-[9px] uppercase tracking-widest text-noctis-muted pointer-events-none transition-all duration-300 font-mono peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-[9px] peer-focus:text-noctis-gold">
                Kapak Görseli URL *
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-transparent border border-noctis-gold/20 hover:border-noctis-gold text-noctis-gold font-mono text-[9px] tracking-widest uppercase rounded-2xl transition-all duration-500 disabled:opacity-50"
          >
            {loading ? 'YAYINLANALANMAYA BAŞLADI...' : '▶ SİNYALİ YAYINLA'}
          </button>
        </form>
      )}

      {activeTab === 'analytics' && <CreatorStats mySignals={mySignals} />}
        </section>
    </div>
  );
}

// ============================================
// BİLEŞEN 3: CONTROL DECK (Lüks Sağ Panel)
// ============================================
interface ControlPanelProps {
  session: Session;
  isOpen: boolean;
  onClose: () => void;
  onRefreshSession: (updatedSession: Session | null) => void;
  onSignalBroadcasted: () => void;
}

function ControlPanel({ session, isOpen, onClose, onRefreshSession, onSignalBroadcasted }: ControlPanelProps) {
  const [activeMenu, setActiveMenu] = useState<'profile' | 'studio'>('profile');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const userMetadata = session.user.user_metadata;
  const [newUsername, setNewUsername] = useState(userMetadata?.username || '');
  const [selectedAvatar, setSelectedAvatar] = useState(userMetadata?.avatar || 'director');
  const [newPassword, setNewPassword] = useState('');

  const hasPasswordBound = session.user.identities?.some(id => id.provider === 'email');

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');
    setIsError(false);

    try {
      const updates: any = {
        data: {
          ...userMetadata,
          username: newUsername,
          avatar: selectedAvatar
        }
      };

      if (newPassword.trim()) {
        if (newPassword.length < 6) {
          setIsError(true);
          setStatusMessage('Hata: Şifre en az 6 karakter olmalıdır.');
          setLoading(false);
          return;
        }
        updates.password = newPassword;
      }

      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      setIsError(false);
      setStatusMessage('✓ Kimlik ayarları başarıyla güncellendi.');
      setNewPassword('');

      const { data: { session: updatedSession } } = await supabase.auth.getSession();
      onRefreshSession(updatedSession);
    } catch (error: any) {
      setIsError(true);
      setStatusMessage(error.message || 'Güncelleme sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />

      <div className={`absolute inset-0 h-full w-full bg-noctis-bg border-l border-white/[0.05] p-8 shadow-2xl overflow-y-auto transform transition-transform duration-500 ease-out flex flex-col justify-between ${activeMenu === 'studio' ? 'md:max-w-[90vw] lg:max-w-[1100px] mx-auto left-0 right-0' : 'max-w-lg md:max-w-xl right-0'} ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div>
          <div className="flex justify-between items-center border-b border-white/[0.05] pb-5 mb-8">
            <div>
              <h2 className="text-xl font-extralight tracking-[0.3em] text-[#f4f4f5] uppercase">CONTROL DECK</h2>
              <p className="text-[8px] font-mono tracking-widest text-noctis-gold uppercase mt-1">NOCTIS SYSTEM INTERFACE</p>
            </div>
            <button onClick={onClose} className="text-xs font-mono text-noctis-muted hover:text-noctis-gold transition-colors">
              // CLOSE PANEL [X]
            </button>
          </div>

          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveMenu('profile')}
              className={`flex-1 py-3 border text-[10px] font-mono tracking-wider uppercase rounded-xl transition-all ${activeMenu === 'profile' ? 'bg-noctis-gold/10 border-noctis-gold text-noctis-gold' : 'bg-transparent border-white/[0.05] text-noctis-muted'}`}
            >
              // KİMLİK AYARLARI
            </button>
            <button
              onClick={() => setActiveMenu('studio')}
              className={`flex-1 py-3 border text-[10px] font-mono tracking-wider uppercase rounded-xl transition-all ${activeMenu === 'studio' ? 'bg-noctis-gold/10 border-noctis-gold text-noctis-gold' : 'bg-transparent border-white/[0.05] text-noctis-muted'}`}
            >
              // YAYIN MERKEZİ (STUDIO)
            </button>
          </div>

          {activeMenu === 'profile' ? (
            <div className="space-y-6 animate-fade-in">
              {statusMessage && (
                <div className={`text-[10px] p-3 rounded-xl border font-mono ${isError ? 'text-red-400 bg-red-950/10 border-red-900/20' : 'text-emerald-400 bg-emerald-950/10 border-emerald-900/20'}`}>
                  {statusMessage}
                </div>
              )}

              <form onSubmit={handleUpdateAccount} className="space-y-6">
                <div className="relative border-b border-white/[0.05] focus-within:border-noctis-gold transition-colors pb-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder=" "
                    className="peer w-full bg-transparent text-gray-200 text-sm outline-none pt-4 pb-1 font-light placeholder-transparent"
                    required
                  />
                  <label className="absolute left-0 top-4 text-[9px] uppercase tracking-widest text-noctis-muted pointer-events-none transition-all duration-300 font-mono peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-[9px] peer-focus:text-noctis-gold">
                    YÖNETMEN İSMİ
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-mono uppercase tracking-widest text-noctis-muted">KİMLİK SİNYALİ</label>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(AVATAR_MAP).map(([key, emoji]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedAvatar(key)}
                        className={`py-4 rounded-2xl border text-xl transition-all ${selectedAvatar === key ? 'bg-noctis-gold/10 border-noctis-gold text-noctis-platinum shadow-lg' : 'bg-transparent border-white/[0.05] text-noctis-muted'}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative border-b border-white/[0.05] focus-within:border-noctis-gold transition-colors pb-2 pt-4">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder=" "
                    className="peer w-full bg-transparent text-gray-200 text-sm outline-none pt-4 pb-1 font-mono placeholder-transparent"
                  />
                  <label className="absolute left-0 top-4 text-[9px] uppercase tracking-widest text-noctis-gold/80 pointer-events-none transition-all duration-300 font-mono peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-[9px] peer-focus:text-noctis-gold">
                    {hasPasswordBound ? 'ŞİFREYİ GÜNCELLE' : 'HESABA ŞİFRE BAĞLA'}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-transparent border border-white/[0.05] hover:border-gray-700 text-gray-300 font-mono text-[9px] tracking-widest uppercase rounded-2xl transition-all duration-300"
                >
                  {loading ? 'YÜKLENİYOR...' : 'KAYDET VE GÜNCELLE'}
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-fade-in">
              <CreatorStudio session={session} onSignalBroadcasted={onSignalBroadcasted} />
            </div>
          )}
        </div>

        <div className="border-t border-white/[0.05] pt-6 mt-12 flex justify-between items-center">
          <div className="text-left font-mono">
            <p className="text-[8px] text-noctis-muted uppercase">YETKİLİ FREKANS</p>
            <p className="text-[10px] text-gray-300">{session.user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-transparent border border-red-900/20 hover:border-red-500/40 text-red-400 font-mono text-[9px] tracking-widest uppercase rounded-xl transition-all"
          >
            // DISCONNECT
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ANA UYGULAMA BİLEŞENİ (App)
// ============================================
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  // Sol Menü Açık/Kapalı Durumu (Üç Çizgili Hamburger)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Seçili Sekme/Sayfa
  const [activeTab, setActiveTab] = useState<'explore' | 'history' | 'liked' | 'watchLater' | 'store'>('explore');

  // Slide-Over Panel Kontrolü
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);

  // Filmler Havuzu
  const [movies, setMovies] = useState<Movie[]>(DEFAULT_MOVIES);
  const [, setMoviesLoading] = useState(false);

  // Store items (loaded from Supabase)
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [storeLoading, setStoreLoading] = useState(false);

  // Bildirim / Toast State
  const [toastMessage, setToastMessage] = useState('');

  // --------------------------------------------
  // HAFIZA MOTORUNU BAĞLIYORUZ (Sürdürülebilir Mimari)
  // --------------------------------------------
  const {
    credits,
    purchasedItems,
    history,
    watchLater,
    likedVideos,
    isStorageLoading,
    addMovieToHistory,
    buyAiItem
  } = useNoctisStorage(session?.user?.id);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshMoviesList = async () => {
    setMoviesLoading(true);
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setMovies(data as Movie[]);
      } else {
        setMovies(DEFAULT_MOVIES);
      }
    } catch (e) {
      console.warn(e);
      setMovies(DEFAULT_MOVIES);
    } finally {
      setMoviesLoading(false);
    }
  };

  const refreshStoreItems = async () => {
    if (!session) return;
    setStoreLoading(true);
    try {
      const { data, error } = await supabase.from('store_items').select('*').order('created_at', { ascending: false });
      if (!error && data) setStoreItems(data as StoreItem[]);
      else setStoreItems([]);
    } catch (e) {
      console.warn('Failed to load store items', e);
      setStoreItems([]);
    } finally {
      setStoreLoading(false);
    }
  };

  useEffect(() => {
    // 1. Sayfa ilk açıldığında mevcut filmleri Supabase'den çekiyoruz
    refreshMoviesList();
    refreshStoreItems();

    // 2. Canlı Akış Odası (Realtime Channel) Kurulumu
    const noctisRealtimeChannel = supabase
      .channel('noctis-live-transmissions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Sadece yeni film yüklendiğinde tetiklenir
          schema: 'public',
          table: 'movies'
        },
        (payload) => {
          // Veritabanına yeni bir film (sinyal) eklendiği an burası çalışır
          const newSignal = payload.new as Movie;
          
          // Yeni gelen filmi listenin en üstüne pürüzsüzce yerleştiriyoruz
          setMovies((currentMovies) => {
            // Eğer film listede zaten varsa (çift kayıt olmaması için) ekleme
            if (currentMovies.some(m => m.id === newSignal.id)) return currentMovies;
            return [newSignal, ...currentMovies];
          });
        }
      )
      .subscribe();

    // 3. Temizlik Protokolü (Bileşen kapandığında hafıza sızıntısını önler)
    return () => {
      supabase.removeChannel(noctisRealtimeChannel);
    };
  }, [session]);

  // Video izleme tıklandığında geçmişe kaydetme protokolü
  const handleSelectMovie = (id: string) => {
    setSelectedMovieId(id);
    addMovieToHistory(id);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleBuyItem = async (item: StoreItem) => {
    const result = await buyAiItem(item.id, item.price);
    if (result.success) {
      showToast(`✓ ${item.title} başarıyla lisanslandı.`);
    } else {
      showToast(`⚠ ${result.message}`);
    }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-noctis-bg flex flex-col items-center justify-center z-50 select-none">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extralight tracking-[0.7em] text-noctis-platinum pl-[0.7em] animate-pulse">NOCTIS</h1>
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-noctis-gold to-transparent mx-auto"></div>
          <p className="text-[8px] tracking-[0.4em] text-noctis-gold/60 font-mono uppercase">
            ESTABLISHING SECURE TRANSMISSION...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const userMetadata = session.user.user_metadata;
  const avatarKey = userMetadata?.avatar || 'director';
  const avatarEmoji = AVATAR_MAP[avatarKey] || '🎬';

  // Sekmelere ait film filtreleme mantıkları
  const displayedMovies = movies.filter(m => {
    if (activeTab === 'explore') return true;
    if (activeTab === 'history') return history.includes(m.id);
    if (activeTab === 'liked') return likedVideos.includes(m.id);
    if (activeTab === 'watchLater') return watchLater.includes(m.id);
    return false;
  });

  const selectedMovie = movies.find((m) => m.id === selectedMovieId);

  return (
    <div className="min-h-screen bg-noctis-bg text-noctis-platinum antialiased select-none selection:bg-noctis-gold/20 transition-all duration-500">
      
      {/* ÜST BAR (HEADER) */}
      <header className="p-6 border-b border-white/[0.05] flex justify-between items-center backdrop-blur-xl bg-noctis-bg/80 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          {/* Sol Menüyü Açıp Kapatan Lüks Üç Çizgi Butonu */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-noctis-muted hover:text-noctis-gold transition-colors focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 
            className="text-lg font-extralight tracking-[0.6em] pl-[0.6em] cursor-pointer hover:text-noctis-gold transition-all duration-500" 
            onClick={() => { setSelectedMovieId(null); setActiveTab('explore'); }}
          >
            NOCTIS
          </h1>
        </div>
        
        {/* Sağ Kontrol Paneli Tetikleyici */}
        <button 
          onClick={() => setIsControlPanelOpen(true)}
          className="w-10 h-10 rounded-full bg-noctis-card border border-white/[0.05] hover:border-noctis-gold/50 flex items-center justify-center text-lg transition-all duration-300 shadow-2xl relative group"
        >
          {avatarEmoji}
          <span className="absolute right-0 bottom-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#09090b] rounded-full animate-pulse" />
        </button>
      </header>

      {/* MODAL VE TOAST BİLDİRİMLERİ */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-noctis-card border border-white/[0.05] px-6 py-3 rounded-2xl text-xs font-mono tracking-wider text-noctis-gold animate-fade-in shadow-2xl">
          {toastMessage}
        </div>
      )}

      {/* LÜKS SAĞ PANEL ENTEGRASYONU */}
      <ControlPanel 
        session={session}
        isOpen={isControlPanelOpen}
        onClose={() => setIsControlPanelOpen(false)}
        onRefreshSession={(updated) => setSession(updated)}
        onSignalBroadcasted={refreshMoviesList}
      />

      {/* ANA GÖVDE VE SOL MENÜ */}
      <div className="flex">
        
        {/* SOL MENÜ (COMPONENT) */}
        {isSidebarOpen ? (
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={(t) => { setActiveTab(t as any); setSelectedMovieId(null); }} 
            setSelectedMovieId={setSelectedMovieId}
            onViewProfile={() => session?.user?.id && setSelectedProfileId(session.user.id)}
          />
        ) : (
          <div className="w-0" />
        )}

        {/* ANA İÇERİK ALANI */}
        <main className="flex-1 p-8">
          
          {selectedProfileId ? (
            /* ============================================
               SAYFA: KULLANICI PROFİLİ
               ============================================ */
            <UserProfile 
              userId={selectedProfileId} 
              onClose={() => setSelectedProfileId(null)}
              onSelectMovie={(movieId) => {
                setSelectedProfileId(null);
                setSelectedMovieId(movieId);
              }}
              session={session}
            />
          ) : selectedMovie ? (
            /* ============================================
               SAYFA: FİLM DETAY / OYNATICI EKRENI
               ============================================ */
            <div className="max-w-5xl mx-auto">
              <VideoContainer 
                movie={selectedMovie} 
                onClose={() => setSelectedMovieId(null)} 
                session={session}
                onViewProfile={(directorId) => {
                  setSelectedProfileId(directorId);
                }}
              />
            </div>
          ) : activeTab === 'store' ? (
            /* ============================================
               SAYFA: AI STORE (Premium Dijital Mağaza)
               ============================================ */
            <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
              <div className="flex justify-between items-end border-b border-white/[0.05] pb-4">
                <div>
                  <h2 className="text-2xl font-extralight tracking-widest text-[#f4f4f5] uppercase">AI STORE</h2>
                  <p className="text-[9px] text-noctis-gold font-mono mt-1 uppercase tracking-wider">// LÜKS PROMPTLAR VE ENTEGRASYON SES SİNYALLERİ</p>
                </div>
                <div className="bg-noctis-card border border-white/[0.05] px-4 py-2 rounded-2xl text-[10px] font-mono text-noctis-gold">
                  CÜZDAN: {isStorageLoading ? 'YÜKLENİYOR...' : `${credits} N-CREDITS`}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {storeLoading ? (
                  [1,2,3].map((i) => (
                    <div key={i} className="bg-noctis-card/40 border border-white/[0.03] p-6 rounded-[32px] animate-pulse h-48" />
                  ))
                ) : (
                  storeItems.map((item) => {
                    const isPurchased = purchasedItems.includes(item.id);
                    return (
                      <div key={item.id} className="bg-noctis-card/60 border border-white/[0.05] p-6 rounded-[32px] hover:border-noctis-gold/20 transition-all duration-500 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[7px] bg-noctis-gold/10 border border-noctis-gold/20 text-noctis-gold px-2 py-1 rounded font-mono uppercase">{(item as any).category}</span>
                            <span className="text-xs font-mono text-noctis-muted">★ {((item as any).rating || 0).toFixed(1)}</span>
                          </div>
                          <h3 className="text-sm font-light text-noctis-platinum uppercase tracking-wider">{item.title}</h3>
                          <p className="text-[11px] text-noctis-muted font-mono mt-1">Creator: @{((item as any).creator || '').toLowerCase()}</p>
                          <p className="text-xs text-noctis-muted font-light mt-3 leading-relaxed">{item.description}</p>
                          
                          <ul className="mt-5 space-y-1.5 border-t border-white/[0.05] pt-4">
                            {((item as any).features || []).map((f: string, i: number) => (
                              <li key={i} className="text-[9px] text-noctis-muted font-mono flex items-center gap-2">
                                <span className="text-noctis-gold">▪</span> {f}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-8 pt-4 border-t border-white/[0.05] flex items-center justify-between">
                          <div>
                            <p className="text-[8px] text-noctis-muted font-mono uppercase">LİSANS BEDELİ</p>
                            <p className="text-base font-light text-noctis-platinum font-mono">{(item as any).price} NC</p>
                          </div>
                          <button
                            onClick={() => handleBuyItem(item)}
                            disabled={isPurchased}
                            className={`px-5 py-2.5 rounded-xl font-mono text-[9px] tracking-wider uppercase transition-all duration-300 ${isPurchased ? 'bg-noctis-card border border-white/[0.03] text-noctis-muted cursor-default' : 'bg-transparent border border-noctis-gold/30 hover:border-noctis-gold text-noctis-gold'}`}
                          >
                            {isPurchased ? 'LİSANSLANDI' : 'LİSANS AL'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* ============================================
               SAYFA: DISCOVER / ARCHIVE FILM GRIDLERI
               ============================================ */
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
                <p className="text-[10px] text-noctis-muted font-mono uppercase tracking-[0.3em]">
                  {activeTab === 'explore' ? "TONIGHT'S TRANSMISSIONS" : `${activeTab.toUpperCase()} ARCHIVE`}
                </p>
                <span className="text-[8px] text-noctis-gold font-mono animate-pulse uppercase tracking-widest">// FEED ACTIVE</span>
              </div>
              
              {displayedMovies.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-white/[0.05] rounded-[32px]">
                  <p className="text-xs text-noctis-muted font-mono uppercase tracking-widest">∅ BU ARŞİVDE KAYITLI SİNYAL BULUNAMADI</p>
                  <p className="text-[9px] text-noctis-muted font-mono mt-2 uppercase">İÇERİKLERİ İZLEYEREK VEYA BEĞENEREK ARŞİVİNİZİ GENİŞLETİN</p>
                </div>
              ) : (
                <MovieGrid movies={displayedMovies} onSelect={handleSelectMovie} />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}