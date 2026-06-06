import VideoPlayer from './VideoPlayer';
import VideoMeta from './VideoMeta';
import CommentSection from './CommentSection';

interface VideoContainerProps { 
  movie: any
  onClose: () => void
  session: any
  onViewProfile?: (directorId: string) => void
}

export default function VideoContainer({ movie, onClose, session, onViewProfile }: VideoContainerProps) {
  // Esneklik: youtube_id, video_url, videoUrl veya youtube_url kullanabilir
  const vid = movie.youtube_id || movie.video_url || movie.videoUrl || movie.youtube_url || '';
  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      <button 
        onClick={onClose} 
        className="text-[9px] font-mono uppercase tracking-widest text-noctis-gold/80 hover:text-noctis-gold transition-all duration-300 flex items-center gap-2"
      >
        <span>←</span> SEÇİME GERİ DÖN
      </button>

      <div className="aspect-video w-full rounded-[32px] overflow-hidden border border-white/[0.05] shadow-2xl relative bg-black">
        <VideoPlayer videoId={vid} />
      </div>

      {/* NOCTIS SİNEMATİK BİLGİ PANELİ */}
      <div className="bg-noctis-card border border-white/[0.05] rounded-[32px] p-8 space-y-6">
        {/* Üst Alan: Başlık ve Yönetmen */}
        <div className="space-y-3">
          {/* Film Başlığı */}
          <h2 className="text-2xl font-light text-noctis-platinum tracking-wide uppercase">
            {movie?.title}
          </h2>
          {/* Yönetmen Künyesi */}
          <p className="text-[10px] text-noctis-muted font-mono uppercase tracking-wider">
            Director: {movie?.director || 'Noctis Network'}
          </p>
        </div>

        {/* Veri Matrisi (Transmissions, Signal Deployed) */}
        <div className="grid grid-cols-2 gap-6 py-6 border-t border-b border-white/[0.05]">
          {/* Sol Taraf: Transmissions/Views */}
          <div className="space-y-2">
            <p className="text-[9px] text-noctis-gold font-mono uppercase tracking-widest">
              Transmissions
            </p>
            <p className="text-xl font-light text-noctis-platinum">
              {(movie?.views || movie?.views_count || 0).toLocaleString()}
            </p>
          </div>

          {/* Sağ Taraf: Signal Deployed Date */}
          <div className="space-y-2">
            <p className="text-[9px] text-noctis-gold font-mono uppercase tracking-widest">
              Signal Deployed
            </p>
            <p className="text-xl font-light text-noctis-platinum">
              {movie?.created_at 
                ? new Date(movie.created_at).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : 'Live Now'}
            </p>
          </div>
        </div>

        {/* Alt Alan: Detaylı Lore/Açıklama Metni */}
        <div className="space-y-3">
          <p className="text-[10px] text-noctis-gold font-mono uppercase tracking-widest">
            // BROADCAST LORE
          </p>
          <p className="text-sm text-noctis-muted font-light leading-relaxed">
            {movie?.description || 'Bu sinematik sinyal için henüz bir açıklama girilmedi.'}
          </p>
        </div>
      </div>

      <VideoMeta movie={movie} session={session} onViewProfile={onViewProfile} />
      <CommentSection videoId={movie.id} session={session} />
    </div>
  );
}
