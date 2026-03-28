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
  Users,
  UserPlus,
  Repeat,
  Heart,
  Clock,
  MapPin,
  Smartphone,
  Calendar,
  ArrowRight,
  ArrowUpRight,
  Target,
  Star,
  Activity
} from 'lucide-react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface CustomerJourneyData {
  acquisition_metrics: {
    new_customers_this_month: number;
    acquisition_rate: number;
    acquisition_cost: number;
    channels: Array<{
      channel: string;
      customers: number;
      cost_per_acquisition: number;
      retention_rate: number;
    }>;
  };
  retention_analysis: {
    first_visit_to_second: number;
    second_to_regular: number;
    churn_rate: number;
    average_lifetime: number; // in days
    cohort_data: Array<{
      month: string;
      new_customers: number;
      retained_30d: number;
      retained_60d: number;
      retained_90d: number;
    }>;
  };
  customer_segments: {
    champions: { count: number; percentage: number; avg_spend: number };
    loyal_customers: { count: number; percentage: number; avg_spend: number };
    potential_loyalists: { count: number; percentage: number; avg_spend: number };
    new_customers: { count: number; percentage: number; avg_spend: number };
    at_risk: { count: number; percentage: number; avg_spend: number };
    lost: { count: number; percentage: number; avg_spend: number };
  };
  behavioral_insights: {
    avg_order_frequency: number;
    seasonal_patterns: Array<{
      month: string;
      orders: number;
      new_customers: number;
      retention_rate: number;
    }>;
    platform_preference: Array<{
      segment: string;
      dine_in: number;
      swiggy: number;
      zomato: number;
      direct_delivery: number;
    }>;
  };
  journey_funnel: {
    awareness: number;
    consideration: number;
    first_order: number;
    repeat_order: number;
    loyal_customer: number;
    champion: number;
  };
  geographic_insights: {
    top_locations: Array<{
      area: string;
      customers: number;
      avg_order_value: number;
      retention_rate: number;
      growth_rate: number;
    }>;
  };
  engagement_metrics: {
    social_media_followers: number;
    email_open_rate: number;
    app_active_users: number;
    loyalty_program_members: number;
    nps_score: number;
  };
}

interface MonthlyTrends {
  trends: Record<string, { pct_change: number; abs_change: number; current: number; previous: number }>;
}

export const CustomerJourney: React.FC = () => {
  const [data, setData] = useState<CustomerJourneyData | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [response, trends] = await Promise.all([
        analyticsApi.getCustomerJourney(),
        analyticsApi.getMonthlyTrends().catch(() => null)
      ]);
      if (trends) setMonthlyTrends(trends);

      // Transform backend response to match frontend interface if needed
      const transformedData: CustomerJourneyData = {
        acquisition_metrics: response.acquisition_metrics || {
          new_customers_this_month: 0,
          acquisition_rate: 0,
          acquisition_cost: 0,
          channels: []
        },
        retention_analysis: response.retention_analysis || {
          first_visit_to_second: 0,
          second_to_regular: 0,
          churn_rate: 0,
          average_lifetime: 0,
          cohort_data: []
        },
        customer_segments: response.customer_segments || {
          champions: { count: 0, percentage: 0, avg_spend: 0 },
          loyal_customers: { count: 0, percentage: 0, avg_spend: 0 },
          potential_loyalists: { count: 0, percentage: 0, avg_spend: 0 },
          new_customers: { count: 0, percentage: 0, avg_spend: 0 },
          at_risk: { count: 0, percentage: 0, avg_spend: 0 },
          lost: { count: 0, percentage: 0, avg_spend: 0 }
        },
        behavioral_insights: response.behavioral_insights || {
          avg_order_frequency: 0,
          seasonal_patterns: [],
          platform_preference: []
        },
        journey_funnel: response.journey_funnel || {
          awareness: 0,
          consideration: 0,
          first_order: 0,
          repeat_order: 0,
          loyal_customer: 0,
          champion: 0
        },
        geographic_insights: response.geographic_insights || {
          top_locations: []
        },
        engagement_metrics: response.engagement_metrics || {
          social_media_followers: 0,
          email_open_rate: 0,
          app_active_users: 0,
          loyalty_program_members: 0,
          nps_score: 0
        }
      };

      setData(transformedData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load customer journey data');
      console.error('Error fetching customer journey:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading size="lg" className="h-full" />;
  if (error || !data) return <div className="p-8 text-red-600">{error}</div>;

  const segmentData = Object.entries(data.customer_segments).map(([key, value]) => ({
    name: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count: value.count,
    percentage: value.percentage,
    avg_spend: value.avg_spend,
    fill: key === 'champions' ? AZA_COLORS.bambooGreen :
          key === 'loyal_customers' ? AZA_COLORS.goldenSesame :
          key === 'potential_loyalists' ? AZA_COLORS.sunsetMandarin :
          key === 'new_customers' ? AZA_COLORS.info :
          key === 'at_risk' ? AZA_COLORS.warning : AZA_COLORS.fortuneRed
  }));

  const funnelData = [
    { name: 'Awareness', value: data.journey_funnel.awareness, fill: AZA_COLORS.gray.light },
    { name: 'Consideration', value: data.journey_funnel.consideration, fill: AZA_COLORS.gray.medium },
    { name: 'First Order', value: data.journey_funnel.first_order, fill: AZA_COLORS.goldenSesame },
    { name: 'Repeat Order', value: data.journey_funnel.repeat_order, fill: AZA_COLORS.sunsetMandarin },
    { name: 'Loyal Customer', value: data.journey_funnel.loyal_customer, fill: AZA_COLORS.bambooGreen },
    { name: 'Champion', value: data.journey_funnel.champion, fill: AZA_COLORS.fortuneRed }
  ];

  return (
    <>
      <Header
        title="Customer Journey Analytics"
        subtitle="Customer acquisition, retention, and lifecycle analysis"
        
      />
      
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Key Customer Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <MetricCard
            title="New Customers"
            value={formatNumber(data.acquisition_metrics.new_customers_this_month)}
            icon={<UserPlus className="w-6 h-6" />}
            trend={monthlyTrends?.trends?.['New User'] ? `${monthlyTrends.trends['New User'].pct_change > 0 ? '+' : ''}${monthlyTrends.trends['New User'].pct_change}%` : undefined}
            trendType={(monthlyTrends?.trends?.['New User']?.pct_change ?? 0) >= 0 ? 'positive' : 'negative'}
            subtitle="this month"
            metricKey="first_timer_repeat_enhanced"
          />
          <MetricCard
            title="Retention Rate"
            value={`${data.retention_analysis.first_visit_to_second.toFixed(1)}%`}
            icon={<Repeat className="w-6 h-6" />}
            trend={(() => {
              if (!monthlyTrends?.trends?.['Repeat User'] || !monthlyTrends?.trends?.['New User']) return undefined;
              const currRepeat = monthlyTrends.trends['Repeat User'].current;
              const currNew = monthlyTrends.trends['New User'].current;
              const prevRepeat = monthlyTrends.trends['Repeat User'].previous;
              const prevNew = monthlyTrends.trends['New User'].previous;
              const currRate = (currRepeat / (currRepeat + currNew)) * 100;
              const prevRate = (prevRepeat / (prevRepeat + prevNew)) * 100;
              const diff = currRate - prevRate;
              return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
            })()}
            trendType={(() => {
              if (!monthlyTrends?.trends?.['Repeat User'] || !monthlyTrends?.trends?.['New User']) return 'positive' as const;
              const currRepeat = monthlyTrends.trends['Repeat User'].current;
              const currNew = monthlyTrends.trends['New User'].current;
              const prevRepeat = monthlyTrends.trends['Repeat User'].previous;
              const prevNew = monthlyTrends.trends['New User'].previous;
              const currRate = (currRepeat / (currRepeat + currNew)) * 100;
              const prevRate = (prevRepeat / (prevRepeat + prevNew)) * 100;
              return currRate >= prevRate ? 'positive' as const : 'negative' as const;
            })()}
            subtitle="first to second visit"
            metricKey="customer_retention"
          />
          <MetricCard
            title="Customer Lifetime"
            value={`${data.retention_analysis.average_lifetime}d`}
            icon={<Clock className="w-6 h-6" />}
            trend="+12d"
            trendType="positive"
            subtitle="average days"
            metricKey="avg_clv"
          />
          <MetricCard
            title="NPS Score"
            value={data.engagement_metrics.nps_score}
            icon={<Heart className="w-6 h-6" />}
            trend="+5"
            trendType="positive"
            subtitle="net promoter score"
            metricKey="online_ratings"
          />
        </div>

        {/* Customer Journey Funnel & Acquisition Channels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <ClickableCard
            title="Customer Journey Funnel"
            subtitle="From awareness to champion conversion"
            metricKey="first_timer_repeat_enhanced"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis tickFormatter={(value) => formatNumber(value)} />
                <Tooltip formatter={(value: number) => [formatNumber(value), 'Count']} />
                <Bar dataKey="value" fill={AZA_COLORS.primary} radius={[4, 4, 0, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="font-semibold text-gray-900">Conversion Rate</p>
                <p className="text-aza-sage text-lg font-bold">
                  {((data.journey_funnel.first_order / data.journey_funnel.consideration) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-600">Consideration → Order</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900">Repeat Rate</p>
                <p className="text-aza-coral text-lg font-bold">
                  {((data.journey_funnel.repeat_order / data.journey_funnel.first_order) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-600">First → Repeat</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900">Champion Rate</p>
                <p className="text-aza-terracotta text-lg font-bold">
                  {((data.journey_funnel.champion / data.journey_funnel.loyal_customer) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-600">Loyal → Champion</p>
              </div>
            </div>
          </ClickableCard>

          <ClickableCard
            title="Acquisition Channels Performance"
            subtitle="Customer acquisition cost and retention by channel"
            metricKey="acquisition_channels"
          >
            <div className="space-y-3">
              {data.acquisition_metrics.channels.map((channel, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{channel.channel}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{formatNumber(channel.customers)}</span>
                      <Users className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Cost per Acquisition</p>
                      <p className="font-semibold text-aza-terracotta">
                        {formatCurrency(channel.cost_per_acquisition)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Retention Rate</p>
                      <p className="font-semibold text-aza-sage">
                        {channel.retention_rate}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-aza-coral h-2 rounded-full" 
                        style={{ width: `${(channel.customers / Math.max(...data.acquisition_metrics.channels.map(c => c.customers))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ClickableCard>
        </div>

        {/* Customer Segments & Behavioral Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <ClickableCard
            title="Customer Segmentation (RFM)"
            subtitle="Recency, Frequency, Monetary analysis"
            metricKey="customer_segments"
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="percentage"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string, props: any) => [
                  `${value}% (${formatNumber(props.payload.count)} customers)`,
                  name
                ]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <p className="font-semibold text-gray-900">Champions</p>
                <p className="text-aza-sage text-lg font-bold">
                  {formatCurrency(data.customer_segments.champions.avg_spend)}
                </p>
                <p className="text-xs text-gray-600">avg spend</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900">Total Value</p>
                <p className="text-aza-terracotta text-lg font-bold">
                  {formatCurrency(segmentData.reduce((sum, segment) => sum + (segment.count * segment.avg_spend), 0))}
                </p>
                <p className="text-xs text-gray-600">total customer value</p>
              </div>
            </div>
          </ClickableCard>

          <ClickableCard
            title="Seasonal Customer Patterns"
            subtitle="Monthly trends in acquisition and retention"
            metricKey="first_timer_repeat_enhanced"
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.behavioral_insights.seasonal_patterns}>
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
            <div className="mt-4 text-center text-sm text-gray-600">
              Peak season: May-June with highest acquisition and retention rates
            </div>
          </ClickableCard>
        </div>

        {/* Geographic Insights & Platform Preferences */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <ClickableCard
            title="Geographic Customer Distribution"
            subtitle="Top performing locations by customer metrics"
            metricKey="first_timer_repeat_enhanced"
          >
            <div className="space-y-3">
              {data.geographic_insights.top_locations.map((location, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <h4 className="font-semibold text-gray-900">{location.area}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{formatNumber(location.customers)}</span>
                      {location.growth_rate > 15 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center">
                      <p className="text-gray-600">AOV</p>
                      <p className="font-semibold">{formatCurrency(location.avg_order_value)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">Retention</p>
                      <p className="font-semibold">{location.retention_rate}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">Growth</p>
                      <p className={clsx(
                        "font-semibold",
                        location.growth_rate > 15 ? 'text-green-600' : 'text-yellow-600'
                      )}>
                        +{location.growth_rate}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ClickableCard>

          <ClickableCard
            title="Platform Preferences by Segment"
            subtitle="Channel preference across customer segments"
            metricKey="platform_distribution"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.behavioral_insights.platform_preference}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="segment" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value: number) => [`${value}%`, '']} />
                <Bar dataKey="dine_in" fill={AZA_COLORS.platforms.inStore} name="In-Store" />
                <Bar dataKey="swiggy" fill={AZA_COLORS.platforms.website} name="Website" />
                <Bar dataKey="zomato" fill={AZA_COLORS.platforms.app} name="App" />
                <Bar dataKey="direct_delivery" fill={AZA_COLORS.goldenSesame} name="Direct" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center text-sm text-gray-600">
              Champions prefer dine-in (45%), while new customers favor delivery platforms
            </div>
          </ClickableCard>
        </div>

        {/* Engagement Metrics & Action Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <ClickableCard
            className="bg-gradient-to-br from-blue-50 to-white border-blue-200"
            metricKey="engagement_metrics"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Social Media</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatNumber(data.engagement_metrics.social_media_followers)}
                </p>
                <p className="text-sm text-gray-500 mt-1">followers</p>
              </div>
              <Smartphone className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600">Email open rate</p>
              <p className="text-lg font-bold text-aza-sage">
                {data.engagement_metrics.email_open_rate}%
              </p>
            </div>
          </ClickableCard>

          <ClickableCard
            className="bg-gradient-to-br from-green-50 to-white border-green-200"
            metricKey="first_timer_repeat_enhanced"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">App Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatNumber(data.engagement_metrics.app_active_users)}
                </p>
                <p className="text-sm text-gray-500 mt-1">monthly active</p>
              </div>
              <Activity className="w-10 h-10 text-green-500 opacity-20" />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600">Loyalty members</p>
              <p className="text-lg font-bold text-aza-sage">
                {formatNumber(data.engagement_metrics.loyalty_program_members)}
              </p>
            </div>
          </ClickableCard>

          <ClickableCard
            className="bg-gradient-to-br from-purple-50 to-white border-purple-200"
            metricKey="customer_retention"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cohort Retention</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {data.retention_analysis.cohort_data?.[2]?.retained_90d && data.retention_analysis.cohort_data?.[2]?.new_customers
                    ? ((data.retention_analysis.cohort_data[2].retained_90d / data.retention_analysis.cohort_data[2].new_customers) * 100).toFixed(1)
                    : '0.0'}%
                </p>
                <p className="text-sm text-gray-500 mt-1">90-day retention</p>
              </div>
              <Calendar className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600">Average frequency</p>
              <p className="text-lg font-bold text-aza-sage">
                {data.behavioral_insights.avg_order_frequency}x/month
              </p>
            </div>
          </ClickableCard>

          <Card
            title="Customer Success Actions"
            className="bg-gradient-to-br from-orange-50 to-white border-orange-200"
          >
            <div className="space-y-3">
              <button className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-sm">Re-engage At-Risk</span>
                </div>
                <p className="text-xs text-gray-600">{formatNumber(data.customer_segments.at_risk.count)} customers</p>
              </button>
              
              <button className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-sm">Nurture Potential</span>
                </div>
                <p className="text-xs text-gray-600">{formatNumber(data.customer_segments.potential_loyalists.count)} candidates</p>
              </button>
              
              <button className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-sm">Champion Program</span>
                </div>
                <p className="text-xs text-gray-600">Reward top {data.customer_segments.champions.percentage}%</p>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CustomerJourney;
