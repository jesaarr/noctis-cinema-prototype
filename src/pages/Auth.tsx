import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

// Minimalist, asil avatar seçenekleri
const AVATARS = [
  { id: 'aurora', name: 'Aurora', emoji: '👁️' },
  { id: 'director', name: 'Director', emoji: '🎬' },
  { id: 'observer', name: 'Observer', emoji: '👤' },
  { id: 'core', name: 'Core', emoji: '🌌' },
];

export default function Auth() {
  // Auth durumu dinleyicisi - link onayından sonra otomatik giriş yakalama
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.reload();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        window.location.reload();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState(1); // 1: Email/Pass, 2: Profil Kurulumu
  
  // Form State'leri
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id);

  // UX State'leri
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Google Giriş Protokolü
  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage('');
    setIsError(false);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) {
      setIsError(true);
      setMessage(error.message);
      setLoading(false);
    }
  };

  // 1. Adımdan 2. Adıma Geçiş (Validasyon)
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!email || !password) {
      setIsError(true);
      setMessage('Lütfen tüm alanları eksiksiz doldurun.');
      return;
    }

    if (password.length < 6) {
      setIsError(true);
      setMessage('Güvenlik Protokolü: Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setStep(2);
  };

  // Kayıt & Giriş Submit Kontrolü
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (isSignUp && !username.trim()) {
      setIsError(true);
      setMessage('Lütfen kendinize özgü bir kullanıcı adı belirleyin.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim(),
              avatar: selectedAvatar,
            }
          }
        });
        if (error) throw error;
        
        setIsError(false);
        setMessage('✓ Kimlik oluşturuldu! E-postanızı doğruladıktan sonra aktarım başlayacak.');
        
        setTimeout(() => {
          setIsSignUp(false);
          setStep(1);
          setPassword('');
        }, 3000);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      setIsError(true);
      if (error.message.includes('Invalid login credentials')) {
        setMessage('Hatalı frekans (E-posta) veya şifre.');
      } else if (error.message.includes('Email not confirmed')) {
        setMessage('Sinyal engellendi: Lütfen e-posta adresinizi doğrulayın.');
      } else if (error.message.includes('User already registered')) {
        setMessage('Bu kimlik zaten mevcut. Giriş yapmayı deneyin.');
      } else {
        setMessage(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] flex items-center justify-center p-4 relative overflow-hidden select-none">
      
      {/* Özel Sinematik CSS Animasyonları ve Ambient Stilleri */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.22; transform: scale(1.05); }
        }
        .animate-shutter-in {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-ambient-glow {
          animation: subtlePulse 8s ease-in-out infinite;
        }
        /* Floating label animasyonu için özel sınıflar */
        .input-group {
          position: relative;
        }
        .input-field:focus ~ .input-label,
        .input-field:not(:placeholder-shown) ~ .input-label {
          top: -12px;
          font-size: 9px;
          color: #d4af37;
        }
      `}</style>

      {/* Arka Planda Kademeli Sinematik Altın Sis Efekti */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-noctis-gold/10 to-transparent rounded-full blur-[150px] pointer-events-none animate-ambient-glow" />

      {/* Ana Giriş Kartı */}
      <div className="w-full max-w-sm bg-noctis-bg/90 border border-white/[0.05] p-8 rounded-[28px] shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative z-10 transition-all duration-500 hover:border-noctis-gold/20 backdrop-blur-xl">
        
        {/* Üstteki İnce Sinematik Çizgi (Adım 2'ye Geçince Parıldar) */}
        <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-noctis-gold to-transparent transition-all duration-1000 ${isSignUp && step === 2 ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`} />

        {/* Logo / Başlık */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extralight tracking-[0.6em] text-noctis-platinum pl-[0.6em] transition-all duration-500 hover:tracking-[0.7em]">NOCTIS</h2>
          <p className="text-[9px] tracking-[0.3em] text-[#a1a1aa] font-mono uppercase mt-2.5">
            {isSignUp ? `// Stage 0${step} : Configuration` : '// Establish Link'}
          </p>
        </div>

        {/* Bildirim Ekranı (Temiz Monospace Stil) */}
        {message && (
          <div className={`text-[11px] p-3 rounded-xl mb-6 border font-mono transition-all duration-300 animate-shutter-in ${
            isError
              ? 'text-noctis-gold bg-noctis-card/10 border-noctis-gold/20'
              : 'text-[#f4f4f5] bg-noctis-card border-white/[0.05]'
          }`}>
            {isError ? '⚡ ENGINE_ALERT: ' : '✓ PROCESS_OK: '} {message}
          </div>
        )}

        {/* --- ADIM 1: GİRİŞ VEYA KAYIT TEMEL BİLGİLERİ --- */}
        {!isSignUp || (isSignUp && step === 1) ? (
          <form onSubmit={isSignUp ? handleNextStep : handleSubmit} className="space-y-6 animate-shutter-in">
            {/* Minimalist Underline Email Input */}
            <div className="input-group border-b border-white/[0.05] focus-within:border-noctis-gold transition-colors duration-300 pb-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                placeholder=" "
                className="input-field w-full bg-transparent text-[#f4f4f5] text-sm outline-none pt-4 pb-1 font-light"
              />
              <label className="input-label absolute left-0 top-4 text-xs uppercase tracking-[0.25em] text-[#52525b] font-mono pointer-events-none transition-all duration-300">
                Frequency (Email)
              </label>
            </div>

            {/* Minimalist Underline Password Input */}
            <div className="input-group border-b border-white/[0.05] focus-within:border-noctis-gold transition-colors duration-300 pb-1">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                placeholder=" "
                className="input-field w-full bg-transparent text-[#f4f4f5] text-sm outline-none pt-4 pb-1 font-light"
              />
              <label className="input-label absolute left-0 top-4 text-xs uppercase tracking-[0.25em] text-[#52525b] font-mono pointer-events-none transition-all duration-300">
                Passcode
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 bg-transparent hover:bg-white/[0.02] border border-[#27272a] hover:border-[#44444a] text-[#f4f4f5] rounded-xl tracking-[0.25em] text-[10px] uppercase font-semibold transition-all duration-500"
            >
              {loading ? 'Transmitting...' : isSignUp ? 'Continue' : 'Secure Sign In'}
            </button>
          </form>
        ) : (
          /* --- ADIM 2: PROFİL VE AVATAR YAPILANDIRMASI --- */
          <form onSubmit={handleSubmit} className="space-y-6 animate-shutter-in">
            {/* Minimalist Underline Username Input */}
            <div className="input-group border-b border-white/[0.05] focus-within:border-noctis-gold transition-colors duration-300 pb-1">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                maxLength={16}
                disabled={loading}
                required
                placeholder=" "
                className="input-field w-full bg-transparent text-[#f4f4f5] text-sm outline-none pt-4 pb-1 font-mono"
              />
              <label className="input-label absolute left-0 top-4 text-xs uppercase tracking-[0.25em] text-[#52525b] font-mono pointer-events-none transition-all duration-300">
                Signature (Username)
              </label>
            </div>

            {/* Lüks Dairesel Avatar Seçici */}
            <div className="space-y-3">
              <label className="text-[9px] uppercase tracking-[0.3em] text-[#52525b] font-mono block pl-1">Core Identity Icon</label>
              <div className="grid grid-cols-4 gap-3">
                {AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => !loading && setSelectedAvatar(av.id)}
                    className={`aspect-square rounded-full flex flex-col items-center justify-center transition-all duration-300 relative border ${
                      selectedAvatar === av.id 
                        ? 'border-noctis-gold bg-noctis-card/10 shadow-[0_0_15px_rgba(212,175,55,0.15)] scale-105' 
                        : 'border-white/[0.05] bg-transparent hover:border-[#3a3a3e]'
                    }`}
                  >
                    <span className="text-xl">{av.emoji}</span>
                    <span className="text-[7px] text-[#52525b] absolute -bottom-4 font-mono uppercase tracking-wider">{av.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="flex-1 py-3 bg-transparent border border-white/[0.05] hover:border-[#333338] text-noctis-muted hover:text-noctis-platinum rounded-xl text-[10px] tracking-[0.2em] uppercase font-mono transition-all duration-300"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-transparent border border-noctis-gold/40 hover:border-noctis-gold hover:bg-noctis-card/10 text-noctis-gold rounded-xl text-[10px] tracking-[0.2em] uppercase font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.05)]"
              >
                {loading ? 'Linking...' : 'Initialize'}
              </button>
            </div>
          </form>
        )}

        {/* Google OAuth (Sadece 1. Adımda Görünür) */}
        {(!isSignUp || step === 1) && (
          <>
            <div className="relative my-6 flex items-center justify-center">
              <div className="h-[1px] w-full bg-noctis-card" />
              <span className="absolute bg-noctis-bg px-3.5 text-[9px] uppercase tracking-[0.3em] text-[#52525b] font-mono">OR</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 bg-transparent hover:bg-white/[0.01] border border-white/[0.05] text-noctis-muted hover:text-noctis-platinum rounded-xl text-[10px] tracking-[0.15em] uppercase flex items-center justify-center gap-3 transition-all duration-300 hover:border-[#3f3f46]"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </>
        )}

        {/* Giriş / Kayıt Mod Değiştirici Buton */}
        <div className="mt-8 text-center border-t border-[#111115] pt-5">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setStep(1);
              setMessage('');
            }}
            className="text-[9px] uppercase tracking-[0.3em] text-noctis-gold hover:text-noctis-platinum transition-colors duration-300 font-mono"
          >
            {isSignUp ? '// Establish Link (Sign In)' : '// Initiate Setup (Register)'}
          </button>
        </div>

      </div>
    </div>
  );
}