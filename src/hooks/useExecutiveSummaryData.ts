import { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../services/api';
import { ExtendedExecutiveSummary, ExecutiveSummary } from '../types/analytics';

export const useExecutiveSummaryData = () => {
  const [data, setData] = useState<ExtendedExecutiveSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryResponse, liveResponse] = await Promise.all([
        analyticsApi.getExecutiveSummary().catch((err: Error) => {
            console.warn('Executive summary fetch failed:', err);
            return null;
        }),
        analyticsApi.getLiveDashboard().catch((err: Error) => {
          console.warn('Live dashboard fetch failed:', err);
          return null;
        })
      ]);

      if (!summaryResponse && !liveResponse) {
          throw new Error('Failed to load analytics data');
      }

      // Base data from summary response
      const summary = summaryResponse as ExecutiveSummary | null;
      let mergedData: ExtendedExecutiveSummary = {
        total_revenue: summary?.total_revenue || 0,
        outlets: summary?.outlets || [],
        customer_metrics: {
          total_segments: summary?.customer_metrics?.total_segments || 0,
          champions_percentage: summary?.customer_metrics?.champions_percentage || 0,
          churn_rate: summary?.customer_metrics?.churn_rate ?? 100,
          avg_clv: summary?.customer_metrics?.avg_clv || 0
        },
        platform_metrics: {
          website_share: summary?.platform_metrics?.website_share || 0,
          app_share: summary?.platform_metrics?.app_share || 0,
          in_store_share: summary?.platform_metrics?.in_store_share || 0,
          platform_orders: summary?.platform_metrics?.platform_orders || 0,
          swiggy_share: summary?.platform_metrics?.website_share || 0,
          zomato_share: summary?.platform_metrics?.app_share || 0,
          dine_in_share: summary?.platform_metrics?.in_store_share || 0,
        },
        forecast_metrics: {
          next_30_days_revenue: summary?.forecast_metrics?.next_30_days_revenue || 0,
          daily_average: summary?.forecast_metrics?.daily_average || 0,
          growth_potential: summary?.forecast_metrics?.growth_potential || 0
        },
        key_insights: summary?.key_insights || [],
        last_updated: summary?.last_updated || new Date().toISOString(),
        store_performance: [],
        ...(summary || {})
      };

      if (liveResponse?.success) {
        console.log('✅ Got live dashboard data');
        
        if (liveResponse.ytd_revenue?.total) {
          mergedData.total_revenue = liveResponse.ytd_revenue.total;
        } else if (liveResponse.sales?.totals?.overall) {
          mergedData.total_revenue = liveResponse.sales.totals.overall;
        }
        
        if (liveResponse.customer_retention?.totals) {
          const retentionRate = liveResponse.customer_retention.totals.retention_rate;
          mergedData.customer_metrics = {
            ...mergedData.customer_metrics,
            churn_rate: 100 - retentionRate,
          };
        }
        
        // Merge enhanced metrics safely
        if (liveResponse.reputation_metrics) mergedData.reputation_metrics = { ...mergedData.reputation_metrics, ...liveResponse.reputation_metrics };
        if (liveResponse.operational_metrics) mergedData.operational_metrics = { ...mergedData.operational_metrics, ...liveResponse.operational_metrics };
        if (liveResponse.marketing_metrics) mergedData.marketing_metrics = { ...mergedData.marketing_metrics, ...liveResponse.marketing_metrics };
        if (liveResponse.menu_performance) mergedData.menu_performance = { ...mergedData.menu_performance, ...liveResponse.menu_performance };
        if (liveResponse.verification) mergedData.verification = liveResponse.verification;

        if (liveResponse.sales?.outlets && Array.isArray(liveResponse.sales.outlets)) {
            mergedData.store_performance = liveResponse.sales.outlets;
        }
      }
      
      // Standardize and Deduplicate Store Performance
      if (mergedData.store_performance && Array.isArray(mergedData.store_performance)) {
           const normalizeName = (name: string) => {
             const cleaned = (name || 'Unknown').toString().replace(/^Aza\s+/i, '').trim();
             const mappings: Record<string, string> = {
               'Phoenix Palladium': 'Phoenix',
               'Palladium': 'Phoenix',
               'Aza Phoenix': 'Phoenix'
             };
             return mappings[cleaned] || cleaned;
           };

           const seenNames = new Map<string, any>();
           for (const outlet of mergedData.store_performance) {
             if (!outlet) continue;
             const revenue = outlet.monthly_revenue || outlet.overall || outlet.revenue || 0;
             const name = outlet.store_name || outlet.outlet || outlet.name || 'Unknown';
             const normalized = normalizeName(name);
             const standardized = {
                 ...outlet,
                 store_name: name,
                 monthly_revenue: revenue,
                 growth_rate: outlet.growth_rate || outlet.growth || 0
             };
             const existing = seenNames.get(normalized);
             if (!existing || revenue > (existing.monthly_revenue || 0)) {
               seenNames.set(normalized, standardized);
             }
           }
           mergedData.store_performance = Array.from(seenNames.values())
             .sort((a: any, b: any) => (b.monthly_revenue || 0) - (a.monthly_revenue || 0))
             .slice(0, 5);
      } else {
          mergedData.store_performance = [];
      }
      
      setData(mergedData);
    } catch (err: any) {
      setError('Failed to load executive summary data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
};
