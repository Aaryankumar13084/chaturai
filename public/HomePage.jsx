import React, { useState, useRef, useEffect } from 'react';
import Header from './comp/Header';
import Aichats from './comp/Aichats';
import Userchat from './comp/Userchat';

// API Keys - In production, use environment variables
const GEMINI_API_KEYS = [
  'AIzaSyDz3YIF97oOAc6DfKDESwV1Kv_PqQnOvFQ',
  'AIzaSyBbnp5cWE5dPYmxQZMbJ3mKwq2fcqjLCno',
  'AIzaSyDLEO_ekHu_HUwZz82QfmGqiKUny_Oxz-U'
];

// Enhanced common responses with variations
const COMMON_RESPONSES = {
  'hi': 'Hi there! How can I help you today?',
  'hello': 'Hello! What can I do for you?',
  'hey': 'Hey! How can I assist you?',
  'how are you': "I'm just a program, but I'm functioning perfectly! How can I help?",
  'how are you doing': "I don't have feelings, but I'm ready to help! What do you need?",
  "what's up": "Not much, just waiting to help you! What's on your mind?",
  'hi there': 'Hi there! What brings you here today?'
};

const HomePage = () => {
  // State management
  const [inputValue, setInputValue] = useState('');
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Enhanced cached response checker
  const getCachedResponse = (prompt) => {
    const lowerPrompt = prompt.toLowerCase().trim();
    
    // Check exact matches first
    if (COMMON_RESPONSES[lowerPrompt]) {
      return COMMON_RESPONSES[lowerPrompt];
    }
    
    // Check for partial matches
    for (const [key, response] of Object.entries(COMMON_RESPONSES)) {
      if (lowerPrompt.includes(key)) {
        return response;
      }
    }
    
    return null;
  };

  // Robust API call with key rotation and retries
  const getAnswer = async (prompt) => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    
    // Add user message immediately
    setChats(prev => [...prev, { sender: 'user', text: prompt }]);
    setInputValue('');

    // Check cache before API call
    const cachedResponse = getCachedResponse(prompt);
    if (cachedResponse) {
      setTimeout(() => {
        setChats(prev => [...prev, { sender: 'bot', text: cachedResponse }]);
        setIsLoading(false);
      }, 500); // Small delay for natural feel
      return;
    }

    let retries = 0;
    const maxRetries = GEMINI_API_KEYS.length * 2;
    let lastError = null;

    while (retries < maxRetries) {
      const apiKey = GEMINI_API_KEYS[currentKeyIndex];
      
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }]
            })
          }
        );

        if (response.status === 429) {
          // Rate limited - rotate key and retry
          setCurrentKeyIndex((prev) => (prev + 1) % GEMINI_API_KEYS.length);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
          retries++;
          continue;
        }

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
          throw new Error('Invalid response structure from API');
        }

        const answer = data.candidates[0].content.parts[0].text;
        setChats(prev => [...prev, { sender: 'bot', text: answer }]);
        
        // Rotate key after successful request
        setCurrentKeyIndex((prev) => (prev + 1) % GEMINI_API_KEYS.length);
        setIsLoading(false);
        return;

      } catch (error) {
        lastError = error;
        console.error(`Attempt ${retries + 1} failed:`, error);
        
        // Rotate key on error
        setCurrentKeyIndex((prev) => (prev + 1) % GEMINI_API_KEYS.length);
        retries++;
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
      }
    }

    // All attempts failed
    setIsLoading(false);
    setError('All API keys are currently unavailable. Please try again later.');
    setChats(prev => [
      ...prev,
      { 
        sender: 'bot', 
        text: "I'm having trouble connecting right now. You can try again in a little while, or ask me something else."
      }
    ]);
  };

  // Auto-scroll and focus management
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (!isLoading) inputRef.current?.focus();
  }, [chats, isLoading]);

  // Input handling
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      getAnswer(inputValue.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <Header />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-7 space-y-4">
        {chats.map((chat, index) => (
          chat.sender === 'user' ? (
            <Userchat 
              key={`user-${index}-${chat.text}`} 
              usertext={chat.text} 
            />
          ) : (
            <Aichats 
              key={`bot-${index}-${chat.text}`} 
              text={chat.text} 
            />
          )
        ))}

        {isLoading && (
          <div className="flex items-center p-4">
            <div className="flex space-x-2">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i}
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            placeholder="Type your message..."
            aria-label="Type your message"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default HomePage;