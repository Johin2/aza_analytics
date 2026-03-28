// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { ClickableCard } from '../components/ui/ClickableCard';
import { MetricCard } from '../components/ui/MetricCard';
import { Loading } from '../components/ui/Loading';
import { DateFilterBar, DateFilterValue } from '../components/ui/DateFilterBar';
import { TabNavigation } from '../components/ui/TabNavigation';
import { analyticsApi } from '../services/api';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';
import { AZA_COLORS } from '../constants/brandColors';
import {
  ShoppingCart,
  IndianRupee,
  TrendingUp,
  Wallet,
  Clock,
  ChefHat,
  UtensilsCrossed,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlatformData {
  market_share?: Array<{ name: string; value: number; color?: string }>;
  revenue_comparison?: Array<{ platform?: string; name?: string; revenue: number; orders?: number }>;
  profitability?: Array<{
    Platform: string;
    Revenue: number;
    Commission: number;
    Delivery_Cost: number;
    Packaging_Cost: number;
    Food_Cost: number;
    Net_Profit: number;
    Profit_Margin: number;
  }>;
  order_metrics?: Record<string, { total_orders?: number; avg_aov?: number; cities?: number; period_label?: string }>;
  data_period?: { start: string; end: string; days: number };
}

interface ExpenseData {
  total_spend: number;
  monthly: Array<{
    month: number;
    month_name: string;
    total: number;
    by_category?: Record<string, number>;
    by_platform?: Record<string, number>;
  }>;
  category_totals: Record<string, number>;
  platform_totals: Record<string, number>;
  outlet_totals?: Record<string, number>;
}

interface HourlyItem {
  hour?: string;
  hour_slot?: string;
  orders?: number;
  metric_value?: number;
  revenue?: number;
}

interface HourlyData {
  data?: HourlyItem[];
  hours?: HourlyItem[];
  peak_hours?: Record<string, unknown>;
  peak_hour?: string;
  peak_orders?: number;
  total_orders?: number;
}

interface KPTItem {
  band: string;
  percentage: number;
  orders?: number;
}

interface KPTData {
  distribution?: KPTItem[];
  bands?: KPTItem[];
  summary?: Record<string, unknown>;
  avg_kpt?: number;
  total_orders?: number;
}

interface MealItem {
  meal_time: string;
  orders_pct: number;
  revenue_pct: number;
}

interface MealData {
  data?: MealItem[];
  meal_times?: MealItem[];
}

interface AOVData {
  cities: Array<{ city: string; swiggy_aov: number; zomato_aov: number }>;
  avg_swiggy_aov: number;
  avg_zomato_aov: number;
  aov_difference: number;
}

interface DeliveryZoneData {
  zones: Array<{ name: string; orders: number; percentage: number; color: string }>;
  primary_zone: string;
  primary_percentage: number;
  total_orders: number;
}

interface DayPatternData {
  days: Array<{ day: string; orders: number }>;
  busiest_day: string;
  busiest_day_orders: number;
}

interface CombinedData {
  platform: PlatformData | null;
  expenses: ExpenseData | null;
  hourly: HourlyData | null;
  kpt: KPTData | null;
  meals: MealData | null;
  aov: AOVData | null;
  deliveryZones: DeliveryZoneData | null;
  dayPatterns: DayPatternData | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const PlatformDelivery: React.FC = () => {
  const [activeTab, setActiveTab] = useState('comparison');
  const [filters, setFilters] = useState<DateFilterValue>({
    year: 2025,
    month: null,
    outlet: null,
  });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CombinedData | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.year, filters.month]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        platformData,
        expenseData,
        hourlyData,
        kptData,
        mealData,
        aovData,
        zonesData,
        dayData,
      ] = await Promise.all([
        analyticsApi.getPlatformAnalytics().catch(() => null),
        analyticsApi.getExpenses(filters.year, filters.month || undefined).catch(() => null),
        analyticsApi.getHourlyInsights().catch(() => null),
        analyticsApi.getKPTDistribution().catch(() => null),
        analyticsApi.getMealTimeInsights().catch(() => null),
        analyticsApi.getPlatformAOV().catch(() => null),
        analyticsApi.getDeliveryZones().catch(() => null),
        analyticsApi.getDayPatterns().catch(() => null),
      ]);
      setData({
        platform: platformData,
        expenses: expenseData,
        hourly: hourlyData,
        kpt: kptData,
        meals: mealData,
        aov: aovData,
        deliveryZones: zonesData,
        dayPatterns: dayData,
      });
    } catch (err) {
      console.error('Failed to load platform & delivery data:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Tabs -----------------------------------------------------------------

  const tabs = [
    { id: 'comparison', label: 'Platform Comparison' },
    { id: 'cost', label: 'Cost & Profitability' },
    { id: 'operations', label: 'Operations' },
  ];

  // --- Loading state --------------------------------------------------------

  if (loading) return <Loading size="lg" className="h-full" />;

  // --- Helpers for data access ----------------------------------------------

  const marketShare = data?.platform?.market_share ?? [];
  const revenueComparison = (data?.platform?.revenue_comparison ?? []).map((item) => ({
    ...item,
    platform: item.platform ?? item.name ?? 'Unknown',
  }));
  const orderMetrics = data?.platform?.order_metrics ?? {};
  const profitability = data?.platform?.profitability ?? [];

  // Compute KPI values for Tab 1
  const totalPlatformRevenue = revenueComparison.reduce((sum, r) => sum + (r.revenue ?? 0), 0);
  const totalPlatformOrders =
    (orderMetrics.Swiggy?.total_orders ?? 0) +
    (orderMetrics.Zomato?.total_orders ?? 0) +
    (orderMetrics.DineIn?.total_orders ?? 0);
  const swiggyAOV = orderMetrics.Swiggy?.avg_aov ?? 0;
  const zomatoAOV = orderMetrics.Zomato?.avg_aov ?? 0;

  // Expense helpers for Tab 2
  const expenses = data?.expenses;
  const categoryEntries = Object.entries(expenses?.category_totals ?? {});
  const categoryPieData = categoryEntries.map(([name, value]) => ({ name, value }));
  const platformTotalEntries = Object.entries(expenses?.platform_totals ?? {});
  const monthlyExpenses = expenses?.monthly ?? [];

  // Hourly helpers for Tab 3
  const hourlyItems: HourlyItem[] = data?.hourly?.data ?? data?.hourly?.hours ?? [];
  const kptItems: KPTItem[] = data?.kpt?.distribution ?? data?.kpt?.bands ?? [];
  const mealItems: MealItem[] = data?.meals?.data ?? data?.meals?.meal_times ?? [];

  // New data helpers
  const aovData = data?.aov;
  const deliveryZoneData = data?.deliveryZones;
  const dayPatternData = data?.dayPatterns;

  // Pie chart colors
  const PIE_COLORS = AZA_COLORS.chartColors;

  // Profit margin data for new chart
  const profitMarginData = profitability.map((platform) => ({
    platform: platform.Platform,
    margin: platform.Profit_Margin,
    profit: platform.Net_Profit,
  }));

  // --- Tab renderers --------------------------------------------------------

  const renderComparison = () => (
    <div className="space-y-6 sm:space-y-8">
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Total Platform Revenue"
          value={formatCurrency(totalPlatformRevenue)}
          icon={<IndianRupee className="w-6 h-6" />}
          subtitle="across all platforms"
          metricKey="platform_trends"
        />
        <MetricCard
          title="Total Orders"
          value={formatNumber(totalPlatformOrders)}
          icon={<ShoppingCart className="w-6 h-6" />}
          subtitle="Swiggy + Zomato + Dine-in"
          metricKey="platform_distribution"
        />
        <MetricCard
          title="Swiggy AOV"
          value={formatCurrency(swiggyAOV)}
          icon={<TrendingUp className="w-6 h-6" />}
          subtitle={`${orderMetrics.Swiggy?.cities ?? '-'} cities`}
          metricKey="platform_aov"
        />
        <MetricCard
          title="Zomato AOV"
          value={formatCurrency(zomatoAOV)}
          icon={<TrendingUp className="w-6 h-6" />}
          subtitle={`${orderMetrics.Zomato?.cities ?? '-'} cities`}
          metricKey="platform_aov"
        />
      </div>

      {/* Charts row - existing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Revenue comparison bar chart */}
        <ClickableCard
          title="Revenue by Platform"
          subtitle="Total revenue contribution per platform"
          metricKey="platform_trends"
        >
          <div className="h-[350px]">
            {revenueComparison.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                    {revenueComparison.map((entry, index) => (
                      <Cell
                        key={`rev-${index}`}
                        fill={
                          entry.platform === 'Swiggy'
                            ? AZA_COLORS.platforms.website
                            : entry.platform === 'Zomato'
                              ? AZA_COLORS.platforms.app
                              : AZA_COLORS.platforms.inStore
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No revenue data available
              </div>
            )}
          </div>
        </ClickableCard>

        {/* Market share pie chart */}
        <ClickableCard
          title="Order Volume Distribution"
          subtitle="Platform share by order count"
          metricKey="platform_distribution"
        >
          <div className="h-[350px] flex flex-col">
            {marketShare.length > 0 ? (
              <>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={marketShare}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${value}%`}
                        outerRadius={100}
                        fill={AZA_COLORS.secondary}
                        dataKey="value"
                      >
                        {marketShare.map((entry, index) => (
                          <Cell
                            key={`ms-${index}`}
                            fill={entry.color ?? PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {marketShare.map((platform) => (
                    <div key={platform.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              platform.color ??
                              PIE_COLORS[marketShare.indexOf(platform) % PIE_COLORS.length],
                          }}
                        />
                        <span className="text-sm text-gray-700">{platform.name}</span>
                      </div>
                      <span className="font-medium">{platform.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No market share data available
              </div>
            )}
          </div>
        </ClickableCard>
      </div>

      {/* NEW CHART: AOV Comparison by City */}
      {aovData && (
        <ClickableCard
          title="AOV Comparison by City"
          subtitle={`Swiggy avg: ₹${aovData.avg_swiggy_aov.toFixed(0)} | Zomato avg: ₹${aovData.avg_zomato_aov.toFixed(0)}`}
          metricKey="platform_aov"
        >
          <div className="h-[380px] flex flex-col">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aovData.cities}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(val) => `₹${val}`} domain={[1200, 'auto']} />
                  <Tooltip formatter={(value: number) => [`₹${value.toFixed(0)}`, '']} />
                  <Legend />
                  <Bar
                    dataKey="swiggy_aov"
                    fill={AZA_COLORS.platforms.swiggy}
                    name="Swiggy AOV"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="zomato_aov"
                    fill={AZA_COLORS.platforms.zomato}
                    name="Zomato AOV"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 text-center text-sm">
              <span className={aovData.aov_difference > 0 ? 'text-green-600' : 'text-red-600'}>
                Swiggy AOV is ₹{Math.abs(aovData.aov_difference).toFixed(0)}{' '}
                {aovData.aov_difference > 0 ? 'higher' : 'lower'} than Zomato
              </span>
            </div>
          </div>
        </ClickableCard>
      )}
    </div>
  );

  const renderCost = () => (
    <div className="space-y-6 sm:space-y-8">
      {/* Top-level expense KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Total Spend"
          value={formatCurrency(expenses?.total_spend ?? 0)}
          icon={<Wallet className="w-6 h-6" />}
          subtitle={filters.month ? `Month ${filters.month}, ${filters.year}` : `Year ${filters.year}`}
          metricKey="commission_analysis"
        />
        {categoryEntries.slice(0, 3).map(([cat, val]) => (
          <MetricCard
            key={cat}
            title={cat}
            value={formatCurrency(val)}
            icon={<IndianRupee className="w-6 h-6" />}
            subtitle="category spend"
            metricKey="commission_analysis"
          />
        ))}
      </div>

      {/* Charts: monthly trend + category pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Monthly expense trend */}
        <ClickableCard
          title="Monthly Expense Trend"
          subtitle={`${filters.year} monthly spend`}
          metricKey="commission_analysis"
        >
          <div className="h-[350px]">
            {monthlyExpenses.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyExpenses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month_name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="total" fill={AZA_COLORS.primary} radius={[6, 6, 0, 0]} name="Total Expense" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No monthly expense data available
              </div>
            )}
          </div>
        </ClickableCard>

        {/* Category breakdown pie */}
        <ClickableCard
          title="Expenses by Category"
          subtitle="Spend distribution across categories"
          metricKey="commission_analysis"
        >
          <div className="h-[350px] flex flex-col">
            {categoryPieData.length > 0 ? (
              <>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }: { name: string; percent?: number }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      >
                        {categoryPieData.map((_entry, index) => (
                          <Cell key={`cat-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {categoryPieData.map((entry, i) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="text-gray-700 truncate">{entry.name}</span>
                      <span className="font-medium ml-auto">{formatCurrency(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No category data available
              </div>
            )}
          </div>
        </ClickableCard>
      </div>

      {/* Platform-level expense breakdown */}
      {platformTotalEntries.length > 0 && (
        <ClickableCard
          title="Expenses by Platform"
          subtitle="Spend breakdown by platform partner"
          metricKey="commission_analysis"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {platformTotalEntries.map(([name, value]) => (
              <div
                key={name}
                className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100"
              >
                <p className="text-sm font-medium text-gray-600 mb-1">{name}</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(value)}</p>
              </div>
            ))}
          </div>
        </ClickableCard>
      )}

      {/* Profit margin from platform analytics (if available) */}
      {profitability.length > 0 && (
        <ClickableCard
          title="Platform Cost Structure"
          subtitle="Cost components and profit margins by platform"
          metricKey="commission_analysis"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={profitability.map((p) => ({
                    name: p.Platform,
                    commission: p.Commission,
                    food: p.Food_Cost,
                  }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `${v}%`} domain={[0, 50]} />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="commission" stackId="a" fill={AZA_COLORS.fortuneRed} name="Ads + Discounts" />
                  <Bar dataKey="food" stackId="a" fill={AZA_COLORS.bambooGreen} name="Food Cost (est.)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-semibold text-gray-700">Platform</th>
                    <th className="text-right py-2 font-semibold text-gray-700">Revenue</th>
                    <th className="text-right py-2 font-semibold text-gray-700">Net Profit</th>
                    <th className="text-right py-2 font-semibold text-gray-700">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {profitability.map((p, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-3 font-medium">{p.Platform}</td>
                      <td className="text-right py-3">{formatCurrency(p.Revenue)}</td>
                      <td className="text-right py-3">{formatCurrency(p.Net_Profit)}</td>
                      <td className="text-right py-3">
                        <span
                          className={`font-medium ${
                            p.Profit_Margin > 50
                              ? 'text-green-600'
                              : p.Profit_Margin > 40
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          }`}
                        >
                          {formatPercentage(p.Profit_Margin)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ClickableCard>
      )}

      {/* NEW CHARTS: Delivery Distance Distribution and Profit Margin Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* NEW CHART: Delivery Distance Distribution */}
        {deliveryZoneData && (
          <ClickableCard
            title="Delivery Distance Distribution"
            subtitle={`Primary zone: ${deliveryZoneData.primary_zone} | ${deliveryZoneData.total_orders.toLocaleString()} orders`}
            metricKey="delivery_distance"
          >
            <div className="h-[380px] flex flex-col">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deliveryZoneData.zones}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="orders"
                      label={({ name, percentage }) => `${name}: ${percentage.toFixed(0)}%`}
                    >
                      {deliveryZoneData.zones.map((entry, index) => (
                        <Cell key={`zone-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string, props: any) => [
                        `${value.toLocaleString()} orders (${props.payload.percentage.toFixed(1)}%)`,
                        props.payload.name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {deliveryZoneData.zones.map((zone, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color }} />
                    <span className="text-gray-700">{zone.name}</span>
                    <span className="font-medium ml-auto">{zone.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </ClickableCard>
        )}

        {/* NEW CHART: Profit Margin Comparison */}
        {profitMarginData.length > 0 && (
          <ClickableCard
            title="Profit Margin Comparison"
            subtitle="Net profit margins by platform"
            metricKey="commission_analysis"
          >
            <div className="h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitMarginData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Bar dataKey="margin" fill={AZA_COLORS.success} radius={[8, 8, 0, 0]}>
                    {profitMarginData.map((entry, index) => (
                      <Cell
                        key={`margin-${index}`}
                        fill={
                          entry.margin > 50
                            ? AZA_COLORS.bambooGreen
                            : entry.margin > 40
                              ? AZA_COLORS.sunsetMandarin
                              : AZA_COLORS.fortuneRed
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ClickableCard>
        )}
      </div>
    </div>
  );

  const renderOperations = () => (
    <div className="space-y-6 sm:space-y-8">
      {/* Operations KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <MetricCard
          title="Peak Hour"
          value={data?.hourly?.peak_hour ?? (data?.hourly as any)?.peak_hours?.peak ?? 'N/A'}
          icon={<Clock className="w-6 h-6" />}
          subtitle={
            data?.hourly?.peak_orders
              ? `${formatNumber(data.hourly.peak_orders)} orders`
              : 'from hourly data'
          }
          metricKey="kitchen_prep_efficiency"
        />
        <MetricCard
          title="Avg Prep Time"
          value={
            data?.kpt?.avg_kpt != null
              ? `${data.kpt.avg_kpt.toFixed(1)} min`
              : 'N/A'
          }
          icon={<ChefHat className="w-6 h-6" />}
          subtitle="Restaverse KPT data"
          metricKey="kitchen_prep_efficiency"
        />
        <MetricCard
          title="Total Hourly Orders"
          value={formatNumber(data?.hourly?.total_orders ?? 0)}
          icon={<UtensilsCrossed className="w-6 h-6" />}
          subtitle="across all hours"
          metricKey="kitchen_prep_efficiency"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Hourly order distribution */}
        <ClickableCard
          title="Hourly Order Distribution"
          subtitle={
            data?.hourly?.peak_hour
              ? `Peak at ${data.hourly.peak_hour}`
              : 'Orders by hour of day'
          }
          metricKey="kitchen_prep_efficiency"
        >
          <div className="h-[300px]">
            {hourlyItems.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={hourlyItems.map((h) => ({
                    hour: h.hour ?? h.hour_slot ?? '',
                    orders: h.orders ?? h.metric_value ?? 0,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 10 }}
                    interval={1}
                    tickFormatter={(val) =>
                      val
                        .split(' - ')[0]
                        .replace('am', '')
                        .replace('pm', 'p')
                    }
                  />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString(), 'Orders']}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <Bar dataKey="orders" fill={AZA_COLORS.sunsetMandarin} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No hourly data available
              </div>
            )}
          </div>
        </ClickableCard>

        {/* KPT distribution */}
        <ClickableCard
          title="Kitchen Prep Time Distribution"
          subtitle={
            data?.kpt?.avg_kpt != null
              ? `Average: ${data.kpt.avg_kpt.toFixed(1)} minutes`
              : 'Prep time bands'
          }
          metricKey="kitchen_prep_efficiency"
        >
          <div className="h-[300px]">
            {kptItems.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kptItems} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="band" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Orders']} />
                  <Bar dataKey="percentage" fill={AZA_COLORS.primary} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No KPT data available
              </div>
            )}
          </div>
          {(data?.kpt?.total_orders ?? 0) > 0 && (
            <div className="mt-3 text-center text-sm text-gray-600">
              {formatNumber(data?.kpt?.total_orders ?? 0)} orders analyzed
            </div>
          )}
        </ClickableCard>
      </div>

      {/* Meal time breakdown */}
      {mealItems.length > 0 && (
        <ClickableCard
          title="Meal Time Breakdown"
          subtitle="Order and revenue share by meal period"
          metricKey="kitchen_prep_efficiency"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mealItems}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="meal_time" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                  <Legend />
                  <Bar dataKey="orders_pct" fill={AZA_COLORS.primary} name="Orders %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue_pct" fill={AZA_COLORS.bambooGreen} name="Revenue %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {mealItems.map((meal, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{meal.meal_time}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-gray-600">Orders</p>
                      <p className="font-semibold">{formatPercentage(meal.orders_pct)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">Revenue</p>
                      <p className="font-semibold">{formatPercentage(meal.revenue_pct)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ClickableCard>
      )}

      {/* NEW CHART: Day-of-Week RadarChart */}
      {dayPatternData && (
        <ClickableCard
          title="Day-of-Week Pattern"
          subtitle={`Busiest: ${dayPatternData.busiest_day}`}
          metricKey="kitchen_prep_efficiency"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={dayPatternData.days}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis tick={{ fontSize: 9 }} />
                  <Radar
                    name="Orders"
                    dataKey="orders"
                    stroke={AZA_COLORS.fortuneRed}
                    fill={AZA_COLORS.fortuneRed}
                    fillOpacity={0.5}
                  />
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString(), 'Orders']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center space-y-3">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Weekly Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(dayPatternData.days.reduce((sum, d) => sum + d.orders, 0))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Busiest Day</p>
                <p className="text-lg font-semibold text-gray-900">{dayPatternData.busiest_day}</p>
                <p className="text-sm text-gray-600">{formatNumber(dayPatternData.busiest_day_orders)} orders</p>
              </div>
            </div>
          </div>
        </ClickableCard>
      )}
    </div>
  );

  // --- Main render ----------------------------------------------------------

  return (
    <>
      <Header
        title="Platform & Delivery"
        subtitle="Platform performance, costs, and operations"
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <DateFilterBar value={filters} onChange={setFilters} />
        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'comparison' && renderComparison()}
        {activeTab === 'cost' && renderCost()}
        {activeTab === 'operations' && renderOperations()}
      </div>
    </>
  );
};

export default PlatformDelivery;
