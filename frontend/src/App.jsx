import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import SplashScreen from './components/SplashScreen';
import NewConsultation from './screens/NewConsultation';
import AgentQuery from './screens/AgentQuery';
import PatientHistory from './screens/PatientHistory';
import Analytics from './screens/Analytics';
import ToastNotification from './components/ToastNotification';
import { checkHealth } from './api';

function App() {
  const [activeTab, setActiveTab] = useState('consultation');
  const [isLive, setIsLive] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [toasts, setToasts] = useState([]);

  const addToast = (title, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const pollHealth = async () => {
      const status = await checkHealth();
      setIsLive(status);
    };
    pollHealth();
    const interval = setInterval(pollHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'https://vaidya-ai-w6ed.onrender.com';
    const sse = new EventSource(`${API_URL}/api/patients/stream`);
    
    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'insert' && data.patient) {
          addToast(
            'New Patient Added',
            `${data.patient.name} (${data.patient.patientId}) was just saved to the database.`
          );
        }
      } catch {
        // Keep-alive SSE messages are not JSON payloads.
      }
    };

    return () => {
      sse.close();
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      <div className={`min-h-screen bg-[var(--color-bg-base)] text-[#111827] selection:bg-[#0D9488]/20 ${showSplash ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
        <div className="print:hidden">
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        
        {!isLive && (
          <div className="bg-[#FEF3C7] border-b border-[#D97706]/20 px-6 py-2 flex items-center justify-center gap-2">
            <span className="text-[#D97706] text-sm mt-0.5">⚠️</span>
            <p className="text-[#D97706] text-sm font-medium">Demo mode — connect backend to enable AI features</p>
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
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Analytics />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        <ToastNotification toasts={toasts} removeToast={removeToast} />
      </div>
    </>
  );
}

export default App;
