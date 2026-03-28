import React, { useState, useEffect } from 'react';
import { Sparkles, X, RefreshCw, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useAutoInsights } from './useAutoInsights';
import { useCommandBar } from './CommandBarProvider';
import { MessageContent } from '../ai/MessageContent';
import { DynamicChart } from '../charts/DynamicChart';
import { useLocation } from 'react-router-dom';

const DISMISS_KEY = 'ai-insights-dismissed';

export const AIInsights: React.FC = () => {
  const location = useLocation();
  const { insights, isLoading, error, chartConfig, pageName, refetch } = useAutoInsights();
  const { open } = useCommandBar();

  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem(DISMISS_KEY) === 'true';
  });
  const [collapsed, setCollapsed] = useState(false);

  // Reset dismissed state on page navigation
  useEffect(() => {
    // Don't auto-reset dismiss — user chose to dismiss for the session
  }, [location.pathname]);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(DISMISS_KEY, 'true');
  };

  const handleFollowUp = () => {
    open('Tell me more about these insights for ' + pageName);
  };

  if (dismissed) return null;

  // Don't render if no content and not loading
  if (!isLoading && !insights && !error) return null;

  return (
    <div className="mx-4 sm:mx-6 lg:mx-8 mt-4">
      <div className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <span className="text-sm font-semibold text-indigo-900">AI Insights</span>
            <span className="text-xs text-indigo-500 hidden sm:inline">
              — {pageName}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={refetch}
              disabled={isLoading}
              className="p-1 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 rounded transition-colors disabled:opacity-50"
              title="Refresh insights"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 rounded transition-colors"
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 text-indigo-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              title="Dismiss for this session"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!collapsed && (
          <div className="px-4 py-3">
            {isLoading && !insights ? (
              // Loading skeleton
              <div className="space-y-2.5 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-200 mt-2 flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3.5 bg-indigo-100 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : insights ? (
              <div className="text-sm text-gray-800 leading-relaxed [&_ul]:ml-2 [&_ul]:space-y-1 [&_li]:text-gray-700">
                <MessageContent content={insights} />
                {chartConfig && <DynamicChart config={chartConfig} compact />}
              </div>
            ) : null}

            {/* Follow-up button */}
            {insights && !isLoading && (
              <div className="mt-3 pt-2.5 border-t border-indigo-50">
                <button
                  onClick={handleFollowUp}
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Ask follow-up
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
