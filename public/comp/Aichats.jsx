import React from 'react';
import CodeBlock from './CodeBlock';

const Aichats = ({ text }) => {
  // Enhanced regex to handle:
  // 1. Regular code blocks (```code```)
  // 2. Inline code with asterisks (**`code`**)
  // 3. Numbered/bullet points with code
  const codeBlockRegex = /(?:```|\*\*`)(\w+)?\n?([\s\S]+?)(?:```|\*\*`)/g;
  
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
    
    // Clean the code content
    let cleanContent = match[2]
      .replace(/^\*\*/, '')      // Remove leading **
      .replace(/\*\*$/, '')      // Remove trailing **
      .replace(/^\*\s*/, '')     // Remove leading * and spaces
      .replace(/\*\s*$/, '')     // Remove trailing * and spaces
      .trim();
    
    // Handle numbered/bullet points with code
    if (cleanContent.match(/^\d+\.\s*\*\*/)) {
      cleanContent = cleanContent.replace(/^\d+\.\s*\*\*/, '').replace(/\*\*:\s*/, '');
    }

    parts.push({
      type: 'code',
      language: match[1] || '',
      content: cleanContent
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
            
            // Handle numbered/bullet points in regular text
            const lines = part.content.split('\n');
            return (
              <div key={`text-${index}`} className="whitespace-pre-wrap">
                {lines.map((line, i) => {
                  if (line.match(/^\d+\.\s*\*\*/)) {
                    const cleanLine = line
                      .replace(/^(\d+\.)\s*\*\*/, '$1 ')
                      .replace(/\*\*:\s*/, '');
                    return <p key={i}>{cleanLine}</p>;
                  }
                  return <p key={i}>{line}</p>;
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Aichats;