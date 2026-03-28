import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Sparkles, X, Loader2, Command } from 'lucide-react';
import { useCommandBar } from './CommandBarProvider';
import { useCommandBarStream } from './useCommandBarStream';
import { MessageContent } from '../ai/MessageContent';
import { MinimalStatus } from '../ai/MinimalStatus';
import { DynamicChart } from '../charts/DynamicChart';

export const CommandBar: React.FC = () => {
  const { isOpen, close, prefill } = useCommandBar();
  const {
    streamState,
    sendQuery,
    cancelStream,
    suggestions,
    currentPage,
    history,
    navigateHistory,
  } = useCommandBarStream();

  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  // Focus input when opened, apply prefill if any
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setInputValue(prefill || '');
    }
  }, [isOpen, prefill]);

  // Auto-scroll response area
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [streamState.response]);

  // Handle keyboard events in the input
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        sendQuery(inputValue.trim());
      }
    } else if (e.key === 'Escape') {
      if (streamState.isStreaming) {
        cancelStream();
      } else {
        close();
      }
    } else if (e.key === 'ArrowUp' && !streamState.isStreaming) {
      e.preventDefault();
      const prev = navigateHistory('up');
      if (prev !== null) setInputValue(prev);
    } else if (e.key === 'ArrowDown' && !streamState.isStreaming) {
      e.preventDefault();
      const next = navigateHistory('down');
      setInputValue(next || '');
    }
  }, [inputValue, sendQuery, cancelStream, close, streamState.isStreaming, navigateHistory]);

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    sendQuery(suggestion);
  };

  const hasResponse = streamState.response || streamState.isStreaming || streamState.error;
  const recentHistory = history.slice(0, 3);

  return (
    <>
      {/* Global Cmd+K listener — toggles open */}
      <GlobalShortcut />

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
              onClick={() => {
                if (streamState.isStreaming) {
                  cancelStream();
                }
                close();
              }}
            />

            {/* Command Bar Modal */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="fixed top-[20vh] left-0 right-0 mx-auto w-full max-w-[560px] z-[201] px-4"
            >
              <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                style={{
                  boxShadow: '0 0 0 1px rgba(99, 102, 241, 0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                }}>

                {/* Input Section */}
                <div className="flex items-center px-4 border-b border-gray-100">
                  <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything about your data..."
                    className="flex-1 px-3 py-3.5 text-sm text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none"
                  />
                  {streamState.isStreaming ? (
                    <button
                      onClick={cancelStream}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Stop
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-gray-400 bg-gray-100 rounded border border-gray-200">
                      <Command className="w-3 h-3" />K
                    </div>
                  )}
                </div>

                {/* Context Badge */}
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50/80 border-b border-gray-100">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-xs text-gray-500">
                    Context: <span className="text-indigo-600 font-medium">{currentPage.name}</span>
                  </span>
                </div>

                {/* Content Area */}
                <div className="max-h-[50vh] overflow-y-auto">
                  {hasResponse ? (
                    <div ref={responseRef} className="p-4 space-y-3">
                      {/* Activity indicator */}
                      {streamState.isStreaming && streamState.activity && !streamState.response && (
                        <MinimalStatus
                          activity={streamState.activity}
                          isActive={true}
                        />
                      )}

                      {/* Streaming response */}
                      {streamState.response && (
                        <div className="text-sm text-gray-800 leading-relaxed">
                          <MessageContent content={streamState.response} />
                          {streamState.chartConfig && !streamState.isStreaming && (
                            <DynamicChart config={streamState.chartConfig} />
                          )}
                        </div>
                      )}

                      {/* Inline activity during streaming */}
                      {streamState.isStreaming && streamState.response && streamState.activity && (
                        <div className="pt-1">
                          <MinimalStatus
                            activity={streamState.activity}
                            isActive={true}
                          />
                        </div>
                      )}

                      {/* Error */}
                      {streamState.error && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                          <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-red-700">{streamState.error}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 space-y-4">
                      {/* Suggestions */}
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                          Suggestions
                        </p>
                        <div className="space-y-1">
                          {suggestions.map((s, i) => (
                            <button
                              key={i}
                              onClick={() => handleSuggestionClick(s)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5 inline mr-2 text-indigo-400" />
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Recent queries */}
                      {recentHistory.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                            Recent
                          </p>
                          <div className="space-y-1">
                            {recentHistory.map((h, i) => (
                              <button
                                key={i}
                                onClick={() => handleSuggestionClick(h.query)}
                                className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-colors truncate"
                              >
                                {h.query}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50/80 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px]">Enter</kbd>
                      Send
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px]">Esc</kbd>
                      {streamState.isStreaming ? 'Cancel' : 'Close'}
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px]">&uarr;</kbd>
                      History
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {streamState.isStreaming && (
                      <Loader2 className="w-3 h-3 text-indigo-500 animate-spin" />
                    )}
                    <span className="text-[10px] text-gray-400">Aza AI</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

/**
 * Isolated component that only handles the global Cmd+K shortcut.
 * Separated so the shortcut works even when the modal is closed.
 */
const GlobalShortcut: React.FC = () => {
  const { toggle } = useCommandBar();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle]);

  return null;
};
