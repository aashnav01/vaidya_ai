import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PatientTimeline from './PatientTimeline';

const PatientCard = ({ patient }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRiskColor = (level) => {
    switch (level) {
      case 'red': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'amber': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'green': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <motion.div 
      layout
      onClick={() => setIsExpanded(!isExpanded)}
      className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl overflow-hidden cursor-pointer hover:border-gray-600 transition-colors"
    >
      <motion.div layout className="p-5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-bold text-white">{patient.name}</h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getRiskColor(patient.riskLevel)}`}>
              {patient.riskLevel} Risk
            </span>
          </div>
          <div className="text-sm text-gray-400 mb-3">
            {patient.age}{patient.gender} • {patient.id}
          </div>
          <div className="flex flex-wrap gap-2">
            {patient.conditions.map((cond, idx) => (
              <span key={idx} className="bg-[var(--color-bg-elevated)] text-gray-300 px-2 py-1 rounded text-xs">
                {cond}
              </span>
            ))}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-gray-500 font-medium mb-1">Last Visit</div>
          <div className="text-sm text-gray-300">{patient.lastVisit}</div>
          <div className="text-xs text-[#10B981] mt-1">{patient.diagnosis}</div>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-[var(--color-border)]"
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
