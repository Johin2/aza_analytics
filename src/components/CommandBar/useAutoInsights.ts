import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ChartConfig } from '../charts/DynamicChart';

interface AutoInsightsState {
  insights: string;
  isLoading: boolean;
  error: string | null;
  chartConfig: ChartConfig | null;
}

const PAGE_NAMES: Record<string, string> = {
  '/': 'Executive Summary',
  '/sales': 'Sales Analytics',
  '/customers': 'Customer Intelligence',
  '/platforms': 'Platform Performance',
  '/stores': 'Store Performance',
  '/marketing': 'Marketing ROI',
  '/reputation': 'Reputation Management',
  '/operations': 'Operational Excellence',
  '/predictive': 'Predictive Insights',
  '/menu': 'Menu Intelligence',
  '/customer-journey': 'Customer Journey',
};

export function useAutoInsights() {
  const location = useLocation();
  const [state, setState] = useState<AutoInsightsState>({
    insights: '',
    isLoading: true,
    error: null,
    chartConfig: null,
  });
  const cacheRef = useRef<Record<string, { text: string; chart: ChartConfig | null }>>({});
  const eventSourceRef = useRef<EventSource | null>(null);
  const mountedRef = useRef(true);

  const pageName = PAGE_NAMES[location.pathname] || 'Dashboard';

  const fetchInsights = useCallback((pathname: string) => {
    // Check cache first
    if (cacheRef.current[pathname]) {
      const cached = cacheRef.current[pathname];
      setState({ insights: cached.text, isLoading: false, error: null, chartConfig: cached.chart });
      return;
    }

    // Cancel existing stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const pageLabel = PAGE_NAMES[pathname] || 'Dashboard';

    setState({ insights: '', isLoading: true, error: null, chartConfig: null });

    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    const apiUrl = `${apiBase}/api/claude/insights?page=${encodeURIComponent(pageLabel)}`;
    const es = new EventSource(apiUrl);
    eventSourceRef.current = es;

    let responseText = '';
    let chartData: ChartConfig | null = null;

    es.onmessage = (event) => {
      if (!mountedRef.current) { es.close(); return; }
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'final_text_delta':
            responseText += data.text;
            setState(prev => ({ ...prev, insights: responseText }));
            break;

          case 'final_done':
            // Don't close yet — wait for chart_data or done
            break;

          case 'chart_data':
            chartData = data.chart as ChartConfig;
            setState(prev => ({ ...prev, chartConfig: chartData }));
            break;

          case 'done':
            es.close();
            eventSourceRef.current = null;
            cacheRef.current[pathname] = { text: responseText, chart: chartData };
            setState({ insights: responseText, isLoading: false, error: null, chartConfig: chartData });
            break;

          case 'error':
            es.close();
            eventSourceRef.current = null;
            setState(prev => ({ ...prev, isLoading: false, error: data.message || 'Failed to load insights' }));
            break;
        }
      } catch {
        // Ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      if (mountedRef.current) {
        setState(prev => ({ ...prev, isLoading: false, error: 'Connection error' }));
      }
    };
  }, []);

  // Track mounted state
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Fetch on page navigation
  useEffect(() => {
    // Small delay to avoid strict-mode double-fire race
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        fetchInsights(location.pathname);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [location.pathname, fetchInsights]);

  const refetch = useCallback(() => {
    delete cacheRef.current[location.pathname];
    fetchInsights(location.pathname);
  }, [location.pathname, fetchInsights]);

  return {
    insights: state.insights,
    isLoading: state.isLoading,
    error: state.error,
    chartConfig: state.chartConfig,
    pageName,
    refetch,
  };
}
