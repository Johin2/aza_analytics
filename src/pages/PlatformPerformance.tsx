import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { ClickableCard } from '../components/ui/ClickableCard';
import { Loading } from '../components/ui/Loading';
import DateFilter from '../components/filters/DateFilter';
import { analyticsApi } from '../services/api';
import { PlatformAnalytics } from '../types/analytics';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { AZA_COLORS } from '../constants/brandColors';
import { AIRecommendations } from '../components/ui/AIRecommendations';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ExtendedPlatformAnalytics extends PlatformAnalytics {
  data_period?: {
    start: string;
    end: string;
    days: number;
  };
  ai_recommendations?: string[];
}

// Restaverse data types
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

export const PlatformPerformance: React.FC = () => {
  const [data, setData] = useState<ExtendedPlatformAnalytics | null>(null);
  const [aovData, setAovData] = useState<AOVData | null>(null);
  const [deliveryZoneData, setDeliveryZoneData] = useState<DeliveryZoneData | null>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [response, aov, zones] = await Promise.all([
        analyticsApi.getPlatformAnalytics(selectedYear, selectedMonth),
        analyticsApi.getPlatformAOV().catch(() => null),
        analyticsApi.getDeliveryZones().catch(() => null)
      ]);
      setData(response as ExtendedPlatformAnalytics);
      if (aov) setAovData(aov);
      if (zones) setDeliveryZoneData(zones);
      analyticsApi.getPlatformForecast(6).then(res => {
        if (res?.success) setForecastData(res);
      }).catch(() => {});
    } catch (err) {
      setError('Failed to load platform analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading size="lg" className="h-full" />;
  if (error || !data) return <div className="p-8 text-red-600">{error}</div>;

  const costBreakdownData = data.profitability.map(platform => ({
    name: platform.Platform,
    commission: platform.Commission,
    delivery: platform.Delivery_Cost,
    packaging: platform.Packaging_Cost,
    food: platform.Food_Cost,
  }));

  const profitMarginData = data.profitability.map(platform => ({
    platform: platform.Platform,
    margin: platform.Profit_Margin,
    profit: platform.Net_Profit,
  }));

  return (
    <>
      <Header
        title="Platform Performance"
        subtitle="Comparative analysis across delivery platforms"
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-3">
          <DateFilter
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
          />
        </div>
        <AIRecommendations recommendations={data?.ai_recommendations} />

        {/* Market Share */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <ClickableCard title="Order Volume Distribution" subtitle={`Platform share by order count (not revenue)${data.data_period ? ` • ${data.data_period.days} days` : ''}`} metricKey="platform_distribution" className="h-full">
            <div className="h-[380px] flex flex-col">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.market_share}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${value}%`}
                      outerRadius={100}
                      fill={AZA_COLORS.secondary}
                      dataKey="value"
                    >
                      {data.market_share.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {data.market_share.map((platform) => (
                  <div key={platform.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: platform.color }}
                      />
                      <span className="text-sm text-gray-700">{platform.name}</span>
                    </div>
                    <span className="font-medium">{platform.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </ClickableCard>

          {/* Revenue Comparison */}
          <ClickableCard title="Revenue by Platform" subtitle={`Total revenue contribution${data.data_period ? ` (Last ${data.data_period.days} days)` : ''}`} metricKey="platform_trends" className="h-full">
            <div className="h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.revenue_comparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis tickFormatter={(value) => `₹${value / 100000}L`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                    {data.revenue_comparison.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.platform === 'Swiggy' ? AZA_COLORS.platforms.website :
                          entry.platform === 'Zomato' ? AZA_COLORS.platforms.app : AZA_COLORS.platforms.inStore
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ClickableCard>

          {/* Key Metrics */}
          <div className="flex flex-col gap-4 h-full">
            <ClickableCard className="bg-gradient-to-br from-green-50 to-white flex-1" metricKey="platform_distribution">
              <h4 className="text-sm font-medium text-gray-600 mb-2">In-Store Traffic</h4>
              <p className="text-2xl font-bold text-gray-900">
                {data.order_metrics.DineIn?.total_orders?.toLocaleString() || 'N/A'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {data.order_metrics.DineIn?.period_label ? `${data.order_metrics.DineIn.period_label} total` : 'Latest month footfalls'}
              </p>
            </ClickableCard>
            <ClickableCard className="bg-gradient-to-br from-orange-50 to-white flex-1" metricKey="platform_aov">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Swiggy Orders</h4>
              <p className="text-2xl font-bold text-gray-900">
                {data.order_metrics.Swiggy?.total_orders?.toLocaleString() || 'N/A'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Avg AOV: {formatCurrency(data.order_metrics.Swiggy?.avg_aov || 0)} ({data.order_metrics.Swiggy?.cities || 5} cities)
              </p>
            </ClickableCard>
            <ClickableCard className="bg-gradient-to-br from-red-50 to-white flex-1" metricKey="platform_aov">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Zomato Orders</h4>
              <p className="text-2xl font-bold text-gray-900">
                {data.order_metrics.Zomato?.total_orders?.toLocaleString() || 'N/A'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Avg AOV: {formatCurrency(data.order_metrics.Zomato?.avg_aov || 0)} ({data.order_metrics.Zomato?.cities || 5} cities)
              </p>
            </ClickableCard>
          </div>
        </div>

        {/* Cost Breakdown */}
        <ClickableCard
          title="Cost Structure Analysis"
          subtitle={`Cost breakdown by platform${data.data_period ? ` • ${new Date(data.data_period.start).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - ${new Date(data.data_period.end).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}`}
          className="mb-6 sm:mb-8"
          metricKey="commission_analysis"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="overflow-x-auto">
            <div className="min-w-[400px]">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={costBreakdownData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `${value}%`} domain={[0, 50]} />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Legend />
                <Bar dataKey="commission" stackId="a" fill={AZA_COLORS.fortuneRed} name="Ad Spend (Expense Sheet)" />
                <Bar dataKey="food" stackId="a" fill={AZA_COLORS.bambooGreen} name="Food Cost (30% est.)" />
              </BarChart>
            </ResponsiveContainer>
            </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Cost Definitions</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: AZA_COLORS.fortuneRed }} />
                      Ad Spend
                    </span>
                    <span className="text-gray-600">Real ad spend from Aza Expense Sheet (Jan–Sept 2025)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: AZA_COLORS.bambooGreen }} />
                      Food Cost
                    </span>
                    <span className="text-gray-600">Ingredients & preparation (30% industry est.)</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-xs text-gray-500">
                  {data.profitability.filter(p => p.Commission > 0).map(p => (
                    <div key={p.Platform}>
                      {p.Platform}: {p.Commission}% ad spend (% of platform revenue)
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Dine-in has 0% platform costs, resulting in ~70% profit margins vs ~58-60% for delivery platforms.
                </p>
              </div>
            </div>
          </div>
        </ClickableCard>

        {/* Restaverse Insights Section */}
        {(aovData || deliveryZoneData) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
            {/* AOV Comparison by City */}
            {aovData && (
              <ClickableCard
                title="AOV Comparison by City"
                subtitle={`Swiggy avg: ₹${aovData.avg_swiggy_aov.toFixed(0)} | Zomato avg: ₹${aovData.avg_zomato_aov.toFixed(0)}`}
                metricKey="platform_aov"
                className="h-full"
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
                      Swiggy AOV is ₹{Math.abs(aovData.aov_difference).toFixed(0)} {aovData.aov_difference > 0 ? 'higher' : 'lower'} than Zomato
                    </span>
                  </div>
                </div>
              </ClickableCard>
            )}

            {/* Delivery Zone Distribution */}
            {deliveryZoneData && (
              <ClickableCard
                title="Delivery Distance Distribution"
                subtitle={`Primary zone: ${deliveryZoneData.primary_zone} | ${deliveryZoneData.total_orders.toLocaleString()} orders`}
                metricKey="delivery_distance"
                className="h-full"
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
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number, name: string, props: any) => [
                            `${value.toLocaleString()} orders (${props.payload.percentage.toFixed(1)}%)`,
                            props.payload.name
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
          </div>
        )}

        {forecastData && forecastData.aggregate_share && (
          <ClickableCard title="" className="mt-6 mb-8" metricKey="platform_distribution">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Projected Platform Share — Next Month</h3>
                <p className="text-sm text-gray-500">ML-predicted order distribution</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">ML Powered</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex-1 text-center">
                <p className="text-sm font-medium text-gray-500">Swiggy</p>
                <p className="text-3xl font-bold" style={{ color: '#FC8019' }}>{forecastData.aggregate_share.swiggy || 0}%</p>
              </div>
              <div className="flex-1">
                <div className="h-4 rounded-full overflow-hidden flex bg-gray-100">
                  <div className="h-full" style={{ width: `${forecastData.aggregate_share.swiggy || 50}%`, backgroundColor: '#FC8019' }} />
                  <div className="h-full" style={{ width: `${forecastData.aggregate_share.zomato || 50}%`, backgroundColor: '#E23744' }} />
                </div>
              </div>
              <div className="flex-1 text-center">
                <p className="text-sm font-medium text-gray-500">Zomato</p>
                <p className="text-3xl font-bold" style={{ color: '#E23744' }}>{forecastData.aggregate_share.zomato || 0}%</p>
              </div>
            </div>
          </ClickableCard>
        )}

        {/* Profit Margins */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <ClickableCard title="Profit Margin Comparison" subtitle="Net profit margins by platform" metricKey="commission_analysis" className="h-full">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitMarginData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Bar dataKey="margin" fill={AZA_COLORS.success} radius={[8, 8, 0, 0]}>
                    {profitMarginData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.margin > 50 ? AZA_COLORS.bambooGreen : entry.margin > 40 ? AZA_COLORS.sunsetMandarin : AZA_COLORS.fortuneRed}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ClickableCard>

          {/* Profitability Table */}
          <ClickableCard title="Detailed Profitability" subtitle="Complete financial breakdown" metricKey="commission_analysis" className="h-full">
            <div className="h-[300px] flex flex-col justify-center">
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
                    {data.profitability.map((platform, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 font-medium">{platform.Platform}</td>
                        <td className="text-right py-3">{formatCurrency(platform.Revenue)}</td>
                        <td className="text-right py-3">{formatCurrency(platform.Net_Profit)}</td>
                        <td className="text-right py-3">
                          <span className={`font-medium ${
                            platform.Profit_Margin > 50 ? 'text-green-600' :
                            platform.Profit_Margin > 40 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {formatPercentage(platform.Profit_Margin)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ClickableCard>
        </div>
      </div>
    </>
  );
};
