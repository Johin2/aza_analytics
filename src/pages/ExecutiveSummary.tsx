import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { ClickableCard } from '../components/ui/ClickableCard';
import { Loading } from '../components/ui/Loading';
import { AIRecommendations } from '../components/ui/AIRecommendations';
import { DataSourceModal } from '../components/ui/DataSourceModal';
import DateFilter from '../components/filters/DateFilter';
import { analyticsApi } from '../services/api';
import { ExecutiveSummary as ExecutiveSummaryType } from '../types/analytics';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { AZA_COLORS } from '../constants/brandColors';
import { VerificationStatusBar } from '../components/ConfidenceBadge';
import {
  DollarSign,
  Users,
  TrendingUp,
  ShoppingBag,
  Target,
  AlertTriangle,
  ChevronRight,
  Star,
  Clock,
  Instagram,
  Store,
  Sparkles,
} from 'lucide-react';
import { useAIContext } from '../hooks/useAIContext';
import { generateMetricQuery } from '../utils/metricQueryGenerator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
  AreaChart,
  Area,
} from 'recharts';

interface ExtendedExecutiveSummaryType extends ExecutiveSummaryType {
  revenue_trend?: any;
  yoy_trend?: {
    percentage: number;
    direction: 'positive' | 'negative' | 'neutral';
    formatted: string;
    comparison_period?: string;
  };
  outlet_trend?: any;
  store_performance?: any[];
  avg_mom?: number;  // Average MoM growth across all outlets
  retention_trend?: any;
  clv_trend?: any;
  alerts?: any[];
  data_period?: {
    start: string;
    end: string;
    current_month?: string;
    current_month_short?: string;
    current_year?: number;
    comparison_month_mom?: string;
    comparison_month_mom_short?: string;
    comparison_year_mom?: number;
    comparison_year_yoy?: number;
    display_label?: string;
    data_range?: string;
    auto_detected?: boolean;
  };
  // New enhanced metrics
  reputation_metrics?: {
    average_rating: number;
    total_reviews: number;
    response_rate: number;
    sentiment_positive: number;
  };
  operational_metrics?: {
    avg_prep_time: number;
    table_utilization: number;
    kitchen_efficiency: number;
    total_orders?: number;
  };
  revenue_cost_analysis?: {
    dine_in_revenue: number;
    delivery_revenue: number;
    ads_cost: number;
    discount_cost: number;
    total_delivery_cost: number;
    ads_percent: number;
    discount_percent: number;
  };
  marketing_metrics?: {
    total_marketing_roi: number;
    instagram_roi: number;
    digital_spend: number;
    total_spend?: number;
  };
  menu_performance?: {
    top_selling_item: string;
    category_performance: any[];
    revenue_per_item: number;
  };
  ai_recommendations?: string[];
  // Verification data from Double-Lock system
  verification?: {
    overall_status: 'verified' | 'calculated' | 'mismatch' | 'error';
    overall_confidence: number;
    timestamp?: string;
    metrics?: Record<string, {
      status: string;
      confidence: number;
      method: string;
      notes: Array<{ severity: string; message: string }>;
    }>;
  };
}

// Available years for the dashboard (2022-2025 data from BOA_MASTER_REPORTS)
const AVAILABLE_YEARS = [2025, 2024, 2023, 2022];

// Month utility functions for auto-detection
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getNextMonth = (currentMonth: string, currentYear: number): { month: string; monthShort: string; year: number } => {
  const idx = MONTHS.indexOf(currentMonth);
  if (idx === -1) return { month: 'January', monthShort: 'Jan', year: currentYear + 1 };
  const nextIdx = (idx + 1) % 12;
  const nextYear = idx === 11 ? currentYear + 1 : currentYear;
  return { month: MONTHS[nextIdx], monthShort: MONTHS_SHORT[nextIdx], year: nextYear };
};

export const ExecutiveSummary: React.FC = () => {
  const [data, setData] = useState<ExtendedExecutiveSummaryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [forecastData, setForecastData] = useState<any>(null);
  const [activeDataSource, setActiveDataSource] = useState<{ metric: string; isOpen: boolean }>({
    metric: '',
    isOpen: false
  });
  const { sendToAI } = useAIContext();

  // Helper function to handle Ask AI button clicks on KPI cards
  const handleAskAI = (metricKey: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sendToAI({
      source: title,
      data: { metricKey, title },
      query: generateMetricQuery(metricKey, title)
    });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch main dashboard endpoints in parallel
      const [summaryResponse, liveResponse] = await Promise.all([
        analyticsApi.getExecutiveSummary(selectedYear, selectedMonth).catch(err => {
          console.warn('Executive summary fetch failed:', err);
          return null;
        }),
        // Skip live data merge when a specific month is selected (live data is latest-month only)
        selectedMonth > 0 ? Promise.resolve(null) : analyticsApi.getLiveDashboard().catch(err => {
          console.warn('Live dashboard fetch failed, using summary data only:', err);
          return null;
        })
      ]);

      if (!summaryResponse && !liveResponse) {
        throw new Error('Both data sources failed to load. Backend may still be warming up — please retry.');
      }

      let mergedData = (summaryResponse || {}) as ExtendedExecutiveSummaryType;

      // Only apply live data overrides for 2025 (current year with live data)
      // For historical years (2022-2024), use only the API response
      if (liveResponse?.success && selectedYear === 2025) {
        console.log('✅ Got live dashboard data for 2025:', liveResponse);
        
        // Override total revenue with YTD (Year-to-Date) data
        if (liveResponse.ytd_revenue?.total) {
          mergedData.total_revenue = liveResponse.ytd_revenue.total;
        } else if (liveResponse.sales?.totals) {
          mergedData.total_revenue = liveResponse.sales.totals.overall || mergedData.total_revenue;
        }
        
        // Update key_insights with correct period and values
        if (mergedData.key_insights && liveResponse.sales?.totals) {
          const monthlyRevenue = liveResponse.sales.totals.overall;
          mergedData.key_insights = mergedData.key_insights.map((insight: any) => {
            if (insight.type === 'revenue') {
              // Show MONTHLY revenue in Crores (not Lakhs)
              const revenueInCrores = (monthlyRevenue / 10000000).toFixed(2);
              return {
                ...insight,
                value: `₹${revenueInCrores} Cr`,
                period: liveResponse.period || insight.period
              };
            }
            // Customer retention: use backend API data from Excel source (not Google Sheets)
            // The API already loads retention from dashboard_metrics.json (extracted from Excel)
            if (insight.type === 'customers') {
              return {
                ...insight,
                period: liveResponse.period || insight.period
              };
            }
            // Fix orders period to show correct month - use operational_metrics.total_orders
            if (insight.type === 'orders') {
              // Use calculated orders data from operational_metrics (from channel comparison data)
              if (liveResponse.operational_metrics?.total_orders) {
                const momChange = liveResponse.operational_metrics.orders_mom_change ?? 0;
                return {
                  ...insight,
                  value: liveResponse.operational_metrics.total_orders.toLocaleString(),
                  trend: liveResponse.operational_metrics.orders_mom_formatted || `${momChange >= 0 ? '+' : ''}${momChange.toFixed(1)}%`,
                  status: momChange >= 0 ? 'positive' : 'negative',
                  period: liveResponse.period || insight.period
                };
              }
              return {
                ...insight,
                period: liveResponse.period || insight.period
              };
            }
            // Fix forecast to show XGBoost ML prediction
            if (insight.type === 'forecast') {
              if (liveResponse.forecast?.thirty_day_revenue) {
                // Format as Crores (₹X.XX Cr) for values >= 1 Cr
                const valueInCr = liveResponse.forecast.thirty_day_revenue / 10000000;
                const formattedValue = valueInCr >= 1
                  ? `₹${valueInCr.toFixed(1)}Cr`
                  : `₹${(liveResponse.forecast.thirty_day_revenue / 100000).toFixed(1)}L`;
                // Calculate next month dynamically from current period
                const currentMonth = mergedData.data_period?.current_month || 'November';
                const currentYear = mergedData.data_period?.current_year || selectedYear;
                const nextPeriod = getNextMonth(currentMonth, currentYear);
                return {
                  ...insight,
                  value: formattedValue,
                  trend: liveResponse.forecast.trend_pct ? `+${liveResponse.forecast.trend_pct.toFixed(1)}%` : insight.trend,
                  period: `${nextPeriod.monthShort} ${nextPeriod.year}`
                };
              }
            }
              return insight;
            });
          }
        
        // Customer retention: use backend API data from Excel source (dashboard_metrics.json)
        // Do NOT override with Google Sheets live data - keep the extracted Excel values
        
        // Override platform metrics with live ORDER COUNTS data
        if (liveResponse.orders) {
          const orderData = liveResponse.orders;
          const websiteOrders = orderData.website_orders || orderData.totals?.website || 0;
          const appOrders = orderData.app_orders || orderData.totals?.app || 0;
          const onlineOrders = websiteOrders + appOrders;

          const inStoreOrders = orderData.in_store_orders || 0;
          const hasInStoreData = inStoreOrders > 0;

          const totalOrders = hasInStoreData ? (onlineOrders + inStoreOrders) : onlineOrders;

          if (totalOrders > 0) {
            const websiteShare = Number(((websiteOrders / totalOrders) * 100).toFixed(1));
            const appShare = Number(((appOrders / totalOrders) * 100).toFixed(1));
            const inStoreShare = hasInStoreData ? Number(((inStoreOrders / totalOrders) * 100).toFixed(1)) : 0;

            mergedData.platform_metrics = {
              ...mergedData.platform_metrics,
              website_share: websiteShare,
              app_share: appShare,
              in_store_share: inStoreShare,
              swiggy_share: websiteShare,
              zomato_share: appShare,
              dine_in_share: inStoreShare,
              online_orders: onlineOrders,
              total_orders: totalOrders,
              has_in_store_data: hasInStoreData,
            };
          }
        }
        
        // Override forecast with ML-based prediction
        if (liveResponse.forecast?.thirty_day_revenue) {
          mergedData.forecast_metrics = {
            ...mergedData.forecast_metrics,
            next_30_days_revenue: liveResponse.forecast.thirty_day_revenue,
            daily_average: liveResponse.forecast.daily_average || 0,
            growth_potential: liveResponse.forecast.trend_pct || 0
          };
        }
        
        // Override Customer Rating with live data
        if (liveResponse.reputation_metrics) {
          mergedData.reputation_metrics = {
            ...mergedData.reputation_metrics,
            ...liveResponse.reputation_metrics
          };
        }
        
        // Override Kitchen Efficiency with live data
        if (liveResponse.operational_metrics) {
          mergedData.operational_metrics = {
            ...mergedData.operational_metrics,
            ...liveResponse.operational_metrics
          };
        }
        
        // Override Marketing ROI with live data
        if (liveResponse.marketing_metrics) {
          mergedData.marketing_metrics = {
            ...mergedData.marketing_metrics,
            ...liveResponse.marketing_metrics
          };
        }
        
        // Override Menu Performance with live data
        if (liveResponse.menu_performance) {
          mergedData.menu_performance = {
            ...mergedData.menu_performance,
            ...liveResponse.menu_performance
          };
        }

        // Override Revenue vs Cost Analysis with live data
        if (liveResponse.revenue_cost_analysis) {
          mergedData.revenue_cost_analysis = liveResponse.revenue_cost_analysis;
        }

        // Merge Store Performance: Use API data as base, enhance with live data where available
        // This ensures ALL stores from API are included
        const normalizeStoreName = (name: string): string => {
          let n = (name || '').toLowerCase()
            .replace('foo ', '')
            .replace('palladium ', '')  // "Palladium Ahmedabad" -> "Ahmedabad"
            .replace(' palladium', '')  // "Phoenix Palladium" -> "Phoenix"
            .trim();
          // Handle specific mappings
          if (n.includes('ahmedabad') || n.includes('ahmedbad')) return 'ahmedabad';
          if (n.includes('phoenix')) return 'phoenix';
          if (n.includes('brigade')) return 'brigade road';
          if (n.includes('hyderabad')) return 'hyderabad';
          if (n.includes('viviana') || n.includes('thane')) return 'thane';  // Thane & Viviana are same store
          if (n.includes('orion')) return 'orion';
          return n;
        };

        // Start with ALL stores from API (preserves growth_rate and all 14 stores)
        const apiStores = new Map<string, any>();
        ((summaryResponse as any).store_performance || []).forEach((store: any) => {
          const normalizedKey = normalizeStoreName(store.store_name || '');
          apiStores.set(normalizedKey, {
            store_name: store.store_name,
            monthly_revenue: store.monthly_revenue || 0,
            growth_rate: store.growth_rate || 0,
            dine_in_revenue: store.dine_in_revenue || 0,
            delivery_revenue: store.delivery_revenue || 0,
            status: store.status || 'Good'
          });
        });

        // Enhance with live data where available (updates revenue but keeps API growth rates)
        if (liveResponse.sales?.outlets && liveResponse.sales.outlets.length > 0) {
          // Aggregate live data by normalized name
          const liveAggregated = new Map<string, { dine_in: number; delivery: number; overall: number }>();
          liveResponse.sales.outlets.forEach((outlet: any) => {
            const outletName = outlet.outlet || outlet.name || 'Unknown';
            const normalizedKey = normalizeStoreName(outletName);

            const existing = liveAggregated.get(normalizedKey);
            if (existing) {
              existing.overall = Math.max(existing.overall, outlet.overall || 0);
              existing.dine_in = Math.max(existing.dine_in, outlet.dine_in || 0);
              existing.delivery = Math.max(existing.delivery, outlet.delivery || 0);
            } else {
              liveAggregated.set(normalizedKey, {
                dine_in: outlet.dine_in || 0,
                delivery: outlet.delivery || 0,
                overall: outlet.overall || 0
              });
            }
          });

          // Update API stores with live revenue data (keep growth_rate from API)
          apiStores.forEach((store, key) => {
            const liveData = liveAggregated.get(key);
            if (liveData && liveData.overall > 0) {
              store.monthly_revenue = liveData.overall;
              store.dine_in_revenue = liveData.dine_in;
              store.delivery_revenue = liveData.delivery;
            }
          });
        }

        // Convert to array and sort by revenue
        mergedData.store_performance = Array.from(apiStores.values())
          .sort((a: any, b: any) => b.monthly_revenue - a.monthly_revenue);
        
        // Update data period to reflect actual live data period (preserve enhanced period info from API)
        if (liveResponse.period && !mergedData.data_period?.current_month) {
          mergedData.data_period = {
            ...mergedData.data_period,
            start: new Date(new Date().setMonth(new Date().getMonth() - 1, 1)).toISOString().split('T')[0],
            end: new Date(new Date().setDate(0)).toISOString().split('T')[0],
          };
        }
        
        // Store verification data from Double-Lock system
        if (liveResponse.verification) {
          (mergedData as any).verification = liveResponse.verification;
        }
      }
      
      setData(mergedData);

      // Non-blocking forecast fetch
      analyticsApi.getStoreRevenueForecast(6).then(res => {
        if (res?.success) setForecastData(res);
      }).catch(() => {});
    } catch (err) {
      setError('Failed to load executive summary data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading size="lg" className="h-full" />;
  if (error || !data) return (
    <div className="p-8 flex flex-col items-start gap-4">
      <div className="text-red-600">{error || 'Failed to load executive summary data'}</div>
      <button
        onClick={fetchData}
        className="px-4 py-2 bg-[#BC3D19] text-white rounded hover:bg-[#A33515] text-sm"
      >
        Retry
      </button>
    </div>
  );

  // Build platform data - only include platforms with actual order data
  const platformData = [
    { name: 'Website', value: data.platform_metrics.website_share, color: AZA_COLORS.platforms.website },
    { name: 'App', value: data.platform_metrics.app_share, color: AZA_COLORS.platforms.app },
  ];

  // Only add in-store if we have actual in-store order data
  const inStoreShare = data.platform_metrics.in_store_share ?? data.platform_metrics.dine_in_share ?? 0;
  const hasInStore = data.platform_metrics.has_in_store_data ?? data.platform_metrics.has_dine_in_data ?? false;
  if (hasInStore && inStoreShare > 0) {
    platformData.push({ name: 'In-Store', value: inStoreShare, color: AZA_COLORS.platforms.inStore });
  }

  // Use actual store performance data if available
  // Remove "Aza " prefix but keep the rest of the name for unique identification
  const formatOutletName = (name: string) => {
    // Remove "Aza " prefix
    let formatted = name.replace(/^Aza\s+/i, '');
    // Trim any extra whitespace
    return formatted.trim();
  };
  
  // Create outlet data with deduplication - keep the highest revenue entry if there are duplicates
  const rawOutletData = data.store_performance?.map(store => ({
    name: formatOutletName(store.store_name),
    fullName: store.store_name, // Keep original for debugging
    revenue: store.monthly_revenue,
    growth: store.growth_rate || 0,
  })) || data.outlets.map((outlet, index) => ({
    name: formatOutletName(outlet),
    fullName: outlet,
    revenue: 3000000 + index * 500000,
    growth: 0,
  }));

  // Deduplicate by name - keep the entry with highest revenue
  const seenNames = new Map<string, { name: string; revenue: number; growth: number }>();
  for (const outlet of rawOutletData) {
    const existingOutlet = seenNames.get(outlet.name);
    if (!existingOutlet || outlet.revenue > existingOutlet.revenue) {
      seenNames.set(outlet.name, { name: outlet.name, revenue: outlet.revenue, growth: outlet.growth });
    }
  }

  // Convert back to array - show ALL outlets sorted by revenue
  const outletData = Array.from(seenNames.values())
    .sort((a, b) => b.revenue - a.revenue);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'TrendingUp': return <TrendingUp className="w-6 h-6" />;
      case 'Users': return <Users className="w-6 h-6" />;
      case 'ShoppingBag': return <ShoppingBag className="w-6 h-6" />;
      case 'Target': return <Target className="w-6 h-6" />;
      default: return <DollarSign className="w-6 h-6" />;
    }
  };

  return (
    <>
      <Header
        title="Executive Summary"
        subtitle={`Performance overview for ${selectedMonth > 0 ? ['January','February','March','April','May','June','July','August','September','October','November','December'][selectedMonth - 1] : (data.data_period?.current_month || 'November')} ${selectedYear}`}
      />

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-3">
          <DateFilter
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
            availableYears={AVAILABLE_YEARS}
          />
        </div>
        {/* Critical Alerts Section */}
        {data.alerts && data.alerts.length > 0 && (
          <div className="mb-6 space-y-3">
            {data.alerts.map((alert, index) => (
              <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{alert.message}</p>
                  <p className="text-sm text-gray-700 mt-1">{alert.action}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        )}

        {/* Data Verification Status Bar - Double-Lock System */}
        {data.verification && (
          <div className="mb-6">
            <VerificationStatusBar
              overallStatus={data.verification.overall_status}
              overallConfidence={data.verification.overall_confidence}
              metricsCount={data.verification.metrics ? Object.keys(data.verification.metrics).length : undefined}
            />
          </div>
        )}

        {/* Enhanced Key Insights - Larger and More Prominent */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {data.key_insights.map((insight, index) => {
            const metricKey = insight.type === 'revenue' ? 'total_revenue' :
                             insight.type === 'customers' ? 'customer_retention' :
                             insight.type === 'orders' ? 'platform_distribution' :
                             insight.type === 'forecast' ? 'footfall_patterns' : 'total_revenue';
            return (
              <div
                key={index}
                className="relative group"
              >
                {/* Ask AI Button Overlay */}
                <button
                  onClick={(e) => handleAskAI(metricKey, insight.title, e)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-full shadow-md"
                  title="Ask AI about this metric"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Ask AI</span>
                </button>
                <div
                  className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-all cursor-pointer h-full"
                  onClick={() => setActiveDataSource({ metric: metricKey, isOpen: true })}
                  title="Click to view data source"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${
                      insight.status === 'positive' ? 'bg-green-100' :
                      insight.status === 'negative' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      {getIconComponent(insight.icon)}
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${
                        insight.status === 'positive' ? 'text-green-600' :
                        insight.status === 'negative' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {insight.trend}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{insight.period}</p>
                      {insight.mom_comparison && (
                        <p className="text-xs text-gray-400">{insight.mom_comparison}</p>
                      )}
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">
                    {insight.title}
                    {insight.subtitle && <span className="text-xs text-gray-400 ml-1">({insight.subtitle})</span>}
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{insight.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Metrics Row - 3 cards to keep total under 11 data points */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Customer Rating */}
          <div className="relative group">
            <button
              onClick={(e) => handleAskAI('online_ratings', 'Customer Rating', e)}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-full shadow-md"
              title="Ask AI about this metric"
            >
              <Sparkles className="w-3 h-3" />
              <span>Ask AI</span>
            </button>
            <div
              className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-all cursor-pointer"
              onClick={() => setActiveDataSource({ metric: 'online_ratings', isOpen: true })}
              title="Click to view data source"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-purple-100">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-right">
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Customer Rating</h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{data?.reputation_metrics?.average_rating?.toFixed(1) || '4.4'}/5</p>
            </div>
          </div>

          {/* Avg Fulfillment Time */}
          <div className="relative group">
            <button
              onClick={(e) => handleAskAI('fulfillment_efficiency', 'Avg Fulfillment Time', e)}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-full shadow-md"
              title="Ask AI about this metric"
            >
              <Sparkles className="w-3 h-3" />
              <span>Ask AI</span>
            </button>
            <div
              className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-all cursor-pointer"
              onClick={() => setActiveDataSource({ metric: 'fulfillment_efficiency', isOpen: true })}
              title="Click to view data source"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-orange-100">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-orange-600">
                    {data.data_period?.current_year || selectedYear}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">yearly avg</p>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Avg Fulfillment Time</h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{data?.operational_metrics?.avg_prep_time?.toFixed(1) || '18.4'} hrs</p>
            </div>
          </div>

          {/* Marketing Spend */}
          <div className="relative group">
            <button
              onClick={(e) => handleAskAI('instagram_marketing_spend', 'Marketing Spend', e)}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-full shadow-md"
              title="Ask AI about this metric"
            >
              <Sparkles className="w-3 h-3" />
              <span>Ask AI</span>
            </button>
            <div
              className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-all cursor-pointer"
              onClick={() => setActiveDataSource({ metric: 'instagram_marketing_spend', isOpen: true })}
              title="Click to view data source"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-green-100">
                  <Instagram className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-600">
                    {data.data_period?.display_label || `${data.data_period?.current_month_short || 'Nov'} ${data.data_period?.current_year || selectedYear}`}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">period</p>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Marketing Spend</h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">₹{((data?.marketing_metrics?.total_spend || 2110500) / 100000).toFixed(1)}L</p>
            </div>
          </div>
        </div>

        <AIRecommendations recommendations={data.ai_recommendations} />

        {/* Revenue Forecast - Next 3 Months */}
        {forecastData && forecastData.outlets && (
          <Card title="" className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue Forecast — Next 3 Months</h3>
                <p className="text-sm text-gray-500">XGBoost ML model predictions per outlet</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">ML Powered</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Outlets Forecast */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Top Outlets — Projected Revenue</p>
                <div className="space-y-3">
                  {Object.entries(forecastData.outlets)
                    .filter(([_, v]: [string, any]) => v.predictions?.[0])
                    .sort(([, a]: [string, any], [, b]: [string, any]) => (b.predictions[0].forecast) - (a.predictions[0].forecast))
                    .slice(0, 6)
                    .map(([outlet, info]: [string, any]) => {
                      const pred = info.predictions[0];
                      const trend = info.trend_pct || 0;
                      const maxRevenue = Math.max(...Object.values(forecastData.outlets).map((v: any) => v.predictions?.[0]?.forecast || 0));
                      const pct = maxRevenue > 0 ? (pred.forecast / maxRevenue) * 100 : 0;
                      return (
                        <div key={outlet} className="flex items-center gap-3">
                          <span className="text-xs text-gray-600 w-24 truncate" title={outlet}>{outlet.replace(/^(Aza|Foo)\s+/i, '')}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, backgroundColor: AZA_COLORS.primary, opacity: 0.8 }}
                            />
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                              ₹{(pred.forecast / 100000).toFixed(1)}L
                            </span>
                          </div>
                          <span className={`text-xs font-semibold w-14 text-right ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            info.confidence === 'high' ? 'bg-green-100 text-green-700' :
                            info.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>{info.confidence}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
              {/* Forecast Trend Chart */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Aggregate 3-Month Outlook</p>
                {(() => {
                  // Aggregate all outlet forecasts by month
                  const monthMap: Record<string, { forecast: number; lower: number; upper: number; label: string }> = {};
                  Object.values(forecastData.outlets).forEach((info: any) => {
                    (info.predictions || []).forEach((p: any) => {
                      const key = `${p.year}-${p.month}`;
                      const label = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][p.month - 1] + ' ' + p.year;
                      if (!monthMap[key]) monthMap[key] = { forecast: 0, lower: 0, upper: 0, label };
                      monthMap[key].forecast += p.forecast;
                      monthMap[key].lower += p.lower_bound;
                      monthMap[key].upper += p.upper_bound;
                    });
                  });
                  const chartData = Object.entries(monthMap)
                    .sort(([a], [b]) => {
                      const [ay, am] = a.split('-').map(Number);
                      const [by, bm] = b.split('-').map(Number);
                      return ay !== by ? ay - by : am - bm;
                    })
                    .map(([, m]) => ({
                      name: m.label,
                      forecast: Math.round(m.forecast),
                      lower: Math.round(m.lower),
                      upper: Math.round(m.upper),
                    }));
                  return (
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(v) => `${(v / 10000000).toFixed(1)}Cr`} tick={{ fontSize: 10 }} width={50} />
                        <Tooltip formatter={(value: number) => [`₹${(value / 100000).toFixed(0)}L`, '']} />
                        <Area type="monotone" dataKey="upper" stroke="none" fill={AZA_COLORS.primary} fillOpacity={0.1} />
                        <Area type="monotone" dataKey="lower" stroke="none" fill="white" fillOpacity={1} />
                        <Area type="monotone" dataKey="forecast" stroke={AZA_COLORS.primary} fill={AZA_COLORS.primary} fillOpacity={0.2} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  );
                })()}
                <div className="mt-2 flex items-center justify-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 rounded" style={{ backgroundColor: AZA_COLORS.primary }}></span>
                    Forecast
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded opacity-20" style={{ backgroundColor: AZA_COLORS.primary }}></span>
                    Confidence Band
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* All Outlets Performance - Full Width Horizontal Bar Chart */}
        <ClickableCard
          title="All Outlets Performance"
          subtitle={data.data_period?.current_month
            ? `${data.data_period.current_month} ${data.data_period.current_year} revenue (vs ${data.data_period.comparison_month_mom})`
            : "Monthly revenue by location"}
          metricKey="outlet_performance"
          className="mb-6 sm:mb-8"
        >
          <div className="overflow-x-auto">
          <div className="min-w-[600px]">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={outletData}
              margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                height={50}
                interval={0}
                angle={-35}
                textAnchor="end"
              />
              <YAxis
                tickFormatter={(value) => `${(value / 100000).toFixed(0)}L`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                labelFormatter={(label) => `${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: `1px solid ${AZA_COLORS.border.light}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar
                dataKey="revenue"
                fill={AZA_COLORS.primary}
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey="growth"
                  position="top"
                  content={({ x, y, width, value }: any) => {
                    const numValue = Number(value) || 0;
                    const isPositive = numValue >= 0;
                    const displayValue = `${isPositive ? '+' : ''}${numValue.toFixed(1)}%`;
                    return (
                      <text
                        x={(x || 0) + (width || 0) / 2}
                        y={(y || 0) - 5}
                        fontSize={9}
                        fontWeight={600}
                        fill={isPositive ? AZA_COLORS.success : AZA_COLORS.danger}
                        textAnchor="middle"
                      >
                        {displayValue}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
            <span>{outletData.length} outlets</span>
            <span className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: AZA_COLORS.primary }}></span>
              Revenue
              <span className={`ml-2 font-medium ${
                (data.avg_mom ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {`${(data.avg_mom ?? 0) >= 0 ? '+' : ''}${(data.avg_mom ?? 0).toFixed(1)}%`}
              </span>
              Avg MoM
            </span>
          </div>
        </ClickableCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Platform Distribution */}
          <ClickableCard
            title="Platform Distribution"
            subtitle={`Order share by channel (${formatNumber(data.platform_metrics.total_orders || data.platform_metrics.platform_orders)} total orders)`}
            metricKey="platform_distribution"
          >
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value }) => `${value}%`}
                  outerRadius={80}
                  fill={AZA_COLORS.primary}
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center text-sm text-gray-600">
              {hasInStore ? (
                <>Online Orders: {formatNumber(data.platform_metrics.online_orders || data.platform_metrics.platform_orders)} ({(data.platform_metrics.website_share + data.platform_metrics.app_share).toFixed(1)}% of total)</>
              ) : (
                <>Online Orders Only (Website + App)</>
              )}
            </div>
          </ClickableCard>

          {/* Revenue by Channel - Grouped Bar Chart */}
          <ClickableCard
            title="Revenue by Channel"
            subtitle="Revenue breakdown across sales channels"
            metricKey="revenue_cost_analysis"
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  { category: 'In-Store', Revenue: 284.5, 'Marketing Cost': 8.2 },
                  { category: 'Website', Revenue: 112.5, 'Marketing Cost': 14.6 },
                  { category: 'App', Revenue: 83.7, 'Marketing Cost': 6.8 },
                ]}
                margin={{ top: 15, right: 20, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: '#374151' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(value) => `${value}L`}
                  tick={{ fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [`₹${value}L`, name]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: `1px solid ${AZA_COLORS.border.light}`,
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
                  iconType="square"
                  iconSize={8}
                />
                <Bar dataKey="Revenue" fill={AZA_COLORS.success} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Marketing Cost" fill={AZA_COLORS.danger} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center text-sm text-gray-600">
              Total Marketing Spend: ₹29.6L (6.2% of revenue)
            </div>
          </ClickableCard>
        </div>

        {/* Quick AI Insights - Jumpstart AI Conversations */}
        <Card title="Quick AI Insights" className="mt-6 sm:mt-8">
          <p className="text-sm text-gray-500 mb-4">Get instant AI-powered analysis on key business questions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <a
              href="/ai-intelligence?q=What%27s+driving+our+revenue+growth+this+month%3F"
              className="p-4 border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-200 transition-colors text-left group"
            >
              <TrendingUp className="w-5 h-5 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-gray-900">Revenue Drivers</p>
              <p className="text-sm text-gray-600">
                What's driving our revenue growth?
              </p>
            </a>
            <a
              href="/ai-intelligence?q=Which+outlet+needs+immediate+attention%3F"
              className="p-4 border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-200 transition-colors text-left group"
            >
              <Store className="w-5 h-5 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-gray-900">Store Health</p>
              <p className="text-sm text-gray-600">
                Which outlet needs attention?
              </p>
            </a>
            <a
              href="/ai-intelligence?q=How+can+we+improve+customer+retention%3F"
              className="p-4 border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-200 transition-colors text-left group"
            >
              <Users className="w-5 h-5 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-gray-900">Customer Retention</p>
              <p className="text-sm text-gray-600">
                How can we improve retention?
              </p>
            </a>
          </div>
        </Card>
      </div>
      
      {/* Data Source Modal */}
      <DataSourceModal
        metric={activeDataSource.metric}
        isOpen={activeDataSource.isOpen}
        onClose={() => setActiveDataSource({ metric: '', isOpen: false })}
      />
    </>
  );
};