// src/components/ProfileDropdown.tsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface ProfileDropdownProps {
  session: Session;
  onOpenSettings: () => void;
  onOpenCreatorDeck: () => void;
  onLogout: () => void;
}

export default function ProfileDropdown({ session, onOpenSettings, onOpenCreatorDeck, onLogout }: ProfileDropdownProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userMetadata = session.user.user_metadata;
  const username = userMetadata?.username || userMetadata?.full_name || session.user.email?.split('@')[0] || 'Curator';
  
  const initial = username.charAt(0).toUpperCase();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutAction = async () => {
    await supabase.auth.signOut();
    onLogout();
    setIsMenuOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Profil Tetikleyici Buton */}
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm font-semibold transition-all duration-200 select-none
          ${isMenuOpen 
            ? 'border-noctis-gold bg-[#191919] text-noctis-gold' 
            : 'border-[#2b2b2b] bg-[#0f0f0f] text-[#f4f4f5] hover:border-[#444444] hover:bg-[#161616]'
          }`}
      >
        {initial}
      </button>

      {/* Dropdown Menü */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[#0B0B0F] border border-white/10 rounded-lg p-1 shadow-[0_12px_30px_rgba(0,0,0,0.5)] z-50">
          
          {/* Kullanıcı Bilgileri */}
          <div className="px-3 py-2 border-b border-white/5 mb-1">
            <p className="text-xs font-medium text-gray-300 truncate">
              {username}
            </p>
            <p className="text-[11px] text-noctis-muted truncate mt-0.5">
              {session.user.email}
            </p>
          </div>
          
          {/* Menü Seçenekleri */}
          <div className="space-y-0.5">
            <button
              onClick={() => { onOpenSettings(); setIsMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-all"
            >
              Account Settings
            </button>

            <button
              onClick={() => { onOpenCreatorDeck(); setIsMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-noctis-gold/80 hover:bg-noctis-gold/10 rounded-lg transition-all border-t border-white/5 mt-1"
            >
              Transmission Deck
            </button>
            
            <button
              onClick={handleLogoutAction}
              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
              Sign Out
            </button>
          </div>

        </div>
      )}
    </div>
  );
}