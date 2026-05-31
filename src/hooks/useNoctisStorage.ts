import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function useNoctisStorage(userId?: string) {
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [watchLater, setWatchLater] = useState<string[]>([]);
  const [likedVideos, setLikedVideos] = useState<string[]>([]);
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [username, setUsername] = useState<string | null>(null);

  // Load initial state from localStorage
  useEffect(() => {
    setPurchasedItems(JSON.parse(localStorage.getItem('noctis_purchased') || '[]'));
    setHistory(JSON.parse(localStorage.getItem('noctis_history') || '[]'));
    setWatchLater(JSON.parse(localStorage.getItem('noctis_watch_later') || '[]'));
    setLikedVideos(JSON.parse(localStorage.getItem('noctis_liked') || '[]'));
    setFollowingList(JSON.parse(localStorage.getItem('noctis_following') || '[]'));
    setUsername(localStorage.getItem('noctis_username'));
  }, []);

  // Sync from Supabase when userId changes
  useEffect(() => {
    if (!userId) return;
    const syncFromSupabase = async () => {
      try {
        const { data: userFollows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', userId);
        if (userFollows) {
          const followIds = userFollows.map(f => f.following_id);
          setFollowingList(followIds);
          localStorage.setItem('noctis_following', JSON.stringify(followIds));
        }
      } catch (e) {
        console.warn('Failed to sync follows from Supabase', e);
      }
    };
    syncFromSupabase();
  }, [userId]);

  const addMovieToHistory = (id: string) => {
    const next = [id, ...history.filter(h => h !== id)].slice(0, 200);
    setHistory(next);
    localStorage.setItem('noctis_history', JSON.stringify(next));
  };

  const toggleLikeVideo = (id: string) => {
    const next = likedVideos.includes(id) ? likedVideos.filter(x => x !== id) : [id, ...likedVideos];
    setLikedVideos(next);
    localStorage.setItem('noctis_liked', JSON.stringify(next));
  };

  const toggleWatchLater = (id: string) => {
    const next = watchLater.includes(id) ? watchLater.filter(x => x !== id) : [id, ...watchLater];
    setWatchLater(next);
    localStorage.setItem('noctis_watch_later', JSON.stringify(next));
  };

  const buyAiItem = (itemId: string) => {
    const nextPurchased = [itemId, ...purchasedItems];
    setPurchasedItems(nextPurchased);
    localStorage.setItem('noctis_purchased', JSON.stringify(nextPurchased));
    return true;
  };

  const addFollowing = async (id: string, userId?: string) => {
    const next = followingList.includes(id) ? followingList : [id, ...followingList];
    setFollowingList(next);
    localStorage.setItem('noctis_following', JSON.stringify(next));
    
    if (userId) {
      try {
        await supabase.from('follows').insert([{ follower_id: userId, following_id: id }]).single();
      } catch (e) {
        console.warn('Failed to add follow to Supabase', e);
      }
    }
  };

  const removeFollowing = async (id: string, userId?: string) => {
    const next = followingList.filter(f => f !== id);
    setFollowingList(next);
    localStorage.setItem('noctis_following', JSON.stringify(next));
    
    if (userId) {
      try {
        await supabase.from('follows').delete().eq('follower_id', userId).eq('following_id', id);
      } catch (e) {
        console.warn('Failed to remove follow from Supabase', e);
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
    purchasedItems,
    history,
    watchLater,
    likedVideos,
    addMovieToHistory,
    toggleLikeVideo,
    toggleWatchLater,
    buyAiItem,
    followingList,
    toggleFollow,
    isFollowing,
    username
  };
}

// also provide a named export for compatibility with different import styles
export { useNoctisStorage };
