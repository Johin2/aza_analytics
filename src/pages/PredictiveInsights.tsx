import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { ClickableCard } from '../components/ui/ClickableCard';
import { MetricCard } from '../components/ui/MetricCard';
import { Loading } from '../components/ui/Loading';
import { analyticsApi } from '../services/api';
import { PredictiveAnalytics } from '../types/analytics';
import { formatCurrency, formatShortDate } from '../utils/formatters';
import { AZA_COLORS } from '../constants/brandColors';
import { TrendingUp, Package, DollarSign, Target } from 'lucide-react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
} from 'recharts';

interface ExtendedPredictiveAnalytics extends PredictiveAnalytics {
  forecast_period?: {
    start: string;
    end: string;
    days: number;
  };
  model_updated?: string;
}

export const PredictiveInsights: React.FC = () => {
  const [data, setData] = useState<ExtendedPredictiveAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await analyticsApi.getPredictiveAnalytics();
      setData(response as ExtendedPredictiveAnalytics);
    } catch (err) {
      setError('Failed to load predictive analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading size="lg" className="h-full" />;
  if (error || !data) return <div className="p-8 text-red-600">{error}</div>;

  const accuracyData = [
    {
      name: 'Model Accuracy',
      value: data.model_accuracy,
      fill: AZA_COLORS.info,
    },
  ];

  return (
    <>
      <Header
        title="Predictive Insights"
        subtitle={`AI-powered forecasts and recommendations${data.model_updated ? ` • Model updated: ${new Date(data.model_updated).toLocaleDateString('en-IN')}` : ''}`}
        
      />
      
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <MetricCard
            title="Model Accuracy"
            value={`${data.model_accuracy}%`}
            icon={<Target className="w-6 h-6" />}
            trend="High"
            trendType="positive"
            subtitle="prediction accuracy"
            metricKey="demand_forecast"
          />
          <MetricCard
            title="Daily Requirement"
            value={formatCurrency(data.inventory_metrics.daily_requirement)}
            icon={<Package className="w-6 h-6" />}
            trend="Optimized"
            trendType="positive"
            subtitle="inventory forecast"
            metricKey="demand_forecast"
          />
          <MetricCard
            title="Revenue Increase"
            value={`+${data.pricing_strategy.revenue_increase}%`}
            icon={<DollarSign className="w-6 h-6" />}
            trend="Dynamic pricing"
            trendType="positive"
            subtitle="potential gain"
            metricKey="price_optimization"
          />
          <MetricCard
            title="Waste Reduction"
            value={`${data.inventory_metrics.optimization_potential}%`}
            icon={<TrendingUp className="w-6 h-6" />}
            trend="Achievable"
            trendType="positive"
            subtitle="inventory optimization"
            metricKey="demand_forecast"
          />
        </div>

        {/* 30-Day Revenue Forecast */}
        <ClickableCard 
          title="30-Day Revenue Forecast" 
          subtitle={data.forecast_period ? 
            `Forecast for ${new Date(data.forecast_period.start).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - ${new Date(data.forecast_period.end).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}` 
            : "Machine learning predictions with confidence intervals"}
          className="mb-6 sm:mb-8"
          metricKey="demand_forecast"
        >
          <div className="overflow-x-auto">
          <div className="min-w-[500px]">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data.forecast}>
              <defs>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={AZA_COLORS.info} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={AZA_COLORS.info} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatShortDate}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tickFormatter={(value) => `₹${value / 1000}K`} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={formatShortDate}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="upper"
                stroke="none"
                fill={AZA_COLORS.info}
                fillOpacity={0.1}
                name="Upper Bound"
              />
              <Area
                type="monotone"
                dataKey="lower"
                stroke="none"
                fill={AZA_COLORS.info}
                fillOpacity={0.1}
                name="Lower Bound"
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke={AZA_COLORS.info}
                strokeWidth={3}
                dot={false}
                name="Forecast"
              />
            </AreaChart>
          </ResponsiveContainer>
          </div>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total 30-Day Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.forecast.reduce((sum, day) => sum + day.forecast, 0))}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Daily Average</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.forecast.reduce((sum, day) => sum + day.forecast, 0) / data.forecast.length)}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Peak Day</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(Math.max(...data.forecast.map(day => day.forecast)))}
              </p>
            </div>
          </div>
        </ClickableCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Inventory Optimization */}
          <ClickableCard title="Inventory Management" subtitle="AI-optimized inventory levels" metricKey="demand_forecast">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Daily Requirement</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(data.inventory_metrics.daily_requirement)}
                  </p>
                </div>
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Safety Stock Level</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(data.inventory_metrics.safety_stock)}
                  </p>
                </div>
                <Package className="w-10 h-10 text-blue-400" />
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Waste Reduction Potential</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.inventory_metrics.optimization_potential}%
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-400" />
              </div>
            </div>
          </ClickableCard>

          {/* Dynamic Pricing Strategy */}
          <ClickableCard title="Dynamic Pricing Recommendations" subtitle="AI-suggested price adjustments" metricKey="price_optimization">
            <div className="mb-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Potential Revenue Increase</p>
                  <p className="text-3xl font-bold text-gray-900">
                    +{data.pricing_strategy.revenue_increase}%
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Recommended Time-based Adjustments:</h4>
              {data.pricing_strategy.recommended_adjustments.map((adjustment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{adjustment.time}</span>
                  <span className={`font-semibold ${
                    adjustment.adjustment.includes('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {adjustment.adjustment}
                  </span>
                </div>
              ))}
            </div>
          </ClickableCard>
        </div>

        {/* Model Performance */}
        <ClickableCard 
          title="Model Performance" 
          subtitle="Machine learning model accuracy metrics"
          className="mt-6 sm:mt-8"
          metricKey="demand_forecast"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={accuracyData}>
                  <RadialBar dataKey="value" fill={AZA_COLORS.info} background={{ fill: AZA_COLORS.background.secondary }} />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold">
                    {data.model_accuracy}%
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
                    <li>• Random Forest algorithm with {data.model_accuracy}% accuracy</li>
                    <li>• Trained on 12+ months of historical data</li>
                    <li>• Updates daily with new transaction data</li>
                    <li>• Accounts for seasonality and trends</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </ClickableCard>
      </div>
    </>
  );
};
