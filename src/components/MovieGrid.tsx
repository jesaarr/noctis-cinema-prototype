

interface MovieGridProps {
  movies: any[];
  onSelect: (id: string) => void;
}

export default function MovieGrid({ movies, onSelect }: MovieGridProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Resim yüklenirken 404 verirse devreye girecek asil siber-gece placeholder'ı
    e.currentTarget.onerror = null; // Sonsuz döngüyü engellemek için
    e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000'; // Mat siber soyut geometrik görsel (Sessiz Lüks)
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {movies.map((m) => (
          <div key={m.id} className="bg-noctis-bg border border-white/[0.05] rounded-2xl p-3 cursor-pointer group hover:border-white/[0.1] transition-all duration-300" onClick={() => onSelect(m.id)}>
            <img 
              src={m.cover_url || m.thumbnailUrl || m.coverImage} 
              alt={m.title} 
              className="w-full h-40 object-cover rounded-lg mb-3"
              onError={handleImageError}
            />
            
            {/* Film Başlığı */}
            <h3 className="text-sm font-light text-noctis-platinum truncate group-hover:text-noctis-gold transition-colors duration-300">{m.title}</h3>
            
            {/* Yönetmen İsmi */}
            <p className="text-[9px] text-noctis-muted mt-1">{m.director || m.creator || 'Noctis Network'}</p>
            
            {/* ⚡ YENİ EKLEDİĞİMİZ METRİK ALANI (YouTube Mantığı - Elit Versiyon) */}
            <div className="flex items-center gap-2 mt-3 text-[11px] font-mono text-zinc-400">
              {/* İzlenme Sayısı */}
              <span>
                {m.views ? m.views.toLocaleString() : 0} transmissions
              </span>
              
              {/* Araya Küçük Bir Nokta Ayracı */}
              <span>•</span>
              
              {/* Yayınlanma Tarihi */}
              <span>
                {m.created_at 
                  ? new Date(m.created_at).toLocaleDateString('tr-TR', {
                      month: 'short',
                      day: 'numeric'
                    })
                  : 'Live'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
