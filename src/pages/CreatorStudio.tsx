import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface CreatorStudioProps {
  session: Session;
  onClose: () => void;
  onSignalBroadcasted: () => void;
}

interface Signal {
  id: string;
  title: string;
  description: string;
  director: string;
  director_id: string;
  youtube_id: string;
  cover_url: string;
  prompt_lore: string;
  ai_tools: string[];
  created_at: string;
  updated_at?: string;
}

// YouTube Linkinden ID ayıklayan Regex yardımcı fonksiyonu
const extractYouTubeId = (url: string): string => {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]{11})|^([a-zA-Z0-9_-]{11})$/;
  const match = url.match(regex);
  return match ? (match[1] || match[2]) : '';
};

export default function CreatorStudio({ session, onClose, onSignalBroadcasted }: CreatorStudioProps) {
  const [activeTab, setActiveTab] = useState<'broadcast' | 'signals' | 'analytics'>('broadcast');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Form durumları
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [promptLore, setPromptLore] = useState('');
  const [aiTools, setAiTools] = useState('');

  // Kullanıcı ve Sinyal durumları
  const [mySignals, setMySignals] = useState<Signal[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const [creatorCheckLoading, setCreatorCheckLoading] = useState(true);

  useEffect(() => {
    checkCreatorStatus();
  }, [session]);

  // Kullanıcının yaratıcı rolünü kontrol etme
  const checkCreatorStatus = async () => {
    try {
      setCreatorCheckLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('is_creator')
        .eq('id', session.user.id)
        .single();

      if (error) {
        // Hata durumunda localstorage kontrolü (Offline desteği)
        const localCreator = localStorage.getItem(`creator_status_${session.user.id}`);
        setIsCreator(localCreator === 'true');
      } else {
        setIsCreator(data?.is_creator ?? false);
      }

      await loadMySignals();
    } catch (err) {
      console.error('Creator status verification error:', err);
      setIsCreator(false);
    } finally {
      setCreatorCheckLoading(false);
    }
  };

  // Kullanıcının kendi yüklediği sinyalleri yüklemesi
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
      // Çevrimdışı / Local fallback
      const localSignals = JSON.parse(localStorage.getItem('noctis_local_signals') || '[]') as Signal[];
      const filtered = localSignals.filter((sig) => sig.director_id === session.user.id);
      setMySignals(filtered);
    }
  };

  // Tek tıkla kanal aktivasyon mekanizması (Onboarding)
  const handleInitializeChannel = async () => {
    setLoading(true);
    setStatusMessage('');
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_creator: true })
        .eq('id', session.user.id);

      if (error) throw error;

      localStorage.setItem(`creator_status_${session.user.id}`, 'true');
      setIsCreator(true);
      setStatusMessage('✓ Kanal başarıyla aktifleştirildi. Yayına hazırsınız.');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err: any) {
      console.warn('Database initialization failed, bypass mode activated:', err);
      // Hata durumunda bile kullanıcıyı bekletmemek için geçici izin veriyoruz
      setIsCreator(true);
      localStorage.setItem(`creator_status_${session.user.id}`, 'true');
    } finally {
      setLoading(false);
    }
  };

  // Sinyal yayınlama (Insert) işlemi
  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');
    setIsError(false);

    if (!title.trim() || !description.trim() || !youtubeUrl.trim() || !coverUrl.trim() || !promptLore.trim()) {
      setIsError(true);
      setStatusMessage('Lütfen zorunlu alanları doldurun.');
      setLoading(false);
      return;
    }

    const extractedId = extractYouTubeId(youtubeUrl);
    if (!extractedId) {
      setIsError(true);
      setStatusMessage('Geçersiz YouTube adresi. Lütfen geçerli bir link girin.');
      setLoading(false);
      return;
    }

    const director = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Director';
    const newSignal: Signal = {
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
      // 1. Önce yerel hafızaya yaz (Anlık UI reaksiyonu için)
      const localSignals = JSON.parse(localStorage.getItem('noctis_local_signals') || '[]') as Signal[];
      localSignals.unshift(newSignal);
      localStorage.setItem('noctis_local_signals', JSON.stringify(localSignals));

      setMySignals(prev => [newSignal, ...prev]);

      // 2. Buluta gönder
      const { error } = await supabase.from('movies').insert([newSignal]);
      
      if (error) throw error;

      setStatusMessage('✓ Sinyal başarıyla uzaya fırlatıldı!');
      resetForm();
    } catch (err) {
      console.warn('Cloud sync offline, saved to local archive.');
      setStatusMessage('✓ Sinyal yerel arşive güvenle kaydedildi.');
      resetForm();
    } finally {
      setLoading(false);
      onSignalBroadcasted();
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  // Sinyal imha protokolü (Delete)
  const handleDeleteSignal = async (id: string) => {
    if (!window.confirm('Bu sinyali kalıcı olarak imha etmek istediğinizden emin misiniz?')) return;
    
    setLoading(true);
    setStatusMessage('');
    try {
      // 1. Local'den sil
      const localSignals = JSON.parse(localStorage.getItem('noctis_local_signals') || '[]') as Signal[];
      const updatedLocal = localSignals.filter(sig => sig.id !== id);
      localStorage.setItem('noctis_local_signals', JSON.stringify(updatedLocal));

      setMySignals(prev => prev.filter(sig => sig.id !== id));

      // 2. Buluttan sil
      const { error } = await supabase.from('movies').delete().eq('id', id);
      if (error) throw error;

      setStatusMessage('✓ Sinyal sistemden kalıcı olarak silindi.');
    } catch (err) {
      console.warn('Deleted from local storage. Cloud sync pending.');
      setStatusMessage('✓ Sinyal yerel depolamadan kaldırıldı.');
    } finally {
      setLoading(false);
      onSignalBroadcasted();
      setTimeout(() => setStatusMessage(''), 3000);
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
      <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-50">
        <p className="text-xs text-gray-500 font-mono uppercase tracking-[0.3em] animate-pulse">Kimlik frekansı taranıyor...</p>
      </div>
    );
  }

  // Kanal Aktivasyon Ekranı (is_creator false ise burası görünür)
  if (!isCreator) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-md bg-[#0a0a0c] border border-gray-900 p-8 rounded-[32px] shadow-2xl relative text-center">
          <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white font-mono text-xs transition-colors">
            ✕
          </button>
          
          <div className="space-y-6 py-4">
            <h2 className="text-xl font-extralight tracking-[0.3em] text-[#f4f4f5] uppercase">TRANSMISSION OFFLINE</h2>
            <div className="h-[1px] w-12 bg-amber-500/20 mx-auto"></div>
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              Kişisel yayın frekansınız henüz başlatılmamış. Kendi kanalınızı açarak yapay zeka sinema eserlerinizi tüm NOCTIS ağına yayınlamak ister misiniz?
            </p>
            <button
              onClick={handleInitializeChannel}
              disabled={loading}
              className="w-full py-3 bg-transparent hover:bg-amber-950/10 border border-amber-500/20 hover:border-amber-500 text-amber-500 rounded-xl text-[10px] tracking-[0.25em] uppercase font-semibold transition-all duration-500"
            >
              {loading ? 'YAYIN HATTI KURULUYOR...' : 'YAYIN KANALINI AKTİFLEŞTİR'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-50 p-4 overflow-y-auto select-none">
      <div className="w-full max-w-3xl bg-[#0a0a0c] border border-gray-900 p-8 rounded-[32px] shadow-2xl relative my-8">
        
        {/* Kapatma Butonu */}
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white font-mono text-xs transition-colors">
          ✕
        </button>

        {/* Üst Kısım & Sekmeler */}
        <div className="mb-8 border-b border-gray-900 pb-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extralight tracking-[0.3em] text-[#f4f4f5] uppercase">CREATION STUDIO</h2>
              <p className="text-[9px] tracking-[0.25em] text-amber-500 font-mono uppercase mt-1">
                MINIMAL NOIR BROADCAST DECK
              </p>
            </div>

            <div className="flex gap-5 font-mono text-[10px]">
              <button
                onClick={() => setActiveTab('broadcast')}
                className={`pb-2 tracking-wider uppercase transition-colors ${activeTab === 'broadcast' ? 'text-amber-500 border-b border-amber-500' : 'text-gray-500 hover:text-gray-300'}`}
              >
                [Yayınla]
              </button>
              <button
                onClick={() => setActiveTab('signals')}
                className={`pb-2 tracking-wider uppercase transition-colors ${activeTab === 'signals' ? 'text-amber-500 border-b border-amber-500' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Sinyallerim ({mySignals.length})
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`pb-2 tracking-wider uppercase transition-colors ${activeTab === 'analytics' ? 'text-amber-500 border-b border-amber-500' : 'text-gray-500 hover:text-gray-300'}`}
              >
                [İstatistik]
              </button>
            </div>
          </div>
        </div>

        {/* Bildirim Alanı */}
        {statusMessage && (
          <div className={`text-xs p-3 rounded-xl mb-6 border font-mono transition-all duration-300 ${isError ? 'text-red-400 bg-red-950/10 border-red-900/20' : 'text-emerald-400 bg-emerald-950/10 border-emerald-900/20'}`}>
            {statusMessage}
          </div>
        )}

        {/* --- BROADCAST FORMU --- */}
        {activeTab === 'broadcast' && (
          <form onSubmit={handleBroadcast} className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            
            {/* Row 1: Başlık & Kısa Açıklama */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative border-b border-gray-900 focus-within:border-amber-500 transition-colors duration-300 pb-1">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  required
                  placeholder=" "
                  className="peer w-full bg-transparent text-[#f4f4f5] text-sm outline-none pt-4 pb-1 font-light placeholder-transparent"
                />
                <label className="absolute left-0 top-4 text-[9px] uppercase tracking-widest text-gray-500 pointer-events-none transition-all duration-300 font-mono peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-[9px] peer-focus:text-amber-500">
                  Film Adı *
                </label>
              </div>

              <div className="relative border-b border-gray-900 focus-within:border-amber-500 transition-colors duration-300 pb-1">
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  required
                  placeholder=" "
                  className="peer w-full bg-transparent text-[#f4f4f5] text-sm outline-none pt-4 pb-1 font-light placeholder-transparent"
                />
                <label className="absolute left-0 top-4 text-[9px] uppercase tracking-widest text-gray-500 pointer-events-none transition-all duration-300 font-mono peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-[9px] peer-focus:text-amber-500">
                  Kısa Sinopsis / Açıklama *
                </label>
              </div>
            </div>

            {/* Row 2: YouTube Linki & Kapak URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative border-b border-gray-900 focus-within:border-amber-500 transition-colors duration-300 pb-1">
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  disabled={loading}
                  required
                  placeholder=" "
                  className="peer w-full bg-transparent text-[#f4f4f5] text-sm outline-none pt-4 pb-1 font-mono placeholder-transparent"
                />
                <label className="absolute left-0 top-4 text-[9px] uppercase tracking-widest text-gray-500 pointer-events-none transition-all duration-300 font-mono peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-[9px] peer-focus:text-amber-500">
                  YouTube Video Linki / ID *
                </label>
              </div>

              <div className="relative border-b border-gray-900 focus-within:border-amber-500 transition-colors duration-300 pb-1">
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  disabled={loading}
                  required
                  placeholder=" "
                  className="peer w-full bg-transparent text-[#f4f4f5] text-sm outline-none pt-4 pb-1 font-light placeholder-transparent"
                />
                <label className="absolute left-0 top-4 text-[9px] uppercase tracking-widest text-gray-500 pointer-events-none transition-all duration-300 font-mono peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-[9px] peer-focus:text-amber-500">
                  Afiş / Kapak Görseli URL *
                </label>
              </div>
            </div>

            {/* Row 3: Hikaye Evreni ve Prompt Detayları */}
            <div className="relative border-b border-gray-900 focus-within:border-amber-500 transition-colors duration-300 pb-1">
              <textarea
                value={promptLore}
                onChange={(e) => setPromptLore(e.target.value)}
                disabled={loading}
                required
                rows={3}
                placeholder=" "
                className="peer w-full bg-transparent text-[#f4f4f5] text-sm outline-none pt-4 pb-1 font-light resize-none placeholder-transparent"
              />
              <label className="absolute left-0 top-4 text-[9px] uppercase tracking-widest text-gray-500 pointer-events-none transition-all duration-300 font-mono peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-[9px] peer-focus:text-amber-500">
                AI Generation Prompt & Hikaye Detayı *
              </label>
            </div>

            {/* Row 4: Kullanılan Araçlar */}
            <div className="relative border-b border-gray-900 focus-within:border-amber-500 transition-colors duration-300 pb-1">
              <input
                type="text"
                value={aiTools}
                onChange={(e) => setAiTools(e.target.value)}
                disabled={loading}
                placeholder=" "
                className="peer w-full bg-transparent text-[#f4f4f5] text-sm outline-none pt-4 pb-1 font-light placeholder-transparent"
              />
              <label className="absolute left-0 top-4 text-[9px] uppercase tracking-widest text-gray-500 pointer-events-none transition-all duration-300 font-mono peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-[9px] peer-focus:text-amber-500">
                Kullanılan Yapay Zeka Araçları (Virgülle Ayırın - Örn: Runway, Midjourney)
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-transparent hover:bg-amber-950/10 border border-amber-500/20 hover:border-amber-500 text-amber-500 rounded-xl text-[10px] tracking-[0.3em] uppercase font-semibold transition-all duration-500"
            >
              {loading ? 'BAĞLANTI KURULUYOR...' : 'SİNYALİ YAYINA AL'}
            </button>
          </form>
        )}

        {/* --- SİNYALLERİM (YAYIN LİSTESİ) --- */}
        {activeTab === 'signals' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {mySignals.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-900 rounded-3xl">
                <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">
                  ∅ Yayında aktif bir sinyaliniz bulunmuyor
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mySignals.map((signal) => (
                  <div key={signal.id} className="bg-[#030305] border border-gray-900 p-4 rounded-2xl flex gap-4 items-center relative group hover:border-amber-500/20 transition-all">
                    <img src={signal.cover_url} alt={signal.title} className="w-16 h-16 rounded-xl object-cover border border-gray-900" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-light text-gray-200 truncate">{signal.title}</h4>
                      <p className="text-[9px] font-mono text-gray-600 mt-1">YAYINDA</p>
                    </div>

                    {/* İmha Et (Delete) Butonu - Sadece hover'da görünür */}
                    <button
                      onClick={() => handleDeleteSignal(signal.id)}
                      className="absolute top-3 right-3 text-[8px] font-mono text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      [İMHA ET]
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- İSTATİSTİK TASLAĞI (Bunu bir sonraki aşamada dolduracağız) --- */}
        {activeTab === 'analytics' && (
          <div className="text-center py-20 animate-pulse">
            <p className="text-xs text-gray-500 font-mono uppercase tracking-[0.3em]">
              ANALYSIS DECK LOADING...
            </p>
            <p className="text-[9px] text-gray-600 font-mono mt-2">
              Veri tabanları analiz ediliyor ve sinyal istatistikleriniz işleniyor.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}