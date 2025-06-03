import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import CodeBlock from './CodeBlock';

const Aichats = ({ text }) => {
  // Enhanced regex to handle markdown code blocks
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
      content: match[2].trim()
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
              <ReactMarkdown
                key={`text-${index}`}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  p: ({node, ...props}) => <p className="whitespace-pre-wrap" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2" {...props} />,
                  li: ({node, ...props}) => <li className="my-1" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                  em: ({node, ...props}) => <em className="italic" {...props} />,
                  code({node, inline, className, children, ...props}) {
                    if (inline) {
                      return (
                        <code className="bg-gray-700 px-1 py-0.5 rounded text-sm" {...props}>
                          {children}
                        </code>
                      );
                    }
                    return null; // Block code handled by CodeBlock component
                  }
                }}
              >
                {part.content}
              </ReactMarkdown>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Aichats;