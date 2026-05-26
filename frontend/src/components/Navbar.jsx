import React, { useState, useEffect } from 'react';
import { checkHealth } from '../api';

const Navbar = ({ activeTab, setActiveTab }) => {
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const pollHealth = async () => {
      const status = await checkHealth();
      setIsLive(status);
    };
    pollHealth();
    const interval = setInterval(pollHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'consultation', label: 'New Consultation' },
    { id: 'query', label: 'Agent Query' },
    { id: 'history', label: 'Patient History' },
  ];

  return (
    <nav className="w-full bg-[#1A1D27] border-b border-[#252936] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('consultation')}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
          <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
          <circle cx="20" cy="10" r="2"/>
        </svg>
        <span className="font-bold text-xl tracking-tight text-white">Vaidya<span className="text-[#10B981]">AI</span></span>
      </div>
      
      <div className="flex gap-1 bg-[#0F1117] p-1 rounded-lg border border-[#252936]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id 
                ? 'bg-[#252936] text-white shadow-sm' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F1117] border border-[#252936]">
        <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`}></div>
        <span className="text-xs font-medium text-gray-300">
          {isLive ? 'Gemini 2.0 Flash connected' : 'Demo Mode (Offline)'}
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
