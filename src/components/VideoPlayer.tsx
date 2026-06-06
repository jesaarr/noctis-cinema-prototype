

interface VideoPlayerProps { videoId: string }

const getEmbedUrl = (url: string) => {
  // 1. EĞER URL BOŞ VEYA TANIMSIZSA: Kendi sitemizi açmasın diye boş bir sayfa fırlatıyoruz
  if (!url || url.trim() === "") {
    return "about:blank"; 
  }
  
  // 2. Eğer zaten saf bir iframe/embed linkiyse direkt güvenle dön
  if (url.includes('embed')) return url;
  
  // 3. YouTube uzun ve kısa linklerini yakalayan regex motoru
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=1&modestbranding=1&rel=0`;
  }
  
  // 4. Eğer girilen URL bir YouTube ID'siyse (direkt 11 haneli kodsa) otomatik dönüştür
  if (url.length === 11 && !url.includes('http')) {
    return `https://www.youtube.com/embed/${url}?autoplay=1&modestbranding=1&rel=0`;
  }
  
  // 5. URL düzgün bir linkse ama YouTube değilse (Vimeo vb.) güvenle dön, değilse engelle
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Güvenlik duvarı: Yukarıdakilerin hiçbiri değilse siteyi çökertmesin diye boş sayfa dön
  return "about:blank";
};

export default function VideoPlayer({ videoId }: VideoPlayerProps) {
  const src = getEmbedUrl(videoId);
  const isDirectVideo = src !== "about:blank" && (src.endsWith('.mp4') || src.endsWith('.webm') || src.endsWith('.mov'));
  
  if (isDirectVideo) {
    return (
      <div className="w-full bg-black rounded-lg overflow-hidden">
        <video 
          className="w-full h-[420px] md:h-[540px]" 
          controls 
          autoPlay
        >
          <source src={src} type="video/mp4" />
          Tarayıcınız video oynatmayı desteklemiyor.
        </video>
      </div>
    );
  }
  
  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      {src !== "about:blank" ? (
        <iframe 
          className="w-full h-[420px] md:h-[540px]" 
          src={src} 
          title="Video player" 
          frameBorder="0" 
          allow="autoplay; fullscreen; picture-in-picture"
          sandbox="allow-same-origin allow-scripts allow-popups allow-presentation"
        />
      ) : (
        <div className="w-full h-[420px] md:h-[540px] flex items-center justify-center text-center">
          <div className="text-noctis-muted text-xs font-mono space-y-2">
            <p>⚠ Geçersiz Video Linki</p>
            <p className="text-[9px]">Lütfen geçerli bir YouTube URL'si veya Video ID'si sağlayın.</p>
          </div>
        </div>
      )}
    </div>
  );
}
