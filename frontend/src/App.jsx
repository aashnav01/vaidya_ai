import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import SplashScreen from './components/SplashScreen';
import NewConsultation from './screens/NewConsultation';
import AgentQuery from './screens/AgentQuery';
import PatientHistory from './screens/PatientHistory';
import { checkHealth } from './api';

function App() {
  const [activeTab, setActiveTab] = useState('consultation');
  const [isLive, setIsLive] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const pollHealth = async () => {
      const status = await checkHealth();
      setIsLive(status);
    };
    pollHealth();
    const interval = setInterval(pollHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      <div className={`min-h-screen bg-[var(--color-bg-base)] text-gray-200 selection:bg-[#10B981]/30 ${showSplash ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
        <div className="print:hidden">
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        
        {!isLive && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 flex items-center justify-center gap-2">
            <span className="text-amber-500 text-sm mt-0.5">⚠️</span>
            <p className="text-amber-400 text-sm font-medium">Demo mode — connect backend to enable AI features</p>
          </div>
        )}

        <main className="relative">
          <AnimatePresence mode="wait">
            {activeTab === 'consultation' && (
              <motion.div
                key="consultation"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <NewConsultation />
              </motion.div>
            )}
            {activeTab === 'query' && (
              <motion.div
                key="query"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <AgentQuery />
              </motion.div>
            )}
            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <PatientHistory />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}

export default App;
