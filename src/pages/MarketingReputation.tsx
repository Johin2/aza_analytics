// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { DateFilterBar, DateFilterValue } from '../components/ui/DateFilterBar';
import { TabNavigation } from '../components/ui/TabNavigation';
import { Card } from '../components/ui/Card';
import { MetricCard } from '../components/ui/MetricCard';
import { Loading } from '../components/ui/Loading';
import { analyticsApi } from '../services/api';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';
import { AZA_COLORS } from '../constants/brandColors';
import {
  DollarSign,
  TrendingUp,
  Star,
  MessageSquare,
  AlertCircle,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Eye,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface PageData {
  expenses: any;
  exec: any;
  complaints: any;
  adsEff: any;
  discEff: any;
  marketingData: any;
  reputationData: any;
}

const CHART_COLORS = AZA_COLORS.chartColors;

export const MarketingReputation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('marketing');
  const [filters, setFilters] = useState<DateFilterValue>({
    year: 2025,
    month: null,
    outlet: null,
  });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PageData | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.year, filters.month]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expenseData, execData, complaints, adsEff, discEff, marketingData, reputationData] =
        await Promise.all([
          analyticsApi
            .getExpenses(filters.year, filters.month || undefined)
            .catch(() => null),
          analyticsApi.getExecutiveSummary(filters.year).catch(() => null),
          analyticsApi.getComplaintAnalysis().catch(() => null),
          analyticsApi.getAdsEfficiency().catch(() => null),
          analyticsApi.getDiscountEfficiency().catch(() => null),
          analyticsApi.getMarketingData().catch(() => null),
          analyticsApi.getReputationData().catch(() => null),
        ]);
      setData({
        expenses: expenseData,
        exec: execData,
        complaints,
        adsEff,
        discEff,
        marketingData,
        reputationData,
      });
    } catch (err) {
      console.error('Error fetching marketing & reputation data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading size="lg" className="h-full" />;

  const tabs = [
    { id: 'marketing', label: 'Marketing Spend & ROI' },
    { id: 'ratings', label: 'Ratings & Reviews' },
    { id: 'efficiency', label: 'Cost Efficiency' },
  ];

  // ---------------------------------------------------------------------------
  // Tab 1 -- Marketing Spend & ROI
  // ---------------------------------------------------------------------------
  const renderMarketing = () => {
    const totalSpend = data?.expenses?.total_spend ?? 0;
    const aggregatorSpend = data?.expenses?.category_totals?.Aggregators ?? 0;
    const digitalSpend = data?.expenses?.category_totals?.Digital ?? 0;

    // Monthly expense trend
    const monthlyData: Array<{ month_name: string; total: number }> =
      data?.expenses?.monthly ?? [];

    // Per-outlet expense breakdown
    const outletTotals: Record<string, number> =
      data?.expenses?.outlet_totals ?? {};
    const outletData = Object.entries(outletTotals)
      .map(([name, amount]) => ({ name, amount: amount as number }))
      .sort((a, b) => b.amount - a.amount);

    // Platform spend breakdown
    const platformTotals: Record<string, number> =
      data?.expenses?.platform_totals ?? {};
    const platformData = Object.entries(platformTotals)
      .filter(([, v]) => (v as number) > 0)
      .map(([name, value]) => ({ name, value: value as number }));

    // Instagram Campaign Performance data
    const instagramCampaigns = data?.marketingData?.instagram_roi?.campaigns ?? [];

    // Budget Utilization data
    const instagramBudget = (data?.marketingData?.instagram_roi?.total_spend ?? 0) * 1.2;
    const zomatoBudget = data?.marketingData?.platform_budgets?.zomato?.budget_2024 ?? 0;
    const swiggyAnnualBudget =
      (data?.marketingData?.platform_budgets?.swiggy?.budget_per_outlet_2024 ?? 0) *
      (data?.marketingData?.platform_budgets?.swiggy?.total_outlets ?? 0) *
      12;
    const competitorBudget = data?.marketingData?.competitor_keywords?.total_budget ?? 0;

    const budgetUtilizationData = [
      {
        name: 'Instagram',
        budget: instagramBudget,
        spent: data?.marketingData?.instagram_roi?.total_spend ?? 0,
      },
      {
        name: 'App',
        budget: zomatoBudget,
        spent: data?.marketingData?.platform_budgets?.zomato?.spent_2024 ?? 0,
      },
      {
        name: 'Website',
        budget: swiggyAnnualBudget,
        spent: swiggyAnnualBudget,
      },
      {
        name: 'Competitor KW',
        budget: competitorBudget,
        spent: competitorBudget,
      },
    ].filter((item) => item.budget > 0 || item.spent > 0);

    // Marketing Spend Trends data
    const monthlyTrends = data?.marketingData?.monthly_trends ?? [];

    return (
      <div className="space-y-6 sm:space-y-8">
        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <MetricCard
            title="Total Marketing Spend"
            value={formatCurrency(totalSpend)}
            icon={<DollarSign className="w-6 h-6" />}
            subtitle={
              filters.month
                ? `Month ${filters.month}, ${filters.year}`
                : `Full year ${filters.year}`
            }
            metricKey="instagram_marketing_spend"
          />
          <MetricCard
            title="Aggregator Spend"
            value={formatCurrency(aggregatorSpend)}
            icon={<BarChart3 className="w-6 h-6" />}
            subtitle="Swiggy + Zomato combined"
            metricKey="instagram_marketing_spend"
          />
          <MetricCard
            title="Digital Spend"
            value={formatCurrency(digitalSpend)}
            icon={<TrendingUp className="w-6 h-6" />}
            subtitle="Instagram, Google & others"
            metricKey="instagram_marketing_spend"
          />
        </div>

        {/* Instagram Campaign Performance & Budget Utilization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <Card
            title="Instagram Campaign Performance"
            subtitle={`${formatPercentage(
              data?.marketingData?.instagram_roi?.roi_percentage ?? 0
            )} ROI across ${instagramCampaigns.length} campaigns`}
          >
            {instagramCampaigns.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={instagramCampaigns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      if (name === 'spend' || name === 'revenue')
                        return formatCurrency(value);
                      if (name === 'roi') return `${value}%`;
                      return formatNumber(value);
                    }}
                  />
                  <Bar dataKey="spend" fill={AZA_COLORS.fortuneRed} name="Spend" />
                  <Bar
                    dataKey="revenue"
                    fill={AZA_COLORS.bambooGreen}
                    name="Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 text-center py-12">
                No campaign data available
              </p>
            )}
          </Card>

          <Card title="Budget Utilization" subtitle="Marketing spend vs allocated budgets">
            {budgetUtilizationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetUtilizationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `₹${value / 1000000}M`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar
                    dataKey="budget"
                    fill={AZA_COLORS.gray.light}
                    name="Budget"
                  />
                  <Bar
                    dataKey="spent"
                    fill={AZA_COLORS.sunsetMandarin}
                    name="Spent"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 text-center py-12">
                No budget data available
              </p>
            )}
          </Card>
        </div>

        {/* Marketing Spend Trends */}
        <Card
          title="Marketing Spend Trends"
          subtitle={`Monthly spend by channel${
            monthlyTrends.length > 0 ? ` (${monthlyTrends.length} months)` : ''
          }`}
        >
          {monthlyTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="instagram_spend"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Instagram"
                />
                <Line
                  type="monotone"
                  dataKey="zomato_spend"
                  stroke={AZA_COLORS.platforms.zomato}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="App"
                />
                <Line
                  type="monotone"
                  dataKey="swiggy_spend"
                  stroke={AZA_COLORS.platforms.swiggy}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Website"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 text-center py-12">
              No monthly trend data available
            </p>
          )}
        </Card>

        {/* Monthly expense trend + Platform pie */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <Card
            title="Monthly Expense Trend"
            subtitle="Total marketing spend by month"
          >
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month_name"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      'Spend',
                    ]}
                  />
                  <Bar
                    dataKey="total"
                    fill={AZA_COLORS.primary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 text-center py-12">
                No monthly expense data available
              </p>
            )}
          </Card>

          <Card
            title="Platform Spend Breakdown"
            subtitle="Spend distribution across platforms"
          >
            {platformData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                    >
                      {platformData.map((_entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={CHART_COLORS[idx % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        formatCurrency(value),
                        'Spend',
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </>
            ) : (
              <p className="text-sm text-gray-500 text-center py-12">
                No platform spend data available
              </p>
            )}
          </Card>
        </div>

        {/* Per-outlet expense breakdown */}
        <Card
          title="Per-Outlet Expense Breakdown"
          subtitle="Marketing spend by outlet"
        >
          {outletData.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(300, outletData.length * 36)}>
              <BarChart data={outletData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => formatCurrency(v)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value: number) => [
                    formatCurrency(value),
                    'Spend',
                  ]}
                />
                <Bar
                  dataKey="amount"
                  fill={AZA_COLORS.secondary}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 text-center py-12">
              No outlet expense data available
            </p>
          )}
        </Card>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Tab 2 -- Ratings & Reviews
  // ---------------------------------------------------------------------------
  const renderRatings = () => {
    const repMetrics = data?.exec?.reputation_metrics ?? {};
    const avgRating = repMetrics.average_rating ?? 4.2;
    const totalReviews = repMetrics.total_reviews ?? 0;
    const responseRate = repMetrics.response_rate ?? 0;

    // Store performance for outlet ratings table
    const storePerf: Array<{ name: string; rating: number }> = (
      data?.exec?.store_performance ?? []
    )
      .map((s: any) => ({
        name: s.name ?? s.outlet ?? 'Unknown',
        rating: s.rating ?? s.average_rating ?? 0,
      }))
      .sort((a: { rating: number }, b: { rating: number }) => b.rating - a.rating);

    // Complaint total
    const totalComplaints = data?.complaints?.total_complaints ?? 0;

    // Rating Trends data
    const reviewTrends = (data?.reputationData?.rating_trends ?? []).map(
      (item: any) => ({
        ...item,
        date: item.month || item.date || '',
      })
    );

    const platformColors = {
      zomato: AZA_COLORS.platforms.zomato,
      swiggy: AZA_COLORS.platforms.swiggy,
      google: AZA_COLORS.platforms.google,
      tripadvisor: AZA_COLORS.platforms.tripadvisor,
    };

    // Sentiment Analysis data
    const sentimentData = [
      {
        name: 'Positive',
        value: data?.reputationData?.sentiment_analysis?.positive ?? 72.5,
        fill: AZA_COLORS.bambooGreen,
      },
      {
        name: 'Neutral',
        value: data?.reputationData?.sentiment_analysis?.neutral ?? 22.8,
        fill: AZA_COLORS.goldenSesame,
      },
      {
        name: 'Negative',
        value: data?.reputationData?.sentiment_analysis?.negative ?? 4.7,
        fill: AZA_COLORS.fortuneRed,
      },
    ];

    return (
      <div className="space-y-6 sm:space-y-8">
        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <MetricCard
            title="Average Rating"
            value={avgRating.toFixed(1)}
            icon={<Star className="w-6 h-6" />}
            subtitle="across all platforms"
            metricKey="online_ratings"
          />
          <MetricCard
            title="Total Reviews"
            value={formatNumber(totalReviews)}
            icon={<MessageSquare className="w-6 h-6" />}
            subtitle="all-time reviews"
            metricKey="online_ratings"
          />
          <MetricCard
            title="Response Rate"
            value={responseRate > 0 ? formatPercentage(responseRate) : 'N/A'}
            icon={<TrendingUp className="w-6 h-6" />}
            subtitle="management responses"
            metricKey="customer_ratings"
          />
          <MetricCard
            title="Total Complaints"
            value={formatNumber(totalComplaints)}
            icon={<AlertCircle className="w-6 h-6" />}
            subtitle="from review analysis"
            metricKey="online_ratings"
          />
        </div>

        {/* Rating Trends & Sentiment Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <Card
            title="Rating Trends"
            subtitle="Monthly rating evolution by platform"
          >
            {reviewTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reviewTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    domain={[3.5, 4.8]}
                    tickFormatter={(value) => value.toFixed(1)}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      value.toFixed(1),
                      name,
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="zomato_rating"
                    stroke={platformColors.zomato}
                    strokeWidth={2}
                    name="App"
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="swiggy_rating"
                    stroke={platformColors.swiggy}
                    strokeWidth={2}
                    name="Website"
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="google_rating"
                    stroke={platformColors.google}
                    strokeWidth={2}
                    name="Google"
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tripadvisor_rating"
                    stroke={platformColors.tripadvisor}
                    strokeWidth={2}
                    name="Tripadvisor"
                    dot={{ r: 3 }}
                  />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 text-center py-12">
                No rating trend data available
              </p>
            )}
          </Card>

          <Card title="Sentiment Analysis" subtitle="Customer sentiment breakdown">
            {sentimentData.some((d) => d.value > 0) ? (
              <>
                <div className="flex items-center justify-center mb-6">
                  <ResponsiveContainer width="60%" height={200}>
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`${value}%`, '']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <ThumbsUp className="w-4 h-4 text-aza-sage" />
                      <span className="font-semibold">
                        {sentimentData[0].value}%
                      </span>
                    </div>
                    <p className="text-gray-600">Positive</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Eye className="w-4 h-4 text-aza-gold" />
                      <span className="font-semibold">
                        {sentimentData[1].value}%
                      </span>
                    </div>
                    <p className="text-gray-600">Neutral</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <ThumbsDown className="w-4 h-4 text-aza-terracotta" />
                      <span className="font-semibold">
                        {sentimentData[2].value}%
                      </span>
                    </div>
                    <p className="text-gray-600">Negative</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500 text-center py-12">
                No sentiment data available
              </p>
            )}
          </Card>
        </div>

        {/* Outlet ratings table */}
        <Card
          title="Outlet Ratings"
          subtitle="Sorted by rating (highest first)"
        >
          {storePerf.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      #
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Outlet
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Rating
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 w-48">
                      Visual
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {storePerf.map((store, idx) => {
                    const pct = (store.rating / 5) * 100;
                    const barColor =
                      store.rating >= 4.0
                        ? AZA_COLORS.success
                        : store.rating >= 3.5
                        ? AZA_COLORS.warning
                        : AZA_COLORS.danger;
                    return (
                      <tr
                        key={idx}
                        className="border-b border-gray-50 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-gray-500">{idx + 1}</td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {store.name}
                        </td>
                        <td className="py-3 px-4 text-right font-bold">
                          {store.rating.toFixed(1)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: barColor,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-12">
              No outlet rating data available
            </p>
          )}
        </Card>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Tab 3 -- Cost Efficiency
  // ---------------------------------------------------------------------------
  const renderEfficiency = () => {
    // Ads efficiency data
    const adsRows: Array<{
      city: string;
      swiggy_ads_per_order: number;
      zomato_ads_per_order: number;
    }> = data?.adsEff?.data ?? data?.adsEff?.cities ?? [];

    // Discount efficiency data
    const discRows: Array<{
      city: string;
      swiggy_discount_per_order: number;
      zomato_discount_per_order: number;
    }> = data?.discEff?.data ?? data?.discEff?.cities ?? [];

    // Complaint reasons
    const complaintReasons: Array<{
      reason: string;
      count: number;
      percentage: number;
    }> = data?.complaints?.complaint_reasons ?? data?.complaints?.by_reason ?? [];

    return (
      <div className="space-y-6 sm:space-y-8">
        {/* Ads + Discount side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Ads per order */}
          <Card
            title="Ads Cost per Order"
            subtitle="Swiggy vs Zomato by city"
          >
            {adsRows.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={adsRows}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={(v) => `${v}`} />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toFixed(1)}`,
                      '',
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="swiggy_ads_per_order"
                    name="Website"
                    fill={AZA_COLORS.platforms.swiggy}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="zomato_ads_per_order"
                    name="App"
                    fill={AZA_COLORS.platforms.zomato}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 text-center py-12">
                No ads efficiency data available
              </p>
            )}
          </Card>

          {/* Discount per order */}
          <Card
            title="Discount per Order"
            subtitle="Swiggy vs Zomato by city"
          >
            {discRows.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={discRows}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={(v) => `${v}`} />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toFixed(1)}`,
                      '',
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="swiggy_discount_per_order"
                    name="Website"
                    fill={AZA_COLORS.platforms.swiggy}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="zomato_discount_per_order"
                    name="App"
                    fill={AZA_COLORS.platforms.zomato}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 text-center py-12">
                No discount efficiency data available
              </p>
            )}
          </Card>
        </div>

        {/* Complaint reasons breakdown */}
        <Card
          title="Complaint Reasons Breakdown"
          subtitle={`${data?.complaints?.total_complaints ?? 0} total complaints analyzed`}
        >
          {complaintReasons.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* Pie chart */}
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={complaintReasons}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="reason"
                    label={({ reason, percentage }) =>
                      `${(reason as string)?.slice(0, 14)}${(reason as string)?.length > 14 ? '..' : ''} ${(percentage as number)?.toFixed(0)}%`
                    }
                  >
                    {complaintReasons.map((_entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={CHART_COLORS[idx % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value} complaints`,
                      name,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              {/* Detail list */}
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {complaintReasons.map((reason, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          CHART_COLORS[idx % CHART_COLORS.length],
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {reason.reason}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {reason.count}
                      </p>
                      <p className="text-xs text-gray-500">
                        {reason.percentage?.toFixed(1) ?? '0'}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-12">
              No complaint data available
            </p>
          )}
        </Card>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      <Header
        title="Marketing & Reputation"
        subtitle="Marketing spend, ratings, and cost optimization"
      />

      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        <DateFilterBar value={filters} onChange={setFilters} />
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === 'marketing' && renderMarketing()}
        {activeTab === 'ratings' && renderRatings()}
        {activeTab === 'efficiency' && renderEfficiency()}
      </div>
    </div>
  );
};

export default MarketingReputation;
