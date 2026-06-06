

interface MovieGridProps {
  movies: any[];
  onSelect: (id: string) => void;
}

export default function MovieGrid({ movies, onSelect }: MovieGridProps) {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {movies.map((m) => (
          <div key={m.id} className="bg-noctis-bg border border-white/[0.05] rounded-2xl p-3 cursor-pointer" onClick={() => onSelect(m.id)}>
            <img src={m.cover_url || m.thumbnailUrl || m.coverImage} alt={m.title} className="w-full h-40 object-cover rounded-lg mb-3" />
            <h3 className="text-sm font-light text-noctis-platinum truncate">{m.title}</h3>
            <p className="text-[9px] text-noctis-muted mt-1">{m.description || m.shortDescription || ''}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
