import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNoctisStorage } from '../hooks/useNoctisStorage';
import MovieGrid from './MovieGrid';

const AVATAR_MAP: Record<string, string> = {
  'aurora': '👁️',
  'director': '🎬',
  'observer': '👤',
  'core': '🌌',
};

interface UserProfileProps {
  userId: string;
  onClose: () => void;
  onSelectMovie?: (movieId: string) => void;
  session?: any;
}

interface UserInfo {
  id: string;
  username: string;
  avatar?: string;
  bio?: string;
  created_at?: string;
}

export default function UserProfile({ userId, onClose, onSelectMovie, session }: UserProfileProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userMovies, setUserMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // NoctisStorage entegrasyonu
  const { isFollowing, toggleFollow } = useNoctisStorage();
  const [following, setFollowing] = useState(false);

  // Görüntülenen profil, oturumu açmış olan kullanıcının kendi profili mi?
  const isMe = session?.user?.id === userId;

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // 1. Kullanıcı Bilgilerini Çekme Protokolü
        const { data: user, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (!profileError && user) {
          setUserInfo(user);
        } else {
          // Yedek plan: Eğer veri tabanından gelmiyorsa veya kendi hesabımızsa metadata'yı oku
          if (isMe) {
            const metadata = session?.user?.user_metadata;
            const fallbackName = metadata?.username || session?.user?.email?.split('@')[0] || 'Anonymous Director';
            setUserInfo({
              id: userId,
              username: fallbackName,
              avatar: metadata?.avatar || 'director',
              bio: 'Noctis Core System Administrator.'
            });
          } else {
            setUserInfo({
              id: userId,
              username: 'Anonymous Director',
              avatar: 'director',
              bio: 'Noctis Sinyal Sağlayıcısı.'
            });
          }
        }

        // Takip durumunu güncelle (Eğer kendimiz değilsek)
        if (!isMe && isFollowing) {
          setFollowing(isFollowing(userId));
        }

        // 2. Kullanıcının Yayınladığı Videoları Çekme Protokolü
        const { data: videos, error: videosError } = await supabase
          .from('movies')
          .select('*')
          .eq('director_id', userId)
          .order('created_at', { ascending: false });

        if (!videosError && videos) {
          setUserMovies(videos);
        } else {
          // Eğer Supabase hataya düşerse App.tsx mantığı gibi local storage'dan oku
          const localSignals = JSON.parse(localStorage.getItem('noctis_local_signals') || '[]');
          const filtered = localSignals.filter((sig: any) => sig.director_id === userId);
          setUserMovies(filtered);
        }
      } catch (e) {
        console.warn('Failed to fetch user profile safely', e);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, session, isMe]);

  const handleFollow = async () => {
    if (isMe) return; // Güvenlik kilidi: Kendi kendini takip edemezsin.
    if (toggleFollow) {
      await toggleFollow(userId);
      setFollowing((v) => !v);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-noctis-muted text-xs font-mono tracking-[0.3em] animate-pulse">
        // RETRIEVING TRANSMITTER METADATA...
      </div>
    );
  }

  const avatarEmoji = AVATAR_MAP[userInfo?.avatar || 'director'] || '🎬';

  return (
    <div className="space-y-10 max-w-5xl mx-auto animate-fade-in pb-16">
      
      {/* ÜST GEZİNTİ BARBARI */}
      <div className="flex items-center justify-between border-b border-white/[0.05] pb-6">
        <button
          onClick={onClose}
          className="text-[9px] font-mono uppercase tracking-widest text-noctis-muted hover:text-noctis-gold transition-all duration-300 flex items-center gap-2"
        >
          <span>←</span> // RETURN TO FEED
        </button>
        <span className="text-[8px] font-mono text-noctis-muted uppercase tracking-widest">
          NODE ID: {userId.substring(0, 8)}...
        </span>
      </div>

      {/* PROFİL KARTI VE DETAYLAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Sol ve Orta Sütun: İsim, Avatar ve Bio */}
        <div className="md:col-span-2 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left bg-noctis-card/30 border border-white/[0.05]/40 p-8 rounded-[32px]">
          <div className="w-20 h-20 rounded-full bg-noctis-card border border-white/[0.05] flex items-center justify-center text-3xl shadow-xl flex-shrink-0">
            {avatarEmoji}
          </div>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center sm:justify-start">
              <h1 className="text-2xl font-light tracking-wide text-[#f4f4f5]">
                @{userInfo?.username}
              </h1>
              {isMe && (
                <span className="text-[7px] bg-noctis-gold/10 border border-noctis-gold/30 text-noctis-gold font-mono px-2 py-0.5 rounded-full uppercase tracking-widest w-fit mx-auto sm:mx-0">
                  OWNER
                </span>
              )}
            </div>
            <p className="text-xs text-noctis-muted font-light leading-relaxed max-w-md">
              {userInfo?.bio || 'Bu yönetmen henüz evrene bir frekans özeti bırakmadı.'}
            </p>
          </div>
        </div>

        {/* Sağ Sütun: Sistem Analitiği ve Aksiyon Butonu */}
        <div className="bg-noctis-card border border-white/[0.05] p-6 rounded-[32px] space-y-4 font-mono text-[9px] tracking-widest uppercase">
          <div>
            <span className="text-noctis-muted">CORE STATUS</span>
            <p className="text-noctis-gold text-[11px] mt-0.5 font-light tracking-wider">
              {isMe ? '✓ MAIN ADMIN SYNCED' : '• EXTERNAL TRANSMITTER'}
            </p>
          </div>
          
          <div className="border-t border-white/[0.05] pt-4">
            <span className="text-noctis-muted">YAYIN GÜCÜ</span>
            <p className="text-gray-300 text-[10px] mt-0.5">{userMovies.length} ACTIVE SIGNALS</p>
          </div>
          
          <div className="border-t border-white/[0.05] pt-4">
            {isMe ? (
              // Eğer benim hesabımsa takip etme seçeneği yerine şık ve inaktif bir dashboard göstergesi koyuyoruz
              <div className="w-full py-3 bg-noctis-card border border-white/[0.05] text-noctis-muted rounded-xl text-center text-[8px] tracking-widest">
                // CANNOT FOLLOW YOURSELF
              </div>
            ) : (
              // Başka birinin profili ise takip protokolü çalışır
              <button
                onClick={handleFollow}
                className={`w-full py-3 border text-[9px] font-mono uppercase rounded-xl transition-all duration-500 font-bold ${
                  following
                    ? 'bg-noctis-gold/10 border-noctis-gold text-noctis-gold'
                    : 'border-white/[0.05] text-noctis-muted hover:text-noctis-platinum hover:border-gray-700'
                }`}
              >
                {following ? '[ ✓ FOLLOWING CREATOR ]' : '[ + FOLLOW CREATOR ]'}
              </button>
            )}
          </div>
        </div>

      </div>

      {/* YÖNETMENİN SİNYALLERİ (FİLM GRID) */}
      <div className="space-y-6 border-t border-white/[0.05] pt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-light tracking-[0.25em] text-noctis-muted uppercase">
            {isMe ? 'MY BROADCAST ARCHIVE' : 'TRANSMISSION LOGS'}
          </h2>
          <span className="text-[8px] text-noctis-muted font-mono">COUNT: {userMovies.length}</span>
        </div>

        {userMovies.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/[0.05] rounded-[32px] text-noctis-muted text-[10px] font-mono uppercase tracking-widest">
            ∅ SİSTEME YÜKLENMİŞ HİÇBİR SİNYAL BULUNAMADI.
          </div>
        ) : (
          <MovieGrid
            movies={userMovies}
            onSelect={(id) => {
              if (onSelectMovie) onSelectMovie(id);
            }}
          />
        )}
      </div>

    </div>
  );
}