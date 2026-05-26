import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SplashScreen = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 600); // Wait for exit animation
    }, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0A0F1C 0%, #0D1425 40%, #111B33 100%)' }}
        >
          {/* Animated background rings */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0.4 }}
                animate={{ scale: 2.5 + i * 0.5, opacity: 0 }}
                transition={{
                  duration: 2.5,
                  delay: i * 0.3,
                  repeat: Infinity,
                  ease: 'easeOut'
                }}
                className="absolute w-40 h-40 rounded-full border border-emerald-500/20"
              />
            ))}
          </div>

          {/* Logo & Text */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Stethoscope icon */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-6"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
                  <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
                  <circle cx="20" cy="10" r="2"/>
                </svg>
              </div>
            </motion.div>

            <h1 className="text-5xl font-bold text-white tracking-tight">
              Vaidya<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">AI</span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400 text-sm mt-3 tracking-widest uppercase"
            >
              Intelligent Clinical Assistant
            </motion.p>

            {/* Loading bar */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '200px' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              className="h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full mt-8"
            />
          </motion.div>

          {/* Bottom text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 text-gray-500 text-xs"
          >
            Powered by Gemini + MongoDB Atlas
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
