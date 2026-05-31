import React from 'react';

interface StoreItem {
  id: string;
  title: string;
  category: 'COLOR GRADING' | 'CREATIVE DIRECTION' | 'SOUNDSCAPES';
  description: string;
  creator: string;
  features: string[];
}

const STORE_ITEMS: StoreItem[] = [
  { 
    id: 's1', 
    title: 'NOIR KODAK 35MM', 
    category: 'COLOR GRADING', 
    description: 'A bespoke cinematic emulsion profile designed to infuse digital renders with the organic texture, rich density, and timeless atmosphere of vintage celluloid film.', 
    creator: 'Noctis Editorial', 
    features: ['3 Professional 3D LUTs (.cube)', 'Optimized for DaVinci Resolve & Premiere', 'S-Curve Contrast Adjustment'] 
  },
  { 
    id: 's2', 
    title: 'CINEMATIC SCENARIO ARCHIVE', 
    category: 'CREATIVE DIRECTION', 
    description: 'An exclusive collection of structured visual guides, lighting blueprints, and prompt formulas designed to achieve photorealistic atmosphere, architectural depth, and premium character portraits.', 
    creator: 'Studio Aurora', 
    features: ['50 Highly Curated Directives', 'Lighting and Camera Angle Formula Guide', 'Composition Frameworks'] 
  },
  { 
    id: 's3', 
    title: 'ANALOG ACOUSTIC ENVELOPES', 
    category: 'SOUNDSCAPES', 
    description: 'A masterfully recorded suite of analog synthesizer drones, low-frequency atmospheric swells, and tactile transition sweeps to establish immediate tension and narrative depth.', 
    creator: 'Core Sound', 
    features: ['24 Mastered High-Fidelity WAV Files', 'Royalty-Free Commercial License', 'Metadata and Key Tagged'] 
  }
];

interface AiStoreProps {
  credits: number; // Kept in interface to prevent App.tsx compile errors, but fully hidden from the premium UI
  purchasedItems: string[];
  onBuy: (item: any) => void;
}

export default function AiStore({ credits, purchasedItems, onBuy }: AiStoreProps) {
  return (
    <div className="space-y-12 animate-fade-in max-w-6xl mx-auto py-4 select-none">
      
      {/* Premium Header Board */}
      <div className="border-b border-gray-900 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-[9px] text-amber-500 font-mono tracking-widest uppercase">PREMIUM MEMBER ACCESS</span>
          </div>
          <h2 className="text-3xl font-extralight tracking-wide text-white uppercase">Studio Asset Suite</h2>
          <p className="text-xs text-gray-400 font-light max-w-xl leading-relaxed">
            A curated library of creative tools, cinematic color profiles, and high-fidelity sound designs. 
            Included exclusively for Noctis Premium members with unlimited access licenses.
          </p>
        </div>
        
        {/* Subtle, premium member indicator (No wallet/coin counter) */}
        <div className="bg-[#0b0b0d] border border-gray-900 px-5 py-3 rounded-2xl text-[10px] font-mono tracking-widest text-gray-400 uppercase">
          LICENSE STATE: <span className="text-amber-500 font-bold">ACTIVE</span>
        </div>
      </div>

      {/* Asset Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {STORE_ITEMS.map((item) => {
          const isActivated = purchasedItems.includes(item.id);
          
          return (
            <div 
              key={item.id} 
              className="bg-[#0b0b0d] border border-gray-900/60 p-8 rounded-[32px] hover:border-gray-800 transition-all duration-500 flex flex-col justify-between relative group overflow-hidden"
            >
              {/* Luxury Accent Top Border Hover Effect */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="space-y-6">
                {/* Category Indicator */}
                <div className="flex justify-between items-center">
                  <span className="text-[8px] tracking-[0.2em] font-mono text-gray-500 uppercase">
                    {item.category}
                  </span>
                  <span className="text-[8px] text-amber-500/80 font-mono tracking-widest uppercase">
                    STUDIO PRO
                  </span>
                </div>

                {/* Info Block */}
                <div className="space-y-3">
                  <h3 className="text-lg font-light text-gray-100 tracking-wide uppercase">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-gray-500 font-mono tracking-wide">
                    By {item.creator}
                  </p>
                  <p className="text-xs text-gray-400 font-light leading-relaxed pt-2">
                    {item.description}
                  </p>
                </div>

                {/* Features Specifications */}
                <ul className="space-y-2 pt-4 border-t border-gray-900/50">
                  {item.features.map((feat, idx) => (
                    <li key={idx} className="text-[10px] text-gray-500 font-light flex items-start gap-2.5">
                      <span className="text-amber-500/60 mt-1">▪</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Segment */}
              <div className="mt-10 pt-5 border-t border-gray-900/50">
                <button
                  onClick={() => onBuy(item)}
                  disabled={isActivated}
                  className={`w-full py-3 rounded-xl text-[9px] font-mono tracking-widest uppercase transition-all duration-300 ease-out font-bold ${
                    isActivated 
                      ? 'bg-gray-950 border border-gray-900 text-gray-600 cursor-default' 
                      : 'bg-transparent border border-gray-800 text-gray-300 hover:text-white hover:border-amber-500'
                  }`}
                >
                  {isActivated ? 'LICENSE INSTALLED' : 'ADD TO WORKSPACE'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}