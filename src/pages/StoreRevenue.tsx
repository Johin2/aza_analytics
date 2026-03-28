// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import { MetricCard } from '../components/ui/MetricCard';
import { DateFilterBar, DateFilterValue } from '../components/ui/DateFilterBar';
import { TabNavigation } from '../components/ui/TabNavigation';
import { analyticsApi } from '../services/api';
import { formatCurrency, formatNumber, formatPercentage, formatShortDate } from '../utils/formatters';
import { AZA_COLORS, PEAK_HOURS_COLORS } from '../constants/brandColors';
import {
  DollarSign,
  ShoppingBag,
  Store,
  Star,
  TrendingUp,
  TrendingDown,
  MapPin,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Line,
  ReferenceLine,
} from 'recharts';

interface StoreRevenueData {
  exec: any;
  sales: any;
  stores: any;
}

export const StoreRevenue: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<DateFilterValue>({
    year: 2025,
    month: null,
    outlet: null,
  });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StoreRevenueData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.year]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [execData, salesData, storeData] = await Promise.all([
        analyticsApi.getExecutiveSummary(filters.year),
        analyticsApi.getSalesAnalytics(),
        analyticsApi.getStoresData(),
      ]);
      setData({ exec: execData, sales: salesData, stores: storeData });
    } catch (err) {
      console.error('Failed to load store revenue data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading size="lg" className="h-full" />;
  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'revenue', label: 'Revenue Trends' },
    { id: 'deep-dive', label: 'Store Deep Dive' },
  ];

  // Safely extract store list from multiple possible data shapes
  const storeList: any[] =
    data?.stores?.summary?.stores ??
    data?.exec?.store_performance ??
    [];

  const totalRevenue =
    data?.stores?.summary?.total_revenue ??
    data?.exec?.total_revenue ??
    0;

  const totalOrders =
    data?.exec?.total_orders ??
    data?.stores?.summary?.total_orders ??
    0;

  const avgRating =
    data?.stores?.summary?.summary?.average_rating ??
    data?.exec?.reputation_metrics?.average_rating ??
    0;

  const outletCount = storeList.length || 1;
  const avgRevenuePerOutlet = totalRevenue / outletCount;

  // Revenue trends from sales analytics
  const revenueTrends: any[] =
    data?.sales?.daily_trends ?? data?.sales?.revenue_trends ?? [];

  // Outlet performance from sales analytics
  const outletPerformance: any[] = data?.sales?.outlet_performance ?? [];

  // Peak hours data from sales analytics
  const peakHoursData = data?.sales?.peak_hours
    ? [
        { name: 'Lunch', value: data.sales.peak_hours.lunch.percentage, color: PEAK_HOURS_COLORS.lunch },
        { name: 'Dinner', value: data.sales.peak_hours.dinner.percentage, color: PEAK_HOURS_COLORS.dinner },
        { name: 'Others', value: data.sales.peak_hours.others.percentage, color: PEAK_HOURS_COLORS.others },
      ]
    : [];

  // Regional data from stores data
  const regionalData = data?.stores?.comparative_analysis?.regional_summary
    ? Object.entries(data.stores.comparative_analysis.regional_summary).map(
        ([region, stats]: [string, any]) => ({
          region,
          stores: stats.store_count,
          avgRevenue: Math.round((stats.avg_revenue / 100000) * 10) / 10, // In lakhs, 1 decimal
          avgRating: stats.avg_rating,
        })
      )
    : [];

  // Rating distribution data - sorted by rating descending
  const ratingData = [...storeList]
    .sort((a, b) => {
      const ratingA = a.customer_rating ?? a.rating ?? 0;
      const ratingB = b.customer_rating ?? b.rating ?? 0;
      return ratingB - ratingA;
    })
    .map((store) => {
      const rating = store.customer_rating ?? store.rating ?? 0;
      return {
        name: store.store_name ?? store.outlet ?? store.name ?? 'Unknown',
        rating: rating,
        fill:
          rating >= 4.7
            ? '#10b981' // Green for excellent
            : rating >= 4.5
            ? '#3b82f6' // Blue for good
            : rating >= 4.3
            ? '#f59e0b' // Yellow for average
            : '#ef4444', // Red for below average
      };
    });

  // Sort stores by revenue descending for the rankings table
  const rankedStores = [...storeList].sort((a, b) => {
    const revA = a.monthly_revenue ?? a.revenue ?? 0;
    const revB = b.monthly_revenue ?? b.revenue ?? 0;
    return revB - revA;
  });

  // Custom label renderer for pie chart
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
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

  // ---- Tab renderers ----

  const renderOverview = () => (
    <div
      role="tabpanel"
      id="tabpanel-overview"
      aria-labelledby="tab-overview"
      className="space-y-6"
    >
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="w-5 h-5" />}
          metricKey="total_revenue"
        />
        <MetricCard
          title="Total Orders"
          value={formatNumber(totalOrders)}
          icon={<ShoppingBag className="w-5 h-5" />}
          metricKey="total_orders"
        />
        <MetricCard
          title="Avg Revenue / Outlet"
          value={formatCurrency(avgRevenuePerOutlet)}
          icon={<Store className="w-5 h-5" />}
          subtitle={`${outletCount} outlets`}
        />
        <MetricCard
          title="Average Rating"
          value={avgRating ? avgRating.toFixed(1) : '--'}
          icon={<Star className="w-5 h-5" />}
          metricKey="outlet_ratings"
        />
      </div>

      {/* Outlet Rankings Table */}
      <Card title="Outlet Rankings" subtitle="Sorted by revenue (highest first)">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                  #
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                  Outlet
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">
                  Revenue
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">
                  Growth
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody>
              {rankedStores.length > 0 ? (
                rankedStores.map((store, idx) => {
                  const name =
                    store.store_name ?? store.outlet ?? store.name ?? 'Unknown';
                  const revenue = store.monthly_revenue ?? store.revenue ?? 0;
                  const growth = store.growth_rate ?? store.growth ?? 0;
                  const rating = store.customer_rating ?? store.rating ?? 0;

                  return (
                    <tr
                      key={name}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900 text-sm">
                        {name}
                      </td>
                      <td className="py-3 px-4 text-right text-sm">
                        {formatCurrency(revenue)}
                      </td>
                      <td className="py-3 px-4 text-right text-sm">
                        {growth !== 0 ? (
                          <span
                            className={`inline-flex items-center gap-1 font-medium ${
                              growth > 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {growth > 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {growth > 0 ? '+' : ''}
                            {formatPercentage(growth)}
                          </span>
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-sm">
                        {rating > 0 ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="text-yellow-500">&#9733;</span>
                            {rating.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-gray-500 text-sm"
                  >
                    No store data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Rating Distribution - NEW CHART */}
      {ratingData.length > 0 && (
        <Card
          title="Rating Distribution by Outlet"
          subtitle={`Customer ratings across all stores (Avg: ${avgRating.toFixed(1)})`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-600">Excellent (4.7+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs text-gray-600">Good (4.5-4.6)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-xs text-gray-600">Average (4.3-4.4)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-gray-600">Below Avg (&lt;4.3)</span>
            </div>
          </div>
          <ResponsiveContainer
            width="100%"
            height={Math.max(300, ratingData.length * 40)}
          >
            <BarChart
              data={ratingData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                domain={[4.0, 5.0]}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => value.toFixed(1)}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                width={75}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}`, 'Rating']}
                labelFormatter={(label) => `${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <ReferenceLine
                x={avgRating}
                stroke="#6b7280"
                strokeDasharray="5 5"
                label={{
                  value: `Avg: ${avgRating.toFixed(1)}`,
                  position: 'top',
                  fontSize: 11,
                  fill: '#6b7280',
                }}
              />
              <Bar dataKey="rating" radius={[0, 4, 4, 0]}>
                {ratingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );

  const renderRevenueTrends = () => {
    // Build chart data from whatever shape the API returns
    const chartData = revenueTrends.map((item: any) => ({
      label: item.month ?? item.date ?? item.period ?? '',
      revenue: item.revenue ?? 0,
      orders: item.orders ?? 0,
    }));

    // Outlet revenue horizontal bar chart data
    const outletBarData = (
      outletPerformance.length > 0 ? outletPerformance : rankedStores
    ).map((s: any) => ({
      name: s.outlet ?? s.store_name ?? s.name ?? 'Unknown',
      revenue: s.revenue ?? s.monthly_revenue ?? 0,
    }));

    return (
      <div
        role="tabpanel"
        id="tabpanel-revenue"
        aria-labelledby="tab-revenue"
        className="space-y-6"
      >
        {/* Daily Revenue Area Chart with Dual Axis - NEW CHART */}
        {chartData.length > 0 && (
          <Card
            title="Revenue Trends"
            subtitle="Revenue and order volume over time"
          >
            <div className="overflow-x-auto">
              <div className="min-w-[500px]">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={AZA_COLORS.primary} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={AZA_COLORS.primary} stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11 }}
                      interval={chartData.length > 12 ? 4 : 0}
                      tickFormatter={(value) =>
                        chartData.length > 12 ? formatShortDate(value) : value
                      }
                    />
                    <YAxis
                      yAxisId="left"
                      tickFormatter={(value) => `₹${(value / 10000000).toFixed(1)}Cr`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === 'Revenue' ? formatCurrency(value) : value.toLocaleString(),
                        name,
                      ]}
                      labelFormatter={(label) =>
                        chartData.length > 12 ? `Date: ${formatShortDate(label)}` : `Month: ${label}`
                      }
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke={AZA_COLORS.primary}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      name="Revenue"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke={AZA_COLORS.success}
                      strokeWidth={2}
                      name="Orders"
                      dot={{ fill: AZA_COLORS.success, strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        )}

        {/* Monthly Revenue Bar Chart */}
        <Card
          title="Monthly Revenue"
          subtitle="Revenue trend across months"
        >
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tickFormatter={(v) => formatCurrency(v)}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === 'revenue'
                      ? formatCurrency(value)
                      : formatNumber(value),
                    name === 'revenue' ? 'Revenue' : 'Orders',
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill={AZA_COLORS.primary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <p>No revenue trend data available</p>
            </div>
          )}
        </Card>

        {/* Peak Hours Distribution - NEW CHART */}
        {peakHoursData.length > 0 && (
          <Card
            title="Peak Hours Analysis"
            subtitle="Order distribution by time of day"
          >
            <div className="flex flex-col h-[450px]">
              <div className="flex-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={peakHoursData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill={AZA_COLORS.primary}
                      dataKey="value"
                    >
                      {peakHoursData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {data?.sales?.peak_hours && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Lunch ({data.sales.peak_hours.lunch.time})
                    </span>
                    <span className="font-medium">
                      {data.sales.peak_hours.lunch.percentage}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Dinner ({data.sales.peak_hours.dinner.time})
                    </span>
                    <span className="font-medium">
                      {data.sales.peak_hours.dinner.percentage}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Revenue by Outlet */}
        <Card
          title="Revenue by Outlet"
          subtitle={`Comparative revenue across ${outletBarData.length} outlets`}
        >
          {outletBarData.length > 0 ? (
            <div className="overflow-y-auto max-h-[500px]">
              <ResponsiveContainer
                width="100%"
                height={Math.max(350, outletBarData.length * 40)}
              >
                <BarChart
                  data={outletBarData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal
                    vertical={false}
                  />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => formatCurrency(v)}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={110}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      'Revenue',
                    ]}
                  />
                  <Bar
                    dataKey="revenue"
                    fill={AZA_COLORS.info}
                    radius={[0, 4, 4, 0]}
                  >
                    {outletBarData.map((_: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
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
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <p>No outlet data available</p>
            </div>
          )}
        </Card>
      </div>
    );
  };

  const renderDeepDive = () => {
    const stores =
      storeList.length > 0
        ? storeList
        : outletPerformance;

    return (
      <div
        role="tabpanel"
        id="tabpanel-deep-dive"
        aria-labelledby="tab-deep-dive"
        className="space-y-6"
      >
        {/* Regional Performance - NEW CHART */}
        {regionalData.length > 0 && (
          <Card
            title="Regional Performance"
            subtitle="Average revenue by region"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Average Revenue by Region */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Average Revenue by Region
                </h4>
                <p className="text-xs text-gray-500 mb-3">Monthly average in Lakhs</p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={regionalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="region"
                      interval={0}
                      tick={{ fontSize: 10 }}
                      angle={-25}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: number) => [`₹${value.toFixed(1)}L`, 'Avg Revenue']}
                    />
                    <Bar dataKey="avgRevenue" fill={AZA_COLORS.info} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Store Count by Region */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Store Count by Region
                </h4>
                <p className="text-xs text-gray-500 mb-3">Number of outlets per region</p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={regionalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="region"
                      interval={0}
                      tick={{ fontSize: 10 }}
                      angle={-25}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip formatter={(value: number) => [value, 'Stores']} />
                    <Bar dataKey="stores" fill={AZA_COLORS.success} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        )}

        {/* Store Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {stores.length > 0 ? (
            stores.map((store: any, idx: number) => {
              const name =
                store.store_name ?? store.outlet ?? store.name ?? 'Unknown';
              const revenue = store.monthly_revenue ?? store.revenue ?? 0;
              const growth = store.growth_rate ?? store.growth ?? 0;
              const rating = store.customer_rating ?? store.rating ?? 0;
              const region = store.region ?? store.city ?? '';
              const storeType = store.type ?? store.store_type ?? '';
              const status = store.status ?? '';

              const statusColor =
                status === 'Excellent'
                  ? 'bg-green-100 text-green-800'
                  : status === 'Good'
                  ? 'bg-blue-100 text-blue-800'
                  : status === 'Average'
                  ? 'bg-yellow-100 text-yellow-800'
                  : status
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-600';

              return (
                <Card key={`${name}-${idx}`} className="hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                      <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                        {name}
                      </h4>
                    </div>
                    {status && (
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColor}`}
                      >
                        {status}
                      </span>
                    )}
                  </div>

                  {(region || storeType) && (
                    <p className="text-xs text-gray-500 mb-3">
                      {[region, storeType].filter(Boolean).join(' / ')}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Revenue</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(revenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Growth</p>
                      <p
                        className={`text-sm font-semibold ${
                          growth > 0
                            ? 'text-green-600'
                            : growth < 0
                            ? 'text-red-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {growth !== 0
                          ? `${growth > 0 ? '+' : ''}${formatPercentage(growth)}`
                          : '--'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Rating</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {rating > 0 ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="text-yellow-500">&#9733;</span>
                            {rating.toFixed(1)}
                          </span>
                        ) : (
                          '--'
                        )}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500">
              No store data available
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Header
        title="Store & Revenue"
        subtitle="Consolidated store performance and revenue analytics"
      />

      <div className="px-4 sm:px-6 lg:px-8 space-y-4">
        <DateFilterBar value={filters} onChange={setFilters} />
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'revenue' && renderRevenueTrends()}
        {activeTab === 'deep-dive' && renderDeepDive()}
      </div>
    </div>
  );
};
