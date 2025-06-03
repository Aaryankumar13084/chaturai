import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import Header from './comp/Header';
import Userchat from './comp/Userchat';

const GEMINI_API_KEYS = [
  'AIzaSyDz3YIF97oOAc6DfKDESwV1Kv_PqQnOvFQ',
  'AIzaSyBbnp5cWE5dPYmxQZMbJ3mKwq2fcqjLCno',
  'AIzaSyDLEO_ekHu_HUwZz82QfmGqiKUny_Oxz-U'
];

// Helper function to extract text from React nodes
const getTextFromChildren = (children) => {
  if (typeof children === 'string') {
    return children;
  }
  
  if (Array.isArray(children)) {
    return children.map(child => getTextFromChildren(child)).join('');
  }
  
  if (children && children.props && children.props.children) {
    return getTextFromChildren(children.props.children);
  }
  
  return '';
};

const HomePage = () => {
  const [inputValue, setInputValue] = useState('');
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setChats([]);
    setInputValue('');
    setError(null);
    setIsLoading(false);
    setCurrentKeyIndex(0);
  }, []);

  const getConversationContext = () => {
    return chats
      .map(chat => `${chat.sender === 'user' ? 'User' : 'AI'}: ${chat.text}`)
      .join('\n');
  };

  const getAnswer = async (prompt) => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setChats(prev => [...prev, { sender: 'user', text: prompt }]);
    setInputValue('');

    const conversationContext = getConversationContext();
    const fullPrompt = `This is our conversation so far:\n${conversationContext}\n\nUser: ${prompt}\nAI:`;

    let retries = 0;
    const maxRetries = GEMINI_API_KEYS.length * 2;

    while (retries < maxRetries) {
      const apiKey = GEMINI_API_KEYS[currentKeyIndex];

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: fullPrompt }]
              }]
            })
          }
        );

        if (response.status === 429) {
          setCurrentKeyIndex((prev) => (prev + 1) % GEMINI_API_KEYS.length);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
          retries++;
          continue;
        }

        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);

        const data = await response.json();
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                      "I couldn't process that request. Please try again.";

        setChats(prev => [...prev, { sender: 'bot', text: answer }]);
        setCurrentKeyIndex((prev) => (prev + 1) % GEMINI_API_KEYS.length);
        setIsLoading(false);
        return;

      } catch (error) {
        console.error(`Attempt ${retries + 1} failed:`, error);
        setCurrentKeyIndex((prev) => (prev + 1) % GEMINI_API_KEYS.length);
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
      }
    }

    setIsLoading(false);
    setError('All API keys are currently unavailable. Please try again later.');
    setChats(prev => [
      ...prev,
      { 
        sender: 'bot', 
        text: "I'm having trouble connecting right now. Please try again later."
      }
    ]);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (!isLoading) inputRef.current?.focus();
  }, [chats, isLoading]);

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
    <div className="flex pt-13 flex-col h-screen bg-black text-white">
      <Header />

      <div className="flex-1 overflow-y-auto p-4 md:p-7 space-y-4">
        {chats.map((chat, index) => (
          chat.sender === 'user' ? (
            <Userchat key={`user-${index}-${chat.text}`} usertext={chat.text} />
          ) : (
            <div key={`bot-${index}-${chat.text}`} className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  AI
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-gray-700 rounded-lg p-4 text-white">
                  <ReactMarkdown 
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      p: ({ node, ...props }) => (
                        <p className="whitespace-pre-wrap my-2 leading-relaxed" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc pl-5 my-2" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal pl-5 my-2" {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="my-1" {...props} />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong className="font-semibold" {...props} />
                      ),
                      em: ({ node, ...props }) => (
                        <em className="italic" {...props} />
                      ),
                      h1: ({ node, ...props }) => (
                        <h1 className="text-2xl font-bold my-4" {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 className="text-xl font-bold my-3" {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className="text-lg font-bold my-2" {...props} />
                      ),
                      code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '');
                        
                        if (!inline) {
                          return (
                            <div className="relative bg-gray-800 rounded-lg my-2">
                              <div className="flex justify-between items-center bg-gray-700 px-4 py-2 rounded-t-lg">
                                <span className="text-xs text-white">
                                  {match?.[1] || 'code'}
                                </span>
                                <button
                                  onClick={(event) => {
                                    const codeContent = getTextFromChildren(children).replace(/\n$/, '');
                                    navigator.clipboard.writeText(codeContent)
                                      .then(() => {
                                        const button = event.currentTarget;
                                        const originalText = button.textContent;
                                        button.textContent = 'Copied!';
                                        setTimeout(() => {
                                          button.textContent = originalText;
                                        }, 2000);
                                      })
                                      .catch(err => {
                                        console.error('Failed to copy: ', err);
                                      });
                                  }}
                                  className="text-xs text-white hover:text-blue-300"
                                >
                                  Copy
                                </button>
                              </div>
                              <pre className="overflow-x-auto p-4">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            </div>
                          );
                        }
                        
                        return (
                          <code className="bg-gray-600 px-1 py-0.5 rounded text-sm" {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {chat.text}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
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