import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center py-20 px-6">
      <div className="w-full bg-[#1A1D27] rounded-xl p-6 border border-[#252936] shadow-lg mb-6">
        <div className="h-6 w-1/3 skeleton-shimmer rounded mb-6"></div>
        <div className="space-y-4">
          <div className="h-4 w-full skeleton-shimmer rounded"></div>
          <div className="h-4 w-5/6 skeleton-shimmer rounded"></div>
          <div className="h-4 w-4/6 skeleton-shimmer rounded"></div>
        </div>
        <div className="mt-8 pt-6 border-t border-[#252936]">
          <div className="flex gap-4">
             <div className="h-20 w-20 skeleton-shimmer rounded-full"></div>
             <div className="flex-1 space-y-3 py-2">
                <div className="h-4 w-1/2 skeleton-shimmer rounded"></div>
                <div className="h-4 w-1/3 skeleton-shimmer rounded"></div>
             </div>
          </div>
        </div>
      </div>
      <p className="text-[#10B981] font-medium animate-pulse flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        Analyzing consultation with Gemini 2.0 Flash...
      </p>
    </div>
  );
};

export default SkeletonCard;
