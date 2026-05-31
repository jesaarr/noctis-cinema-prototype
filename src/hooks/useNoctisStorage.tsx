import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Hafıza motorunun yöneteceği veri tipleri
export interface NoctisState {
  credits: number;
  purchasedItems: string[];
  history: string[]; // Film ID listesi
  watchLater: string[];
  likedVideos: string[];
}

const DEFAULT_STATE: NoctisState = {
  credits: 500,
  purchasedItems: [],
  history: [],
  watchLater: [],
  likedVideos: []
};

export function useNoctisStorage(userId: string | undefined) {
  const [storageState, setStorageState] = useState<NoctisState>(DEFAULT_STATE);
  const [isStorageLoading, setIsStorageLoading] = useState(true);

  // 1. HAFIZADAN VERİLERİ YÜKLE (F5 Koruması)
  useEffect(() => {
    if (!userId) return;

    const loadPersistedData = async () => {
      setIsStorageLoading(true);
      const storageKey = `noctis_storage_${userId}`;
      
      // Önce yerel hafızaya bak
      const localData = localStorage.getItem(storageKey);
      let currentState = localData ? JSON.parse(localData) : DEFAULT_STATE;

      try {
        // İleride Supabase'e taşımak istersen burası bulut senkronizasyonu yapacak
        const { data, error } = await supabase
          .from('user_inventories')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!error && data) {
          currentState = {
            credits: data.credits,
            purchasedItems: data.purchased_items || [],
            history: data.history || [],
            watchLater: data.watch_later || [],
            likedVideos: data.liked_videos || []
          };
        }
      } catch (err) {
        console.warn("Supabase sync yet hazır değil, local hafızadan devam ediliyor.");
      }

      setStorageState(currentState);
      setIsStorageLoading(false);
    };

    loadPersistedData();
  }, [userId]);

  // 2. VERİLER DEĞİŞTİĞİNDE YEREL HAFIZAYA YAZ
  const saveState = (newState: NoctisState) => {
    if (!userId) return;
    setStorageState(newState);
    localStorage.setItem(`noctis_storage_${userId}`, JSON.stringify(newState));

    // Arka planda asenkron olarak Supabase'i de güncelle (Uygulamayı yavaşlatmaz)
    supabase
      .from('user_inventories')
      .upsert({
        user_id: userId,
        credits: newState.credits,
        purchased_items: newState.purchasedItems,
        history: newState.history,
        watch_later: newState.watchLater,
        liked_videos: newState.likedVideos,
        updated_at: new Date().toISOString()
      })
      .then(({ error }) => {
        if (error) console.log("Cloud senkronizasyon sıraya alındı (Offline Mode).");
      });
  };

  // 3. TETİKLEYİCİ AKSİYON MOTORLARI
  const addMovieToHistory = (movieId: string) => {
    const updatedHistory = [movieId, ...storageState.history.filter(id => id !== movieId)];
    saveState({ ...storageState, history: updatedHistory });
  };

  const toggleLikeVideo = (movieId: string) => {
    const isLiked = storageState.likedVideos.includes(movieId);
    const updated = isLiked 
      ? storageState.likedVideos.filter(id => id !== movieId)
      : [...storageState.likedVideos, movieId];
    saveState({ ...storageState, likedVideos: updated });
  };

  const toggleWatchLater = (movieId: string) => {
    const isScheduled = storageState.watchLater.includes(movieId);
    const updated = isScheduled 
      ? storageState.watchLater.filter(id => id !== movieId)
      : [...storageState.watchLater, movieId];
    saveState({ ...storageState, watchLater: updated });
  };

  const buyAiItem = (itemId: string, price: number): boolean => {
    if (storageState.credits < price) return false; // Kredi yetersiz
    if (storageState.purchasedItems.includes(itemId)) return true; // Zaten alınmış

    saveState({
      ...storageState,
      credits: storageState.credits - price,
      purchasedItems: [...storageState.purchasedItems, itemId]
    });
    return true;
  };

  return {
    ...storageState,
    isStorageLoading,
    addMovieToHistory,
    toggleLikeVideo,
    toggleWatchLater,
    buyAiItem
  };
}