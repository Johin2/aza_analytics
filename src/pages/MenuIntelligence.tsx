import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { MetricCard } from '../components/ui/MetricCard';
import { ClickableCard } from '../components/ui/ClickableCard';
import { Card } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import { analyticsApi } from '../services/api';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { AZA_COLORS } from '../constants/brandColors';
import { clsx } from 'clsx';
import {
  Utensils,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Award,
  BarChart3,
  Star,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  ChefHat
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Line
} from 'recharts';

interface MenuIntelligenceData {
  menu_performance: {
    total_items: number;
    active_items: number;
    avg_item_revenue: number;
    top_performers: Array<{
      item_name: string;
      category: string;
      orders: number;
      revenue: number;
      profit_margin: number;
      rating: number;
      platforms: {
        dine_in: number;
        swiggy: number;
        zomato: number;
      };
    }>;
    underperformers: Array<{
      item_name: string;
      category: string;
      orders: number;
      revenue: number;
      days_since_last_order: number;
      recommendation: string;
    }>;
  };
  category_analysis: {
    categories: Array<{
      name: string;
      items_count: number;
      total_revenue: number;
      avg_margin: number;
      popularity_score: number;
      seasonal_trend: number;
    }>;
  };
  profitability_analysis: {
    high_margin_items: Array<{
      item: string;
      margin: number;
      revenue: number;
      volume: number;
    }>;
    cost_analysis: {
      food_cost_percentage: number;
      labor_intensive_items: string[];
      supplier_cost_trends: Array<{
        ingredient: string;
        cost_change: number;
        impact_on_items: string[];
      }>;
    };
  };
  platform_performance: {
    platform_bestsellers: {
      swiggy: Array<{ item: string; orders: number; rating: number }>;
      zomato: Array<{ item: string; orders: number; rating: number }>;
      dine_in: Array<{ item: string; orders: number; rating: number }>;
    };
    platform_margins: {
      swiggy: { revenue: number; commission: number; net_margin: number };
      zomato: { revenue: number; commission: number; net_margin: number };
      dine_in: { revenue: number; commission: number; net_margin: number };
    };
  };
  customer_preferences: {
    dietary_preferences: Array<{
      type: string;
      percentage: number;
      growth_rate: number;
      top_items: string[];
    }>;
    price_sensitivity: {
      budget_conscious: number;
      mid_range: number;
      premium: number;
    };
    seasonal_favorites: Array<{
      season: string;
      items: Array<{ name: string; boost: number }>;
    }>;
  };
  optimization_opportunities: {
    menu_engineering: Array<{
      item: string;
      current_position: 'star' | 'plow_horse' | 'puzzle' | 'dog';
      recommendation: string;
      potential_impact: string;
    }>;
    pricing_optimization: Array<{
      item: string;
      current_price: number;
      optimal_price: number;
      revenue_impact: number;
    }>;
  };
  trends_insights: {
    emerging_trends: Array<{
      trend: string;
      adoption_rate: number;
      potential_items: string[];
    }>;
    declining_items: Array<{
      item: string;
      decline_rate: number;
      reason: string;
      action: string;
    }>;
  };
}

// Restaverse data types
interface ItemIssuesData {
  items: Array<{
    item_name: string;
    quality_issues: number;
    spillage_issues: number;
    missing_items: number;
    wrong_items: number;
    total_issues: number;
  }>;
  total_items: number;
  top_issue_item: string;
}

interface BasketSizeData {
  quantities: Array<{
    quantity: string;
    orders: number;
    percentage: number;
  }>;
  avg_items_per_order: number;
  total_orders: number;
}

interface MonthlyTrends {
  trends: Record<string, { pct_change: number; abs_change: number; current: number; previous: number }>;
}

export const MenuIntelligence: React.FC = () => {
  const [data, setData] = useState<MenuIntelligenceData | null>(null);
  const [itemIssues, setItemIssues] = useState<ItemIssuesData | null>(null);
  const [basketSize, setBasketSize] = useState<BasketSizeData | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [response, issues, basket, trends] = await Promise.all([
        analyticsApi.getMenuIntelligence(),
        analyticsApi.getItemIssues().catch(() => null),
        analyticsApi.getBasketSize().catch(() => null),
        analyticsApi.getMonthlyTrends().catch(() => null)
      ]);
      if (trends) setMonthlyTrends(trends);

      if (issues) setItemIssues(issues);
      if (basket) setBasketSize(basket);

      // Transform backend response to match frontend interface if needed
      const transformedData: MenuIntelligenceData = {
        menu_performance: response.menu_performance || {
          total_items: 0,
          active_items: 0,
          avg_item_revenue: 0,
          top_performers: [],
          underperformers: []
        },
        category_analysis: response.category_analysis || { categories: [] },
        profitability_analysis: response.profitability_analysis || {
          high_margin_items: [],
          cost_analysis: {
            food_cost_percentage: 0,
            labor_intensive_items: [],
            supplier_cost_trends: []
          }
        },
        platform_performance: response.platform_performance || {
          platform_bestsellers: { swiggy: [], zomato: [], dine_in: [] },
          platform_margins: {
            swiggy: { revenue: 0, commission: 0, net_margin: 0 },
            zomato: { revenue: 0, commission: 0, net_margin: 0 },
            dine_in: { revenue: 0, commission: 0, net_margin: 0 }
          }
        },
        customer_preferences: response.customer_preferences || {
          dietary_preferences: [],
          price_sensitivity: { budget_conscious: 0, mid_range: 0, premium: 0 },
          seasonal_favorites: []
        },
        optimization_opportunities: response.optimization_opportunities || {
          menu_engineering: [],
          pricing_optimization: []
        },
        trends_insights: response.trends_insights || {
          emerging_trends: [],
          declining_items: []
        }
      };

      setData(transformedData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load menu intelligence data');
      console.error('Error fetching menu intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading size="lg" className="h-full" />;
  if (error || !data) return <div className="p-8 text-red-600">{error}</div>;

  const categoryPerformanceData = data.category_analysis.categories.map(cat => ({
    ...cat,
    revenue_per_item: cat.total_revenue / cat.items_count
  }));

  const profitabilityScatterData = data.menu_performance.top_performers.map(item => ({
    name: item.item_name,
    x: item.orders,
    y: item.profit_margin,
    revenue: item.revenue
  }));

  const platformRevenueData = [
    { name: 'In-Store', revenue: data.platform_performance.platform_margins.dine_in.revenue, margin: data.platform_performance.platform_margins.dine_in.net_margin, fill: AZA_COLORS.platforms.inStore },
    { name: 'Website', revenue: data.platform_performance.platform_margins.swiggy.revenue, margin: data.platform_performance.platform_margins.swiggy.net_margin, fill: AZA_COLORS.platforms.website },
    { name: 'App', revenue: data.platform_performance.platform_margins.zomato.revenue, margin: data.platform_performance.platform_margins.zomato.net_margin, fill: AZA_COLORS.platforms.app }
  ];

  return (
    <>
      <Header
        title="Menu Intelligence"
        subtitle="Menu performance, profitability analysis, and optimization insights"
        
      />
      
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Key Menu Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <MetricCard
            title="Active Menu Items"
            value={data.menu_performance.active_items}
            icon={<Utensils className="w-6 h-6" />}
            trend={`${data.menu_performance.total_items - data.menu_performance.active_items} inactive`}
            trendType="neutral"
            subtitle={`of ${data.menu_performance.total_items} total items`}
            metricKey="top_selling_platform_items"
          />
          <MetricCard
            title="Avg Item Revenue"
            value={formatCurrency(data.menu_performance.avg_item_revenue)}
            icon={<DollarSign className="w-6 h-6" />}
            trend="+12.5%"
            trendType="positive"
            subtitle="per menu item"
            metricKey="top_selling_platform_items"
          />
          <MetricCard
            title="Food Cost %"
            value={`${data.profitability_analysis.cost_analysis.food_cost_percentage}%`}
            icon={<BarChart3 className="w-6 h-6" />}
            trend="-1.2%"
            trendType="positive"
            subtitle="of total revenue"
            metricKey="top_selling_platform_items"
          />
          <MetricCard
            title="Top Item Rating"
            value={(data.menu_performance.top_performers?.[0]?.rating ?? 4.5).toFixed(1)}
            icon={<Star className="w-6 h-6" />}
            trend={monthlyTrends?.trends?.['Average Rating'] ? `${monthlyTrends.trends['Average Rating'].abs_change > 0 ? '+' : ''}${monthlyTrends.trends['Average Rating'].abs_change}` : undefined}
            trendType={(monthlyTrends?.trends?.['Average Rating']?.abs_change ?? 0) >= 0 ? 'positive' : 'negative'}
            subtitle={data.menu_performance.top_performers?.[0]?.item_name ?? 'N/A'}
            metricKey="online_ratings"
          />
        </div>

        {/* Restaverse Insights Section */}
        {(itemIssues || basketSize) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
            {/* Item Quality Issues */}
            {itemIssues && itemIssues.items && itemIssues.items.length > 0 && (
              <ClickableCard
                title="Quality Issues by Item"
                subtitle={`${itemIssues.total_items || itemIssues.items.length} items analyzed`}
                metricKey="top_selling_platform_items"
              >
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {itemIssues.items.slice(0, 6).map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm truncate flex-1">{item.item_name}</h4>
                        <span className={clsx(
                          "text-xs font-bold px-2 py-1 rounded",
                          item.total_issues > 40 ? 'bg-red-100 text-red-700' :
                          item.total_issues > 20 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        )}>
                          {item.total_issues} issues
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Quality: {item.quality_issues}</span>
                        <span>Missing: {item.missing_items}</span>
                        <span>Wrong: {item.wrong_items}</span>
                        <span>Spillage: {item.spillage_issues}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-center text-sm text-gray-600">
                  Top Issue Item: {itemIssues.top_issue_item}
                </div>
              </ClickableCard>
            )}

            {/* Basket Size Distribution */}
            {basketSize && basketSize.quantities && (
              <ClickableCard
                title="Items per Order Distribution"
                subtitle={`Avg: ${(basketSize.avg_items_per_order || 2.5).toFixed(1)} items/order | ${(basketSize.total_orders || 0).toLocaleString()} orders`}
                metricKey="top_selling_platform_items"
              >
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={basketSize.quantities}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quantity" tick={{ fontSize: 11 }} tickFormatter={(val) => `${val} items`} />
                    <YAxis tickFormatter={(val) => `${val}%`} />
                    <Tooltip
                      formatter={(value: number, name: string, props: any) => [
                        `${props.payload.orders.toLocaleString()} orders (${value.toFixed(1)}%)`,
                        'Orders'
                      ]}
                    />
                    <Bar dataKey="percentage" fill={AZA_COLORS.sunsetMandarin} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-center">
                  <div>
                    <span className="text-gray-600">1 item:</span>{' '}
                    <span className="font-medium">{basketSize.quantities.find(d => d.quantity === '1')?.percentage.toFixed(0) || 0}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">2 items:</span>{' '}
                    <span className="font-medium">{basketSize.quantities.find(d => d.quantity === '2')?.percentage.toFixed(0) || 0}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">3+ items:</span>{' '}
                    <span className="font-medium">
                      {(basketSize.quantities
                        .filter(d => parseInt(d.quantity) >= 3)
                        .reduce((sum, d) => sum + d.percentage, 0)).toFixed(0) || 0}%
                    </span>
                  </div>
                </div>
              </ClickableCard>
            )}
          </div>
        )}

        {/* Top Performers & Category Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <ClickableCard
            title="Top Performing Items"
            subtitle="Highest revenue generating menu items"
            metricKey="top_selling_platform_items"
          >
            <div className="space-y-3">
              {data.menu_performance.top_performers.slice(0, 5).map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={clsx(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                      )}>
                        {index + 1}
                      </span>
                      <h4 className="font-semibold text-gray-900">{item.item_name}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-bold">{item.rating}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center">
                      <p className="text-gray-600">Orders</p>
                      <p className="font-semibold">{formatNumber(item.orders)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">Revenue</p>
                      <p className="font-semibold text-aza-sage">{formatCurrency(item.revenue)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">Margin</p>
                      <p className="font-semibold text-aza-terracotta">{item.profit_margin}%</p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between text-xs text-gray-600">
                    <span>In-Store: {item.platforms.dine_in}</span>
                    <span>Website: {item.platforms.swiggy}</span>
                    <span>App: {item.platforms.zomato}</span>
                  </div>
                </div>
              ))}
            </div>
          </ClickableCard>

          <ClickableCard
            title="Category Performance Analysis"
            subtitle="Revenue and margin analysis by category"
            metricKey="top_selling_platform_items"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={10} />
                <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => formatCurrency(value / 1000) + 'k'} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value: number, name: string) => {
                  if (name === 'Revenue') return [formatCurrency(value), 'Revenue'];
                  if (name === 'Margin %') return [`${value}%`, 'Margin %'];
                  return [value, name];
                }} />
                <Legend />
                <Bar yAxisId="left" dataKey="total_revenue" fill={AZA_COLORS.primary} name="Revenue" />
                <Line yAxisId="right" dataKey="avg_margin" stroke={AZA_COLORS.success} strokeWidth={3} name="Margin %" dot={{ fill: AZA_COLORS.success }} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center text-sm text-gray-600">
              {categoryPerformanceData.length > 0 ? (
                <>
                  {categoryPerformanceData.reduce((best, cat) => cat.avg_margin > best.avg_margin ? cat : best, categoryPerformanceData[0]).name} has the highest margin ({categoryPerformanceData.reduce((best, cat) => cat.avg_margin > best.avg_margin ? cat : best, categoryPerformanceData[0]).avg_margin}%)
                </>
              ) : 'No category data available'}
            </div>
          </ClickableCard>
        </div>

        {/* Profitability Analysis & Platform Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <ClickableCard
            title="Profitability vs Popularity Matrix"
            subtitle="Menu items plotted by orders vs profit margin"
            metricKey="top_selling_platform_items"
          >
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={profitabilityScatterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" name="Orders" tickFormatter={formatNumber} />
                <YAxis dataKey="y" name="Margin %" tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value: number, name: string) => {
                  if (name === 'Orders') return [formatNumber(value), 'Orders'];
                  if (name === 'Margin %') return [`${value}%`, 'Profit Margin'];
                  return [value, name];
                }} 
                labelFormatter={(label, payload) => payload?.[0]?.payload?.name || ''} />
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
          </ClickableCard>

          <ClickableCard
            title="Platform Revenue & Margins"
            subtitle="Performance comparison across platforms"
            metricKey="platform_distribution"
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={platformRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => formatCurrency(value / 1000000) + 'M'} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value: number, name: string) => {
                  if (name === 'Revenue') return [formatCurrency(value), 'Revenue'];
                  if (name === 'Net Margin') return [`${value}%`, 'Net Margin'];
                  return [value, name];
                }} />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill={AZA_COLORS.primary} name="Revenue" />
                <Line yAxisId="right" dataKey="margin" stroke={AZA_COLORS.danger} strokeWidth={3} name="Net Margin" dot={{ fill: AZA_COLORS.danger }} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {Object.entries(data.platform_performance.platform_bestsellers).map(([platform, items]) => (
                <div key={platform} className="flex items-center justify-between text-sm">
                  <span className="font-medium capitalize">{platform} Top Item:</span>
                  <span className="text-aza-sage">{items?.[0]?.item ?? 'N/A'} ({items?.[0]?.orders ?? 0} orders)</span>
                </div>
              ))}
            </div>
          </ClickableCard>
        </div>

        {/* Customer Preferences & Optimization Opportunities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <ClickableCard
            title="Customer Dietary Preferences"
            subtitle="Preference trends and growth rates"
            metricKey="customer_segments"
          >
            <div className="space-y-4">
              {data.customer_preferences.dietary_preferences.map((pref, index) => (
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
                    <span className={clsx(
                      "font-medium",
                      pref.growth_rate > 15 ? 'text-green-600' : pref.growth_rate > 5 ? 'text-yellow-600' : 'text-gray-600'
                    )}>
                      Growth: {pref.growth_rate > 0 ? '+' : ''}{pref.growth_rate}%
                    </span>
                    <span className="text-gray-600">Top: {pref.top_items[0]}</span>
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
          </ClickableCard>

          <ClickableCard
            title="Menu Optimization Opportunities"
            subtitle="Engineering recommendations for better performance"
            metricKey="top_selling_platform_items"
          >
            <div className="space-y-3">
              {data.optimization_opportunities.menu_engineering.map((opportunity, index) => (
                <div key={index} className={clsx(
                  "p-4 rounded-lg border",
                  opportunity.current_position === 'star' ? 'bg-green-50 border-green-200' :
                  opportunity.current_position === 'plow_horse' ? 'bg-yellow-50 border-yellow-200' :
                  opportunity.current_position === 'puzzle' ? 'bg-blue-50 border-blue-200' :
                  'bg-red-50 border-red-200'
                )}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{opportunity.item}</h4>
                      <span className={clsx(
                        "text-xs px-2 py-1 rounded-full font-medium",
                        opportunity.current_position === 'star' ? 'bg-green-100 text-green-800' :
                        opportunity.current_position === 'plow_horse' ? 'bg-yellow-100 text-yellow-800' :
                        opportunity.current_position === 'puzzle' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      )}>
                        {opportunity.current_position.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-aza-sage">{opportunity.potential_impact}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{opportunity.recommendation}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h5 className="font-semibold text-gray-900 mb-2">Pricing Optimization</h5>
              <div className="space-y-2">
                {data.optimization_opportunities.pricing_optimization.slice(0, 2).map((pricing, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{pricing.item}</span>
                    <span className="font-medium">
                      {formatCurrency(pricing.current_price)} → {formatCurrency(pricing.optimal_price)}
                      <span className="text-aza-sage ml-2">+{formatCurrency(pricing.revenue_impact)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ClickableCard>
        </div>

        {/* Trends & Action Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <ClickableCard
            className="bg-gradient-to-br from-green-50 to-white border-green-200"
            metricKey="top_selling_platform_items"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emerging Trend</p>
                <p className="text-lg font-bold text-gray-900 mt-2">
                  {data.trends_insights.emerging_trends?.[0]?.trend ?? 'N/A'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {data.trends_insights.emerging_trends?.[0]?.adoption_rate ?? 0}% adoption
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500 opacity-20" />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600">Potential items</p>
              <p className="text-sm font-medium">
                {data.trends_insights.emerging_trends?.[0]?.potential_items?.slice(0, 2).join(', ') ?? 'N/A'}
              </p>
            </div>
          </ClickableCard>

          <ClickableCard
            className="bg-gradient-to-br from-red-50 to-white border-red-200"
            metricKey="top_selling_platform_items"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Declining Items</p>
                <p className="text-lg font-bold text-gray-900 mt-2">
                  {data.trends_insights.declining_items.length}
                </p>
                <p className="text-sm text-gray-500 mt-1">need attention</p>
              </div>
              <TrendingDown className="w-10 h-10 text-red-500 opacity-20" />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600">Biggest decline</p>
              <p className="text-sm font-medium">
                {data.trends_insights.declining_items?.[0]?.item ?? 'N/A'} ({data.trends_insights.declining_items?.[0]?.decline_rate ?? 0}%)
              </p>
            </div>
          </ClickableCard>

          <ClickableCard
            className="bg-gradient-to-br from-purple-50 to-white border-purple-200"
            metricKey="top_selling_platform_items"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Margin Items</p>
                <p className="text-lg font-bold text-gray-900 mt-2">
                  {data.profitability_analysis.high_margin_items.length}
                </p>
                <p className="text-sm text-gray-500 mt-1">items &gt;75% margin</p>
              </div>
              <Award className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600">Top performer</p>
              <p className="text-sm font-medium">
                {data.profitability_analysis.high_margin_items?.[0]?.item ?? 'N/A'} ({data.profitability_analysis.high_margin_items?.[0]?.margin ?? 0}%)
              </p>
            </div>
          </ClickableCard>

          <Card
            title="Menu Actions"
            className="bg-gradient-to-br from-orange-50 to-white border-orange-200"
          >
            <div className="space-y-3">
              <button className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-sm">Remove Dogs</span>
                </div>
                <p className="text-xs text-gray-600">Eliminate {data.menu_performance.underperformers.length} underperformers</p>
              </button>
              
              <button className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center gap-2 mb-1">
                  <ChefHat className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-sm">Promote Stars</span>
                </div>
                <p className="text-xs text-gray-600">Feature top {data.menu_performance.top_performers.length} performers</p>
              </button>
              
              <button className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-sm">Price Optimize</span>
                </div>
                <p className="text-xs text-gray-600">Adjust {data.optimization_opportunities.pricing_optimization.length} item prices</p>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MenuIntelligence;
