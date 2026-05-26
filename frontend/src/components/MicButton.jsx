import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MicButton = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 64; // Low res for thick bars
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      drawWaveform();
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      // Fallback for mock demo if mic access is denied
      setIsRecording(true);
      setTimeout(() => stopRecording(), 3000);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      
      // Center visualization vertically
      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        
        ctx.fillStyle = '#EF4444'; // Red for recording
        ctx.fillRect(x, canvas.height / 2 - barHeight / 2, barWidth, barHeight);
        
        x += barWidth + 2;
      }
    };
    
    draw();
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.button
        onClick={isRecording ? stopRecording : startRecording}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.1 }}
        className={`relative rounded-full flex items-center justify-center focus:outline-none ${
          isRecording ? 'w-[300px] h-24 bg-[var(--color-bg-card)] border border-red-500/30' : 'w-[120px] h-[120px] bg-[var(--color-bg-card)] border border-[var(--color-border)]'
        }`}
        style={!isRecording ? {
          animation: 'breathing-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          boxShadow: '0 0 30px rgba(16, 185, 129, 0.15), inset 0 0 20px rgba(16, 185, 129, 0.1)'
        } : {
          animation: 'ripple-glow 2s cubic-bezier(0, 0.2, 0.8, 1) infinite',
        }}
        layout
      >
        <AnimatePresence mode="wait">
          {!isRecording ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key="recording"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center w-full px-6 justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                <span className="font-mono text-red-500 font-medium">{formatTime(recordingTime)}</span>
              </div>
              <canvas ref={canvasRef} width="120" height="40" className="opacity-80" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      
      <motion.p 
        layout
        className={`mt-6 text-sm font-medium ${isRecording ? 'text-red-400' : 'text-gray-400'}`}
      >
        {isRecording ? 'Tap to stop recording' : 'Start Consultation'}
      </motion.p>
    </div>
  );
};

export default MicButton;
