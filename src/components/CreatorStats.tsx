import React from 'react';

interface CreatorStatsProps { echoStrength: number; resonances: number; activeSignals: number }

export default function CreatorStats({ echoStrength, resonances, activeSignals }: CreatorStatsProps) {
  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-[#07070c] border border-gray-900 p-4 rounded-lg text-center">
        <div className="text-[10px] text-gray-400 font-mono uppercase">Echo Strength</div>
        <div className="text-2xl text-amber-500 font-extralight mt-2">{echoStrength}</div>
      </div>

      <div className="bg-[#07070c] border border-gray-900 p-4 rounded-lg text-center">
        <div className="text-[10px] text-gray-400 font-mono uppercase">Resonances</div>
        <div className="text-2xl text-amber-500 font-extralight mt-2">{resonances}</div>
      </div>

      <div className="bg-[#07070c] border border-gray-900 p-4 rounded-lg text-center">
        <div className="text-[10px] text-gray-400 font-mono uppercase">Active Signals</div>
        <div className="text-2xl text-amber-500 font-extralight mt-2">{activeSignals}</div>
      </div>
    </div>
  );
}
