import React, { useState, useRef, useEffect } from 'react';
import ChatBubble from '../components/ChatBubble';
import { agentQuery } from '../api';
import { motion } from 'framer-motion';

const AgentQuery = () => {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      insight: 'Hello Doctor. I can query our clinical database to find patient trends, identify critical cases, or summarize recent consultations. How can I assist you today?',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text) => {
    const queryText = text || input;
    if (!queryText.trim()) return;

    const newMessages = [...messages, { role: 'user', content: queryText }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await agentQuery(queryText);
      setMessages([...newMessages, { role: 'ai', ...response }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'ai', insight: 'Error querying the database. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const chips = [
    "Show critical patients today",
    "Find similar dengue cases",
    "Blood pressure trends this week"
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col py-6 px-4">
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col">
        {messages.map((msg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChatBubble message={msg} />
          </motion.div>
        ))}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start mb-6"
          >
            <div className="bg-[var(--color-bg-card)] p-4 rounded-2xl rounded-tl-sm shadow flex gap-2 items-center">
              <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {chips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              disabled={isLoading}
              className="bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-gray-300 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about your patients..."
            disabled={isLoading}
            className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl py-4 pl-4 pr-14 text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] disabled:opacity-50 disabled:hover:bg-[#10B981] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z"/>
              <path d="M22 2 11 13"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentQuery;
