import React, { useState, useRef, useEffect } from 'react';
import Header from './comp/Header';
import Aichats from './comp/Aichats';
import Userchat from './comp/Userchat';

// Multiple API Keys - Consider using environment variables in production
const GEMINI_API_KEYS = [
  'AIzaSyDz3YIF97oOAc6DfKDESwV1Kv_PqQnOvFQ',
  'AIzaSyBbnp5cWE5dPYmxQZMbJ3mKwq2fcqjLCno',
  'AIzaSyDLEO_ekHu_HUwZz82QfmGqiKUny_Oxz-U'
];

// Cache for common responses
const COMMON_RESPONSES = {
  'hi': 'Hi there! How can I help you today?',
  'hello': 'Hello! What can I do for you?',
  'how are you': "I'm an AI assistant, so I don't have feelings, but I'm functioning well! How can I help you today?",
  'what can you do': 'I can answer questions, help with research, and assist with various topics. What would you like to know?'
};

const HomePage = () => {
  // State management
  const [inputValue, setInputValue] = useState('');
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const [usageCount, setUsageCount] = useState(0);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Check cached responses first
  const getCachedResponse = (prompt) => {
    const lowerPrompt = prompt.toLowerCase().trim();
    return COMMON_RESPONSES[lowerPrompt] || null;
  };

  // API call to Gemini with retry logic and key rotation
  const getAnswer = async (prompt) => {
    if (!prompt.trim()) return;

    // Check cache first
    const cachedResponse = getCachedResponse(prompt);
    if (cachedResponse) {
      setChats(prev => [...prev, 
        { sender: 'user', text: prompt },
        { sender: 'bot', text: cachedResponse }
      ]);
      return;
    }

    setIsLoading(true);
    setError(null);
    setChats(prev => [...prev, { sender: 'user', text: prompt }]);
    setInputValue('');

    let lastError = null;
    let retryDelay = 1000; // Initial retry delay

    // Try each key with exponential backoff
    for (let attempts = 0; attempts < GEMINI_API_KEYS.length * 2; attempts++) {
      const apiKey = GEMINI_API_KEYS[currentKeyIndex];

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          }
        );

        if (response.status === 429) { // Rate limited
          console.warn(`Rate limited on key ${currentKeyIndex + 1}, delaying...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retryDelay *= 2; // Exponential backoff
          continue;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          lastError = new Error(errorData.message || `API request failed with status ${response.status}`);
          continue;
        }

        const data = await response.json();

        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
          lastError = new Error('Invalid response structure from API');
          continue;
        }

        const answer = data.candidates[0].content.parts[0].text;
        setChats(prev => [...prev, { sender: 'bot', text: answer }]);
        setUsageCount(prev => prev + 1);
        
        // Rotate key after every 3 successful requests
        if (usageCount >= 2) {
          setCurrentKeyIndex((prev) => (prev + 1) % GEMINI_API_KEYS.length);
          setUsageCount(0);
        }
        
        return; // Success - exit the function
      } catch (error) {
        lastError = error;
        console.error(`API Key ${currentKeyIndex + 1} error:`, error);
        
        // Rotate to next key on error
        setCurrentKeyIndex((prev) => (prev + 1) % GEMINI_API_KEYS.length);
        setUsageCount(0);
      }
    }

    // If all attempts failed
    setError('Failed to get response after multiple attempts. Please try again later.');
    setChats(prev => [
      ...prev,
      { 
        sender: 'bot', 
        text: 'Sorry, I encountered an error processing your request. Please try a different question or try again later.' 
      }
    ]);
    
    setIsLoading(false);
  };

  // Auto-scroll to bottom and focus input
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [chats, isLoading]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      getAnswer(inputValue.trim());
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header Section */}
      <Header />

      {/* Chat Display Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-7 space-y-4">
        {chats.map((chat, index) =>
          chat.sender === 'user' ? (
            <Userchat key={`user-${index}-${Date.now()}`} usertext={chat.text} />
          ) : (
            <Aichats key={`bot-${index}-${Date.now()}`} text={chat.text} />
          )
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center p-4">
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={`dot-${i}`}
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Section */}
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