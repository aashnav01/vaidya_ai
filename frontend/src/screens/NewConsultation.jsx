import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import MicButton from '../components/MicButton';
import SkeletonCard from '../components/SkeletonCard';
import SOAPNote from '../components/SOAPNote';
import PatientTimeline from '../components/PatientTimeline';
import RiskScore from '../components/RiskScore';
import DrugInteractions from '../components/DrugInteractions';
import JanAushadhi from '../components/JanAushadhi';
import { processConsultation } from '../api';

const NewConsultation = () => {
  const [patientId, setPatientId] = useState('');
  const [status, setStatus] = useState('idle'); // idle | processing | complete
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleRecordingComplete = async (audioBlob) => {
    setStatus('processing');
    try {
      const data = await processConsultation(audioBlob, patientId);
      setResult(data);
      setStatus('complete');
    } catch (error) {
      console.error(error);
      setStatus('idle');
    }
  };

  const handleSave = async () => {
    setSaved(true);
    
    // Generate PDF
    const element = document.getElementById('consultation-results');
    if (element) {
      const opt = {
        margin:       0.5,
        filename:     `Consultation_${patientId || 'Patient'}_${new Date().toISOString().split('T')[0]}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#0F1117' },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(element).save();
    }

    setTimeout(() => {
      setStatus('idle');
      setResult(null);
      setSaved(false);
      setPatientId('');
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl mx-auto flex flex-col items-center pt-12"
          >
            <div className="w-full relative mb-12">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.3-4.3"/>
                </svg>
              </div>
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Patient name or ID (optional)..."
                className="w-full bg-[#1A1D27] border border-[#252936] rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all text-lg shadow-inner"
              />
            </div>
            
            <MicButton onRecordingComplete={handleRecordingComplete} />
          </motion.div>
        )}

        {status === 'processing' && (
          <motion.div 
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SkeletonCard />
          </motion.div>
        )}

        {status === 'complete' && result && (
          <motion.div 
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            <div id="consultation-results" className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 bg-[#0F1117] rounded-xl">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#1A1D27] rounded-xl p-6 border border-[#252936]">
                  <SOAPNote data={result.soap} />
                </div>
                <DrugInteractions interactions={result.drugInteractions} />
                <JanAushadhi alternatives={result.janAushadhi} />
              </div>
              
              <div className="space-y-6">
                <RiskScore score={result.riskScore} />
                <div className="h-[400px]">
                  <PatientTimeline />
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saved}
                className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
                  saved ? 'bg-emerald-600 text-white cursor-default' : 'bg-[#10B981] hover:bg-[#059669] text-white hover:shadow-emerald-500/20'
                }`}
              >
                {saved ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                    Saved & Downloaded!
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/>
                      <polyline points="7 3 7 8 15 8"/>
                    </svg>
                    Save & Download PDF
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewConsultation;
