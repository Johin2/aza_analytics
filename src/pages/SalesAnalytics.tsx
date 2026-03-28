import React, { useEffect, useState, useRef } from 'react';
import { Header } from '../components/layout/Header';
import { ClickableCard } from '../components/ui/ClickableCard';
import { Loading } from '../components/ui/Loading';
import { analyticsApi } from '../services/api';
import { SalesAnalytics as SalesAnalyticsType } from '../types/analytics';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { AZA_COLORS, PEAK_HOURS_COLORS } from '../constants/brandColors';
import { AIRecommendations } from '../components/ui/AIRecommendations';
import { ChevronDown, Filter } from 'lucide-react';
import {
  Line,
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
  Area,
  AreaChart,
  ComposedChart,
  LabelList,
  ReferenceLine,
} from 'recharts';

interface ExtendedSalesAnalyticsType extends SalesAnalyticsType {
  data_period?: {
    start: string;
    end: string;
    days?: number;
    months?: number;
    year?: number;
  };
  data_granularity?: 'yearly' | 'monthly';
  available_months?: number[];
  ai_recommendations?: string[];
}

type PlatformFilter = 'all' | 'swiggy' | 'zomato' | 'dine-in';

export const SalesAnalytics: React.FC = () => {
  const [data, setData] = useState<ExtendedSalesAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [granularity, setGranularity] = useState<'yearly' | 'monthly'>('yearly');
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [barsAnimated, setBarsAnimated] = useState(false);
  const barsRef = useRef<HTMLDivElement>(null);
  const [trendAnimKey, setTrendAnimKey] = useState(0);
  const trendRef = useRef<HTMLDivElement>(null);
  const [forecastData, setForecastData] = useState<any>(null);

  const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Intersection observer: re-trigger bar animation on scroll into view
  useEffect(() => {
    const el = barsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setBarsAnimated(false);
          requestAnimationFrame(() => setBarsAnimated(true));
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [data]);

  // Intersection observer: re-trigger trend chart animation on scroll into view
  useEffect(() => {
    const el = trendRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTrendAnimKey(k => k + 1);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [data]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [granularity, platformFilter, selectedMonth]);

  const fetchData = async () => {
    try {
      if (!data) setLoading(true);
      setBarsAnimated(false);
      const month = granularity === 'monthly' ? selectedMonth : 0;
      const response = await analyticsApi.getSalesAnalytics(granularity, platformFilter, month);
      const extResponse = response as ExtendedSalesAnalyticsType;
      setData(extResponse);
      requestAnimationFrame(() => setBarsAnimated(true));
      // Non-blocking forecast fetch
      analyticsApi.getStoreRevenueForecast(6).then(res => {
        if (res?.success) setForecastData(res);
      }).catch(() => {});
      // Auto-select latest month when switching to monthly for the first time
      if (granularity === 'monthly' && selectedMonth === 0 && extResponse.available_months?.length) {
        setSelectedMonth(extResponse.available_months[extResponse.available_months.length - 1]);
      }
    } catch (err) {
      setError('Failed to load sales analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) return <Loading size="lg" className="h-full" />;
  if (error || !data) return <div className="p-8 text-red-600">{error}</div>;

  // Platform filter options
  const filterOptions: { value: PlatformFilter; label: string; color: string }[] = [
    { value: 'all', label: 'All Channels', color: AZA_COLORS.neutral },
    { value: 'swiggy', label: 'Website', color: AZA_COLORS.platforms.website },
    { value: 'zomato', label: 'App', color: AZA_COLORS.platforms.app },
    { value: 'dine-in', label: 'In-Store', color: AZA_COLORS.platforms.inStore },
  ];

  const selectedFilter = filterOptions.find(f => f.value === platformFilter)!;

  const peakHoursData = [
    { name: 'Lunch', value: data.peak_hours.lunch.percentage, color: PEAK_HOURS_COLORS.lunch },
    { name: 'Dinner', value: data.peak_hours.dinner.percentage, color: PEAK_HOURS_COLORS.dinner },
    { name: 'Others', value: data.peak_hours.others.percentage, color: PEAK_HOURS_COLORS.others },
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <>
      <Header
        title="Sales Analytics"
        subtitle="Detailed sales performance and trends analysis"
        
      />
      
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        {/* Filters Row */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* Granularity Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setGranularity('yearly')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  granularity === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
              </button>
              <button
                onClick={() => setGranularity('monthly')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  granularity === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
            </div>
            {/* Month Picker (visible only in monthly view) */}
            {granularity === 'monthly' && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                {(data?.available_months || []).map((m) => (
                  <option key={m} value={m}>{MONTH_LABELS[m - 1]} 2025</option>
                ))}
              </select>
            )}
            {/* Platform Filter */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>Filter:</span>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedFilter.color }} />
              <span className="font-medium">{selectedFilter.label}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showFilterDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[160px]">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setPlatformFilter(option.value);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                      platformFilter === option.value ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: option.color }} />
                    <span className={platformFilter === option.value ? 'font-medium' : ''}>{option.label}</span>
                    {platformFilter === option.value && (
                      <span className="ml-auto text-danger-600">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <AIRecommendations recommendations={data.ai_recommendations} />

        {/* Outlet Performance Table */}
        <ClickableCard
          title="Outlet Performance Rankings"
          subtitle={`${granularity === 'yearly' ? 'Full year 2025' : `${MONTH_LABELS[(selectedMonth || 1) - 1]} 2025`} · ${platformFilter !== 'all' ? `${selectedFilter.label} only` : 'All platforms'}`}
          className="mb-6 sm:mb-8"
          metricKey="outlet_performance"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Outlet</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Orders</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Growth</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Rating
                    {platformFilter === 'zomato' && (
                      <div className="text-xs font-normal text-gray-400 mt-0.5">Dining | Delivery</div>
                    )}
                    {platformFilter === 'dine-in' && (
                      <div className="text-xs font-normal text-gray-400 mt-0.5">Google</div>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.outlet_performance.map((outlet, index) => {
                  return (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium">{outlet.outlet}</td>
                    <td className="text-right py-4 px-4">{formatCurrency(outlet.revenue)}</td>
                    <td className="text-right py-4 px-4">{outlet.orders.toLocaleString()}</td>
                    <td className="text-right py-4 px-4">
                      {outlet.growth !== 0 ? (
                        <span className={`font-medium ${
                          outlet.growth > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {outlet.growth > 0 ? '+' : ''}{formatPercentage(outlet.growth)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="text-right py-4 px-4">
                      {platformFilter === 'zomato' && (outlet.rating_dining || outlet.rating_delivery) ? (
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <span className="text-yellow-500">★</span>
                          {(outlet.rating_dining || 0).toFixed(1)}
                          <span className="text-gray-300 mx-0.5">|</span>
                          {(outlet.rating_delivery || 0).toFixed(1)}
                        </span>
                      ) : outlet.rating > 0 ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          {outlet.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ClickableCard>

        {/* Revenue Trends + Forecast (unified chart) */}
        <div ref={trendRef}>
        <ClickableCard
          title="Monthly Revenue Trends"
          subtitle={(() => {
            const yearLabel = data.data_period?.year || new Date(data.data_period?.start || Date.now()).getFullYear();
            const monthCount = data.data_period?.months || data.daily_trends?.length || 0;
            const forecastLabel = forecastData?.outlets ? ' · ML forecast included' : '';
            return `${yearLabel} · ${monthCount} months · All outlets combined${forecastLabel}`;
          })()}
          className="mb-6 sm:mb-8"
          metricKey="daily_revenue"
        >
          {data.daily_trends && data.daily_trends.length > 0 ? (() => {
            // Build actual data points with sortable keys
            const actualData = data.daily_trends.map((item: any, idx: number) => {
              const monthLabel = item.month || new Date(item.date).toLocaleString('en-US', { month: 'short' });
              const dateObj = item.date ? new Date(item.date) : null;
              const yr = dateObj ? dateObj.getFullYear() : (data.data_period?.year || 2025);
              const monthNum = dateObj ? dateObj.getMonth() + 1 : idx + 1;
              return {
                month: monthLabel,
                sortKey: `${yr}-${String(monthNum).padStart(2, '0')}`,
                revenue: item.revenue,
                orders: item.orders,
                type: 'actual' as const,
              };
            });

            // Build forecast data points
            let forecastPoints: any[] = [];
            let outletRanked: any[] = [];
            let totalProjected = 0;
            let avgConfidence = '';
            if (forecastData?.outlets) {
              const outlets = forecastData.outlets as Record<string, any>;
              const outletNames = Object.keys(outlets);
              const monthMap: Record<string, { revenue: number; lower: number; upper: number; label: string }> = {};
              outletNames.forEach((name: string) => {
                const preds = outlets[name]?.predictions || [];
                preds.forEach((p: any) => {
                  const key = `${p.year}-${String(p.month).padStart(2, '0')}`;
                  const label = `${MONTH_LABELS[p.month - 1]} '${String(p.year).slice(2)}`;
                  if (!monthMap[key]) monthMap[key] = { revenue: 0, lower: 0, upper: 0, label };
                  monthMap[key].revenue += p.forecast;
                  monthMap[key].lower += p.lower_bound;
                  monthMap[key].upper += p.upper_bound;
                });
              });
              forecastPoints = Object.entries(monthMap)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([sortKey, v]) => ({
                  month: v.label,
                  sortKey,
                  forecast: Math.round(v.revenue),
                  upper: Math.round(v.upper),
                  lower: Math.round(v.lower),
                  type: 'forecast' as const,
                }));
              totalProjected = forecastPoints.reduce((s, d) => s + d.forecast, 0);
              const confidences = outletNames.map(n => outlets[n]?.confidence);
              const highCount = confidences.filter((c: string) => c === 'high').length;
              avgConfidence = highCount / confidences.length >= 0.6 ? 'high' : highCount / confidences.length >= 0.3 ? 'medium' : 'low';
              outletRanked = outletNames
                .map(name => ({
                  name,
                  forecast: (outlets[name]?.predictions || []).reduce((s: number, p: any) => s + p.forecast, 0),
                  confidence: outlets[name]?.confidence || 'low',
                  trend: outlets[name]?.trend_pct || 0,
                }))
                .sort((a: any, b: any) => b.forecast - a.forecast)
                .slice(0, 5);
            }

            // Merge actuals + forecast, keeping only forecast months strictly after last actual
            const lastActual = actualData[actualData.length - 1];
            const lastActualKey = lastActual.sortKey; // e.g. "2025-12"
            const futureForecasts = forecastPoints.filter((d: any) => d.sortKey > lastActualKey);

            const combined = [
              // All actual months except last (with nulls for forecast fields)
              ...actualData.slice(0, -1).map((d: any) => ({ ...d, forecast: null, upper: null, lower: null })),
              // Last actual month doubles as bridge point for seamless forecast connection
              ...(futureForecasts.length > 0 ? [{
                ...lastActual,
                forecast: lastActual.revenue,
                upper: lastActual.revenue,
                lower: lastActual.revenue,
              }] : [{ ...lastActual, forecast: null, upper: null, lower: null }]),
              // Future forecast months (with nulls for actual fields)
              ...futureForecasts.map((d: any) => ({ ...d, revenue: null, orders: null })),
            ];

            const lastActualMonth = lastActual?.month || '';

            return (
              <>
                <div className="overflow-x-auto">
                  <div className="min-w-[500px]">
                    <ResponsiveContainer key={trendAnimKey} width="100%" height={320}>
                      <ComposedChart data={combined}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={AZA_COLORS.primary} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={AZA_COLORS.primary} stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorForecastFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05}/>
                          </linearGradient>
                          <linearGradient id="colorBandFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.12}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} interval={0} />
                        <YAxis yAxisId="left" tickFormatter={(value) => `₹${(value / 10000000).toFixed(1)}Cr`} />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                        <Tooltip
                          formatter={(value: number, name: string) => {
                            if (value === null || value === undefined) return ['-', name];
                            if (name === 'Revenue') return [formatCurrency(value), 'Revenue'];
                            if (name === 'Forecast') return [formatCurrency(value), 'Forecast (ML)'];
                            if (name === 'Orders') return [value.toLocaleString(), 'Orders'];
                            if (name === 'Upper Bound' || name === 'Lower Bound') return [formatCurrency(value), name];
                            return [formatCurrency(value), name];
                          }}
                          labelFormatter={(label) => `Month: ${label}`}
                        />
                        <Legend />
                        {lastActualMonth && forecastPoints.length > 0 && (
                          <ReferenceLine yAxisId="left" x={lastActualMonth} stroke="#8B5CF6" strokeDasharray="4 4" strokeOpacity={0.5} />
                        )}
                        {/* Actual revenue area */}
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="revenue"
                          stroke={AZA_COLORS.primary}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                          name="Revenue"
                          connectNulls={false}
                          isAnimationActive={true}
                          animationDuration={1500}
                        />
                        {/* Confidence band upper */}
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="upper"
                          stroke="none"
                          fill="url(#colorBandFill)"
                          name="Upper Bound"
                          connectNulls={false}
                          legendType="none"
                        />
                        {/* Confidence band lower */}
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="lower"
                          stroke="none"
                          fill="white"
                          name="Lower Bound"
                          connectNulls={false}
                          legendType="none"
                        />
                        {/* Forecast line */}
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="forecast"
                          stroke="#8B5CF6"
                          strokeWidth={2.5}
                          strokeDasharray="6 3"
                          fill="url(#colorForecastFill)"
                          name="Forecast"
                          connectNulls={false}
                          dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                          isAnimationActive={true}
                          animationDuration={1200}
                        />
                        {/* Orders line */}
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="orders"
                          stroke={AZA_COLORS.success}
                          strokeWidth={2}
                          name="Orders"
                          dot={{ fill: AZA_COLORS.success, strokeWidth: 2 }}
                          connectNulls={false}
                          isAnimationActive={true}
                          animationDuration={1800}
                          animationBegin={300}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                {/* Forecast summary below chart */}
                {forecastPoints.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-gray-600">
                        <span className="inline-block w-3 h-0.5 rounded bg-purple-500 mr-1.5 align-middle" style={{ borderTop: '2px dashed #8B5CF6' }}></span>
                        Forecast projected: <span className="font-semibold text-gray-900">{formatCurrency(totalProjected)}</span>
                        <span className="ml-2 text-xs text-gray-400">XGBoost ML model</span>
                      </span>
                      <span className="text-gray-600">
                        Confidence: <span className={`font-semibold ${avgConfidence === 'high' ? 'text-emerald-600' : avgConfidence === 'medium' ? 'text-amber-600' : 'text-rose-600'}`}>{avgConfidence}</span>
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Top 5 Outlets by Projected Revenue</h4>
                    <div className="space-y-1.5">
                      {outletRanked.map((o: any, i: number) => (
                        <div key={o.name} className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-gray-50">
                          <span className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                            <span className="font-medium text-gray-700">{o.name}</span>
                          </span>
                          <span className="flex items-center gap-3">
                            <span className="text-gray-900 font-medium">{formatCurrency(o.forecast)}</span>
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${o.trend >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                              {o.trend >= 0 ? '+' : ''}{o.trend.toFixed(1)}%
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${o.confidence === 'high' ? 'bg-emerald-100 text-emerald-700' : o.confidence === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                              {o.confidence}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })() : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <p>No revenue trend data available. Please check backend connection.</p>
            </div>
          )}
        </ClickableCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Peak Hours Radial Chart */}
          <ClickableCard title="Peak Hours Analysis" subtitle="Order distribution by time of day" metricKey="footfall_patterns" className="h-full">
            {(() => {
              const items = [
                { name: 'Dinner', time: data.peak_hours.dinner.time, value: data.peak_hours.dinner.percentage, color: PEAK_HOURS_COLORS.dinner },
                { name: 'Lunch', time: data.peak_hours.lunch.time, value: data.peak_hours.lunch.percentage, color: PEAK_HOURS_COLORS.lunch },
                { name: 'Others', time: data.peak_hours.others.time, value: data.peak_hours.others.percentage, color: PEAK_HOURS_COLORS.others },
              ];
              const total = items.reduce((s, d) => s + d.value, 0);
              const SIZE = 320;
              const CX = SIZE / 2;
              const CY = SIZE / 2;
              const INNER_R = 55;
              const OUTER_R = SIZE / 2 - 10;
              const GAP = 2; // degrees between segments
              const SWEEP = 360 - items.length * GAP;

              const toRad = (deg: number) => (deg * Math.PI) / 180;
              const arcPath = (startDeg: number, endDeg: number, innerR: number, outerR: number) => {
                const s1 = toRad(startDeg); const e1 = toRad(endDeg);
                const large = endDeg - startDeg > 180 ? 1 : 0;
                const ox1 = CX + outerR * Math.cos(s1), oy1 = CY + outerR * Math.sin(s1);
                const ox2 = CX + outerR * Math.cos(e1), oy2 = CY + outerR * Math.sin(e1);
                const ix1 = CX + innerR * Math.cos(e1), iy1 = CY + innerR * Math.sin(e1);
                const ix2 = CX + innerR * Math.cos(s1), iy2 = CY + innerR * Math.sin(s1);
                return `M${ox1},${oy1} A${outerR},${outerR} 0 ${large} 1 ${ox2},${oy2} L${ix1},${iy1} A${innerR},${innerR} 0 ${large} 0 ${ix2},${iy2} Z`;
              };

              let cumAngle = -90;
              const segments = items.map((item) => {
                const angleDeg = (item.value / total) * SWEEP;
                const start = cumAngle;
                cumAngle += angleDeg + GAP;
                return { ...item, startAngle: start, endAngle: start + angleDeg };
              });

              return (
                <div className="flex flex-col items-center h-[450px] justify-center">
                  <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                    {/* Background ring */}
                    <circle cx={CX} cy={CY} r={OUTER_R} fill="none" stroke="#f1f5f9" strokeWidth={1} />
                    <circle cx={CX} cy={CY} r={INNER_R} fill="white" stroke="#f1f5f9" strokeWidth={1} />

                    {segments.map((seg) => {
                      const midAngle = (seg.startAngle + seg.endAngle) / 2;
                      const labelR = (INNER_R + OUTER_R) / 2;
                      const lx = CX + labelR * Math.cos(toRad(midAngle));
                      const ly = CY + labelR * Math.sin(toRad(midAngle));
                      return (
                        <g key={seg.name} className="group cursor-default">
                          <path
                            d={arcPath(seg.startAngle, seg.endAngle, INNER_R, OUTER_R)}
                            fill={seg.color}
                            fillOpacity={0.85}
                            stroke="white"
                            strokeWidth={1.5}
                            className="transition-all duration-200 group-hover:fill-opacity-100"
                          />
                          {/* Percentage inside arc */}
                          <text
                            x={lx} y={ly}
                            textAnchor="middle" dominantBaseline="central"
                            className="text-sm font-bold fill-white pointer-events-none"
                            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
                          >
                            {seg.value}%
                          </text>
                          {/* Hover tooltip in center */}
                          <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <circle cx={CX} cy={CY} r={INNER_R - 2} fill="white" />
                            <text x={CX} y={CY - 6} textAnchor="middle" className="text-xs fill-gray-500 font-medium">{seg.name}</text>
                            <text x={CX} y={CY + 14} textAnchor="middle" className="text-lg fill-gray-900 font-bold">{seg.value}%</text>
                          </g>
                        </g>
                      );
                    })}

                  </svg>

                  {/* Legend below */}
                  <div className="mt-2 space-y-1.5 w-full max-w-[280px]">
                    {items.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-gray-600">{item.name} ({item.time})</span>
                        </span>
                        <span className="font-semibold">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </ClickableCard>

          {/* Revenue Race Bars */}
          <div ref={barsRef}>
          <ClickableCard title="Revenue Distribution" subtitle={`Comparative revenue across all ${data.outlet_performance.length} outlets`} metricKey="outlet_performance" className="h-full">
            {(() => {
              const sorted = [...data.outlet_performance].sort((a, b) => b.revenue - a.revenue);
              const maxRev = sorted[0]?.revenue || 1;
              const colors = AZA_COLORS.chartColors;

              return (
                <div className="space-y-1.5 py-2">
                  {sorted.map((outlet, i) => {
                    const pct = (outlet.revenue / maxRev) * 100;
                    const isPositive = outlet.growth >= 0;
                    const color = colors[i % colors.length];
                    return (
                      <div key={outlet.outlet} className="group flex items-center gap-3 px-1 py-1.5 rounded-lg hover:bg-gray-50/80 transition-colors">
                        {/* Rank */}
                        <div className="shrink-0 w-6 text-center">
                          <span className="text-[10px] font-bold text-gray-300 group-hover:text-gray-500 transition-colors">
                            {i + 1}
                          </span>
                        </div>
                        {/* Outlet name */}
                        <div className="shrink-0 w-[100px] text-right">
                          <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors truncate block">
                            {outlet.outlet}
                          </span>
                        </div>
                        {/* Bar */}
                        <div className="flex-1 relative h-7 bg-gray-50 rounded-md overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 rounded-md transition-all ease-out"
                            style={{
                              width: barsAnimated ? `${pct}%` : '0%',
                              background: `linear-gradient(90deg, ${color}CC, ${color})`,
                              transitionDuration: `${800 + i * 60}ms`,
                              transitionDelay: `${i * 50}ms`,
                            }}
                          />
                          {/* Revenue label inside bar */}
                          <div
                            className="absolute inset-0 flex items-center px-2.5 transition-opacity"
                            style={{ opacity: barsAnimated ? 1 : 0, transitionDelay: `${400 + i * 50}ms`, transitionDuration: '400ms' }}
                          >
                            {pct > 25 && (
                              <span className="text-[11px] font-semibold text-white drop-shadow-sm">
                                {formatCurrency(outlet.revenue)}
                              </span>
                            )}
                          </div>
                          {/* Revenue label outside bar (for small bars) */}
                          {pct <= 25 && (
                            <span
                              className="absolute top-1/2 -translate-y-1/2 text-[11px] font-semibold text-gray-600 transition-opacity"
                              style={{ left: `calc(${pct}% + 8px)`, opacity: barsAnimated ? 1 : 0, transitionDelay: `${400 + i * 50}ms`, transitionDuration: '400ms' }}
                            >
                              {formatCurrency(outlet.revenue)}
                            </span>
                          )}
                        </div>
                        {/* Growth */}
                        <div className="shrink-0 w-[60px] flex items-center justify-end">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isPositive
                              ? 'text-emerald-700 bg-emerald-50'
                              : 'text-rose-700 bg-rose-50'
                          }`}>
                            {isPositive ? '+' : ''}{outlet.growth.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <div className="mt-2 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>{data.outlet_performance.length} outlets</span>
              <span>{granularity === 'yearly' ? 'Annual' : MONTH_LABELS[(selectedMonth || 1) - 1]} Revenue</span>
            </div>
          </ClickableCard>
          </div>
        </div>

        {/* Recommendations */}
        {data.recommendations && Object.keys(data.recommendations).length > 0 && (
          <ClickableCard 
            title="Strategic Recommendations" 
            subtitle="Data-driven insights for revenue optimization"
            className="mt-6 sm:mt-8"
            metricKey="revenue_trend"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {Object.entries(data.recommendations).map(([key, value], index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 capitalize">
                    {key.replace(/_/g, ' ')}
                  </h4>
                  <p className="text-sm text-gray-600">{String(value)}</p>
                </div>
              ))}
            </div>
          </ClickableCard>
        )}
      </div>
    </>
  );
};
