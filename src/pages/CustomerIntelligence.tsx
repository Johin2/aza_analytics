import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Header } from '../components/layout/Header';
import { ClickableCard } from '../components/ui/ClickableCard';
import { MetricCard } from '../components/ui/MetricCard';
import { Loading } from '../components/ui/Loading';
import DateFilter from '../components/filters/DateFilter';
import { analyticsApi } from '../services/api';
import { CustomerAnalytics } from '../types/analytics';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { AZA_COLORS } from '../constants/brandColors';
import { AIRecommendations } from '../components/ui/AIRecommendations';
import { Users, UserPlus, ShoppingCart, TrendingUp, Filter } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ExtendedCustomerAnalytics extends CustomerAnalytics {
  analysis_period?: string;
  data_as_of?: string;
  trends?: {
    total_visits?: number;
    first_timers?: number;
    repeat_customers?: number;
    repeat_rate?: number;
    period?: string;
  };
  repeat_by_outlet?: Array<{ outlet: string; repeat_pct: number; first_timer_pct: number }>;
  monthly_volume?: Array<{ month: string; monthNumber: number; first_timers: number; repeat_customers: number; total: number }>;
  outlet_monthly?: Array<{ outlet: string; month: number; monthName: string; first_timer: number; repeat_regular: number; total: number; repeat_pct: number }>;
  outlet_list?: string[];
  ai_recommendations?: string[];
}

// --- Animated counter hook ---
function useCountUp(end: number, duration: number = 1200): number {
  const [value, setValue] = useState(0);
  const prevEnd = useRef(end);

  useEffect(() => {
    prevEnd.current = end;
    if (end === 0) { setValue(0); return; }
    const startTime = performance.now();
    let raf: number;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);

  return value;
}

// --- Animated metric card wrapper ---
const AnimatedMetricCard: React.FC<{
  title: string;
  rawValue: number;
  format: (v: number) => string;
  icon: React.ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  metricKey?: string;
}> = ({ title, rawValue, format, icon, trend, trendType, subtitle, metricKey }) => {
  const animated = useCountUp(rawValue);
  return (
    <MetricCard
      title={title}
      value={format(animated)}
      icon={icon}
      trend={trend}
      trendType={trendType}
      subtitle={subtitle}
      metricKey={metricKey}
    />
  );
};

const MONTH_NAMES: Record<number, string> = {
  1: 'January', 2: 'February', 3: 'March', 4: 'April', 5: 'May', 6: 'June',
  7: 'July', 8: 'August', 9: 'September', 10: 'October', 11: 'November', 12: 'December',
};

export const CustomerIntelligence: React.FC = () => {
  const [data, setData] = useState<ExtendedCustomerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOutlet, setSelectedOutlet] = useState<string>('all');
  const [donutKey, setDonutKey] = useState(0); // for re-triggering animation
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [forecastData, setForecastData] = useState<any>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await analyticsApi.getCustomerAnalytics(selectedYear, selectedMonth);
      setData(response as ExtendedCustomerAnalytics);
      analyticsApi.getCustomerForecast(6).then(res => {
        if (res?.success) setForecastData(res);
      }).catch(() => {});
    } catch (err) {
      setError('Failed to load customer analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Recompute all derived data when outlet filter changes
  const filtered = useMemo(() => {
    if (!data) return null;
    if (selectedOutlet === 'all') {
      return {
        metrics: data.metrics,
        trends: data.trends,
        segments: data.segments,
        clv_by_segment: data.clv_by_segment,
        repeat_by_outlet: data.repeat_by_outlet,
        monthly_volume: data.monthly_volume,
        retention: data.retention,
      };
    }

    // Filter outlet_monthly to selected outlet
    const om = (data.outlet_monthly || []).filter(r => r.outlet === selectedOutlet);
    if (om.length === 0) return null;

    const latestMonth = Math.max(...om.map(r => r.month));
    const latest = om.find(r => r.month === latestMonth);
    const prevMonth = latestMonth - 1;
    const prev = om.find(r => r.month === prevMonth);

    const ft = latest?.first_timer || 0;
    const rp = latest?.repeat_regular || 0;
    const total = ft + rp;
    const ftPct = total > 0 ? Math.round(ft / total * 1000) / 10 : 0;
    const rpPct = total > 0 ? Math.round(rp / total * 1000) / 10 : 0;

    // Trends
    let trends: any = {};
    if (prev) {
      const prevTotal = prev.first_timer + prev.repeat_regular;
      const pct = (c: number, p: number) => p > 0 ? Math.round((c - p) / p * 1000) / 10 : 0;
      trends = {
        total_visits: pct(total, prevTotal),
        first_timers: pct(ft, prev.first_timer),
        repeat_customers: pct(rp, prev.repeat_regular),
        repeat_rate: pct(rpPct, prev.repeat_pct || 0),
      };
    }

    // Monthly volume for this outlet
    const monthlyVolume = om.map(r => ({
      month: MONTH_NAMES[r.month] || '',
      monthNumber: r.month,
      first_timers: r.first_timer,
      repeat_customers: r.repeat_regular,
      total: r.first_timer + r.repeat_regular,
    })).sort((a, b) => a.monthNumber - b.monthNumber);

    // Retention for this outlet
    const retention = om.map(r => {
      const t = r.first_timer + r.repeat_regular;
      return {
        month: MONTH_NAMES[r.month] || '',
        monthNumber: r.month,
        retention: t > 0 ? Math.round(r.repeat_regular / t * 1000) / 10 : 0,
      };
    }).sort((a, b) => a.monthNumber - b.monthNumber);

    // CLV for this outlet
    const outletClv = (data.clv_by_segment || []).filter(r => r.segment === selectedOutlet);

    return {
      metrics: {
        total_customers: total,
        active_customers: rp,
        new_customers_monthly: ft,
        avg_frequency: rpPct,
      },
      trends,
      segments: [
        { name: 'First Timers', value: ftPct, color: '#F59E0B' },
        { name: 'Repeat Customers', value: rpPct, color: '#10B981' },
      ],
      clv_by_segment: outletClv,
      repeat_by_outlet: [{ outlet: selectedOutlet, repeat_pct: rpPct, first_timer_pct: ftPct }],
      monthly_volume: monthlyVolume,
      retention,
    };
  }, [data, selectedOutlet]);

  const handleOutletChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOutlet(e.target.value);
    setDonutKey(k => k + 1); // retrigger donut animation
  }, []);

  if (loading) return <Loading size="lg" className="h-full" />;
  if (error || !data || !filtered) return <div className="p-8 text-red-600">{error}</div>;

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, name
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-medium text-xs"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  const outletLabel = selectedOutlet === 'all' ? 'all outlets' : selectedOutlet;

  return (
    <>
      <Header
        title="Customer Intelligence"
        subtitle={`${data.analysis_period || 'Last 12 months'} analysis${data.data_as_of ? ` • Data as of ${new Date(data.data_as_of).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}`}
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        {/* Date & Outlet Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <DateFilter
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
          />
          {data.outlet_list && data.outlet_list.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Outlet</span>
            </div>
            <select
              value={selectedOutlet}
              onChange={handleOutletChange}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all cursor-pointer hover:border-gray-300"
            >
              <option value="all">All Outlets</option>
              {data.outlet_list.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            {selectedOutlet !== 'all' && (
              <button
                onClick={() => { setSelectedOutlet('all'); setDonutKey(k => k + 1); }}
                className="px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-full hover:bg-primary-100 transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>
          )}
        </div>

        <AIRecommendations recommendations={data?.ai_recommendations} />

        {/* Key Metrics — animated counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <AnimatedMetricCard
            title="Total Visits"
            rawValue={filtered.metrics.total_customers}
            format={formatNumber}
            icon={<Users className="w-6 h-6" />}
            trend={filtered.trends?.total_visits != null ? `${filtered.trends.total_visits > 0 ? '+' : ''}${filtered.trends.total_visits}%` : undefined}
            trendType={(filtered.trends?.total_visits ?? 0) >= 0 ? 'positive' : 'negative'}
            subtitle="latest month (first-time + repeat)"
            metricKey="customer_segments"
          />
          <AnimatedMetricCard
            title="Repeat Customers"
            rawValue={filtered.metrics.active_customers}
            format={formatNumber}
            icon={<TrendingUp className="w-6 h-6" />}
            trend={filtered.trends?.repeat_customers != null ? `${filtered.trends.repeat_customers > 0 ? '+' : ''}${filtered.trends.repeat_customers}%` : undefined}
            trendType={(filtered.trends?.repeat_customers ?? 0) >= 0 ? 'positive' : 'negative'}
            subtitle="returned this month"
            metricKey="customer_retention"
          />
          <AnimatedMetricCard
            title="First-Time Visitors"
            rawValue={filtered.metrics.new_customers_monthly}
            format={formatNumber}
            icon={<UserPlus className="w-6 h-6" />}
            trend={filtered.trends?.first_timers != null ? `${filtered.trends.first_timers > 0 ? '+' : ''}${filtered.trends.first_timers}%` : undefined}
            trendType={(filtered.trends?.first_timers ?? 0) >= 0 ? 'positive' : 'negative'}
            subtitle="new visitors this month"
            metricKey="acquisition_channels"
          />
          <AnimatedMetricCard
            title="Repeat Rate"
            rawValue={Math.round(filtered.metrics.avg_frequency * 10)}
            format={(v) => `${(v / 10).toFixed(1)}%`}
            icon={<ShoppingCart className="w-6 h-6" />}
            trend={filtered.trends?.repeat_rate != null ? `${filtered.trends.repeat_rate > 0 ? '+' : ''}${filtered.trends.repeat_rate}%` : undefined}
            trendType={(filtered.trends?.repeat_rate ?? 0) >= 0 ? 'positive' : 'negative'}
            subtitle={selectedOutlet === 'all' ? 'avg repeat customer rate across outlets' : `repeat rate for ${selectedOutlet}`}
            metricKey="customer_retention"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Customer Segmentation — animated donut */}
          <ClickableCard
            title="Customer Segmentation"
            subtitle={`First-time vs repeat split — ${outletLabel}`}
            metricKey="customer_segments"
            className="h-full"
          >
            <div className="h-[450px] flex flex-col">
              <div className="flex-1 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      key={donutKey}
                      data={filtered.segments}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={130}
                      innerRadius={75}
                      fill={AZA_COLORS.primary}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    >
                      {filtered.segments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: '-16px' }}>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(filtered.metrics.total_customers)}</p>
                    <p className="text-xs text-gray-500">Total Visits</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {filtered.segments.map((segment) => (
                  <div key={segment.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span className="text-sm text-gray-700">
                      {segment.name}: {segment.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ClickableCard>

          {/* CLV by Segment */}
          <ClickableCard
            title="Revenue per Customer by Outlet"
            subtitle="Monthly revenue ÷ total customers per outlet (latest month)"
            metricKey="avg_clv"
            className="h-full"
          >
            <div className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={selectedOutlet === 'all' ? data.clv_by_segment : filtered.clv_by_segment} margin={{ bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="segment"
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={100}
                  />
                  <YAxis tickFormatter={(value) => `₹${value / 1000}K`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="value" fill={AZA_COLORS.mistBlue} radius={[8, 8, 0, 0]} animationDuration={800}>
                    {(selectedOutlet === 'all' ? data.clv_by_segment : filtered.clv_by_segment || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          selectedOutlet !== 'all'
                            ? AZA_COLORS.bambooGreen
                            : index === 0 ? AZA_COLORS.bambooGreen : index === 1 ? AZA_COLORS.sunsetMandarin : AZA_COLORS.mistBlue
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ClickableCard>
        </div>

        {/* Repeat Rate by Outlet + Monthly Volume — side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Repeat Rate by Outlet — horizontal bars */}
          {filtered.repeat_by_outlet && filtered.repeat_by_outlet.length > 0 && (
            <ClickableCard
              title="Repeat Rate by Outlet"
              subtitle={selectedOutlet === 'all' ? 'Repeat customer % per outlet (latest month)' : `Repeat rate for ${selectedOutlet}`}
              metricKey="customer_retention"
              className="h-full"
            >
              <ResponsiveContainer width="100%" height={450}>
                <BarChart
                  data={selectedOutlet === 'all' ? filtered.repeat_by_outlet : (data.repeat_by_outlet || [])}
                  layout="vertical"
                  margin={{ left: 20, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => `${v}%`} domain={[0, 50]} />
                  <YAxis
                    type="category"
                    dataKey="outlet"
                    width={140}
                    tick={{ fontSize: 11 }}
                    interval={0}
                  />
                  <Tooltip
                    formatter={(value: number) => `${value}%`}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Bar dataKey="repeat_pct" name="Repeat %" radius={[0, 4, 4, 0]} animationDuration={800}>
                    {(selectedOutlet === 'all' ? filtered.repeat_by_outlet : (data.repeat_by_outlet || [])).map((entry: any, idx: number) => (
                      <Cell
                        key={idx}
                        fill={
                          selectedOutlet !== 'all' && entry.outlet === selectedOutlet
                            ? '#10B981'
                            : selectedOutlet !== 'all'
                            ? '#E5E7EB'
                            : idx === 0 ? '#10B981' : idx === (data.repeat_by_outlet || []).length - 1 ? '#EF4444' : AZA_COLORS.mistBlue
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ClickableCard>
          )}

          {/* Monthly Customer Volume */}
          {filtered.monthly_volume && filtered.monthly_volume.length > 0 && (
            <ClickableCard
              title="Monthly Customer Volume"
              subtitle={`First-time vs repeat visitors — ${outletLabel}`}
              metricKey="customer_segments"
              className="h-full"
            >
              <ResponsiveContainer width="100%" height={450}>
                <ComposedChart data={filtered.monthly_volume}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => v.substring(0, 3)}
                  />
                  <YAxis tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatNumber(value),
                      name === 'first_timers' ? 'First Timers' : name === 'repeat_customers' ? 'Repeat Customers' : 'Total'
                    ]}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend
                    formatter={(value) => value === 'first_timers' ? 'First Timers' : value === 'repeat_customers' ? 'Repeat Customers' : 'Total'}
                  />
                  <Bar dataKey="first_timers" name="first_timers" stackId="a" fill="#F59E0B" animationDuration={800} />
                  <Bar dataKey="repeat_customers" name="repeat_customers" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} animationDuration={800} />
                  <Line type="monotone" dataKey="total" name="total" stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </ClickableCard>
          )}
        </div>

        {/* Next Month Customer Forecast */}
        {forecastData && forecastData.aggregate && (
          <ClickableCard title="" className="mb-6 sm:mb-8" metricKey="customer_segments">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Next Month Customer Forecast</h3>
                <p className="text-sm text-gray-500">ML-predicted customer volumes across all outlets</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">ML Powered</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'First-Timers', value: forecastData.aggregate.first_timer, format: (v: number) => v.toLocaleString() },
                { label: 'Repeat', value: forecastData.aggregate.repeat_regular, format: (v: number) => v.toLocaleString() },
                { label: 'Total', value: forecastData.aggregate.total, format: (v: number) => v.toLocaleString() },
                { label: 'Repeat Rate', value: forecastData.aggregate.repeat_pct, format: (v: number) => `${v}%` },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{item.format(item.value)}</p>
                </div>
              ))}
            </div>
          </ClickableCard>
        )}

        {/* Retention Curve */}
        <ClickableCard
          title="Customer Retention Analysis"
          subtitle={`Monthly retention rate over ${data.analysis_period || '12 months'}${selectedOutlet !== 'all' ? ` — ${selectedOutlet}` : ''}`}
          className="mb-6 sm:mb-8"
          metricKey="customer_retention"
        >
          {filtered.retention && filtered.retention.length > 0 ? (
            <>
              <div className="overflow-x-auto">
              <div className="min-w-[500px]">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={filtered.retention}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="monthNumber"
                    label={{ value: 'Months Since First Purchase', position: 'insideBottom', offset: -5 }}
                    ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
                  />
                  <YAxis
                    tickFormatter={(value) => `${value}%`}
                    label={{ value: 'Retention Rate', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    formatter={(value: number) => `${value}%`}
                    labelFormatter={(label) => `Month ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="retention"
                    stroke={AZA_COLORS.mistBlue}
                    strokeWidth={3}
                    dot={{ fill: AZA_COLORS.mistBlue, r: 5 }}
                    name="Retention Rate"
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
              </div>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">3-Month Retention</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filtered.retention.find(r => r.monthNumber === 3)?.retention ?? 'N/A'}
                    {filtered.retention.find(r => r.monthNumber === 3)?.retention !== undefined && '%'}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">6-Month Retention</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filtered.retention.find(r => r.monthNumber === 6)?.retention ?? 'N/A'}
                    {filtered.retention.find(r => r.monthNumber === 6)?.retention !== undefined && '%'}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">12-Month Retention</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filtered.retention.find(r => r.monthNumber === 12)?.retention ?? 'N/A'}
                    {filtered.retention.find(r => r.monthNumber === 12)?.retention !== undefined && '%'}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-500 text-center">
                Data source: First Timer vs Regular/Repeat Customer Analysis
              </p>
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500 mb-2">Retention data not available</p>
              <p className="text-sm text-gray-400">
                Cohort-based retention tracking requires longitudinal customer data
              </p>
            </div>
          )}
        </ClickableCard>

        {/* Insights */}
        {data.insights && data.insights.length > 0 && (
          <ClickableCard title="Key Insights" subtitle="Actionable recommendations" metricKey="customer_segments">
            <div className="space-y-4">
              {data.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-700">{index + 1}</span>
                  </div>
                  <p className="text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </ClickableCard>
        )}
      </div>
    </>
  );
};
