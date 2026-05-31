import React, { useState, useEffect } from 'react';
import Auth from './pages/Auth';
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';

import { useNoctisStorage } from './hooks/useNoctisStorage';
import Sidebar from './components/Sidebar';
import MovieGrid from './components/MovieGrid';
import VideoContainer from './components/VideoContainer';
import UserProfile from './components/UserProfile';

// ============================================
// METADATA VE HAZIR VERİTABANI (NOCTIS LORE)
// ============================================
const AVATAR_MAP: Record<string, string> = {
  'aurora': '👁️',
  'director': '🎬',
  'observer': '👤',
  'core': '🌌',
};

interface Movie {
  id: string;
  title: string;
  description: string;
  director: string;
  director_id: string;
  youtube_id: string;
  cover_url: string;
  prompt_lore?: string;
  ai_tools?: string[];
  created_at: string;
}

// AI Store Ürün Şeması
interface StoreItem {
  id: string;
  title: string;
  category: 'LUTS' | 'PROMPTS' | 'AUDIO' | '3D ASSETS';
  price: number;
  description: string;
  creator: string;
  rating: number;
  features: string[];
}

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

const STORE_ITEMS: StoreItem[] = [
  {
    id: 's1',
    title: 'NOIR KODAK 35MM',
    category: 'LUTS',
    price: 150,
    description: 'Yapay zeka renderlarına Leica ve vintage sinema dokusu kazandıran, kontrastı yoğun, sarı-siyah ağırlıklı profesyonel renk LUT paketi.',
    creator: 'Director',
    rating: 4.9,
    features: ['3 LUT Files (.cube)', 'Compatible with DaVinci / Premier', 'Optimized for Midjourney v6']
  },
  {
    id: 's2',
    title: 'HYPER-REAL SCIFI PROMPT BOOK',
    category: 'PROMPTS',
    price: 100,
    description: 'Fotogerçekçi uzay, distopik mimari ve sinematik portre çekimleri için 50 adet özel formüle edilmiş Midjourney ve Stable Diffusion istemi.',
    creator: 'Aurora',
    rating: 5.0,
    features: ['50 Master Prompts', 'Aspect Ratio Guides', 'Lighting Keywords Library']
  },
  {
    id: 's3',
    title: 'ANALOG COLD SWELLS',
    category: 'AUDIO',
    price: 200,
    description: 'Analog synthesizer ünitelerinden kaydedilmiş, sinematik derinlik ve gerilim yaratan derin bas pedleri, drone sesleri ve retro-futuristik geçiş efektleri.',
    creator: 'Core',
    rating: 4.8,
    features: ['24 High-Quality WAV Files', 'Royalty-Free License', 'Tempo & Key Labeled']
  }
];

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
        <div className="bg-[#121214] border border-[#1f1f23] p-5 rounded-2xl text-center">
          <p className="text-[9px] uppercase tracking-widest text-gray-500 font-mono">ECHO STRENGTH</p>
          <p className="text-2xl font-light text-[#eab308] mt-2">{totalViews}</p>
          <span className="text-[8px] text-gray-600 font-mono">Toplam İzlenme</span>
        </div>
        <div className="bg-[#121214] border border-[#1f1f23] p-5 rounded-2xl text-center">
          <p className="text-[9px] uppercase tracking-widest text-gray-500 font-mono">RESONANCES</p>
          <p className="text-2xl font-light text-[#eab308] mt-2">{totalResonances}</p>
          <span className="text-[8px] text-gray-600 font-mono">Etkileşimler</span>
        </div>
        <div className="bg-[#121214] border border-[#1f1f23] p-5 rounded-2xl text-center">
          <p className="text-[9px] uppercase tracking-widest text-gray-500 font-mono">ACTIVE SIGNALS</p>
          <p className="text-2xl font-light text-[#eab308] mt-2">{mySignals.length}</p>
          <span className="text-[8px] text-gray-600 font-mono">Yayınlanan Film</span>
        </div>
      </div>

      <div className="bg-[#121214] border border-[#1f1f23] p-6 rounded-3xl">
        <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#eab308] mb-6">// BROADCAST TIMELINE</h4>
        <div className="flex justify-between items-end h-24 px-4 border-b border-gray-900">
          {[40, 15, 65, 30, 85, 45, 95, 20, 60, 50, 75, 90].map((val, idx) => (
            <div key={idx} className="flex flex-col items-center w-full group">
              <div style={{ height: `${val}%` }} className="w-[3px] bg-gray-800 group-hover:bg-[#eab308] transition-all duration-500 rounded-t-full relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-[#eab308] text-[7px] font-mono px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  %{val}
                </div>
              </div>
              <span className="text-[7px] text-gray-600 font-mono mt-2">{idx + 1}h</span>
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
  const [activeTab, setActiveTab] = useState<'broadcast' | 'signals' | 'analytics'>('broadcast');
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
      const localSignals = JSON.parse(localStorage.getItem('noctis_local_signals') || '[]') as Movie[];
      localSignals.unshift(newSignal);
      localStorage.setItem('noctis_local_signals', JSON.stringify(localSignals));

      setMySignals(prev => [newSignal, ...prev]);
      setStatusMessage('✓ Sinyal yerel sisteme başarıyla işlendi.');

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
    if (!window.confirm('Bu sinyali kalıcı olarak silmek istediğinize emin misiniz?')) return;
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
      <div className="flex items-center justify-center py-20 text-xs font-mono text-gray-500 tracking-widest animate-pulse">
        KİMLİK DOĞRULANIYOR...
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="py-12 px-4 max-w-md mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full border border-[#eab308]/20 flex items-center justify-center mx-auto text-2xl animate-pulse">
          ⚡
        </div>
        <h3 className="text-sm font-light tracking-[0.3em] text-gray-100 uppercase">TRANSMISSION OFFLINE</h3>
        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider leading-relaxed">
          Kendi yayın kuleleriniz henüz aktif edilmedi. Sinematik yapıtlarınızı NOCTIS evrenine ulaştırmak için kanalınızı tek tıkla başlatın.
        </p>
        <button
          onClick={handleInitializeChannel}
          disabled={loading}
          className="w-full py-3 bg-[#eab308]/5 hover:bg-[#eab308]/10 border border-[#eab308]/20 hover:border-[#eab308] text-[#eab308] rounded-xl text-[10px] tracking-widest uppercase font-mono font-bold transition-all duration-500"
        >
          {loading ? 'KULELER AKTİF EDİLİYOR...' : 'YAYIN FREKANSINI BAŞLAT'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-6 border-b border-gray-900 pb-3 font-mono text-[10px]">
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`pb-2 tracking-wider uppercase transition-colors ${activeTab === 'broadcast' ? 'text-[#eab308] border-b border-[#eab308]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          [BROADCAST]
        </button>
        <button
          onClick={() => setActiveTab('signals')}
          className={`pb-2 tracking-wider uppercase transition-colors ${activeTab === 'signals' ? 'text-[#eab308] border-b border-[#eab308]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          MY SIGNALS ({mySignals.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-2 tracking-wider uppercase transition-colors ${activeTab === 'analytics' ? 'text-[#eab308] border-b border-[#eab308]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          [ANALYTICS]
        </button>
      </div>

      {statusMessage && (
        <div className={`text-[10px] p-3 rounded-xl border font-mono ${isError ? 'text-red-400 bg-red-950/10 border-red-900/20' : 'text-emerald-400 bg-emerald-950/10 border-emerald-900/20'}`}>
          {statusMessage}
        </div>
      )}

      {activeTab === 'broadcast' && (
        <form onSubmit={handleBroadcast} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative border-b border-gray-900 focus-within:border-[#eab308] transition-colors pb-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder=" "
                className="peer w-full bg-transparent text-gray-200 text-sm outline-none pt-4 pb-1 font-light placeholder-transparent"
                required
              />
              <label className="absolute left-0 top-4 text-[9px] uppercase tracking-widest text-gray-500 pointer-events-none transition-all duration-300 font-mono peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-[9px] peer-focus:text-[#eab308]">
                Film Adı *
              </label>
            </div>

            <div className="relative border-b border-gray-900 focus-within:border-[#eab308] transition-colors pb-2">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder=" "
                className="peer w-full bg-transparent text-gray-200 text-sm outline-none pt-4 pb-1 font-light placeholder-transparent"
                required
              />
              <label className="absolute left-0 top-4 text-[9px] uppercase tracking-widest text-gray-500 pointer-events-none transition-all duration-300 font-mono peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-[9px] peer-focus:text-[#eab308]">
                Kısa Özet / Sinopsis *
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative border-b border-gray-900 focus-within:border-[#eab308] transition-colors pb-2">
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder=" "
                className="peer w-full bg-transparent text-gray-200 text-sm outline-none pt-4 pb-1 font-mono placeholder-transparent"
                required
              />
              <label className="absolute left-0 top-4 text-[9px] uppercase tracking-widest text-gray-500 pointer-events-none transition-all duration-300 font-mono peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-[9px] peer-focus:text-[#eab308]">
                YouTube Link veya ID *
              </label>
            </div>

            <div className="relative border-b border-gray-900 focus-within:border-[#eab308] transition-colors pb-2">
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder=" "
                className="peer w-full bg-transparent text-gray-200 text-sm outline-none pt-4 pb-1 font-light placeholder-transparent"
                required
              />
              <label className="absolute left-0 top-4 text-[9px] uppercase tracking-widest text-gray-500 pointer-events-none transition-all duration-300 font-mono peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-[9px] peer-focus:text-[#eab308]">
                Kapak Görseli URL *
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-transparent border border-[#eab308]/20 hover:border-[#eab308] text-[#eab308] font-mono text-[9px] tracking-widest uppercase rounded-2xl transition-all duration-500 disabled:opacity-50"
          >
            {loading ? 'YAYINLANALANMAYA BAŞLADI...' : '▶ SİNYALİ YAYINLA'}
          </button>
        </form>
      )}

      {activeTab === 'signals' && (
        <div className="space-y-4">
          {mySignals.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-900 rounded-3xl text-gray-600 text-xs font-mono">
              Henüz yayınlanmış bir film bulunamadı.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mySignals.map((signal) => (
                <div key={signal.id} className="bg-[#121214] border border-[#1f1f23] p-4 rounded-2xl group flex flex-col justify-between">
                  <div>
                    <h5 className="text-xs text-gray-200 truncate">{signal.title}</h5>
                    <p className="text-[10px] text-gray-500 line-clamp-2 mt-1">{signal.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteSignal(signal.id)}
                    className="mt-4 text-[8px] font-mono tracking-widest text-red-400 hover:text-red-500 text-left uppercase"
                  >
                    // DEACTIVATE SIGNAL [X]
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && <CreatorStats mySignals={mySignals} />}
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

      <div className={`absolute top-0 right-0 h-full w-full max-w-lg md:max-w-xl bg-[#09090b] border-l border-gray-900 p-8 shadow-2xl overflow-y-auto transform transition-transform duration-500 ease-out flex flex-col justify-between ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div>
          <div className="flex justify-between items-center border-b border-gray-900 pb-5 mb-8">
            <div>
              <h2 className="text-xl font-extralight tracking-[0.3em] text-[#f4f4f5] uppercase">CONTROL DECK</h2>
              <p className="text-[8px] font-mono tracking-widest text-[#eab308] uppercase mt-1">NOCTIS SYSTEM INTERFACE</p>
            </div>
            <button onClick={onClose} className="text-xs font-mono text-gray-500 hover:text-[#eab308] transition-colors">
              // CLOSE PANEL [X]
            </button>
          </div>

          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveMenu('profile')}
              className={`flex-1 py-3 border text-[10px] font-mono tracking-wider uppercase rounded-xl transition-all ${activeMenu === 'profile' ? 'bg-[#eab308]/5 border-[#eab308] text-[#eab308]' : 'bg-transparent border-gray-900 text-gray-500'}`}
            >
              // KİMLİK AYARLARI
            </button>
            <button
              onClick={() => setActiveMenu('studio')}
              className={`flex-1 py-3 border text-[10px] font-mono tracking-wider uppercase rounded-xl transition-all ${activeMenu === 'studio' ? 'bg-[#eab308]/5 border-[#eab308] text-[#eab308]' : 'bg-transparent border-gray-900 text-gray-500'}`}
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
                <div className="relative border-b border-gray-900 focus-within:border-[#eab308] transition-colors pb-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder=" "
                    className="peer w-full bg-transparent text-gray-200 text-sm outline-none pt-4 pb-1 font-light placeholder-transparent"
                    required
                  />
                  <label className="absolute left-0 top-4 text-[9px] uppercase tracking-widest text-gray-500 pointer-events-none transition-all duration-300 font-mono peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-[9px] peer-focus:text-[#eab308]">
                    YÖNETMEN İSMİ
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-mono uppercase tracking-widest text-gray-500">KİMLİK SİNYALİ</label>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(AVATAR_MAP).map(([key, emoji]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedAvatar(key)}
                        className={`py-4 rounded-2xl border text-xl transition-all ${selectedAvatar === key ? 'bg-[#eab308]/5 border-[#eab308] text-white shadow-lg' : 'bg-transparent border-gray-900 text-gray-400'}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative border-b border-gray-900 focus-within:border-[#eab308] transition-colors pb-2 pt-4">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder=" "
                    className="peer w-full bg-transparent text-gray-200 text-sm outline-none pt-4 pb-1 font-mono placeholder-transparent"
                  />
                  <label className="absolute left-0 top-4 text-[9px] uppercase tracking-widest text-amber-500/80 pointer-events-none transition-all duration-300 font-mono peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-[9px] peer-focus:text-[#eab308]">
                    {hasPasswordBound ? 'ŞİFREYİ GÜNCELLE' : 'HESABA ŞİFRE BAĞLA'}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-transparent border border-gray-900 hover:border-gray-700 text-gray-300 font-mono text-[9px] tracking-widest uppercase rounded-2xl transition-all duration-300"
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

        <div className="border-t border-gray-900 pt-6 mt-12 flex justify-between items-center">
          <div className="text-left font-mono">
            <p className="text-[8px] text-gray-500 uppercase">YETKİLİ FREKANS</p>
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
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      let merged: Movie[] = [...DEFAULT_MOVIES];

      if (!error && data) {
        merged = [...data, ...merged];
      }

      const localSignals = JSON.parse(localStorage.getItem('noctis_local_signals') || '[]') as Movie[];
      localSignals.forEach((local) => {
        if (!merged.some(m => m.id === local.id)) {
          merged.unshift(local);
        }
      });

      setMovies(merged);
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    refreshMoviesList();
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

  const handleBuyItem = (item: StoreItem) => {
    const success = buyAiItem(item.id, item.price);
    if (success) {
      showToast(`✓ ${item.title} başarıyla lisanslandı.`);
    } else {
      showToast('❌ Yetersiz N-Credit. Yayında kalarak kredi kazanın.');
    }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-[#09090b] flex flex-col items-center justify-center z-50 select-none">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extralight tracking-[0.7em] text-white pl-[0.7em] animate-pulse">NOCTIS</h1>
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#eab308] to-transparent mx-auto"></div>
          <p className="text-[8px] tracking-[0.4em] text-[#eab308]/60 font-mono uppercase">
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
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] antialiased select-none selection:bg-[#eab308]/20 transition-all duration-500">
      
      {/* ÜST BAR (HEADER) */}
      <header className="p-6 border-b border-gray-900/50 flex justify-between items-center backdrop-blur-xl bg-[#09090b]/60 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          {/* Sol Menüyü Açıp Kapatan Lüks Üç Çizgi Butonu */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-400 hover:text-[#eab308] transition-colors focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 
            className="text-lg font-extralight tracking-[0.6em] pl-[0.6em] cursor-pointer hover:text-[#eab308] transition-all duration-500" 
            onClick={() => { 
              setSelectedMovieId(null); 
              setSelectedProfileId(null); 
              setActiveTab('explore'); 
            }}
          >
            NOCTIS
          </h1>
        </div>
        
        {/* Sağ Kontrol Paneli Tetikleyici */}
        <button 
          onClick={() => setIsControlPanelOpen(true)}
          className="w-10 h-10 rounded-full bg-[#121214] border border-gray-900 hover:border-[#eab308]/50 flex items-center justify-center text-lg transition-all duration-300 shadow-2xl relative group"
        >
          {avatarEmoji}
          <span className="absolute right-0 bottom-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#09090b] rounded-full animate-pulse" />
        </button>
      </header>

      {/* MODAL VE TOAST BİLDİRİMLERİ */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-[#121214] border border-gray-900 px-6 py-3 rounded-2xl text-xs font-mono tracking-wider text-[#eab308] animate-fade-in shadow-2xl">
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
            setActiveTab={(t) => { 
              setActiveTab(t as any); 
              setSelectedMovieId(null); 
              setSelectedProfileId(null); // Navigasyon kilitlenmesini kökten çözen sıfırlama
            }} 
            setSelectedMovieId={(id) => {
              setSelectedMovieId(id);
              setSelectedProfileId(null); // Video seçildiğinde açık profili kapatır
            }}
            onViewProfile={() => {
              if (session?.user?.id) {
                setSelectedProfileId(session.user.id);
                setSelectedMovieId(null); // Profil açıldığında açık videoyu kapatır
              }
            }}
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
                setSelectedProfileId(null); // Profil kapatılır
                setSelectedMovieId(movieId); // Seçilen video oynatılmaya başlar
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
                  setSelectedMovieId(null); // Profil sayfasına giderken video container temizlenir
                  setSelectedProfileId(directorId); // Yönetmen profili açılır
                }}
              />
            </div>
          ) : activeTab === 'store' ? (
            /* ============================================
               SAYFA: AI STORE (Premium Dijital Mağaza)
               ============================================ */
            <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
              <div className="flex justify-between items-end border-b border-gray-900 pb-4">
                <div>
                  <h2 className="text-2xl font-extralight tracking-widest text-[#f4f4f5] uppercase">AI STORE</h2>
                  <p className="text-[9px] text-[#eab308] font-mono mt-1 uppercase tracking-wider">// LÜKS PROMPTLAR VE ENTEGRASYON SES SİNYALLERİ</p>
                </div>
                <div className="bg-[#121214] border border-gray-900 px-4 py-2 rounded-2xl text-[10px] font-mono text-[#eab308]">
                  CÜZDAN: {credits} N-CREDITS
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {STORE_ITEMS.map((item) => {
                  const isPurchased = purchasedItems.includes(item.id);
                  return (
                    <div key={item.id} className="bg-[#121214]/60 border border-gray-900 p-6 rounded-[32px] hover:border-[#eab308]/20 transition-all duration-500 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[7px] bg-[#eab308]/5 border border-[#eab308]/20 text-[#eab308] px-2 py-1 rounded font-mono uppercase">{item.category}</span>
                          <span className="text-xs font-mono text-gray-500">★ {item.rating.toFixed(1)}</span>
                        </div>
                        <h3 className="text-sm font-light text-gray-100 uppercase tracking-wider">{item.title}</h3>
                        <p className="text-[11px] text-gray-500 font-mono mt-1">Creator: @{item.creator.toLowerCase()}</p>
                        <p className="text-xs text-gray-400 font-light mt-3 leading-relaxed">{item.description}</p>
                        
                        <ul className="mt-5 space-y-1.5 border-t border-gray-900/60 pt-4">
                          {item.features.map((f, i) => (
                            <li key={i} className="text-[9px] text-gray-500 font-mono flex items-center gap-2">
                              <span className="text-[#eab308]">▪</span> {f}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-8 pt-4 border-t border-gray-900/60 flex items-center justify-between">
                        <div>
                          <p className="text-[8px] text-gray-600 font-mono uppercase">LİSANS BEDELİ</p>
                          <p className="text-base font-light text-white font-mono">{item.price} NC</p>
                        </div>
                        <button
                          onClick={() => handleBuyItem(item)}
                          disabled={isPurchased}
                          className={`px-5 py-2.5 rounded-xl font-mono text-[9px] tracking-wider uppercase transition-all duration-300 ${isPurchased ? 'bg-gray-900 border border-gray-800 text-gray-600 cursor-default' : 'bg-transparent border border-[#eab308]/30 hover:border-[#eab308] text-[#eab308]'}`}
                        >
                          {isPurchased ? 'LİSANSLANDI' : 'LİSANS AL'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ============================================
               SAYFA: DISCOVER / ARCHIVE FILM GRIDLERI
               ============================================ */
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center justify-between border-b border-gray-900 pb-3">
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.3em]">
                  {activeTab === 'explore' ? "TONIGHT'S TRANSMISSIONS" : `${activeTab.toUpperCase()} ARCHIVE`}
                </p>
                <span className="text-[8px] text-[#eab308] font-mono animate-pulse uppercase tracking-widest">// FEED ACTIVE</span>
              </div>
              
              {displayedMovies.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-gray-900 rounded-[32px]">
                  <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">∅ BU ARŞİVDE KAYITLI SİNYAL BULUNAMADI</p>
                  <p className="text-[9px] text-gray-600 font-mono mt-2 uppercase">İÇERİKLERİ İZLEYEREK VEYA BEĞENEREK ARŞİVİNİZİ GENİŞLETİN</p>
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