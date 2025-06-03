import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import CodeBlock from './CodeBlock';

const Aichats = ({ text }) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]+?)\n```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index)
      });
    }
    parts.push({
      type: 'code',
      language: match[1] || '',
      content: match[2].trim()
    });
    lastIndex = match.index + match[0].length;
  }

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
                className="text-white"
                components={{
                  p: (props) => <p className="whitespace-pre-wrap text-white" {...props} />,
                  ul: (props) => <ul className="list-disc pl-5 my-2 text-white" {...props} />,
                  ol: (props) => <ol className="list-decimal pl-5 my-2 text-white" {...props} />,
                  li: (props) => <li className="my-1 text-white" {...props} />,
                  strong: (props) => <strong className="font-semibold text-white" {...props} />,
                  em: (props) => <em className="italic text-white" {...props} />,
                  h1: (props) => <h1 className="text-2xl font-bold my-2 text-white" {...props} />,
                  h2: (props) => <h2 className="text-xl font-bold my-2 text-white" {...props} />,
                  h3: (props) => <h3 className="text-lg font-bold my-2 text-white" {...props} />,
                  code({ inline, className, children, ...props }) {
                    if (inline) {
                      return (
                        <code className="bg-gray-700 px-1 py-0.5 rounded text-sm text-white" {...props}>
                          {children}
                        </code>
                      );
                    }
                    return null;
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