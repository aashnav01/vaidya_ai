import React from 'react';

const DrugInteractions = ({ interactions }) => {
  if (!interactions || interactions.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-[#DC2626]/30 overflow-hidden animate-shake">
      <div className="bg-red-50 px-4 py-3 border-b border-[#DC2626]/20 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <line x1="12" x2="12" y1="9" y2="13"/>
          <line x1="12" x2="12.01" y1="17" y2="17"/>
        </svg>
        <h3 className="text-[#DC2626] font-semibold">Critical Drug Interactions Detected</h3>
      </div>
      <div className="p-4 flex flex-wrap gap-3">
        {interactions.map((interaction, idx) => (
          <div key={idx} className="bg-red-50/50 border border-[#DC2626]/20 rounded-lg px-4 py-2 w-full">
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-[#111827]">{interaction.drugs}</span>
              <span className="text-[10px] uppercase tracking-wider font-bold bg-red-100 text-[#DC2626] px-2 py-0.5 rounded">
                {interaction.severity}
              </span>
            </div>
            <p className="text-sm text-[#6B7280]">{interaction.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DrugInteractions;
