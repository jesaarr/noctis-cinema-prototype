import { useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';

interface Signal {
  id: string;
  title: string;
  description: string;
  director: string;
  director_id: string;
  youtube_id: string;
  cover_url: string;
  prompt_lore?: string;
  ai_tools?: string[];
  created_at: string;
}

interface CreatorStatsProps {
  session: Session;
  mySignals: Signal[];
}

export default function CreatorStats({ session, mySignals }: CreatorStatsProps) {
  // Kullanıcı adı ayıklama
  const username = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Curator';

  // İstatistik verilerini dinamik ve %100 deterministik simüle etme (Asla rastgele zıplamaz)
  const analyticsData = useMemo(() => {
    let totalEchoes = 0;
    let totalResonances = 0;

    const signalDetails = mySignals.map((sig) => {
      // Rastgeleliği önleyen String Tabanlı Güvenli Hash Algoritması (Seed Motoru)
      // Film adındaki ve ID'sindeki karakter kodlarını kullanarak sabit bir sayı üretir.
      const stringKey = `${sig.id}-${sig.title}`;
      let hash = 0;
      for (let i = 0; i < stringKey.length; i++) {
        hash = stringKey.charCodeAt(i) + ((hash << 5) - hash);
      }
      const absoluteHash = Math.abs(hash);

      // İzlenme (Echoes): 250 ile 3500 arasında film adına özel deterministik bir sayı
      const echoes = (absoluteHash % 3250) + 250; 
      
      // Etkileşim Oranı (Resonance Rate): %72 ile %98 arasında sabit bir oran
      const resonanceRate = 72 + (absoluteHash % 27); 
      
      // Toplam Etkileşim Sayısı
      const resonances = Math.round(echoes * (resonanceRate / 100));

      totalEchoes += echoes;
      totalResonances += resonances;

      return {
        id: sig.id,
        title: sig.title,
        echoes,
        resonanceRate,
        coverUrl: sig.cover_url
      };
    });

    const averageResonance = totalEchoes > 0 
      ? Math.round((totalResonances / totalEchoes) * 100) 
      : 0;

    return {
      totalEchoes,
      averageResonance,
      signalDetails
    };
  }, [mySignals]);

  return (
    <div className="space-y-10 animate-fade-in py-2">
      
      {/* ============================================
          SECTION 1: HIGH-END METRIC GRID
          ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1: Echo Strength (Total Views) */}
        <div className="bg-noctis-bg border border-white/[0.05] rounded-2xl p-6 relative overflow-hidden group hover:border-noctis-gold/20 transition-all duration-500">
          <div className="absolute top-0 left-0 w-1 h-full bg-noctis-gold/40 group-hover:bg-noctis-gold transition-all duration-500" />
          <p className="text-[10px] font-mono tracking-[0.2em] text-noctis-muted uppercase">ECHO STRENGTH</p>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-3xl font-extralight tracking-tight text-noctis-platinum">
              {analyticsData.totalEchoes.toLocaleString('tr-TR')}
            </span>
            <span className="text-[10px] text-noctis-muted font-mono uppercase">Hertz</span>
          </div>
          <p className="text-[9px] text-noctis-muted font-light mt-2">
            Toplam sinyal yayılımı ve izleyici erişimi.
          </p>
        </div>

        {/* Metric 2: Resonance Score (Engagement) */}
        <div className="bg-noctis-bg border border-white/[0.05] rounded-2xl p-6 relative overflow-hidden group hover:border-noctis-gold/20 transition-all duration-500">
          <div className="absolute top-0 left-0 w-1 h-full bg-noctis-gold/20 group-hover:bg-noctis-gold/60 transition-all duration-500" />
          <p className="text-[10px] font-mono tracking-[0.2em] text-noctis-muted uppercase">RESONANCE RATE</p>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-3xl font-extralight tracking-tight text-noctis-gold">
              %{analyticsData.averageResonance}
            </span>
            <span className="text-[10px] text-noctis-muted font-mono uppercase">Frekans</span>
          </div>
          <p className="text-[9px] text-noctis-muted font-light mt-2">
            İzleyicilerin sinyal evreniyle kurduğu bağ oranı.
          </p>
        </div>

        {/* Metric 3: Active Signals (Uploads Count) */}
        <div className="bg-noctis-bg border border-white/[0.05] rounded-2xl p-6 relative overflow-hidden group hover:border-noctis-gold/20 transition-all duration-500">
          <div className="absolute top-0 left-0 w-1 h-full bg-gray-800 group-hover:bg-gray-600 transition-all duration-500" />
          <p className="text-[10px] font-mono tracking-[0.2em] text-noctis-muted uppercase">ACTIVE SIGNALS</p>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-3xl font-extralight tracking-tight text-noctis-platinum">
              {mySignals.length}
            </span>
            <span className="text-[10px] text-noctis-muted font-mono uppercase">Yayın</span>
          </div>
          <p className="text-[9px] text-noctis-muted font-light mt-2">
            Uzay boşluğunda aktif olarak yayılan sinemalarınız.
          </p>
        </div>

      </div>

      {/* ============================================
          SECTION 2: LINEAR GRID CHART (Minimal Activity)
          ============================================ */}
      <div className="bg-noctis-bg border border-white/[0.05] rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-mono tracking-widest text-noctis-muted uppercase">// BROADCAST TIMELINE</h3>
          <span className="text-[8px] text-noctis-muted font-mono uppercase">24 Hour Transmission Feed</span>
        </div>
        
        {/* Yatay lüks şerit analiz çizgisi */}
        <div className="relative h-16 w-full flex items-end gap-[3px] border-b border-white/[0.05] pb-2">
          {Array.from({ length: 48 }).map((_, idx) => {
            // Zaman tüneli dalgalanmasını da sabit tutmak için matematiksel bir sinüs dalgası
            const height = Math.abs(Math.sin(idx * 0.3) * 35) + 10;
            const isHighlight = idx % 6 === 0;
            return (
              <div 
                key={idx} 
                style={{ height: `${height}%` }}
                className={`flex-1 transition-all duration-500 rounded-sm ${
                  isHighlight 
                    ? 'bg-noctis-gold/80 hover:bg-noctis-gold' 
                    : 'bg-noctis-card hover:bg-noctis-gold/20'
                }`}
                title="Sinyal Akış Yoğunluğu"
              />
            );
          })}
        </div>
        
        <div className="flex justify-between text-[8px] text-noctis-muted font-mono mt-2">
          <span>00:00 UTC</span>
          <span>12:00 UTC</span>
          <span>24:00 UTC</span>
        </div>
      </div>

      {/* ============================================
          SECTION 3: SIGNAL BREAKDOWN LIST
          ============================================ */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono tracking-widest text-noctis-muted uppercase border-b border-white/[0.05] pb-2">
          // INDIVIDUAL SIGNAL LOGS
        </h3>

        {analyticsData.signalDetails.length === 0 ? (
          <p className="text-center py-10 text-[10px] text-noctis-muted font-mono uppercase tracking-wider">
            Sinyal kaydı bulunamadı. Veriler yayınlanınca işlenecektir.
          </p>
        ) : (
          <div className="space-y-3">
            {analyticsData.signalDetails.map((sig) => (
              <div 
                key={sig.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-noctis-bg border border-white/[0.05] rounded-xl hover:border-white/[0.03] transition-all duration-300"
              >
                {/* Sol Kısım: Başlık & Thumbnail */}
                <div className="flex items-center gap-4 min-w-0">
                  <img 
                    src={sig.coverUrl} 
                    alt={sig.title} 
                    className="w-10 h-10 rounded-lg object-cover border border-white/[0.05] shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-light text-gray-200 truncate">{sig.title}</h4>
                    <p className="text-[9px] text-noctis-muted font-mono uppercase mt-0.5">Yönetmen: @{username.toLowerCase()}</p>
                  </div>
                </div>

                {/* Sağ Kısım: İnce Detaylı Grafikler */}
                <div className="flex items-center gap-6 sm:gap-10 shrink-0 font-mono text-[10px]">
                  
                  {/* Views/Echoes */}
                  <div className="w-24">
                    <div className="flex justify-between text-[8px] text-noctis-muted mb-1">
                      <span>ECHOES</span>
                      <span>{sig.echoes} hz</span>
                    </div>
                    <div className="h-1 bg-noctis-card rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${(sig.echoes / 3500) * 100}%` }}
                        className="h-full bg-gray-600 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Resonance */}
                  <div className="w-24">
                    <div className="flex justify-between text-[8px] text-noctis-muted mb-1">
                      <span>RESONANCE</span>
                      <span>%{sig.resonanceRate}</span>
                    </div>
                    <div className="h-1 bg-noctis-card rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${sig.resonanceRate}%` }}
                        className="h-full bg-noctis-gold rounded-full"
                      />
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}