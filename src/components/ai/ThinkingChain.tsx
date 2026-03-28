import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Brain } from 'lucide-react';

interface ThinkingStep {
  type: 'thinking';
  content: string;
  timestamp: number;
}

interface ToolStep {
  id: string;
  name: string;
  display_name: string;
  input: any;
  timestamp: number;
  status: 'running' | 'completed' | 'error';
  result_preview?: string;
}

interface ThinkingChainProps {
  thinkingChain: ThinkingStep[];
  toolChain: ToolStep[];
  isComplete: boolean;
  currentThinking?: string;
}

export const ThinkingChain: React.FC<ThinkingChainProps> = ({ 
  thinkingChain, 
  toolChain, 
  isComplete,
  currentThinking 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [displayText, setDisplayText] = useState('');

  // Auto-expand when thinking starts
  useEffect(() => {
    if (!isComplete && (thinkingChain.length > 0 || currentThinking)) {
      setIsExpanded(true);
    }
  }, [thinkingChain.length, currentThinking, isComplete]);

  // Handle streaming thinking text
  useEffect(() => {
    if (currentThinking) {
      setDisplayText(currentThinking);
    } else if (thinkingChain.length > 0) {
      setDisplayText(thinkingChain[thinkingChain.length - 1].content);
    }
  }, [currentThinking, thinkingChain]);

  if (thinkingChain.length === 0 && toolChain.length === 0 && !currentThinking) {
    return null;
  }

  const totalSteps = thinkingChain.length + toolChain.length;
  const completedTools = toolChain.filter(tool => tool.status === 'completed').length;
  const hasActiveThinking = !isComplete && (currentThinking || thinkingChain.length > 0);

  return (
    <div className="mb-6">
      {/* ChatGPT-style thinking box */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 ease-out shadow-sm">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              {hasActiveThinking ? (
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-gray-600 animate-thinking-pulse" />
                  <span className="text-sm font-medium text-gray-800">
                    Claude is thinking...
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Claude thought about this
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {totalSteps > 0 && (
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                {totalSteps} step{totalSteps !== 1 ? 's' : ''}
              </span>
            )}
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
            )}
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-200 animate-slide-down">
            {/* Thinking Content */}
            {(displayText || thinkingChain.length > 0) && (
              <div className="px-5 py-4 bg-white animate-fade-in-up">
                <div className="prose prose-sm max-w-none">
                  {hasActiveThinking ? (
                    <div className="text-gray-700 leading-relaxed">
                      <div className="whitespace-pre-wrap text-sm">{displayText}</div>
                      {!isComplete && (
                        <div className="flex items-center gap-2 mt-3 text-gray-500">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-thinking-pulse"></div>
                          <span className="text-xs">Thinking...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {thinkingChain.map((step, index) => (
                        <div key={index} className="text-gray-700 leading-relaxed">
                          <div className="whitespace-pre-wrap text-sm">{step.content}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Tool Steps - Only show if there are tools and expanded */}
            {toolChain.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-3 bg-gray-25">
                <div className="text-xs font-medium text-gray-600 mb-3 uppercase tracking-wider">
                  Analysis Process ({completedTools}/{toolChain.length} steps)
                </div>
                <div className="space-y-2">
                  {toolChain.map((tool, index) => {
                    // Extract file name if present in display_name
                    const fileMatch = tool.display_name?.match(/([^/]+\.xlsx?)/i);
                    const fileName = fileMatch ? fileMatch[1] : null;
                    
                    return (
                      <div 
                        key={tool.id} 
                        className={`flex items-start justify-between py-2 px-2 rounded-md transition-all ${
                          tool.status === 'running' ? 'bg-blue-50 border-l-2 border-blue-400' :
                          tool.status === 'completed' ? 'hover:bg-gray-50' :
                          'hover:bg-red-50'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-700">
                              {tool.display_name || tool.name}
                            </span>
                            {tool.status === 'running' && (
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                              </div>
                            )}
                          </div>
                          {fileName && (
                            <div className="text-xs text-gray-500 mt-0.5 pl-4">
                              File: {fileName}
                            </div>
                          )}
                          {tool.result_preview && tool.status === 'completed' && (
                            <div className="text-xs text-gray-500 mt-1 pl-4 truncate">
                              {tool.result_preview}
                            </div>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 ${
                          tool.status === 'completed' ? 'bg-green-100 text-green-700' :
                          tool.status === 'error' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {tool.status === 'running' ? 'Processing' : 
                           tool.status === 'completed' ? 'Complete' : 
                           'Error'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};