import React from 'react';
import ReactMarkdown from 'react-markdown';

const Aichats = ({ text }) => {
  return (
    <div className="flex items-start ml-1">
      <div className="bg-blue-600 text-white p-2 rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className="flex-1 bg-gray-800 p-4 rounded-lg text-white">
        <ReactMarkdown className="prose prose-invert max-w-none">
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default Aichats;