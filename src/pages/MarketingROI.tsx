import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { MetricCard } from '../components/ui/MetricCard';
import { ClickableCard } from '../components/ui/ClickableCard';
import { Card } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import DateFilter from '../components/filters/DateFilter';
import { analyticsApi } from '../services/api';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';
import { AZA_COLORS } from '../constants/brandColors';
import { AIRecommendations } from '../components/ui/AIRecommendations';
import { clsx } from 'clsx';
import {
  DollarSign,
  TrendingUp,
  Target,
  Instagram,
  Zap,
  Users,
  MousePointer,
  ArrowUpRight,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// Restaverse data types
interface AdsEfficiencyData {
  cities: Array<{
    city: string;
    swiggy_ads_per_order: number;
    zomato_ads_per_order: number;
    swiggy_ads_pct: number;
    zomato_ads_pct: number;
  }>;
  total_cities: number;
}

interface DiscountEfficiencyData {
  cities: Array<{
    city: string;
    swiggy_discount_per_order: number;
    zomato_discount_per_order: number;
    swiggy_discount_pct: number;
    zomato_discount_pct: number;
  }>;
  total_cities: number;
}

interface MarketingData {
  instagram_roi: {
    total_spend: number;
    total_revenue: number;
    roi_percentage: number;
    campaigns: Array<{
      name: string;
      spend: number;
      revenue: number;
      roi: number;
      reach: number;
      engagement: number;
    }>;
  };
  platform_budgets: {
    zomato: {
      budget_2024: number;
      spent_2024: number;
      budget_2025: number;
      performance: number;
    };
    swiggy: {
      budget_per_outlet_2024: number;
      budget_per_outlet_2025: number;
      total_outlets: number;
      click_performance: number;
    };
  };
  competitor_keywords: {
    total_budget: number;
    locations: string[];
    performance: {
      clicks: number;
      conversions: number;
      cost_per_acquisition: number;
    };
  };
  monthly_trends: Array<{
    month: string;
    instagram_spend: number;
    instagram_revenue: number;
    zomato_spend: number;
    zomato_performance: number;
    swiggy_spend: number;
    swiggy_performance: number;
  }>;
  alerts: Array<{
    type: 'high_spend' | 'low_roi' | 'budget_exceeded';
    message: string;
    severity: 'high' | 'medium' | 'low';
    recommendation: string;
  }>;
  ai_recommendations?: string[];
}

export const MarketingROI: React.FC = () => {
  const [data, setData] = useState<MarketingData | null>(null);
  const [adsData, setAdsData] = useState<AdsEfficiencyData | null>(null);
  const [discountData, setDiscountData] = useState<DiscountEfficiencyData | null>(null);
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
      const [response, ads, discounts] = await Promise.all([
        analyticsApi.getMarketingData(selectedYear, selectedMonth),
        analyticsApi.getAdsEfficiency().catch(() => null),
        analyticsApi.getDiscountEfficiency().catch(() => null)
      ]);

      if (ads) setAdsData(ads);
      if (discounts) setDiscountData(discounts);

      // Transform backend response to match frontend interface if needed
      const transformedData: MarketingData = {
        instagram_roi: response.instagram_roi || {
          total_spend: 0,
          total_revenue: 0,
          roi_percentage: 0,
          campaigns: []
        },
        platform_budgets: response.platform_budgets || {
          zomato: {
            budget_2024: 0,
            spent_2024: 0,
            budget_2025: 0,
            performance: 0
          },
          swiggy: {
            budget_per_outlet_2024: 0,
            budget_per_outlet_2025: 0,
            total_outlets: 0,
            click_performance: 0
          }
        },
        competitor_keywords: response.competitor_keywords || {
          total_budget: 0,
          locations: [],
          performance: {
            clicks: 0,
            conversions: 0,
            cost_per_acquisition: 0
          }
        },
        monthly_trends: response.monthly_trends || [],
        alerts: response.alerts || [],
        ai_recommendations: response.ai_recommendations
      };

      setData(transformedData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load marketing ROI data');
      console.error('Error fetching marketing data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading size="lg" className="h-full" />;
  if (error || !data) return <div className="p-8 text-red-600">{error}</div>;

  const totalMarketingSpend = (data.instagram_roi.total_spend || 0) +
                            (data.platform_budgets.zomato.spent_2024 || 0) +
                            ((data.platform_budgets.swiggy.budget_per_outlet_2024 || 0) * (data.platform_budgets.swiggy.total_outlets || 0) * 12);

  const totalMarketingRevenue = (data.instagram_roi.total_revenue || 0) +
                              ((data.platform_budgets.zomato.spent_2024 || 0) * (data.platform_budgets.zomato.performance || 0) / 100) +
                              ((data.platform_budgets.swiggy.budget_per_outlet_2024 || 0) * (data.platform_budgets.swiggy.total_outlets || 0) * 12 * (data.platform_budgets.swiggy.click_performance || 0) / 100);

  // Prevent division by zero - use 1 as minimum to avoid NaN
  const overallROI = totalMarketingSpend > 0
    ? ((totalMarketingRevenue - totalMarketingSpend) / totalMarketingSpend) * 100
    : 0;

  // Use actual data from API where available, avoid hardcoded values
  const instagramBudget = data.instagram_roi.total_spend > 0 ? data.instagram_roi.total_spend * 1.2 : 0; // Estimate budget as 120% of spend
  const zomatoBudget = data.platform_budgets.zomato.budget_2024 || 0;
  const swiggyAnnualBudget = (data.platform_budgets.swiggy.budget_per_outlet_2024 || 0) * (data.platform_budgets.swiggy.total_outlets || 0) * 12;
  const competitorBudget = data.competitor_keywords.total_budget || 0;

  const budgetUtilizationData = [
    { name: 'Instagram', budget: instagramBudget, spent: data.instagram_roi.total_spend || 0, utilization: instagramBudget > 0 ? ((data.instagram_roi.total_spend || 0) / instagramBudget) * 100 : 0 },
    { name: 'App', budget: zomatoBudget, spent: data.platform_budgets.zomato.spent_2024 || 0, utilization: zomatoBudget > 0 ? ((data.platform_budgets.zomato.spent_2024 || 0) / zomatoBudget) * 100 : 0 },
    { name: 'Website', budget: swiggyAnnualBudget, spent: swiggyAnnualBudget, utilization: swiggyAnnualBudget > 0 ? 100 : 0 },
    { name: 'Competitor KW', budget: competitorBudget, spent: competitorBudget, utilization: competitorBudget > 0 ? 100 : 0 }
  ].filter(item => item.budget > 0 || item.spent > 0); // Only show channels with data

  return (
    <>
      <Header
        title="Marketing ROI Dashboard"
        subtitle="Digital marketing performance and budget optimization"
      />

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-3">
          <DateFilter
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
            availableYears={[2025, 2024]}
          />
        </div>
        <AIRecommendations recommendations={data?.ai_recommendations} />

        {/* Marketing Alerts */}
        {data.alerts.length > 0 && (
          <div className="mb-6 space-y-3">
            {data.alerts.map((alert, index) => (
              <div key={index} className={clsx(
                "border-l-4 p-4 rounded-r-lg flex items-start gap-3",
                alert.severity === 'high' ? 'bg-red-50 border-red-400' : 
                alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-400' : 
                'bg-blue-50 border-blue-400'
              )}>
                <AlertTriangle className={clsx(
                  "w-5 h-5 flex-shrink-0 mt-0.5",
                  alert.severity === 'high' ? 'text-red-600' : 
                  alert.severity === 'medium' ? 'text-yellow-600' : 
                  'text-blue-600'
                )} />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{alert.message}</p>
                  <p className="text-sm text-gray-700 mt-1">{alert.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Key Marketing Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <MetricCard
            title="Overall Marketing ROI"
            value={overallROI > 0 ? `${overallROI.toFixed(1)}%` : 'N/A'}
            icon={<TrendingUp className="w-6 h-6" />}
            subtitle={overallROI > 165 ? 'Above industry avg (165%)' : 'Industry avg: 165%'}
            metricKey="marketing_roi"
          />
          <MetricCard
            title="Total Marketing Spend"
            value={formatCurrency(totalMarketingSpend)}
            icon={<DollarSign className="w-6 h-6" />}
            subtitle="combined channels"
            metricKey="instagram_marketing_spend"
          />
          <MetricCard
            title="Attributed Revenue"
            value={formatCurrency(totalMarketingRevenue)}
            icon={<Target className="w-6 h-6" />}
            subtitle="from marketing channels"
            metricKey="zomato_marketing_budget_2024"
          />
          <MetricCard
            title="Cost Per Acquisition"
            value={data.competitor_keywords.performance.cost_per_acquisition > 0 ? formatCurrency(data.competitor_keywords.performance.cost_per_acquisition) : 'N/A'}
            icon={<Users className="w-6 h-6" />}
            subtitle="competitive keywords"
            metricKey="competitor_keywords"
          />
        </div>

        {/* Restaverse Cost Efficiency Section */}
        {(adsData || discountData) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
            {/* Ads Cost per Order by City - Platform Comparison */}
            {adsData && adsData.cities && (
              <ClickableCard
                title="Advertising Cost per Order by City"
                subtitle={`${adsData.cities.length} cities analyzed | Platform comparison`}
                metricKey="instagram_marketing_spend"
              >
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={adsData.cities}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="city" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={(val) => `₹${val}`} />
                    <Tooltip formatter={(value: number) => [`₹${value.toFixed(0)}`, '']} />
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
                <div className="mt-3 text-center text-sm text-gray-600">
                  Data source: Restaverse Ads per Order Analysis
                </div>
              </ClickableCard>
            )}

            {/* Discount Cost per Order by City - Platform Comparison */}
            {discountData && discountData.cities && (
              <ClickableCard
                title="Discount Cost per Order by City"
                subtitle={`${discountData.cities.length} cities analyzed | Platform comparison`}
                metricKey="instagram_marketing_spend"
              >
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={discountData.cities}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="city" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={(val) => `₹${val}`} />
                    <Tooltip formatter={(value: number) => [`₹${value.toFixed(0)}`, '']} />
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
                <div className="mt-3 text-center text-sm text-gray-600">
                  Data source: Restaverse Discount Analysis
                </div>
              </ClickableCard>
            )}
          </div>
        )}

        {/* Instagram Campaigns & Budget Utilization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <ClickableCard
            title="Instagram Campaign Performance"
            subtitle={`${formatPercentage(data.instagram_roi.roi_percentage)} ROI across ${data.instagram_roi.campaigns.length} campaigns`}
            metricKey="instagram_marketing_spend"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.instagram_roi.campaigns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={10} />
                <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                <Tooltip formatter={(value: number, name: string) => {
                  if (name === 'spend' || name === 'revenue') return formatCurrency(value);
                  if (name === 'roi') return `${value}%`;
                  return formatNumber(value);
                }} />
                <Bar dataKey="spend" fill={AZA_COLORS.fortuneRed} name="Spend" />
                <Bar dataKey="revenue" fill={AZA_COLORS.bambooGreen} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center text-sm text-gray-600">
              {data.instagram_roi.campaigns.length > 0 ? (
                <>
                  {(() => {
                    const best = data.instagram_roi.campaigns.reduce((b, c) =>
                      (c.roi ?? -Infinity) > (b.roi ?? -Infinity) ? c : b,
                      data.instagram_roi.campaigns[0]);
                    return `Best Performer: ${best.name} (${best.roi != null ? best.roi.toFixed(1) : 'N/A'}% ROI)`;
                  })()}
                </>
              ) : 'No campaign data available'}
            </div>
          </ClickableCard>

          <ClickableCard
            title="Budget Utilization"
            subtitle="Marketing spend vs allocated budgets"
            metricKey="swiggy_click_budget"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetUtilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `₹${value / 1000000}M`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="budget" fill={AZA_COLORS.gray.light} name="Budget" />
                <Bar dataKey="spent" fill={AZA_COLORS.sunsetMandarin} name="Spent" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <p className="font-semibold text-gray-900">Total Budget</p>
                <p className="text-aza-coral">{formatCurrency(budgetUtilizationData.reduce((sum, item) => sum + item.budget, 0))}</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900">Utilization</p>
                <p className="text-aza-sage">
                  {(() => {
                    const totalBudget = budgetUtilizationData.reduce((sum, item) => sum + item.budget, 0);
                    const totalSpent = budgetUtilizationData.reduce((sum, item) => sum + item.spent, 0);
                    return totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : '0.0';
                  })()}%
                </p>
              </div>
            </div>
          </ClickableCard>
        </div>

        {/* Platform Performance & Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <ClickableCard
            title="Platform Marketing Performance"
            subtitle="ROI comparison across marketing channels"
            metricKey="zomato_marketing_budget_2025"
          >
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Instagram className="w-5 h-5 text-purple-600" />
                    Instagram Campaigns
                  </h4>
                  <span className="text-2xl font-bold text-aza-sage">
                    {formatPercentage(data.instagram_roi.roi_percentage)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Spend</p>
                    <p className="font-semibold">{formatCurrency(data.instagram_roi.total_spend)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Revenue</p>
                    <p className="font-semibold">{formatCurrency(data.instagram_roi.total_revenue)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-white p-4 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-600" />
                    Zomato Marketing
                  </h4>
                  <span className="text-2xl font-bold text-aza-sage">
                    {formatPercentage(data.platform_budgets.zomato.performance)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">2024 Spent</p>
                    <p className="font-semibold">{formatCurrency(data.platform_budgets.zomato.spent_2024)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">2025 Budget</p>
                    <p className="font-semibold">{formatCurrency(data.platform_budgets.zomato.budget_2025)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-white p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MousePointer className="w-5 h-5 text-green-600" />
                    Swiggy Clicks
                  </h4>
                  <span className="text-2xl font-bold text-aza-sage">
                    {formatPercentage(data.platform_budgets.swiggy.click_performance)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Per Outlet (2024)</p>
                    <p className="font-semibold">{formatCurrency(data.platform_budgets.swiggy.budget_per_outlet_2024)}/mo</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Per Outlet (2025)</p>
                    <p className="font-semibold">{formatCurrency(data.platform_budgets.swiggy.budget_per_outlet_2025)}/mo</p>
                  </div>
                </div>
              </div>
            </div>
          </ClickableCard>

          <ClickableCard
            title="Marketing Spend Trends"
            subtitle={`Monthly spend by channel${data.monthly_trends.length > 0 ? ` (${data.monthly_trends.length} months)` : ''}`}
            metricKey="brand_planning"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthly_trends}>
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
            <div className="mt-4 text-center text-sm text-gray-600">
              Monthly marketing spend across channels • Data source: Marketing spends x Aza
            </div>
          </ClickableCard>
        </div>

        {/* Competitor Keywords & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <ClickableCard
            title="Competitor Keywords"
            subtitle={`₹${formatNumber(data.competitor_keywords.total_budget)} budget across ${data.competitor_keywords.locations.length} locations`}
            metricKey="competitor_keywords"
            className="lg:col-span-1"
          >
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(data.competitor_keywords.performance.conversions)}
                </p>
                <p className="text-sm text-gray-600">Total Conversions</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{formatNumber(data.competitor_keywords.performance.clicks)}</p>
                  <p className="text-gray-600">Clicks</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{formatCurrency(data.competitor_keywords.performance.cost_per_acquisition)}</p>
                  <p className="text-gray-600">Cost per Customer</p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2">Active Locations:</p>
                <div className="flex flex-wrap gap-1">
                  {data.competitor_keywords.locations.map((location, index) => (
                    <span key={index} className="px-2 py-1 bg-aza-gold bg-opacity-20 text-xs rounded-full">
                      {location}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </ClickableCard>

          <Card
            title="Marketing Optimization Recommendations"
            subtitle="Data-driven insights for better ROI"
            className="lg:col-span-2"
          >
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ArrowUpRight className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900">Increase Instagram Budget</h4>
                    <p className="text-sm text-green-800 mt-1">
                      Instagram campaigns showing highest ROI ({formatPercentage(data.instagram_roi.roi_percentage)}). Consider reallocating budget from lower-performing channels.
                    </p>
                    <p className="text-xs text-green-700 mt-2">Current monthly spend: {formatCurrency(data.instagram_roi.total_spend / 12)}</p>
                  </div>
                </div>
              </div>

              {data.monthly_trends.length >= 2 && (() => {
                const sorted = [...data.monthly_trends].sort((a, b) => b.instagram_revenue - a.instagram_revenue);
                const peakMonth = sorted[0];
                return (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-900">Optimize Seasonal Campaigns</h4>
                        <p className="text-sm text-yellow-800 mt-1">
                          {peakMonth.month} showed peak performance ({formatCurrency(peakMonth.instagram_revenue)} revenue). Plan similar intensity campaigns for upcoming festivals and events.
                        </p>
                        <p className="text-xs text-yellow-700 mt-2">Focus on: Weekend Brunch & Festival specials</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {data.competitor_keywords.performance.cost_per_acquisition > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Competitor Keyword Expansion</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        Cost per acquisition at {formatCurrency(data.competitor_keywords.performance.cost_per_acquisition)} across {data.competitor_keywords.locations.length} locations ({data.competitor_keywords.locations.join(', ')}).
                      </p>
                      <p className="text-xs text-blue-700 mt-2">
                        {formatNumber(data.competitor_keywords.performance.conversions)} conversions from {formatNumber(data.competitor_keywords.performance.clicks)} clicks
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MarketingROI;
