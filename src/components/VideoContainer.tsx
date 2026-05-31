import React from 'react';
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
  const vid = movie.youtube_id || movie.videoUrl || '';
  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      <button 
        onClick={onClose} 
        className="text-[9px] font-mono uppercase tracking-widest text-[#eab308]/80 hover:text-[#eab308] transition-all duration-300 flex items-center gap-2"
      >
        <span>←</span> SEÇİME GERİ DÖN
      </button>

      <div className="aspect-video w-full rounded-[32px] overflow-hidden border border-gray-900 shadow-2xl relative bg-black">
        <VideoPlayer videoId={vid} />
      </div>

      <VideoMeta movie={movie} session={session} onViewProfile={onViewProfile} />
      <CommentSection videoId={movie.id} session={session} />
    </div>
  );
}
