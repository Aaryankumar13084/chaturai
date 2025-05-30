import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Header from './comp/Header';
import Aichats from './comp/Aichats';
import Userchat from './comp/Userchat';

// Multiple API Keys
const GEMINI_API_KEYS = [
  'AIzaSyDLEO_ekHu_HUwZz82QfmGqiKUny_Oxz-',
  'AIzaSyXXXXXX_Another_Key_1234567',
  'AIzaSyDLEO_ekHu_HUwZz82QfmGqiKUny_Oxz-U'
];

const HomePage = () => {
  // State management
  const [inputValue, setInputValue] = useState('');
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // API call to Gemini with retry logic
  const getanswer = async (prompt) => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setChats((prev) => [...prev, { sender: 'user', text: prompt }]);
    setInputValue('');

    let success = false;

    for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
      const apiKey = GEMINI_API_KEYS[i];

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

        if (!response.ok) {
          console.warn(`API Key ${i + 1} failed with status: ${response.status}`);
          continue; // Try next key
        }

        const data = await response.json();

        if (!data.candidates?.[0]?.content) {
          console.warn(`API Key ${i + 1} returned invalid structure`);
          continue; // Try next key
        }

        const answer = data.candidates[0].content.parts[0].text;
        setChats((prev) => [...prev, { sender: 'bot', text: answer }]);
        success = true;
        break; // Exit loop if successful
      } catch (error) {
        console.error(`API Key ${i + 1} error:`, error);
        // Try next key
      }
    }

    if (!success) {
      setChats((prev) => [
        ...prev,
        { sender: 'bot', text: 'Sorry, all API keys failed. Please try again later.' }
      ]);
    }

    setIsLoading(false);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue.trim() && !isLoading) {
      getanswer(inputValue.trim());
    }
  };

  return (
    <div className="flex flex-col pt-10 h-[97vh] bg-gray-900">
      {/* Header Section */}
      <Header />

      {/* Chat Display Area */}
      <div className="flex-1 overflow-y-auto p-7 space-y-4">
        {chats.map((chat, index) =>
          chat.sender === 'user' ? (
            <Userchat key={index} usertext={chat.text} />
          ) : (
            <Aichats key={index} text={chat.text} />
          )
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center p-4">
            <div className="flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
            </div>
          </div>
        )}

        <div ref={chatEndRef}></div>
      </div>

      {/* Input Section */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            placeholder="Type your message..."
            aria-label="Type your message"
          />

          <button
            onClick={() => inputValue.trim() && !isLoading && getanswer(inputValue.trim())}
            disabled={isLoading || !inputValue.trim()}
            className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    </div>
  );
};

export default HomePage;