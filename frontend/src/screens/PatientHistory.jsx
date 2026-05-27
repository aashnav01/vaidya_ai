import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getPatients } from '../api';
import PatientCard from '../components/PatientCard';

const PatientHistory = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const data = await getPatients();
        setPatients(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.id.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = filterRisk === 'All' || p.riskLevel.toLowerCase() === filterRisk.toLowerCase();
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-white">Patient History</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select 
            value={filterRisk} 
            onChange={(e) => setFilterRisk(e.target.value)}
            className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-[#10B981] transition-colors"
          >
            <option value="All">All Risks</option>
            <option value="Red">Red (High Risk)</option>
            <option value="Amber">Amber (Medium Risk)</option>
            <option value="Green">Green (Low Risk)</option>
          </select>

          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID..."
              className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] transition-colors"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 border-[var(--color-bg-card)] border-t-[#10B981] animate-spin"></div>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {filteredPatients.map(patient => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
          
          {filteredPatients.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              No patients found matching your filters.
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default PatientHistory;
