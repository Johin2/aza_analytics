import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useCommandBar } from './CommandBarProvider';
import { ChartConfig } from '../charts/DynamicChart';

interface PageContext {
  name: string;
  description: string;
  suggestions: string[];
}

const PAGE_CONTEXT_MAP: Record<string, PageContext> = {
  '/': {
    name: 'Executive Summary',
    description: 'Overview of KPIs, revenue, and business health',
    suggestions: ['What needs my attention today?', 'Compare this month vs last month', 'Business vitality score?'],
  },
  '/sales': {
    name: 'Sales Analytics',
    description: 'Revenue trends, AOV, and outlet sales performance',
    suggestions: ['Which outlet is underperforming?', 'Why did revenue change?', 'Show AOV trend'],
  },
  '/customers': {
    name: 'Customer Intelligence',
    description: 'Customer segments, retention, and acquisition',
    suggestions: ['How can we improve retention?', 'Which segment is growing fastest?'],
  },
  '/platforms': {
    name: 'Platform Performance',
    description: 'Swiggy, Zomato, and delivery platform analytics',
    suggestions: ['Is Swiggy or Zomato more profitable?', 'Optimize platform mix'],
  },
  '/stores': {
    name: 'Store Performance',
    description: 'Store-level revenue, ratings, and operational metrics',
    suggestions: ['Rank stores by profitability', 'Compare Viviana vs Infiniti'],
  },
  '/marketing': {
    name: 'Marketing ROI',
    description: 'Marketing spend, campaign performance, and ROI',
    suggestions: ['What\'s our marketing ROI?', 'Which campaign performed best?'],
  },
  '/reputation': {
    name: 'Reputation Management',
    description: 'Ratings, reviews, and customer sentiment',
    suggestions: ['How are ratings trending?', 'Top customer complaints'],
  },
  '/operations': {
    name: 'Operational Excellence',
    description: 'Kitchen prep times, delivery efficiency, and operational metrics',
    suggestions: ['Operational bottlenecks?', 'Kitchen prep time trend'],
  },
  '/predictive': {
    name: 'Predictive Insights',
    description: 'Demand forecasting and predictive models',
    suggestions: ['Predict next week\'s revenue', 'Demand forecast'],
  },
  '/menu': {
    name: 'Menu Intelligence',
    description: 'Menu item performance and pricing analysis',
    suggestions: ['Top selling items', 'Price optimization opportunities'],
  },
  '/customer-journey': {
    name: 'Customer Journey',
    description: 'Customer acquisition funnel and lifecycle',
    suggestions: ['Customer acquisition funnel', 'Drop-off analysis'],
  },
};

const UNIVERSAL_SUGGESTIONS = [
  'Give me a business health summary',
  'Top 3 urgent actions',
  'Compare Swiggy vs Zomato',
];

export interface HistoryEntry {
  query: string;
  response: string;
  timestamp: Date;
}

export interface StreamState {
  isStreaming: boolean;
  response: string;
  activity: string;
  error: string | null;
  chartConfig: ChartConfig | null;
}

export function useCommandBarStream() {
  const location = useLocation();
  const { isOpen, sessionId } = useCommandBar();
  const [streamState, setStreamState] = useState<StreamState>({
    isStreaming: false,
    response: '',
    activity: '',
    error: null,
    chartConfig: null,
  });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const eventSourceRef = useRef<EventSource | null>(null);

  const currentPage = PAGE_CONTEXT_MAP[location.pathname] || {
    name: 'Dashboard',
    description: 'Aza Fashions Analytics Dashboard',
    suggestions: [],
  };

  const suggestions = [...currentPage.suggestions, ...UNIVERSAL_SUGGESTIONS];

  // Reset history index when command bar opens/closes
  useEffect(() => {
    if (isOpen) {
      setHistoryIndex(-1);
    }
  }, [isOpen]);

  const cancelStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setStreamState(prev => ({
      ...prev,
      isStreaming: false,
      activity: '',
    }));
  }, []);

  const sendQuery = useCallback((query: string) => {
    if (!query.trim() || !sessionId) return;

    // Cancel any existing stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const contextPrefix = `[COMMAND BAR — STRICT RULES: Max 100 words. Format: 3-5 bullet points, each one line with a key insight + a short actionable next step. No headers, no sub-bullets, no intros. Example format:
• Revenue up 28% MoM → maintain current pricing strategy
• NESCO underperforming at +6% growth → audit operations this week
• 68% churn rate → launch targeted retention campaign
User is viewing "${currentPage.name}" (${currentPage.description})]\n\n`;
    const fullPrompt = contextPrefix + query;

    setStreamState({
      isStreaming: true,
      response: '',
      activity: 'Connecting...',
      error: null,
      chartConfig: null,
    });

    let responseText = '';
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    const apiUrl = `${apiBase}/api/claude/stream?prompt=${encodeURIComponent(fullPrompt)}&session_id=${encodeURIComponent(sessionId)}`;
    const es = new EventSource(apiUrl);
    eventSourceRef.current = es;

    es.onopen = () => {
      setStreamState(prev => ({ ...prev, activity: 'Connected' }));
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'connection_status':
            setStreamState(prev => ({ ...prev, activity: 'Analyzing...' }));
            break;

          case 'live_activity':
            setStreamState(prev => ({
              ...prev,
              activity: data.activity || 'Processing...',
            }));
            break;

          case 'thinking_chain_update':
            setStreamState(prev => ({
              ...prev,
              activity: 'Thinking...',
            }));
            break;

          case 'final_start':
            responseText = '';
            setStreamState(prev => ({
              ...prev,
              response: '',
              activity: '',
            }));
            break;

          case 'final_text_delta':
            responseText += data.text;
            setStreamState(prev => ({
              ...prev,
              response: responseText,
            }));
            break;

          case 'final_done':
            setStreamState(prev => ({
              ...prev,
              isStreaming: false,
              activity: '',
            }));
            break;

          case 'chart_data':
            setStreamState(prev => ({
              ...prev,
              chartConfig: data.chart as ChartConfig,
            }));
            break;

          case 'done':
            es.close();
            eventSourceRef.current = null;
            setStreamState(prev => ({
              ...prev,
              response: responseText || prev.response,
              isStreaming: false,
              activity: '',
            }));
            // Save to history
            setHistory(prev => [
              { query, response: responseText, timestamp: new Date() },
              ...prev,
            ]);
            break;

          case 'error':
            es.close();
            eventSourceRef.current = null;
            setStreamState(prev => ({
              ...prev,
              isStreaming: false,
              error: data.message || 'An error occurred',
              activity: '',
            }));
            break;
        }
      } catch {
        // Ignore parse errors for non-JSON events
      }
    };

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      setStreamState(prev => ({
        ...prev,
        isStreaming: false,
        error: 'Connection error. Please check if the API server is running.',
        activity: '',
      }));
    };
  }, [sessionId, currentPage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const navigateHistory = useCallback((direction: 'up' | 'down'): string | null => {
    if (history.length === 0) return null;

    let newIndex: number;
    if (direction === 'up') {
      newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
    } else {
      newIndex = historyIndex > 0 ? historyIndex - 1 : -1;
    }

    setHistoryIndex(newIndex);
    return newIndex >= 0 ? history[newIndex].query : null;
  }, [history, historyIndex]);

  return {
    streamState,
    sendQuery,
    cancelStream,
    suggestions,
    currentPage,
    history,
    navigateHistory,
  };
}
