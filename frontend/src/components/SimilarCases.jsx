import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { findSimilarCases } from '../api';

const SimilarCases = ({ consultationId }) => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!consultationId) return;
    setLoading(true);
    setSearched(true);
    const results = await findSimilarCases(consultationId);
    setCases(results);
    setLoading(false);
  };

  const getRiskColor = (score) => {
    if (score >= 70) return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-500' };
    if (score >= 30) return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-500' };
    return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-500' };
  };

  return (
    <div className="bg-[var(--color-bg-card)] rounded-xl p-6 border border-[var(--color-border)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <h3 className="text-white font-semibold text-lg">Atlas Vector Search</h3>
        </div>
        <span className="text-[10px] text-gray-500 font-medium bg-[var(--color-bg-base)] px-2 py-1 rounded">MongoDB AI</span>
      </div>
      
      <p className="text-gray-400 text-sm mb-4">Find past patients with similar clinical presentations using semantic AI search.</p>

      {!searched && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSearch}
          className="w-full py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all shadow-lg shadow-indigo-500/20"
        >
          🔍 Find Similar Cases
        </motion.button>
      )}

      {loading && (
        <div className="space-y-3 mt-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-lg skeleton-shimmer" />
          ))}
        </div>
      )}

      <AnimatePresence>
        {searched && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 mt-2"
          >
            {cases.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">No similar cases found. Run the database seeder or add more consultations first.</p>
              </div>
            ) : (
              cases.map((c, i) => {
                const risk = getRiskColor(c.riskScore || 0);
                const similarity = Math.round((c.score || 0) * 100);
                return (
                  <motion.div
                    key={c._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`${risk.bg} ${risk.border} border rounded-lg p-4`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${risk.dot}`} />
                          <span className="text-white font-medium text-sm truncate">
                            {c.patientName || 'Anonymous'}
                          </span>
                          <span className={`text-xs font-bold ${risk.text}`}>
                            Risk: {c.riskScore || 0}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                          {c.soap?.a || c.soap?.s || 'No assessment available'}
                        </p>
                      </div>
                      <div className="ml-3 flex flex-col items-end shrink-0">
                        <span className="text-indigo-400 font-bold text-lg">{similarity}%</span>
                        <span className="text-gray-500 text-[10px]">match</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}

            {cases.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSearch}
                className="w-full py-2 rounded-lg text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 transition-all"
              >
                ↻ Search Again
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SimilarCases;
