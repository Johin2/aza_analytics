import React, { useEffect, useState } from 'react';
import { Loader2, Search, Database, TrendingUp, FileText, CheckCircle, AlertCircle, Brain, Sparkles } from 'lucide-react';

interface LiveActivityTickerProps {
  currentActivity?: string;
  currentTool?: string;
  progress?: {
    current: number;
    total: number;
    percentage?: number;
  };
  isActive: boolean;
  connectionStatus?: 'connecting' | 'connected' | 'disconnected' | 'error';
}

const getActivityIcon = (activity: string, tool?: string) => {
  // Tool-specific icons
  if (tool) {
    if (tool.includes('search') || tool.includes('find')) return <Search className="w-4 h-4" />;
    if (tool.includes('data') || tool.includes('excel')) return <Database className="w-4 h-4" />;
    if (tool.includes('analyze') || tool.includes('analysis')) return <TrendingUp className="w-4 h-4" />;
    if (tool.includes('file') || tool.includes('read')) return <FileText className="w-4 h-4" />;
  }
  
  // Activity-based icons
  if (activity?.toLowerCase().includes('thinking')) return <Brain className="w-4 h-4" />;
  if (activity?.toLowerCase().includes('analyzing')) return <TrendingUp className="w-4 h-4" />;
  if (activity?.toLowerCase().includes('searching')) return <Search className="w-4 h-4" />;
  if (activity?.toLowerCase().includes('processing')) return <Database className="w-4 h-4" />;
  if (activity?.toLowerCase().includes('complete')) return <CheckCircle className="w-4 h-4" />;
  if (activity?.toLowerCase().includes('error')) return <AlertCircle className="w-4 h-4" />;
  
  // Default spinning loader
  return <Loader2 className="w-4 h-4 animate-spin" />;
};

const getConnectionIcon = (status?: string) => {
  switch (status) {
    case 'connected':
      return <div className="w-2 h-2 bg-green-500 rounded-full" />;
    case 'connecting':
      return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />;
    case 'disconnected':
    case 'error':
      return <div className="w-2 h-2 bg-red-500 rounded-full" />;
    default:
      return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
  }
};

export const LiveActivityTicker: React.FC<LiveActivityTickerProps> = ({
  currentActivity = 'Waiting for input...',
  currentTool,
  progress,
  isActive,
  connectionStatus = 'disconnected'
}) => {
  const [dots, setDots] = useState('');
  const [shimmer, setShimmer] = useState(false);

  // Animate dots for ongoing activities
  useEffect(() => {
    if (!isActive) {
      setDots('');
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, [isActive]);

  // Shimmer effect for new activities
  useEffect(() => {
    if (currentActivity) {
      setShimmer(true);
      const timer = setTimeout(() => setShimmer(false), 500);
      return () => clearTimeout(timer);
    }
  }, [currentActivity]);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300 ease-out">
      {/* Header with connection status */}
      <div className="px-4 py-2 bg-white bg-opacity-60 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {getConnectionIcon(connectionStatus)}
            <span className="text-xs font-medium text-blue-700">
              {connectionStatus === 'connected' ? 'Claude' : 
               connectionStatus === 'connecting' ? 'Connecting...' : 
               'Disconnected'}
            </span>
          </div>

          {/* Activity Indicator */}
          <div className="flex items-center gap-2">
            {isActive && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
            <span className="text-xs font-medium text-blue-600">
              {isActive ? 'Working...' : 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Activity Display */}
      <div className={`px-5 py-4 bg-white transition-all duration-300 ${shimmer ? 'bg-gradient-to-r from-white via-blue-50 to-white animate-shimmer' : ''}`}>
        <div className="flex items-center gap-4">
          {/* Activity Icon */}
          <div className={`flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
            {getActivityIcon(currentActivity, currentTool)}
          </div>

          {/* Activity Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium transition-colors duration-200 ${isActive ? 'text-gray-800' : 'text-gray-500'}`}>
                {currentActivity}
              </span>
              {isActive && (
                <div className="flex items-center gap-1">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '150ms'}}></div>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Tool name if available */}
            {currentTool && (
              <div className="text-xs text-blue-600 mt-1 font-medium">
                {currentTool}
              </div>
            )}
          </div>

          {/* Progress Indicator */}
          {progress && progress.total > 0 && (
            <div className="flex-shrink-0">
              <div className="text-right">
                <div className="text-xs font-medium text-gray-700">
                  {progress.current}/{progress.total}
                </div>
                <div className="text-xs text-gray-500">
                  {progress.percentage || Math.round((progress.current / progress.total) * 100)}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {progress && progress.total > 0 && (
          <div className="mt-3">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
                style={{ 
                  width: `${progress.percentage || (progress.current / progress.total) * 100}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Animated bottom border when active */}
      {isActive && (
        <div className="h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse-line opacity-60" />
      )}
    </div>
  );
};

// Note: Add these animations to your global CSS or Tailwind config:
// @keyframes shimmer {
//   0% { background-position: -200% 0; }
//   100% { background-position: 200% 0; }
// }
// @keyframes pulse-line {
//   0%, 100% { opacity: 0.3; transform: translateX(-100%); }
//   50% { opacity: 1; transform: translateX(100%); }
// }
// .animate-shimmer { background-size: 200% 100%; animation: shimmer 0.5s ease-out; }
// .animate-pulse-line { animation: pulse-line 2s ease-in-out infinite; }