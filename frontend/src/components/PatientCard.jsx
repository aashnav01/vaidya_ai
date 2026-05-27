import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PatientTimeline from './PatientTimeline';

const PatientCard = ({ patient }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRiskColor = (level) => {
    switch (level) {
      case 'red': return 'bg-red-50 text-[#DC2626] border-red-200';
      case 'amber': return 'bg-amber-50 text-[#D97706] border-amber-200';
      case 'green': return 'bg-emerald-50 text-[#059669] border-emerald-200';
      default: return 'bg-gray-50 text-[#6B7280] border-gray-200';
    }
  };

  const getRiskBorderColor = (level) => {
    switch (level) {
      case 'red': return 'border-l-[#DC2626]';
      case 'amber': return 'border-l-[#D97706]';
      case 'green': return 'border-l-[#059669]';
      default: return 'border-l-[#E5E7EB]';
    }
  };

  return (
    <motion.div 
      layout
      onClick={() => setIsExpanded(!isExpanded)}
      className={`bg-white border border-[#E5E7EB] border-l-4 ${getRiskBorderColor(patient.riskLevel)} rounded-xl overflow-hidden cursor-pointer hover:border-[#D1D5DB] transition-colors`}
    >
      <motion.div layout className="p-5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-medium text-[#111827]">{patient.name}</h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getRiskColor(patient.riskLevel)}`}>
              {patient.riskLevel} Risk
            </span>
          </div>
          <div className="text-sm text-[#6B7280] mb-3">
            {patient.age}{patient.gender} • {patient.id}
          </div>
          <div className="flex flex-wrap gap-2">
            {patient.conditions.map((cond, idx) => (
              <span key={idx} className="bg-[#F3F4F6] text-[#374151] px-2 py-1 rounded text-xs">
                {cond}
              </span>
            ))}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-[#6B7280] font-medium mb-1">Last Visit</div>
          <div className="text-sm text-[#374151]">{patient.lastVisit}</div>
          <div className="text-xs text-[#0D9488] mt-1">{patient.diagnosis}</div>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-[#E5E7EB]"
          >
            <div className="p-5">
              <PatientTimeline />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PatientCard;
