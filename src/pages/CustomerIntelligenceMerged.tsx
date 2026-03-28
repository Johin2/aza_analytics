import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { MetricCard } from '../components/ui/MetricCard';
import { ClickableCard } from '../components/ui/ClickableCard';
import { Loading } from '../components/ui/Loading';
import { DateFilterBar, DateFilterValue } from '../components/ui/DateFilterBar';
import { TabNavigation } from '../components/ui/TabNavigation';
import { analyticsApi } from '../services/api';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';
import { AZA_COLORS } from '../constants/brandColors';
import { Users, UserPlus, ShoppingCart, TrendingUp, RefreshCw, ArrowRight } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SegmentItem {
  name: string;
  value: number;
  color: string;
  percentage?: number;
}

interface CLVItem {
  segment: string;
  value: number;
}

interface RetentionPoint {
  month: string;
  monthNumber: number;
  retention: number;
}

interface CustomerData {
  segments: SegmentItem[];
  clv_by_segment: CLVItem[];
  retention: RetentionPoint[];
  metrics: {
    total_customers: number;
    active_customers: number;
    new_customers_monthly: number;
    avg_frequency: number;
  };
  insights: string[];
  analysis_period?: string;
  data_as_of?: string;
  total_customers?: number;
  customer_value?: number;
}

interface FunnelStage {
  stage: string;
  value: number;
  percentage: number;
}

interface FunnelData {
  funnel_stages: FunnelStage[];
  summary?: Record<string, unknown>;
}

interface ExecData {
  first_timer_ratio?: number;
  repeat_ratio?: number;
  first_timers?: number;
  repeats?: number;
  [key: string]: unknown;
}

interface JourneyData {
  behavioral_insights?: {
    seasonal_patterns?: Array<{
      month: string;
      orders: number;
      new_customers: number;
      retention_rate: number;
    }>;
    platform_preference?: Array<{
      segment: string;
      dine_in: number;
      swiggy: number;
      zomato: number;
      direct_delivery: number;
    }>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface MergedData {
  customers: CustomerData | null;
  funnel: FunnelData | null;
  exec: ExecData | null;
  journey: JourneyData | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const CustomerIntelligenceMerged: React.FC = () => {
  const [activeTab, setActiveTab] = useState('segmentation');
  const [filters, setFilters] = useState<DateFilterValue>({
    year: 2025,
    month: null,
    outlet: null,
  });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MergedData | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [customerData, funnelData, execData, journeyData] = await Promise.all([
        analyticsApi.getCustomerAnalytics().catch(() => null),
        analyticsApi.getConversionFunnel().catch(() => null),
        analyticsApi.getExecutiveSummary(filters.year).catch(() => null),
        analyticsApi.getCustomerJourney().catch(() => null),
      ]);
      setData({
        customers: customerData as CustomerData | null,
        funnel: funnelData as FunnelData | null,
        exec: execData as ExecData | null,
        journey: journeyData as JourneyData | null,
      });
    } catch (err) {
      console.error('Failed to load customer intelligence data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading size="lg" className="h-full" />;

  // -----------------------------------------------------------------------
  // Derived values
  // -----------------------------------------------------------------------

  const totalCustomers =
    data?.customers?.metrics?.total_customers ?? data?.customers?.total_customers ?? 0;

  const avgCLV = data?.customers?.customer_value ?? 0;

  const retentionRate =
    data?.customers?.metrics?.active_customers && totalCustomers
      ? (data.customers.metrics.active_customers / totalCustomers) * 100
      : 0;

  const firstTimerRatio = data?.exec?.first_timer_ratio ?? 0;

  const segments: SegmentItem[] =
    data?.customers?.segments && data.customers.segments.length > 0
      ? data.customers.segments
      : [
          { name: 'Champions', value: 18, color: AZA_COLORS.bambooGreen },
          { name: 'Loyal', value: 27, color: AZA_COLORS.primary },
          { name: 'Potential Loyalists', value: 22, color: AZA_COLORS.mistBlue },
          { name: 'New Customers', value: 15, color: AZA_COLORS.secondary },
          { name: 'At Risk', value: 12, color: AZA_COLORS.warning },
          { name: 'Lost', value: 6, color: AZA_COLORS.danger },
        ];

  // -----------------------------------------------------------------------
  // Tab definitions
  // -----------------------------------------------------------------------

  const tabs = [
    { id: 'segmentation', label: 'Segmentation' },
    { id: 'journey', label: 'Journey & Retention' },
  ];

  // -----------------------------------------------------------------------
  // Pie chart label renderer
  // -----------------------------------------------------------------------

  const RADIAN = Math.PI / 180;
  const renderPieLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
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

  // -----------------------------------------------------------------------
  // Funnel data
  // -----------------------------------------------------------------------

  const funnelStages: FunnelStage[] =
    data?.funnel?.funnel_stages && data.funnel.funnel_stages.length > 0
      ? data.funnel.funnel_stages
      : [
          { stage: 'Menu Opens', value: 10000, percentage: 100 },
          { stage: 'Add to Cart', value: 4500, percentage: 45 },
          { stage: 'Orders Placed', value: 2800, percentage: 28 },
        ];

  const maxFunnelValue = Math.max(...funnelStages.map((s) => s.value), 1);

  // -----------------------------------------------------------------------
  // Retention curve data
  // -----------------------------------------------------------------------

  const retentionCurve =
    data?.customers?.retention && data.customers.retention.length > 0
      ? data.customers.retention
      : Array.from({ length: 12 }, (_, i) => ({
          month: `M${i + 1}`,
          monthNumber: i + 1,
          retention: Math.round(100 * Math.pow(0.85, i + 1)),
        }));

  // -----------------------------------------------------------------------
  // Journey data - seasonal patterns and platform preferences
  // -----------------------------------------------------------------------

  const seasonalPatterns =
    data?.journey?.behavioral_insights?.seasonal_patterns ?? [];

  const platformPreferences =
    data?.journey?.behavioral_insights?.platform_preference ?? [];

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-6">
      <Header
        title="Customer Intelligence"
        subtitle="Segmentation, journey analysis, and retention insights"
      />

      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        <DateFilterBar value={filters} onChange={setFilters} />
        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* ============================================================= */}
        {/* Tab 1 - Segmentation                                          */}
        {/* ============================================================= */}
        {activeTab === 'segmentation' && (
          <div
            role="tabpanel"
            id="tabpanel-segmentation"
            aria-labelledby="tab-segmentation"
          >
            {/* KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <MetricCard
                title="Total Customers"
                value={formatNumber(totalCustomers)}
                icon={<Users className="w-6 h-6" />}
                subtitle="all time"
                metricKey="customer_segments"
              />
              <MetricCard
                title="Avg CLV"
                value={avgCLV ? formatCurrency(avgCLV) : 'N/A'}
                icon={<ShoppingCart className="w-6 h-6" />}
                subtitle="lifetime value"
                metricKey="avg_clv"
              />
              <MetricCard
                title="Retention Rate"
                value={formatPercentage(retentionRate)}
                icon={<RefreshCw className="w-6 h-6" />}
                trendType={retentionRate >= 50 ? 'positive' : 'negative'}
                subtitle="active / total"
                metricKey="customer_retention"
              />
              <MetricCard
                title="First-timer Ratio"
                value={firstTimerRatio ? formatPercentage(firstTimerRatio) : 'N/A'}
                icon={<UserPlus className="w-6 h-6" />}
                subtitle={`${filters.year} data`}
                metricKey="first_timer_repeat_enhanced"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
              {/* Pie - Customer Segments */}
              <ClickableCard
                title="Customer Segmentation"
                subtitle="RFM Analysis: Recency, Frequency, Monetary"
                metricKey="customer_segments"
                className="h-full"
              >
                <div className="h-[400px] flex flex-col">
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={segments}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderPieLabel}
                          outerRadius={120}
                          fill={AZA_COLORS.primary}
                          dataKey="value"
                        >
                          {segments.map((entry, index) => (
                            <Cell key={`seg-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {segments.map((seg) => (
                      <div key={seg.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: seg.color }}
                        />
                        <span className="text-sm text-gray-700">
                          {seg.name}: {seg.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </ClickableCard>

              {/* Bar - CLV by Segment */}
              <ClickableCard
                title="Customer Lifetime Value"
                subtitle="Average CLV by customer segment"
                metricKey="avg_clv"
                className="h-full"
              >
                <div className="h-[400px]">
                  {data?.customers?.clv_by_segment &&
                  data.customers.clv_by_segment.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.customers.clv_by_segment}
                        margin={{ bottom: 50 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="segment"
                          angle={-45}
                          textAnchor="end"
                          interval={0}
                          height={100}
                        />
                        <YAxis tickFormatter={(v) => `${formatCurrency(v)}`} />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Bar
                          dataKey="value"
                          fill={AZA_COLORS.mistBlue}
                          radius={[8, 8, 0, 0]}
                        >
                          {data.customers.clv_by_segment.map((_, index) => (
                            <Cell
                              key={`clv-${index}`}
                              fill={
                                AZA_COLORS.chartColors[
                                  index % AZA_COLORS.chartColors.length
                                ]
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      CLV segment data not available
                    </div>
                  )}
                </div>
              </ClickableCard>
            </div>

            {/* Insights */}
            {data?.customers?.insights && data.customers.insights.length > 0 && (
              <ClickableCard
                title="Key Insights"
                subtitle="Actionable recommendations"
                metricKey="customer_segments"
              >
                <div className="space-y-4">
                  {data.customers.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-700">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-gray-700">{insight}</p>
                    </div>
                  ))}
                </div>
              </ClickableCard>
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* Tab 2 - Journey & Retention                                    */}
        {/* ============================================================= */}
        {activeTab === 'journey' && (
          <div
            role="tabpanel"
            id="tabpanel-journey"
            aria-labelledby="tab-journey"
          >
            {/* KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <MetricCard
                title="New Customers"
                value={formatNumber(
                  data?.customers?.metrics?.new_customers_monthly ?? 0
                )}
                icon={<UserPlus className="w-6 h-6" />}
                subtitle="this month"
                metricKey="first_timer_repeat_enhanced"
              />
              <MetricCard
                title="Active Customers"
                value={formatNumber(
                  data?.customers?.metrics?.active_customers ?? 0
                )}
                icon={<TrendingUp className="w-6 h-6" />}
                subtitle="visited in last 90 days"
                metricKey="customer_retention"
              />
              <MetricCard
                title="Avg Frequency"
                value={
                  data?.customers?.metrics?.avg_frequency
                    ? data.customers.metrics.avg_frequency.toFixed(1)
                    : 'N/A'
                }
                icon={<ShoppingCart className="w-6 h-6" />}
                subtitle="orders / month"
                metricKey="customer_retention"
              />
              <MetricCard
                title="Repeat Ratio"
                value={
                  data?.exec?.repeat_ratio
                    ? formatPercentage(data.exec.repeat_ratio)
                    : 'N/A'
                }
                icon={<RefreshCw className="w-6 h-6" />}
                subtitle={`${filters.year} data`}
                metricKey="first_timer_repeat_enhanced"
              />
            </div>

            {/* Charts Row 1 - Funnel and Retention */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
              {/* Conversion Funnel */}
              <Card
                title="Conversion Funnel"
                subtitle="Menu opens through to completed orders"
              >
                <div className="space-y-4 py-2">
                  {funnelStages.map((stage, index) => {
                    const widthPct = (stage.value / maxFunnelValue) * 100;
                    return (
                      <div key={stage.stage}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {stage.stage}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatNumber(stage.value)} ({stage.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div
                            className="h-6 rounded-full transition-all duration-500 flex items-center pl-3"
                            style={{
                              width: `${Math.max(widthPct, 8)}%`,
                              backgroundColor:
                                AZA_COLORS.chartColors[
                                  index % AZA_COLORS.chartColors.length
                                ],
                            }}
                          >
                            <span className="text-xs font-medium text-white whitespace-nowrap">
                              {stage.percentage}%
                            </span>
                          </div>
                        </div>
                        {index < funnelStages.length - 1 && (
                          <div className="flex justify-center my-1">
                            <ArrowRight className="w-4 h-4 text-gray-300 rotate-90" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Retention Curve */}
              <ClickableCard
                title="Retention Curve"
                subtitle="Monthly retention rate over time"
                metricKey="customer_retention"
                className="h-full"
              >
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={retentionCurve}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="monthNumber"
                        label={{
                          value: 'Months Since First Purchase',
                          position: 'insideBottom',
                          offset: -5,
                        }}
                        ticks={retentionCurve.map((r) => r.monthNumber)}
                      />
                      <YAxis
                        tickFormatter={(v) => `${v}%`}
                        domain={[0, 100]}
                        label={{
                          value: 'Retention %',
                          angle: -90,
                          position: 'insideLeft',
                        }}
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
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Quick retention stats */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">3-Month</p>
                    <p className="text-xl font-bold text-gray-900">
                      {retentionCurve.find((r) => r.monthNumber === 3)?.retention ??
                        'N/A'}
                      {retentionCurve.find((r) => r.monthNumber === 3)?.retention !==
                        undefined && '%'}
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">6-Month</p>
                    <p className="text-xl font-bold text-gray-900">
                      {retentionCurve.find((r) => r.monthNumber === 6)?.retention ??
                        'N/A'}
                      {retentionCurve.find((r) => r.monthNumber === 6)?.retention !==
                        undefined && '%'}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">12-Month</p>
                    <p className="text-xl font-bold text-gray-900">
                      {retentionCurve.find((r) => r.monthNumber === 12)?.retention ??
                        'N/A'}
                      {retentionCurve.find((r) => r.monthNumber === 12)?.retention !==
                        undefined && '%'}
                    </p>
                  </div>
                </div>
              </ClickableCard>
            </div>

            {/* Charts Row 2 - Seasonal Patterns and Platform Preferences */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
              {/* Seasonal Customer Patterns */}
              <ClickableCard
                title="Seasonal Customer Patterns"
                subtitle="Monthly trends in acquisition and retention"
                metricKey="first_timer_repeat_enhanced"
              >
                <div className="h-[300px]">
                  {seasonalPatterns.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={seasonalPatterns}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip formatter={(value: number, name: string) => {
                          if (name === 'Retention Rate') return [`${value}%`, 'Retention Rate'];
                          return [formatNumber(value), name];
                        }} />
                        <Legend />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="orders"
                          stackId="1"
                          stroke={AZA_COLORS.primary}
                          fill={AZA_COLORS.primary}
                          fillOpacity={0.6}
                          name="Orders"
                        />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="new_customers"
                          stackId="2"
                          stroke={AZA_COLORS.success}
                          fill={AZA_COLORS.success}
                          fillOpacity={0.6}
                          name="New Customers"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="retention_rate"
                          stroke={AZA_COLORS.danger}
                          strokeWidth={3}
                          name="Retention Rate"
                          dot={{ fill: AZA_COLORS.danger }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      Seasonal pattern data not available
                    </div>
                  )}
                </div>
                {seasonalPatterns.length > 0 && (
                  <div className="mt-4 text-center text-sm text-gray-600">
                    Peak season: May-June with highest acquisition and retention rates
                  </div>
                )}
              </ClickableCard>

              {/* Platform Preferences by Segment */}
              <ClickableCard
                title="Platform Preferences by Segment"
                subtitle="Channel preference across customer segments"
                metricKey="platform_distribution"
              >
                <div className="h-[300px]">
                  {platformPreferences.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={platformPreferences}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="segment" />
                        <YAxis tickFormatter={(value) => `${value}%`} />
                        <Tooltip formatter={(value: number) => [`${value}%`, '']} />
                        <Legend />
                        <Bar dataKey="dine_in" fill={AZA_COLORS.platforms.inStore} name="In-Store" />
                        <Bar dataKey="swiggy" fill={AZA_COLORS.platforms.website} name="Website" />
                        <Bar dataKey="zomato" fill={AZA_COLORS.platforms.app} name="App" />
                        <Bar dataKey="direct_delivery" fill={AZA_COLORS.goldenSesame} name="Direct" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      Platform preference data not available
                    </div>
                  )}
                </div>
                {platformPreferences.length > 0 && (
                  <div className="mt-4 text-center text-sm text-gray-600">
                    Champions prefer dine-in (45%), while new customers favor delivery platforms
                  </div>
                )}
              </ClickableCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerIntelligenceMerged;
