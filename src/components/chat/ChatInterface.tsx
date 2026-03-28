import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Sparkles,
  Share2,
  BookOpen,
  Lightbulb,
  ChevronLeft,
  Mic,
  MicOff,
  Plus,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { StreamingMessage } from '../ai/ActivityFeed';
import { ProcessSection } from '../ai/ProcessSection';
import { MinimalStatus } from '../ai/MinimalStatus';
import { MessageContent } from '../ai/MessageContent';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  thinkingChain?: any[];
  toolChain?: any[];
  activities?: any[];
}

interface ChatInterfaceProps {
  messages: Message[];
  message: string;
  setMessage: (message: string) => void;
  handleSendMessage: () => void;
  isLoading: boolean;
  suggestedQueries: string[];
  liveData: any;
  streamingResponse: string;
  isProcessing: boolean;
  currentThinking: string;
  thinkingChain: any[];
  toolChain: any[];
  finalAnswerStarted: boolean;
  liveActivity: any;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

// Helper function to get time-based greeting
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// Helper function to extract first name
const getFirstName = (fullName: string | undefined): string => {
  if (!fullName) return '';
  return fullName.split(' ')[0];
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  message,
  setMessage,
  handleSendMessage,
  isLoading,
  suggestedQueries,
  liveData,
  streamingResponse,
  currentThinking,
  thinkingChain,
  toolChain,
  finalAnswerStarted,
  liveActivity,
  messagesEndRef
}) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { user, isAuthenticated } = useAuth();
  const firstName = getFirstName(user?.name);
  const greeting = getGreeting();

  // State for voice recognition
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // Use a ref to always have the latest setMessage function
  const setMessageRef = useRef(setMessage);
  setMessageRef.current = setMessage;

  // State for file uploads
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when context is loaded (from "Ask AI" button)
  useEffect(() => {
    if (liveData && inputRef.current) {
      // Small delay to ensure the UI has rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [liveData]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const validFiles: File[] = [];
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
      ];
      const allowedExtensions = ['.csv', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.gif', '.webp'];

      Array.from(files).forEach(file => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (allowedTypes.includes(file.type) || allowedExtensions.includes(extension)) {
          validFiles.push(file);
        }
      });

      if (validFiles.length > 0) {
        setUploadedFiles(prev => [...prev, ...validFiles]);
        // Add file names to the message
        const fileNames = validFiles.map(f => f.name).join(', ');
        setMessage(message + (message ? ' ' : '') + `[Attached: ${fileNames}]`);
      } else {
        alert('Please upload only Excel (.xlsx, .xls), CSV (.csv), or image files (.jpg, .png, .gif, .webp)');
      }
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove uploaded file
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN'; // Changed to Indian English for better recognition

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update the input with either final or interim transcript
        const textToSet = finalTranscript || interimTranscript;
        if (textToSet) {
          setMessageRef.current(textToSet);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access in your browser settings.');
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Toggle voice recognition
  const toggleVoiceInput = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-50 to-red-50 border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors group"
              title="Back to Dashboard"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
            </button>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold bg-gradient-to-r from-danger-600 to-rose-600 bg-clip-text text-transparent">
                Aza
              </span>
              <div className="h-8 w-px bg-gray-300" />
              <span className="text-xl font-bold bg-gradient-to-r from-danger-600 to-rose-600 bg-clip-text text-transparent">
                Aza
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <BookOpen className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area - Different layout for empty vs conversation state */}
      <div className={clsx(
        "flex-1 overflow-y-auto",
        messages.length === 0 ? "flex items-center justify-center" : "p-6"
      )}>
        {messages.length === 0 ? (
          /* Claude-style centered empty state */
          <div className="w-full max-w-2xl mx-auto px-6">
            {/* Personalized Greeting */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-danger-600" />
                <h1 className="text-3xl font-semibold text-gray-800">
                  {isAuthenticated && firstName 
                    ? `Welcome, ${firstName}`
                    : `${greeting}!`
                  }
                </h1>
              </div>
            </div>

            {/* Centered Input Box */}
            <div className="mb-6">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                <textarea
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask about sales, trends, or performance..."
                  className="w-full px-5 py-4 text-lg resize-none focus:outline-none border-none"
                  rows={1}
                />
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-1 relative">
                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".csv,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {/* File Upload Button (+) */}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Upload file (Excel, CSV, or Image)"
                    >
                      <Plus className="w-5 h-5" />
                    </button>

                    {/* Uploaded Files Preview */}
                    {uploadedFiles.length > 0 && (
                      <div className="flex items-center gap-1 ml-1">
                        {uploadedFiles.map((file, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600"
                          >
                            <span className="max-w-[80px] truncate">{file.name}</span>
                            <button
                              onClick={() => removeFile(idx)}
                              className="text-gray-400 hover:text-danger-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Voice Input Button */}
                    <button 
                      onClick={toggleVoiceInput}
                      disabled={!speechSupported}
                      className={clsx(
                        "p-2 rounded-lg transition-colors",
                        !speechSupported 
                          ? "text-gray-300 cursor-not-allowed"
                          : isListening 
                            ? "text-white bg-danger-600 animate-pulse" 
                            : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      )}
                      title={isListening ? "Stop listening" : "Voice input"}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    {isListening && (
                      <span className="text-sm text-danger-600 animate-pulse">Listening...</span>
                    )}
                    <span className="text-sm text-gray-400">Aza</span>
                    <button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isLoading}
                      className={clsx(
                        "p-2.5 rounded-full transition-all duration-200",
                        message.trim() && !isLoading
                          ? "bg-danger-600 text-white hover:bg-danger-700 shadow-md"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      )}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Horizontal Pill Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setMessage("Show me today's revenue breakdown")}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Revenue
              </button>
              <button
                onClick={() => setMessage("Analyze customer retention and loyalty")}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Customers
              </button>
              <button
                onClick={() => setMessage("What are the operational insights for this week?")}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Operations
              </button>
              <button
                onClick={() => setMessage("Give me key insights and recommendations")}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <Lightbulb className="w-4 h-4 text-purple-500" />
                Insights
              </button>
              <button
                onClick={() => setMessage("Surprise me with an interesting finding about the business")}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-danger-500" />
                Aza's pick
              </button>
            </div>

            {/* Context Indicator - Enhanced */}
            {liveData && (
              <div className="mt-6 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-rose-800">
                      Analyzing: {liveData.source || 'Dashboard metric'}
                    </p>
                    <p className="text-xs text-rose-600 mt-0.5">
                      AI context loaded from {liveData.page || 'dashboard'}
                    </p>
                  </div>
                  {liveData.data?.value && (
                    <div className="text-right">
                      <p className="text-lg font-bold text-rose-700">{liveData.data.value}</p>
                      {liveData.data?.trend && (
                        <p className={`text-xs ${liveData.data.trendType === 'positive' ? 'text-green-600' : liveData.data.trendType === 'negative' ? 'text-red-600' : 'text-gray-500'}`}>
                          {liveData.data.trend}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <div key={msg.id}>
                {/* Show ProcessSection ABOVE the message for assistant messages */}
                {msg.role === 'assistant' && ((msg.thinkingChain && msg.thinkingChain.length > 0) || (msg.toolChain && msg.toolChain.length > 0)) && (() => {
                  console.log('Rendering ProcessSection for message:', msg.id, 'with chains:', msg.thinkingChain?.length, msg.toolChain?.length);
                  return (
                    <div className="flex justify-start mb-2">
                      <div className="max-w-4xl w-full">
                        <ProcessSection 
                          thinkingChain={msg.thinkingChain || []}
                          toolChain={msg.toolChain || []}
                          isProcessing={false}
                        />
                      </div>
                    </div>
                  );
                })()}
                <div
                  className={clsx(
                    "flex",
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={clsx(
                      "max-w-[80%] rounded-lg px-4 py-3",
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-danger-600 to-rose-600 text-white'
                        : 'bg-white border border-gray-200'
                    )}
                  >
                    <div className={clsx(
                      "text-sm",
                      msg.role === 'user' ? 'text-white' : ''
                    )}>
                      <MessageContent content={msg.content} isUser={msg.role === 'user'} />
                    </div>
                    <p className={clsx(
                      "text-xs mt-2",
                      msg.role === 'user' ? 'text-emerald-100' : 'text-gray-400'
                    )}>
                      {format(msg.timestamp, 'h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Minimal inline status - Shows current activity subtly */}
            {isLoading && !streamingResponse && (
              <div className="mb-2 text-center">
                <MinimalStatus
                  activity={liveActivity.activity}
                  isActive={isLoading}
                />
              </div>
            )}

            {/* Show current thinking step (temporary display during streaming) */}
            {isLoading && currentThinking && !streamingResponse && thinkingChain.length === 0 && (
              <div className="flex justify-start">
                <div className="max-w-4xl bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-600 font-medium">Claude is thinking...</span>
                  </div>
                  <div className="text-gray-700 italic text-sm">
                    {currentThinking}
                  </div>
                </div>
              </div>
            )}

            {/* Process section - Always show ABOVE answer when present */}
            {(isLoading || finalAnswerStarted) && (thinkingChain.length > 0 || toolChain.length > 0) && (
              <div className="flex justify-start mb-2">
                <div className="max-w-4xl w-full">
                  <ProcessSection 
                    thinkingChain={thinkingChain}
                    toolChain={toolChain}
                    isProcessing={!finalAnswerStarted}
                  />
                </div>
              </div>
            )}

            {/* Show final answer BELOW process section - properly formatted response */}
            {streamingResponse && (
              <div className="flex justify-start">
                <div className="max-w-4xl w-full">
                  <StreamingMessage content={streamingResponse} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - Only shown when in conversation mode (messages exist) */}
      {messages.length > 0 && (
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask about sales, customers, trends, predictions..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={2}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
                className={clsx(
                  "px-6 py-3 rounded-lg font-medium transition-all duration-200",
                  message.trim() && !isLoading
                    ? "bg-gradient-to-r from-danger-600 to-rose-600 text-white hover:from-danger-700 hover:to-rose-700 shadow-soft"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};