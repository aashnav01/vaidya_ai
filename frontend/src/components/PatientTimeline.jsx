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
      <div className="bg-white rounded-xl p-6 border border-[#E5E7EB] h-full flex flex-col">
        <h3 className="text-[#111827] font-medium mb-6">Patient History</h3>
        <div className="text-[#6B7280] text-sm mt-4 text-center">No previous history found.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-[#E5E7EB] h-full flex flex-col">
      <h3 className="text-[#111827] font-medium mb-6">Patient History</h3>
      
      <div className="relative border-l-2 border-[#E5E7EB] ml-3 flex-1 flex flex-col gap-6">
        {timelineData.map((visit, idx) => (
          <div 
            key={idx} 
            className="relative pl-6"
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {/* Timeline dot */}
            <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-white ${idx === 0 ? 'bg-[#0D9488]' : 'bg-[#D1D5DB]'}`}></div>
            
            <div className="cursor-pointer">
              <span className="text-xs font-semibold text-[#9CA3AF]">{visit.date}</span>
              <h4 className={`font-medium ${idx === 0 ? 'text-[#111827]' : 'text-[#374151]'}`}>{visit.diagnosis}</h4>
            </div>

            <AnimatePresence>
              {hoveredIdx === idx && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-6 top-14 z-10 w-[240px] bg-white border border-[#E5E7EB] p-3 rounded-lg shadow-lg"
                >
                  <div className="text-xs text-[#6B7280] mb-1">Seen by {visit.doctor}</div>
                  <p className="text-sm text-[#374151]">{visit.notes}</p>
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
