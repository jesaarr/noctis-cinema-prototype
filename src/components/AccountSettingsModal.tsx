import React, { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { validateAccountUpdate } from '../validators/account';
import { accountService } from '../services/accountService';

const AVATAR_MAP: Record<string, string> = {
  'cinema': 'AU', 
  'editorial': 'ED', 
  'archival': 'AR', 
  'minimal': 'ST', 
};

interface AccountSettingsModalProps {
  session: Session;
  onClose: () => void;
  onRefreshSession: (updatedSession: Session | null) => void;
}

export default function AccountSettingsModal({ session, onClose, onRefreshSession }: AccountSettingsModalProps) {
  const userMetadata = session?.user?.user_metadata;
  
  const [newUsername, setNewUsername] = useState(userMetadata?.username || '');
  const [selectedAvatar, setSelectedAvatar] = useState(userMetadata?.avatar || 'cinema');
  const [newPassword, setNewPassword] = useState('');
  
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasPasswordBound = session?.user?.identities?.some(id => id.provider === 'email') ?? true;

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');
    setIsError(false);

    // 1. Katman: Validasyon Kontrolü
    const validation = validateAccountUpdate(newUsername, newPassword);
    if (!validation.isValid) {
      setIsError(true);
      setStatusMessage(validation.message);
      setLoading(false);
      return;
    }

    try {
      // 2. Katman: Servis Çağrısı
      const updatedSession = await accountService.updateProfile({
        username: newUsername,
        avatar: selectedAvatar,
        password: newPassword,
        currentUserMetadata: userMetadata
      });

      setIsError(false);
      setStatusMessage('Changes successfully applied to your profile.');
      setNewPassword('');

      onRefreshSession(updatedSession);

      setTimeout(() => {
        setStatusMessage('');
        onClose();
      }, 1800);

    } catch (error: any) {
      setIsError(true);
      setStatusMessage(error.message || 'An operational error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in select-none">
      <div className="w-full max-w-md bg-[#09090b] border border-gray-900/80 p-8 rounded-[32px] shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative">
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-white text-xs tracking-widest transition-colors p-2"
        >
          CLOSE
        </button>

        <div className="mb-8 space-y-1">
          <h3 className="text-sm font-light uppercase tracking-[0.25em] text-gray-200">Studio Profile</h3>
          <p className="text-[10px] text-gray-500 font-mono tracking-wide">MANAGE ACCOUNT IDENTIFICATION</p>
        </div>

        {statusMessage && (
          <div className={`text-[11px] font-mono tracking-wide p-4 rounded-xl mb-6 border transition-all ${
            isError
              ? 'text-red-400 bg-red-950/10 border-red-900/30'
              : 'text-amber-500 bg-amber-950/5 border-amber-950/30'
          }`}>
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleUpdateAccount} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-[0.2em] font-mono text-gray-500">Username Identifier</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full bg-[#050507] border border-gray-900 focus:border-gray-800 text-gray-200 rounded-xl px-4 py-3 text-xs outline-none tracking-wide transition-all"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-[0.2em] font-mono text-gray-500">Signature Index</label>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(AVATAR_MAP).map(([key, labelCode]) => (
                <button
                  key={key}
                  type="button"
                  disabled={loading}
                  onClick={() => setSelectedAvatar(key)}
                  className={`py-3 rounded-xl border text-[10px] font-mono tracking-widest transition-all ${
                    selectedAvatar === key
                      ? 'border-amber-500 text-amber-500 bg-amber-500/[0.02]'
                      : 'border-gray-900 bg-[#050507] text-gray-500 hover:border-gray-800 hover:text-gray-300'
                  }`}
                >
                  {labelCode}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-900/40">
            <label className="text-[9px] uppercase tracking-[0.2em] font-mono text-gray-500">
              {hasPasswordBound ? 'Security Key (Change)' : 'Assign Security Key'}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={hasPasswordBound ? 'Leave vacant to preserve current' : 'Define secure passphrase'}
              className="w-full bg-[#050507] border border-gray-900 focus:border-gray-800 text-gray-200 rounded-xl px-4 py-3 text-xs outline-none placeholder:text-gray-700 tracking-wide transition-all"
              disabled={loading}
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-900/40">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 bg-transparent border border-gray-900 text-gray-500 rounded-xl text-[9px] font-mono uppercase tracking-widest hover:border-gray-800 hover:text-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-transparent border border-amber-500/30 hover:border-amber-500 text-amber-500 rounded-xl text-[9px] font-mono uppercase tracking-widest transition-all font-bold"
            >
              {loading ? 'Processing...' : 'Save Configuration'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}