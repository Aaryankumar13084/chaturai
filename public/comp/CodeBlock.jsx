import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    // Final cleaning of the code before copying
    const cleanCode = code
      .replace(/^\d+\.\s*/, '')  // Remove numbered prefixes
      .replace(/^\*\*/, '')      // Remove leading **
      .replace(/\*\*$/, '')      // Remove trailing **
      .replace(/^\*\s*/, '')     // Remove leading * and spaces
      .replace(/\*\s*$/, '')     // Remove trailing * and spaces
      .trim();

    navigator.clipboard.writeText(cleanCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className="relative bg-gray-800 rounded-lg my-2">
      <div className="flex justify-between items-center bg-gray-700 px-4 py-2 rounded-t-lg">
        <span className="text-xs text-gray-300">{language || 'code'}</span>
        <button
          onClick={copyToClipboard}
          className="flex items-center space-x-1 text-xs text-gray-300 hover:text-white"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm">
        <code>
          {code.replace(/^\d+\.\s*/, '')}  {/* Remove numbered prefixes for display */}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;