// @ts-nocheck
import React, { useEffect, useState, useRef } from 'react';
import { Header } from '../components/layout/Header';
import { DateFilterBar, DateFilterValue } from '../components/ui/DateFilterBar';
import { TabNavigation } from '../components/ui/TabNavigation';
import { Card } from '../components/ui/Card';
import { MetricCard } from '../components/ui/MetricCard';
import { Loading } from '../components/ui/Loading';
import { analyticsApi } from '../services/api';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { AZA_COLORS } from '../constants/brandColors';
import { clsx } from 'clsx';
import {
  TrendingUp,
  Target,
  DollarSign,
  BarChart3,
  AlertTriangle,
  Send,
  MessageSquare,
  Bot,
  User,
  Utensils,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';

interface ChatEntry {
  role: 'user' | 'assistant';
  content: string;
}

interface PredictiveAIData {
  predictive: any;
  forecast: any;
  exec: any;
  itemIssues: any;
  menuData: any;
  basketData: any;
}

export const PredictiveAI: React.FC = () => {
  const [activeTab, setActiveTab] = useState('forecast');
  const [filters, setFilters] = useState<DateFilterValue>({
    year: 2025,
    month: null,
    outlet: null,
  });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PredictiveAIData | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.year]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [predictive, forecast, execData, itemIssues, menuData, basketData] = await Promise.all([
        analyticsApi.getPredictiveAnalytics(),
        analyticsApi.get30DayForecast().catch(() => null),
        analyticsApi.getExecutiveSummary(filters.year),
        analyticsApi.getItemIssues().catch(() => null),
        analyticsApi.getMenuIntelligence().catch(() => null),
        analyticsApi.getBasketSize().catch(() => null),
      ]);
      setData({ predictive, forecast, exec: execData, itemIssues, menuData, basketData });
    } catch (err) {
      console.error('Failed to load predictive AI data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = () => {
    const trimmed = chatMessage.trim();
    if (!trimmed) return;

    const userEntry: ChatEntry = { role: 'user', content: trimmed };
    const assistantEntry: ChatEntry = {
      role: 'assistant',
      content:
        'AI analysis is being processed. In the full version, this connects to the Claude AI backend for real-time insights about your restaurant data.',
    };

    setChatHistory((prev) => [...prev, userEntry, assistantEntry]);
    setChatMessage('');
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setChatMessage(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  };

  if (loading) return <Loading size="lg" className="h-full" />;

  const tabs = [
    { id: 'forecast', label: 'Revenue Forecasting' },
    { id: 'menu', label: 'Menu Intelligence' },
    { id: 'chat', label: 'AI Chat' },
  ];

  // --- Forecast tab helpers ---
  const forecastData = data?.forecast?.forecast;
  const predictedRevenue = forecastData?.predicted_revenue ?? null;
  const confidenceInterval = forecastData?.confidence_interval ?? null;
  const trendDirection = forecastData?.trend ?? null;
  const dailyForecast: Array<{
    date: string;
    predicted: number;
    lower_bound: number;
    upper_bound: number;
  }> = forecastData?.daily_forecast ?? [];

  // Also grab the old predictive forecast for fallback chart
  const predictiveForecast = data?.predictive?.forecast ?? [];

  // Model accuracy for radial chart
  const accuracyData = [
    {
      name: 'Model Accuracy',
      value: data?.predictive?.model_accuracy ?? 0,
      fill: AZA_COLORS.info,
    },
  ];

  // --- Menu tab helpers ---
  const menuPerformance = data?.exec?.menu_performance ?? null;
  const topItems: Array<{ item_name?: string; name?: string; orders?: number; revenue?: number }> =
    menuPerformance?.top_items ?? menuPerformance?.top_selling_item
      ? [{ name: menuPerformance?.top_selling_item }]
      : [];

  const itemIssuesData: Array<{
    item_name: string;
    quality_issues?: number;
    quantity_issues?: number;
    missing_items?: number;
    order_delayed?: number;
    spillage_issues?: number;
    wrong_items?: number;
    total_issues?: number;
  }> = data?.itemIssues?.data ?? data?.itemIssues?.items ?? [];

  // Sort issues by total descending and take first 10
  const sortedIssues = [...itemIssuesData]
    .map((item) => ({
      ...item,
      _total:
        (item.total_issues ?? 0) ||
        (item.quality_issues ?? 0) +
          (item.quantity_issues ?? 0) +
          (item.missing_items ?? 0) +
          (item.order_delayed ?? 0) +
          (item.spillage_issues ?? 0) +
          (item.wrong_items ?? 0),
    }))
    .sort((a, b) => b._total - a._total)
    .slice(0, 10);

  // Extract menu intelligence data
  const categoryPerformance =
    data?.menuData?.category_analysis?.categories?.map((cat: any) => ({
      ...cat,
      revenue_per_item: cat.total_revenue / cat.items_count,
    })) ?? [];

  const profitabilityMatrix =
    data?.menuData?.menu_performance?.top_performers?.map((item: any) => ({
      name: item.item_name,
      x: item.orders,
      y: item.profit_margin,
      revenue: item.revenue,
    })) ?? [];

  const platformPerformance = data?.menuData?.platform_performance
    ? [
        {
          name: 'In-Store',
          revenue: data.menuData.platform_performance.platform_margins.dine_in.revenue,
          margin: data.menuData.platform_performance.platform_margins.dine_in.net_margin,
          fill: AZA_COLORS.platforms.inStore,
        },
        {
          name: 'Website',
          revenue: data.menuData.platform_performance.platform_margins.swiggy.revenue,
          margin: data.menuData.platform_performance.platform_margins.swiggy.net_margin,
          fill: AZA_COLORS.platforms.website,
        },
        {
          name: 'App',
          revenue: data.menuData.platform_performance.platform_margins.zomato.revenue,
          margin: data.menuData.platform_performance.platform_margins.zomato.net_margin,
          fill: AZA_COLORS.platforms.app,
        },
      ]
    : [];

  const basketSizeData = data?.basketData?.quantities ?? [];

  const dietaryPreferences = data?.menuData?.customer_preferences?.dietary_preferences ?? [];

  // --- Render functions ---

  const renderForecast = () => {
    const confidenceLabel = confidenceInterval
      ? `${formatCurrency(confidenceInterval.lower ?? confidenceInterval[0])} - ${formatCurrency(confidenceInterval.upper ?? confidenceInterval[1])}`
      : 'N/A';

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <MetricCard
            title="Predicted Revenue"
            value={predictedRevenue != null ? formatCurrency(predictedRevenue) : 'N/A'}
            icon={<DollarSign className="w-6 h-6" />}
            trend={trendDirection ?? 'Calculating...'}
            trendType={
              trendDirection === 'up' || trendDirection === 'positive'
                ? 'positive'
                : trendDirection === 'down' || trendDirection === 'negative'
                  ? 'negative'
                  : 'neutral'
            }
            subtitle="30-day forecast"
            metricKey="demand_forecast"
          />
          <MetricCard
            title="Confidence Range"
            value={confidenceLabel}
            icon={<Target className="w-6 h-6" />}
            trend="95% interval"
            trendType="neutral"
            subtitle="prediction bounds"
            metricKey="demand_forecast"
          />
          <MetricCard
            title="Model Accuracy"
            value={data?.predictive?.model_accuracy ? `${data.predictive.model_accuracy}%` : 'N/A'}
            icon={<BarChart3 className="w-6 h-6" />}
            trend="ML-powered"
            trendType="positive"
            subtitle="forecast accuracy"
            metricKey="demand_forecast"
          />
        </div>

        {/* 30-Day Forecast Chart */}
        <Card
          title="30-Day Revenue Forecast"
          subtitle={
            dailyForecast.length > 0
              ? 'Daily predicted revenue with confidence bands'
              : predictiveForecast.length > 0
                ? 'Revenue forecast from predictive model'
                : undefined
          }
        >
          {dailyForecast.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={dailyForecast}>
                <defs>
                  <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={AZA_COLORS.info} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={AZA_COLORS.info} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="boundsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={AZA_COLORS.primary} stopOpacity={0.1} />
                    <stop offset="95%" stopColor={AZA_COLORS.primary} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => {
                    try {
                      return new Date(val).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                      });
                    } catch {
                      return val;
                    }
                  }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                  labelFormatter={(label) => {
                    try {
                      return new Date(label).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      });
                    } catch {
                      return label;
                    }
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="upper_bound"
                  stroke="none"
                  fill="url(#boundsGradient)"
                  name="Upper Bound"
                />
                <Area
                  type="monotone"
                  dataKey="lower_bound"
                  stroke="none"
                  fill="url(#boundsGradient)"
                  name="Lower Bound"
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke={AZA_COLORS.info}
                  strokeWidth={2.5}
                  fill="url(#forecastGradient)"
                  name="Predicted Revenue"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : predictiveForecast.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={predictiveForecast}>
                <defs>
                  <linearGradient id="fallbackGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={AZA_COLORS.info} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={AZA_COLORS.info} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => {
                    try {
                      return new Date(val).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                      });
                    } catch {
                      return val;
                    }
                  }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  labelFormatter={(label) => {
                    try {
                      return new Date(label).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      });
                    } catch {
                      return label;
                    }
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill={AZA_COLORS.info}
                  fillOpacity={0.08}
                  name="Upper Bound"
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="none"
                  fill={AZA_COLORS.info}
                  fillOpacity={0.08}
                  name="Lower Bound"
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke={AZA_COLORS.info}
                  strokeWidth={2.5}
                  dot={false}
                  name="Forecast"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Target className="w-12 h-12 mb-3 text-gray-300" />
              <p className="text-lg font-medium">Forecast model training...</p>
              <p className="text-sm mt-1">
                The revenue forecast model is being prepared. Check back shortly.
              </p>
            </div>
          )}

          {/* Summary stats below chart */}
          {dailyForecast.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total 30-Day Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    dailyForecast.reduce((sum, day) => sum + (day.predicted ?? 0), 0)
                  )}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Daily Average</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    dailyForecast.length > 0
                      ? dailyForecast.reduce((sum, day) => sum + (day.predicted ?? 0), 0) /
                          dailyForecast.length
                      : 0
                  )}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Peak Day</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    Math.max(...dailyForecast.map((day) => day.predicted ?? 0), 0)
                  )}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Model Accuracy Radial Chart - RESTORED */}
        <Card title="Model Performance" subtitle="Machine learning model accuracy metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="90%"
                  data={accuracyData}
                >
                  <RadialBar
                    dataKey="value"
                    fill={AZA_COLORS.info}
                    background={{ fill: AZA_COLORS.background?.secondary ?? '#f3f4f6' }}
                  />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-3xl font-bold"
                  >
                    {data?.predictive?.model_accuracy ?? 0}%
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
              <p className="text-center text-gray-600 mt-2">Prediction Accuracy</p>
            </div>
            <div className="flex items-center">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Model Insights:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>
                      • Random Forest algorithm with {data?.predictive?.model_accuracy ?? 0}%
                      accuracy
                    </li>
                    <li>• Trained on 12+ months of historical data</li>
                    <li>• Updates daily with new transaction data</li>
                    <li>• Accounts for seasonality and trends</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Predictive model info cards */}
        {data?.predictive && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Inventory Management" subtitle="AI-optimized inventory levels">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Daily Requirement</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(data.predictive?.inventory_metrics?.daily_requirement ?? 0)}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Safety Stock</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(data.predictive?.inventory_metrics?.safety_stock ?? 0)}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-blue-400" />
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Waste Reduction Potential</p>
                    <p className="text-xl font-bold text-gray-900">
                      {data.predictive?.inventory_metrics?.optimization_potential ?? 0}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </Card>

            <Card
              title="Dynamic Pricing Recommendations"
              subtitle="AI-suggested price adjustments"
            >
              <div className="mb-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Potential Revenue Increase</p>
                    <p className="text-2xl font-bold text-gray-900">
                      +{data.predictive?.pricing_strategy?.revenue_increase ?? 0}%
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm">Time-based Adjustments:</h4>
                {(data.predictive?.pricing_strategy?.recommended_adjustments ?? []).map(
                  (adj: { time: string; adjustment: string }, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-700 text-sm">{adj.time}</span>
                      <span
                        className={`font-semibold text-sm ${
                          adj.adjustment?.includes('+') ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {adj.adjustment}
                      </span>
                    </div>
                  )
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  };

  const renderMenu = () => {
    return (
      <div className="space-y-6">
        {/* Top Selling Items */}
        <Card title="Top Selling Items" subtitle="Best performing menu items from executive data">
          {topItems.length > 0 ? (
            <div className="space-y-3">
              {topItems.map((item, index) => {
                const itemName = item.item_name ?? item.name ?? 'Unknown Item';
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        index === 0
                          ? 'bg-yellow-500'
                          : index === 1
                            ? 'bg-gray-400'
                            : index === 2
                              ? 'bg-orange-500'
                              : 'bg-blue-500'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{itemName}</h4>
                      {item.orders != null && (
                        <p className="text-sm text-gray-500">
                          {formatNumber(item.orders)} orders
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      {item.revenue != null && (
                        <p className="font-bold text-gray-900">{formatCurrency(item.revenue)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Utensils className="w-10 h-10 mb-3 text-gray-300" />
              <p className="text-sm">No top selling items data available</p>
            </div>
          )}
        </Card>

        {/* Category Performance Bar+Line Chart - RESTORED */}
        {categoryPerformance.length > 0 && (
          <Card
            title="Category Performance Analysis"
            subtitle="Revenue and margin analysis by category"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tickFormatter={(value) => formatCurrency(value / 1000) + 'k'}
                />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'Revenue') return [formatCurrency(value), 'Revenue'];
                    if (name === 'Margin %') return [`${value}%`, 'Margin %'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="total_revenue"
                  fill={AZA_COLORS.primary}
                  name="Revenue"
                />
                <Line
                  yAxisId="right"
                  dataKey="avg_margin"
                  stroke={AZA_COLORS.success}
                  strokeWidth={3}
                  name="Margin %"
                  dot={{ fill: AZA_COLORS.success }}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center text-sm text-gray-600">
              {categoryPerformance.length > 0 &&
                `${categoryPerformance.reduce((best: any, cat: any) => (cat.avg_margin > best.avg_margin ? cat : best), categoryPerformance[0]).name} has the highest margin (${categoryPerformance.reduce((best: any, cat: any) => (cat.avg_margin > best.avg_margin ? cat : best), categoryPerformance[0]).avg_margin}%)`}
            </div>
          </Card>
        )}

        {/* Profitability vs Popularity Scatter Chart - RESTORED */}
        {profitabilityMatrix.length > 0 && (
          <Card
            title="Profitability vs Popularity Matrix"
            subtitle="Menu items plotted by orders vs profit margin"
          >
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={profitabilityMatrix}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" name="Orders" tickFormatter={formatNumber} />
                <YAxis dataKey="y" name="Margin %" tickFormatter={(value) => `${value}%`} />
                <ZAxis dataKey="revenue" range={[50, 400]} />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'Orders') return [formatNumber(value), 'Orders'];
                    if (name === 'Margin %') return [`${value}%`, 'Profit Margin'];
                    return [value, name];
                  }}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.name || ''}
                />
                <Scatter dataKey="y" fill={AZA_COLORS.sunsetMandarin} />
              </ScatterChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
              <div className="text-center p-2 bg-green-50 rounded">
                <p className="font-semibold text-green-800">Stars</p>
                <p className="text-green-600">High Orders, High Margin</p>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded">
                <p className="font-semibold text-yellow-800">Plow Horses</p>
                <p className="text-yellow-600">High Orders, Low Margin</p>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded">
                <p className="font-semibold text-blue-800">Puzzles</p>
                <p className="text-blue-600">Low Orders, High Margin</p>
              </div>
              <div className="text-center p-2 bg-red-50 rounded">
                <p className="font-semibold text-red-800">Dogs</p>
                <p className="text-red-600">Low Orders, Low Margin</p>
              </div>
            </div>
          </Card>
        )}

        {/* Platform Revenue & Margins Bar+Line Chart - RESTORED */}
        {platformPerformance.length > 0 && (
          <Card
            title="Platform Revenue & Margins"
            subtitle="Performance comparison across platforms"
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={platformPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tickFormatter={(value) => formatCurrency(value / 1000000) + 'M'}
                />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'Revenue') return [formatCurrency(value), 'Revenue'];
                    if (name === 'Net Margin') return [`${value}%`, 'Net Margin'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill={AZA_COLORS.primary} name="Revenue" />
                <Line
                  yAxisId="right"
                  dataKey="margin"
                  stroke={AZA_COLORS.danger}
                  strokeWidth={3}
                  name="Net Margin"
                  dot={{ fill: AZA_COLORS.danger }}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {data?.menuData?.platform_performance?.platform_bestsellers &&
                Object.entries(data.menuData.platform_performance.platform_bestsellers).map(
                  ([platform, items]: [string, any]) => (
                    <div key={platform} className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">{platform} Top Item:</span>
                      <span className="text-aza-sage">
                        {items?.[0]?.item ?? 'N/A'} ({items?.[0]?.orders ?? 0} orders)
                      </span>
                    </div>
                  )
                )}
            </div>
          </Card>
        )}

        {/* Basket Size Distribution Bar Chart - RESTORED */}
        {basketSizeData.length > 0 && (
          <Card
            title="Items per Order Distribution"
            subtitle={`Avg: ${(data?.basketData?.avg_items_per_order || 2.5).toFixed(1)} items/order | ${(data?.basketData?.total_orders || 0).toLocaleString()} orders`}
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={basketSizeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="quantity"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `${val} items`}
                />
                <YAxis tickFormatter={(val) => `${val}%`} />
                <Tooltip
                  formatter={(value: number, name: string, props: any) => [
                    `${props.payload.orders.toLocaleString()} orders (${value.toFixed(1)}%)`,
                    'Orders',
                  ]}
                />
                <Bar dataKey="percentage" fill={AZA_COLORS.sunsetMandarin} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-center">
              <div>
                <span className="text-gray-600">1 item:</span>{' '}
                <span className="font-medium">
                  {basketSizeData.find((d: any) => d.quantity === '1')?.percentage.toFixed(0) || 0}
                  %
                </span>
              </div>
              <div>
                <span className="text-gray-600">2 items:</span>{' '}
                <span className="font-medium">
                  {basketSizeData.find((d: any) => d.quantity === '2')?.percentage.toFixed(0) || 0}
                  %
                </span>
              </div>
              <div>
                <span className="text-gray-600">3+ items:</span>{' '}
                <span className="font-medium">
                  {basketSizeData
                    .filter((d: any) => parseInt(d.quantity) >= 3)
                    .reduce((sum: number, d: any) => sum + d.percentage, 0)
                    .toFixed(0) || 0}
                  %
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Dietary Preferences Cards - RESTORED */}
        {dietaryPreferences.length > 0 && (
          <Card title="Customer Dietary Preferences" subtitle="Preference trends and growth rates">
            <div className="space-y-4">
              {dietaryPreferences.map((pref: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{pref.type}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{pref.percentage}%</span>
                      {pref.growth_rate > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span
                      className={clsx(
                        'font-medium',
                        pref.growth_rate > 15
                          ? 'text-green-600'
                          : pref.growth_rate > 5
                            ? 'text-yellow-600'
                            : 'text-gray-600'
                      )}
                    >
                      Growth: {pref.growth_rate > 0 ? '+' : ''}
                      {pref.growth_rate}%
                    </span>
                    <span className="text-gray-600">Top: {pref.top_items?.[0] ?? 'N/A'}</span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-aza-coral h-2 rounded-full"
                        style={{ width: `${pref.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Item Issues Table */}
        <Card
          title="Item Issues Analysis"
          subtitle={
            sortedIssues.length > 0
              ? `Top ${sortedIssues.length} items by total issues`
              : 'Quality and fulfillment issues by item'
          }
        >
          {sortedIssues.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Item Name</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Quality Issues
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Quantity Issues
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Missing Items
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Order Delayed
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedIssues.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900 max-w-[200px] truncate">
                        {item.item_name}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {item.quality_issues ?? 0}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {item.quantity_issues ?? item.spillage_issues ?? 0}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {item.missing_items ?? 0}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {item.order_delayed ?? item.wrong_items ?? 0}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            item._total > 40
                              ? 'bg-red-100 text-red-700'
                              : item._total > 20
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {item._total}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <AlertTriangle className="w-10 h-10 mb-3 text-gray-300" />
              <p className="text-sm">No item issues data available</p>
            </div>
          )}
        </Card>
      </div>
    );
  };

  const renderChat = () => {
    const suggestions = [
      'Revenue forecast next month?',
      'Which outlet needs attention?',
      'Top performing menu items?',
    ];

    return (
      <Card className="flex flex-col min-h-[500px]">
        {/* Chat header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Aza AI Assistant</h3>
            <p className="text-xs text-gray-500">
              Ask questions about your fashion retail data
            </p>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-[300px] max-h-[400px]">
          {chatHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
              <MessageSquare className="w-12 h-12 mb-3 text-gray-300" />
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs mt-1">
                Start a conversation or pick a suggestion below
              </p>
            </div>
          )}
          {chatHistory.map((entry, index) => (
            <div
              key={index}
              className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start gap-2 max-w-[80%] ${
                  entry.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    entry.role === 'user'
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {entry.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    entry.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {entry.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested questions */}
        <div className="flex flex-wrap gap-2 pb-3 pt-2 border-t border-gray-100">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-full transition-colors border border-primary-200"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="flex items-center gap-2 pt-2">
          <input
            ref={inputRef}
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your restaurant data..."
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            aria-label="Chat message input"
          />
          <button
            onClick={handleSendChat}
            disabled={!chatMessage.trim()}
            className="w-10 h-10 flex items-center justify-center bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </Card>
    );
  };

  return (
    <>
      <Header
        title="Predictive & AI"
        subtitle="Forecasting, menu analytics, and AI insights"
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          <DateFilterBar value={filters} onChange={setFilters} />
          <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          <div
            role="tabpanel"
            id={`tabpanel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
          >
            {activeTab === 'forecast' && renderForecast()}
            {activeTab === 'menu' && renderMenu()}
            {activeTab === 'chat' && renderChat()}
          </div>
        </div>
      </div>
    </>
  );
};

export default PredictiveAI;
