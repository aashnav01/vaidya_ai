import React, { useState, useEffect } from 'react';

const CountUp = ({ target }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 1200;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeProgress * target));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [target]);

  return <span>₹{count}</span>;
};

const JanAushadhi = ({ alternatives }) => {
  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div className="bg-[#F0FDF4] border border-[#059669]/30 rounded-xl overflow-hidden mt-6 animate-slide-in-right">
      <div className="bg-[#059669]/10 px-4 py-3 border-b border-[#059669]/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Government Logo Placeholder */}
          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1/3 bg-orange-500"></div>
            <div className="absolute inset-x-0 top-1/3 h-1/3 bg-white"></div>
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-green-500"></div>
            <div className="w-2 h-2 rounded-full border border-blue-800 absolute z-10"></div>
          </div>
          <h3 className="text-[#059669] font-semibold text-sm">Jan Aushadhi Kendra Alternatives</h3>
        </div>
        <span className="text-xs text-[#059669]/70">Govt. of India</span>
      </div>
      
      <div className="p-4 space-y-3">
        {alternatives.map((alt, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-[#E5E7EB]">
            <div className="flex items-center gap-3 flex-1 text-sm">
              <span className="text-[#6B7280] line-through decoration-red-500/50">{alt.branded}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9CA3AF]">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
              <span className="text-[#111827] font-medium">{alt.generic}</span>
            </div>
            <div className="bg-[#ECFDF5] text-[#059669] px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border border-[#059669]/30 flex items-center gap-1">
              Save <CountUp target={alt.savings} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JanAushadhi;
