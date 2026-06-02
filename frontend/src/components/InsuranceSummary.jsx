import React, { useState } from 'react';
import { motion } from 'framer-motion';

const InsuranceSummary = ({ summary }) => {
  const [copied, setCopied] = useState(false);

  if (!summary) return null;

  const handleCopy = () => {
    const text = `
Insurance Pre-Authorization Summary
-----------------------------------
ICD-10 Code: ${summary.icd10Code}
Diagnosis: ${summary.diagnosisDescription}
Onset Date: ${summary.onsetDate}
Emergency: ${summary.isEmergency ? 'Yes' : 'No'}
Pre-Existing: ${summary.preExistingConditions?.join(', ') || 'None'}
Proposed Procedures: ${summary.proposedProcedures?.join(', ') || 'None'}

Estimated Costs (INR)
- Consultation: ₹${summary.estimatedCost?.consultation || 0}
- Investigations: ₹${summary.estimatedCost?.investigations || 0}
- Medicines: ₹${summary.estimatedCost?.medicines || 0}
- Total: ₹${summary.estimatedCost?.total || 0}

Pre-Auth Required: ${summary.preAuthRequired ? 'Yes' : 'No'}

TPA Notes:
${summary.tpaReadyNotes}
    `.trim();
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB] bg-[#F8F9FA]">
        <h3 className="text-[#111827] font-medium text-lg flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
          Insurance & TPA Summary
        </h3>
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
          summary.preAuthRequired 
            ? 'bg-amber-50 text-[#D97706] border-amber-200' 
            : 'bg-emerald-50 text-[#059669] border-emerald-200'
        }`}>
          {summary.preAuthRequired ? 'Pre-Auth Required' : 'Pre-Auth Not Required'}
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#F8F9FA] p-3 rounded-lg border border-[#E5E7EB]">
            <span className="text-xs text-[#6B7280] font-medium uppercase tracking-wider block mb-1">ICD-10 Code</span>
            <span className="text-[#111827] text-2xl font-semibold">{summary.icd10Code}</span>
          </div>
          <div className="bg-[#F8F9FA] p-3 rounded-lg border border-[#E5E7EB]">
            <span className="text-xs text-[#6B7280] font-medium uppercase tracking-wider block mb-1">Primary Diagnosis</span>
            <span className="text-[#111827] font-medium line-clamp-2">{summary.diagnosisDescription}</span>
          </div>
        </div>

        <div className="text-sm text-[#374151] grid grid-cols-2 gap-2">
          <div><span className="text-[#6B7280]">Onset Date:</span> {summary.onsetDate}</div>
          <div><span className="text-[#6B7280]">Emergency:</span> {summary.isEmergency ? 'Yes' : 'No'}</div>
          <div className="col-span-2">
            <span className="text-[#6B7280]">Pre-Existing:</span> {summary.preExistingConditions?.join(', ') || 'None'}
          </div>
          <div className="col-span-2">
            <span className="text-[#6B7280]">Procedures:</span> {summary.proposedProcedures?.join(', ') || 'None'}
          </div>
        </div>

        <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F8F9FA] text-[#6B7280] font-medium uppercase text-xs">
              <tr>
                <th className="px-4 py-2 border-b border-[#E5E7EB]">Cost Breakdown</th>
                <th className="px-4 py-2 border-b border-[#E5E7EB] text-right">Estimated (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              <tr>
                <td className="px-4 py-2 text-[#374151]">Consultation</td>
                <td className="px-4 py-2 text-right font-medium text-[#111827]">₹{summary.estimatedCost?.consultation || 0}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-[#374151]">Investigations</td>
                <td className="px-4 py-2 text-right font-medium text-[#111827]">₹{summary.estimatedCost?.investigations || 0}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-[#374151]">Medicines</td>
                <td className="px-4 py-2 text-right font-medium text-[#111827]">₹{summary.estimatedCost?.medicines || 0}</td>
              </tr>
              <tr className="bg-[#F8F9FA]">
                <td className="px-4 py-3 font-semibold text-[#111827]">Total Estimated Cost</td>
                <td className="px-4 py-3 text-right font-bold text-[#0D9488] text-base">₹{summary.estimatedCost?.total || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-[#F3F4F6] p-4 rounded-lg border border-[#E5E7EB]">
          <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">TPA Ready Notes</h4>
          <p className="text-sm text-[#374151] leading-relaxed">{summary.tpaReadyNotes}</p>
        </div>

        <button 
          onClick={handleCopy}
          className="w-full py-2.5 rounded-lg border border-[#E5E7EB] font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#F8F9FA] transition-colors text-[#111827]"
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span className="text-[#059669]">Copied to Clipboard</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              Copy for TPA
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default InsuranceSummary;
