import React from 'react';
import { useNoctisStorage } from '../hooks/useNoctisStorage';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (t: string) => void;
  setSelectedMovieId: (id: string | null) => void;
  onViewProfile?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, setSelectedMovieId, onViewProfile }: SidebarProps) {
  const { history, watchLater, likedVideos, followingList, username } = useNoctisStorage();
  const historyCount = history.length;
  const watchLaterCount = watchLater.length;
  const likedCount = likedVideos.length;

  const handleNav = (tab: string) => {
    setSelectedMovieId(null);
    setActiveTab(tab);
  };

  return (
    <aside className="w-64 min-h-screen bg-[#070709] border-r border-[#121214] p-6 flex flex-col justify-between select-none">
      <div className="space-y-8">
        
        {/* User Identity Segment */}
        <div className="bg-[#0b0b0e] border border-[#16161a] p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#eab308]/20 to-transparent" />
          
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] font-mono tracking-widest text-gray-600 uppercase">SYS_CURATOR</p>
              <p className="text-sm font-light text-gray-200 truncate tracking-wide">
                @{username ? username.toLowerCase() : 'anonymous'}
              </p>
            </div>
            
            <button 
              onClick={onViewProfile}
              className="w-full py-2 px-3 bg-transparent border border-gray-800 hover:border-[#eab308] text-gray-400 hover:text-[#eab308] text-[9px] font-mono uppercase tracking-widest rounded-lg transition-all duration-300 ease-out"
            >
              VIEW PROFILE
            </button>
          </div>
        </div>

        {/* Navigation Deck */}
        <nav className="space-y-7">
          
          {/* Group 1: Discover */}
          <div className="space-y-1.5">
            <p className="text-[9px] text-gray-600 font-mono tracking-[0.3em] uppercase font-medium px-3 mb-3">
              DISCOVER
            </p>
            
            <button 
              onClick={() => handleNav('explore')} 
              className={`w-full text-left py-2.5 px-3 rounded-xl text-xs tracking-wider transition-all duration-300 relative group flex items-center justify-between ${
                activeTab === 'explore' 
                  ? 'bg-gradient-to-r from-[#eab308]/5 to-transparent text-[#eab308] font-medium' 
                  : 'text-gray-400 hover:bg-white/[0.01] hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {activeTab === 'explore' && (
                  <span className="w-1.5 h-1.5 bg-[#eab308] rounded-full shadow-[0_0_8px_#eab308]" />
                )}
                <span className="uppercase tracking-[0.12em]">DISCOVER SIGNALS</span>
              </div>
            </button>

            <button 
              onClick={() => handleNav('store')} 
              className={`w-full text-left py-2.5 px-3 rounded-xl text-xs tracking-wider transition-all duration-300 relative group flex items-center justify-between ${
                activeTab === 'store' 
                  ? 'bg-gradient-to-r from-[#eab308]/5 to-transparent text-[#eab308] font-medium' 
                  : 'text-gray-400 hover:bg-white/[0.01] hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {activeTab === 'store' && (
                  <span className="w-1.5 h-1.5 bg-[#eab308] rounded-full shadow-[0_0_8px_#eab308]" />
                )}
                <span className="uppercase tracking-[0.12em]">AI STORE DECK</span>
              </div>
            </button>
          </div>

          {/* Group 2: Archive */}
          <div className="space-y-1.5">
            <p className="text-[9px] text-gray-600 font-mono tracking-[0.3em] uppercase font-medium px-3 mb-3">
              ARCHIVE
            </p>

            <button 
              onClick={() => handleNav('history')} 
              className={`w-full text-left py-2.5 px-3 rounded-xl text-xs tracking-wider transition-all duration-300 flex items-center justify-between ${
                activeTab === 'history' 
                  ? 'bg-gradient-to-r from-[#eab308]/5 to-transparent text-[#eab308] font-medium' 
                  : 'text-gray-400 hover:bg-white/[0.01] hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {activeTab === 'history' && (
                  <span className="w-1.5 h-1.5 bg-[#eab308] rounded-full shadow-[0_0_8px_#eab308]" />
                )}
                <span className="uppercase tracking-[0.12em]">HISTORY</span>
              </div>
              <span className="text-[9px] font-mono text-gray-500 bg-[#121215] px-2 py-0.5 rounded border border-gray-900 group-hover:text-gray-300">
                {historyCount}
              </span>
            </button>

            <button 
              onClick={() => handleNav('watchLater')} 
              className={`w-full text-left py-2.5 px-3 rounded-xl text-xs tracking-wider transition-all duration-300 flex items-center justify-between ${
                activeTab === 'watchLater' 
                  ? 'bg-gradient-to-r from-[#eab308]/5 to-transparent text-[#eab308] font-medium' 
                  : 'text-gray-400 hover:bg-white/[0.01] hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {activeTab === 'watchLater' && (
                  <span className="w-1.5 h-1.5 bg-[#eab308] rounded-full shadow-[0_0_8px_#eab308]" />
                )}
                <span className="uppercase tracking-[0.12em]">WATCH LATER</span>
              </div>
              <span className="text-[9px] font-mono text-gray-500 bg-[#121215] px-2 py-0.5 rounded border border-gray-900 group-hover:text-gray-300">
                {watchLaterCount}
              </span>
            </button>

            <button 
              onClick={() => handleNav('liked')} 
              className={`w-full text-left py-2.5 px-3 rounded-xl text-xs tracking-wider transition-all duration-300 flex items-center justify-between ${
                activeTab === 'liked' 
                  ? 'bg-gradient-to-r from-[#eab308]/5 to-transparent text-[#eab308] font-medium' 
                  : 'text-gray-400 hover:bg-white/[0.01] hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {activeTab === 'liked' && (
                  <span className="w-1.5 h-1.5 bg-[#eab308] rounded-full shadow-[0_0_8px_#eab308]" />
                )}
                <span className="uppercase tracking-[0.12em]">LIKED SIGNALS</span>
              </div>
              <span className="text-[9px] font-mono text-gray-500 bg-[#121215] px-2 py-0.5 rounded border border-gray-900 group-hover:text-gray-300">
                {likedCount}
              </span>
            </button>
          </div>

        </nav>
      </div>

      {/* System Status Footer */}
      <div className="border-t border-[#121214] pt-6 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#eab308]/80 rounded-full animate-pulse" />
          <p className="text-[8px] text-gray-500 font-mono tracking-[0.2em] uppercase font-light">
            SECURE TRANSMISSION
          </p>
        </div>
        <p className="text-[7px] text-gray-600 font-mono tracking-wider">
          NOCTIS ENGINE v2.5
        </p>
      </div>
    </aside>
  );
}