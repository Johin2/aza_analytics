import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Minimize2, Maximize2, Loader, FileText, Code, Database } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
  isStreaming?: boolean;
}

interface Activity {
  type: 'thinking' | 'file_access' | 'code_execution' | 'analyzing';
  content: string;
}

export const EnhancedChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [useSDK, setUseSDK] = useState(true); // Toggle for SDK vs regular API
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    // Fetch SDK suggestions on mount
    fetchSuggestions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSuggestions = async () => {
    try {
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const endpoint = useSDK
        ? `${apiBase}/api/claude/sdk/suggestions`
        : `${apiBase}/api/claude/suggestions`;

      const response = await fetch(endpoint);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      // Fallback suggestions
      setSuggestions([
        "What are our top 5 best-selling dishes?",
        "Analyze sales trends from the past month",
        "Compare Swiggy vs Zomato performance"
      ]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setCurrentActivity({ type: 'thinking', content: 'Processing your query...' });

    try {
      // Use SDK endpoint for enhanced capabilities
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const endpoint = useSDK
        ? `${apiBase}/api/claude/sdk/ask`
        : `${apiBase}/api/claude/ask`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage.content,
          context: {
            page: window.location.pathname,
            useSDK: useSDK
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.answer,
          timestamp: new Date(),
          sources: data.sources
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Show model used
        if (data.model) {
          console.log(`Response generated using: ${data.model}`);
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to connect to the server'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setCurrentActivity(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setIsMinimized(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'file_access':
        return <FileText className="w-3 h-3 animate-pulse" />;
      case 'code_execution':
        return <Code className="w-3 h-3 animate-pulse" />;
      case 'analyzing':
        return <Database className="w-3 h-3 animate-pulse" />;
      default:
        return <Loader className="w-3 h-3 animate-spin" />;
    }
  };

  const formatMessage = (content: string) => {
    // Basic formatting for better display
    return content.split('\n').map((line, idx) => {
      // Handle headers (lines starting with ##)
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="font-bold text-lg mt-2 mb-1">{line.substring(3)}</h3>;
      }
      // Handle bold text
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={idx} className="mb-1">
            {parts.map((part, i) => 
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
          </p>
        );
      }
      // Handle list items
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return <li key={idx} className="ml-4">{line.substring(2)}</li>;
      }
      // Handle numbered lists
      if (/^\d+\.\s/.test(line)) {
        return <li key={idx} className="ml-4">{line}</li>;
      }
      // Regular lines
      return line ? <p key={idx} className="mb-1">{line}</p> : <br key={idx} />;
    });
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
      isMinimized ? 'w-20' : 'w-96'
    }`}>
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <span className="font-semibold">
              {isMinimized ? '' : 'Claude AI Assistant'}
            </span>
            {useSDK && !isMinimized && (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded">SDK</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isMinimized && currentActivity && (
              <div className="flex items-center gap-1 text-xs">
                {getActivityIcon(currentActivity.type)}
                <span className="opacity-90">{currentActivity.content}</span>
              </div>
            )}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-white/20 p-1 rounded transition-colors"
              aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* SDK Toggle */}
            <div className="px-4 py-2 bg-gray-50 border-b">
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={useSDK}
                  onChange={(e) => {
                    setUseSDK(e.target.checked);
                    fetchSuggestions();
                  }}
                  className="rounded"
                />
                Use Claude Code SDK (Excel Analysis)
              </label>
            </div>

            {/* Messages Area */}
            <div className="h-96 overflow-y-auto p-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-indigo-400" />
                  <p className="text-sm mb-4">
                    {useSDK 
                      ? "I can analyze your Excel data directly! Ask me anything."
                      : "Ask me anything about your restaurant data!"}
                  </p>
                  
                  {/* Suggestions */}
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 mb-2">Try asking:</p>
                    {suggestions.slice(0, 3).map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left px-3 py-2 text-xs bg-white rounded-lg hover:bg-indigo-50 transition-colors border border-gray-200"
                      >
                        💡 {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] ${
                        message.role === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-gray-200'
                      } rounded-lg p-3`}>
                        <div className="flex items-start gap-2">
                          {message.role === 'assistant' && <Bot className="w-4 h-4 mt-1 flex-shrink-0" />}
                          <div className="flex-1">
                            {message.role === 'assistant' ? (
                              <div className="text-sm">
                                {formatMessage(message.content)}
                              </div>
                            ) : (
                              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                            )}
                            {message.sources && message.sources.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-xs text-gray-500">Sources:</p>
                                {message.sources.map((source, idx) => (
                                  <span key={idx} className="text-xs text-gray-400 block">
                                    📄 {source}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {message.role === 'user' && <User className="w-4 h-4 mt-1 flex-shrink-0" />}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Loader className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-gray-600">
                            {currentActivity ? currentActivity.content : 'Claude is thinking...'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t p-4 bg-white rounded-b-lg">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={useSDK 
                    ? "Ask about Excel data, sales, customers..." 
                    : "Ask me anything..."
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {useSDK 
                  ? "Powered by Claude Code SDK • Direct Excel access"
                  : "Powered by Claude • Shift+Enter for new line"
                }
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};