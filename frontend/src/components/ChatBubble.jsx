import React from 'react';

const ChatBubble = ({ message }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="bg-[#10B981] text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[75%] shadow-lg">
          <p className="text-sm font-medium">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6 w-full">
      <div className="bg-[#1A1D27] border border-[#252936] text-white p-5 rounded-2xl rounded-tl-sm max-w-[85%] shadow-lg w-full">
        {message.interpreted_as && (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#252936]">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <span className="text-xs text-gray-400 font-medium">Interpreted as: <span className="text-gray-300">{message.interpreted_as}</span></span>
          </div>
        )}
        
        <p className="text-sm leading-relaxed mb-4">{message.insight}</p>
        
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-[#252936]">
          <div className="flex gap-2">
            {message.collection_queried && (
              <span className="bg-[#252936] text-gray-300 px-2 py-1 rounded text-[10px] font-semibold tracking-wide uppercase">
                {message.collection_queried}
              </span>
            )}
            {message.count !== undefined && (
              <span className="bg-[#10B981]/20 text-[#10B981] px-2 py-1 rounded text-[10px] font-semibold tracking-wide uppercase">
                {message.count} Matches
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 opacity-70">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10B981]">
              <path d="M12 2v20"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span className="text-[10px] font-medium text-gray-400">Powered by Gemini 2.0 Flash + MongoDB Atlas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
