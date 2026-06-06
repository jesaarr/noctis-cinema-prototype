import type { Movie } from '../types/cinema';

interface CreatorStatsProps {
  movies: Movie[]; // Statik sayılar yerine direkt yüklenen filmlerin listesini alıyoruz
}

export default function CreatorStats({ movies }: CreatorStatsProps) {
  // Aktif sinyal sayısı = toplam yüklenen film sayısı
  const activeSignals = movies.length;

  // Toplam Rezonans (Etkileşim) = Filmlerin resonance_count değerlerinin toplamı
  const totalResonances = movies.reduce((sum, movie) => sum + (movie.resonance_count || 0), 0);

  // Echo Strength (Yankı Gücü) = İzlenme ve rezonansa göre hesaplanan dinamik bir siber metrik
  const totalViews = movies.reduce((sum, movie) => sum + (movie.views_count || 0), 0);
  const echoStrength = totalViews > 0 ? ((totalResonances / totalViews) * 100).toFixed(1) : "0.0";

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-noctis-bg border border-white/[0.05] p-4 rounded-lg text-center">
        <div className="text-[10px] text-noctis-muted font-mono uppercase tracking-wider">Echo Strength</div>
        <div className="text-2xl text-noctis-gold font-extralight mt-2">{echoStrength}%</div>
      </div>

      <div className="bg-noctis-bg border border-white/[0.05] p-4 rounded-lg text-center">
        <div className="text-[10px] text-noctis-muted font-mono uppercase tracking-wider">Resonances</div>
        <div className="text-2xl text-noctis-gold font-extralight mt-2">{totalResonances}</div>
      </div>

      <div className="bg-noctis-bg border border-white/[0.05] p-4 rounded-lg text-center">
        <div className="text-[10px] text-noctis-muted font-mono uppercase tracking-wider">Active Signals</div>
        <div className="text-2xl text-noctis-gold font-extralight mt-2">{activeSignals}</div>
      </div>
    </div>
  );
}