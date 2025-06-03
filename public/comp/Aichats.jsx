import React from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';

const Aichats = ({ text }) => {
  // This regex matches code blocks in markdown format (```language\ncode\n```)
  const codeBlockRegex = /```(\w+)?\n([\s\S]+?)\n```/g;
  
  // Split the text into parts, separating code blocks from regular text
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before the code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index)
      });
    }
    
    // Add the code block
    parts.push({
      type: 'code',
      language: match[1] || '',
      content: match[2]
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after the last code block
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex)
    });
  }
  
  return (
    <div className="flex space-x-3">
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
          AI
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm md:text-base">
          {parts.map((part, index) => {
            if (part.type === 'code') {
              return (
                <CodeBlock 
                  key={`code-${index}`}
                  code={part.content}
                  language={part.language}
                />
              );
            }
            return (
              <p key={`text-${index}`} className="whitespace-pre-wrap">
                {part.content}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Aichats;