import React, { useMemo } from 'react';
import { useNoctisStorage } from '../hooks/useNoctisStorage';

interface VideoMetaProps { 
  movie: any;
  session?: any;
  onViewProfile?: (directorId: string) => void;
}

// Tarihi lüks, minimalist bir göreceli zamana çeviren yardımcı fonksiyon
const getRelativeTime = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  } catch {
    return 'Recently';
  }
};

export default function VideoMeta({ movie, session, onViewProfile }: VideoMetaProps) {
  // Noctis merkezi hafıza birimi
  const { followingList, toggleFollow, watchLater, toggleWatchLater } = useNoctisStorage(session?.user?.id);

  // Oturumu açık olan kullanıcı bu videonun sahibi mi?
  const isMe = session?.user?.id === movie.director_id;

  // Takip durumu dinamik olarak listeden taranır (State kilitlenmesi yaşanmaz)
  const isFollowingDirector = useMemo(() => {
    if (!movie.director_id) return false;
    return followingList?.includes(movie.director_id) || false;
  }, [followingList, movie.director_id]);

  const isWatchLater = useMemo(() => {
    return watchLater?.includes(movie.id) || false;
  }, [watchLater, movie.id]);

  const relativeTime = useMemo(() => {
    return getRelativeTime(movie.created_at);
  }, [movie.created_at]);

  const handleFollow = () => {
    if (isMe || !movie.director_id) return;
    if (toggleFollow) {
      toggleFollow(movie.director_id);
    }
  };

  const handleViewProfile = () => {
    if (onViewProfile && movie.director_id) {
      onViewProfile(movie.director_id);
    }
  };

  return (
    <div className="space-y-8 border-b border-gray-950 pb-8 animate-fade-in">
      
      {/* Interaction Button Bar */}
      <div className="flex items-center justify-between border-b border-gray-900/50 pb-5">
        <div className="flex gap-4">
          
          {/* Watch Later Toggle */}
          <button 
            onClick={() => toggleWatchLater(movie.id)}
            className={`px-4 py-2.5 border text-[9px] font-mono uppercase rounded-xl transition-all duration-300 ${
              isWatchLater 
                ? 'bg-[#eab308]/5 border-[#eab308] text-[#eab308]' 
                : 'border-gray-900 text-gray-500 hover:text-white hover:border-gray-700'
            }`}
          >
            {isWatchLater ? '[ SCHEDULED ]' : 'WATCH LATER'}
          </button>
          
          {/* Follow/Owner Toggle */}
          {isMe ? (
            <div className="px-4 py-2.5 bg-gray-950 border border-gray-900 text-gray-600 rounded-xl text-[9px] font-mono uppercase tracking-wider cursor-default select-none">
              OWNER CHANNEL
            </div>
          ) : (
            movie.director_id && (
              <button 
                onClick={handleFollow}
                className={`px-4 py-2.5 border text-[9px] font-mono uppercase rounded-xl transition-all duration-300 ${
                  isFollowingDirector 
                    ? 'bg-[#eab308]/5 border-[#eab308] text-[#eab308] font-bold' 
                    : 'border-gray-900 text-gray-400 hover:text-white hover:border-gray-700'
                }`}
              >
                {isFollowingDirector ? '[ FOLLOWING ]' : 'FOLLOW CREATOR'}
              </button>
            )
          )}

        </div>

        <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">
          SIGNAL KEY: {movie.id.substring(0, 8)}
        </span>
      </div>

      {/* Title and Director Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Sol Alan: Başlık & Özet */}
        <div className="md:col-span-2 space-y-4">
          <div className="inline-block bg-[#eab308]/5 border border-[#eab308]/20 text-[#eab308] px-3 py-1.5 rounded-full font-mono text-[8px] uppercase tracking-widest">
            ACTIVE SYSTEM TRANSMISSION
          </div>
          <h2 className="text-3xl font-extralight tracking-wide text-white">{movie.title}</h2>
          <p className="text-xs text-gray-400 font-light leading-relaxed">{movie.description}</p>
        </div>

        {/* Sağ Alan: Lüks İstatistik Kartı */}
        <div className="bg-[#121214]/60 border border-gray-900 p-6 rounded-[32px] h-fit space-y-4 font-mono text-[9px] tracking-widest uppercase">
          
          <div>
            <span className="text-gray-500">TRANSMITTER</span>
            <div className="block mt-1">
              {movie.director_id ? (
                <button 
                  onClick={handleViewProfile}
                  className="text-white text-xs font-light hover:text-[#eab308] transition-colors cursor-pointer text-left"
                >
                  @{movie.director.toLowerCase()}
                </button>
              ) : (
                <span className="text-gray-400 text-xs font-light">@anonymous</span>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-900/60 pt-4">
            <span className="text-gray-500">ECHO STRENGTH</span>
            <p className="text-[#eab308] text-xs mt-1 font-light">
              {(movie.views ?? 0).toLocaleString('tr-TR')} VIEWS
            </p>
          </div>
          
          <div className="border-t border-gray-900/60 pt-4">
            <span className="text-gray-500">TIMESTAMP</span>
            <p className="text-gray-300 text-[10px] mt-1 font-light">{relativeTime}</p>
          </div>
          
          {movie.ai_tools && movie.ai_tools.length > 0 && (
            <div className="border-t border-gray-900/60 pt-4">
              <span className="text-gray-500">GENERATION ENGINES</span>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {movie.ai_tools.map((tool: string, i: number) => (
                  <span 
                    key={i} 
                    className="bg-black/40 border border-gray-900 text-[#eab308] px-2.5 py-1 rounded-lg text-[7px] tracking-wide"
                  >
                    {tool.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}