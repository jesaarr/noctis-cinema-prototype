import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export interface NoctisState {
  credits: number;
  purchasedItems: string[];
  history: string[];
  watchLater: string[];
  likedVideos: string[];
  followingList: string[];
  username: string | null;
  isStorageLoading: boolean;
}

const DEFAULT_STATE: NoctisState = {
  credits: 0,
  purchasedItems: [],
  history: [],
  watchLater: [],
  likedVideos: [],
  followingList: [],
  username: null,
  isStorageLoading: true
};

export function useNoctisStorage(userId?: string) {
  const [credits, setCredits] = useState(DEFAULT_STATE.credits);
  const [purchasedItems, setPurchasedItems] = useState<string[]>(DEFAULT_STATE.purchasedItems);
  const [history, setHistory] = useState<string[]>(DEFAULT_STATE.history);
  const [watchLater, setWatchLater] = useState<string[]>(DEFAULT_STATE.watchLater);
  const [likedVideos, setLikedVideos] = useState<string[]>(DEFAULT_STATE.likedVideos);
  const [followingList, setFollowingList] = useState<string[]>(DEFAULT_STATE.followingList);
  const [username, setUsername] = useState<string | null>(DEFAULT_STATE.username);
  const [isStorageLoading, setIsStorageLoading] = useState(DEFAULT_STATE.isStorageLoading);

  const loadLocalPreferences = () => {
    setHistory(JSON.parse(localStorage.getItem('noctis_history') || '[]'));
    setWatchLater(JSON.parse(localStorage.getItem('noctis_watch_later') || '[]'));
    setLikedVideos(JSON.parse(localStorage.getItem('noctis_liked') || '[]'));
    setUsername(localStorage.getItem('noctis_username'));
  };

  const persistLocalState = () => {
    localStorage.setItem('noctis_history', JSON.stringify(history));
    localStorage.setItem('noctis_watch_later', JSON.stringify(watchLater));
    localStorage.setItem('noctis_liked', JSON.stringify(likedVideos));
  };

  const refreshUserInventory = useCallback(async () => {
    if (!userId) {
      setIsStorageLoading(false);
      return;
    }

    setIsStorageLoading(true);
    try {
      const [{ data: profileData, error: profileError }, { data: assetsData, error: assetsError }] = await Promise.all([
        supabase.from('profiles').select('credits').eq('id', userId).single(),
        supabase.from('purchased_assets').select('item_id').eq('user_id', userId)
      ]);

      if (!profileError && profileData) {
        setCredits(profileData.credits ?? 0);
      }

      if (!assetsError && Array.isArray(assetsData)) {
        setPurchasedItems(assetsData.map((row) => (row as { item_id: string }).item_id));
      }
    } catch (err) {
      console.warn('Noctis storage sync failed:', err);
    } finally {
      setIsStorageLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadLocalPreferences();
  }, []);

  useEffect(() => {
    refreshUserInventory();
  }, [refreshUserInventory]);

  useEffect(() => {
    persistLocalState();
  }, [history, watchLater, likedVideos]);

  const addMovieToHistory = (movieId: string) => {
    const nextHistory = [movieId, ...history.filter((id) => id !== movieId)].slice(0, 200);
    setHistory(nextHistory);
    localStorage.setItem('noctis_history', JSON.stringify(nextHistory));
  };

  const toggleLikeVideo = (movieId: string) => {
    const nextLiked = likedVideos.includes(movieId)
      ? likedVideos.filter((id) => id !== movieId)
      : [movieId, ...likedVideos];
    setLikedVideos(nextLiked);
    localStorage.setItem('noctis_liked', JSON.stringify(nextLiked));
  };

  const toggleWatchLater = (movieId: string) => {
    const nextWatchLater = watchLater.includes(movieId)
      ? watchLater.filter((id) => id !== movieId)
      : [movieId, ...watchLater];
    setWatchLater(nextWatchLater);
    localStorage.setItem('noctis_watch_later', JSON.stringify(nextWatchLater));
  };

  const buyAiItem = async (itemId: string, itemPrice: number) => {
    if (!userId) {
      return { success: false, message: 'Oturum açılmamış kullanıcı.' };
    }
    if (purchasedItems.includes(itemId)) {
      return { success: true, message: 'Bu öğe zaten satın alındı.' };
    }
    if (credits < itemPrice) {
      return { success: false, message: 'Yetersiz kredi.' };
    }

    setIsStorageLoading(true);
    try {
      const { error } = await supabase.rpc('buy_ai_asset', {
        item_id: itemId,
        item_price: itemPrice
      });

      if (error) {
        return { success: false, message: error.message };
      }

      await refreshUserInventory();
      return { success: true, message: 'Satın alma tamamlandı.' };
    } catch (err) {
      console.warn('buyAiItem RPC failed', err);
      return { success: false, message: 'Satın alma sırasındaja bir şeyler ters gitti.' };
    } finally {
      setIsStorageLoading(false);
    }
  };

  const addFollowing = async (id: string, currentUserId?: string) => {
    const next = followingList.includes(id) ? followingList : [id, ...followingList];
    setFollowingList(next);
    if (currentUserId) {
      try {
        await supabase.from('follows').insert([{ follower_id: currentUserId, following_id: id }]);
      } catch (err) {
        console.warn('Failed to follow user on Supabase', err);
      }
    }
  };

  const removeFollowing = async (id: string, currentUserId?: string) => {
    const next = followingList.filter((follow) => follow !== id);
    setFollowingList(next);
    if (currentUserId) {
      try {
        await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', id);
      } catch (err) {
        console.warn('Failed to unfollow user on Supabase', err);
      }
    }
  };

  const toggleFollow = async (id: string) => {
    if (followingList.includes(id)) {
      await removeFollowing(id, userId);
    } else {
      await addFollowing(id, userId);
    }
  };

  const isFollowing = (id: string) => followingList.includes(id);

  return {
    credits,
    purchasedItems,
    history,
    watchLater,
    likedVideos,
    followingList,
    username,
    isStorageLoading,
    addMovieToHistory,
    toggleLikeVideo,
    toggleWatchLater,
    buyAiItem,
    toggleFollow,
    isFollowing
  };
}

