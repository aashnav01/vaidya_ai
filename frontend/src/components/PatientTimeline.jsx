import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PatientTimeline = ({ visits }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const timelineData = visits || [
    { date: 'Oct 12, 2025', diagnosis: 'Hypertension Follow-up', doctor: 'Dr. Sharma', notes: 'BP stable on Telmisartan 40mg.' },
    { date: 'Aug 05, 2025', diagnosis: 'Acute Bronchitis', doctor: 'Dr. Sharma', notes: 'Prescribed antibiotics and cough syrup.' },
    { date: 'Feb 20, 2025', diagnosis: 'Initial Consultation', doctor: 'Dr. Patel', notes: 'Diagnosed with primary hypertension.' }
  ];

  if (visits && visits.length === 0) {
    return (
      <div className="bg-[#1A1D27] rounded-xl p-6 border border-[#252936] h-full flex flex-col">
        <h3 className="text-white font-semibold mb-6">Patient History</h3>
        <div className="text-gray-500 text-sm mt-4 text-center">No previous history found.</div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1D27] rounded-xl p-6 border border-[#252936] h-full flex flex-col">
      <h3 className="text-white font-semibold mb-6">Patient History</h3>
      
      <div className="relative border-l-2 border-[#252936] ml-3 flex-1 flex flex-col gap-6">
        {timelineData.map((visit, idx) => (
          <div 
            key={idx} 
            className="relative pl-6"
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {/* Timeline dot */}
            <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-[#1A1D27] ${idx === 0 ? 'bg-[#10B981]' : 'bg-gray-500'}`}></div>
            
            <div className="cursor-pointer">
              <span className="text-xs font-semibold text-gray-500">{visit.date}</span>
              <h4 className={`font-medium ${idx === 0 ? 'text-white' : 'text-gray-300'}`}>{visit.diagnosis}</h4>
            </div>

            <AnimatePresence>
              {hoveredIdx === idx && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-6 top-14 z-10 w-[240px] bg-[#252936] border border-gray-700 p-3 rounded-lg shadow-xl"
                >
                  <div className="text-xs text-gray-400 mb-1">Seen by {visit.doctor}</div>
                  <p className="text-sm text-gray-200">{visit.notes}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientTimeline;
