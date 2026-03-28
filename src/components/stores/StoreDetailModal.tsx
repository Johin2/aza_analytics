import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { StoreDetails } from '../../types/stores';
import { storeApi } from '../../services/storeApi';
import { Loading } from '../ui/Loading';
import { formatCurrency, formatPercentage, formatShortDate } from '../../utils/formatters';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface StoreDetailModalProps {
  storeName: string;
  onClose: () => void;
}

export const StoreDetailModal: React.FC<StoreDetailModalProps> = ({ storeName, onClose }) => {
  const [data, setData] = useState<StoreDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStoreDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeName]);

  const fetchStoreDetails = async () => {
    try {
      setLoading(true);
      const response = await storeApi.getStoreDetails(storeName);
      setData(response);
    } catch (err) {
      setError('Failed to load store details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!data && !loading && !error) return null;

  const platformData = data ? [
    { name: 'Website', value: data.metrics.platform_mix.Swiggy, color: '#BC3D19' },
    { name: 'App', value: data.metrics.platform_mix.Zomato, color: '#EC7C5D' },
    { name: 'In-Store', value: data.metrics.platform_mix['Dine-in'], color: '#388E3C' },
  ] : [];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{storeName}</h2>
            {data && (
              <p className="text-sm text-gray-600">
                {data.metrics.metadata.region} • {data.metrics.metadata.type} • {data.metrics.metadata.size}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <Loading size="lg" className="h-64" />
          ) : error || !data ? (
            <div className="text-center text-red-600 py-8">{error}</div>
          ) : (
            <div className="space-y-6">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(data.metrics.monthly_revenue)}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    {data.metrics.growth_rate > 0 ? '+' : ''}{formatPercentage(data.metrics.growth_rate)} growth
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Customer Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    <span className="text-yellow-500">★</span> {data.metrics.customer_rating}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {data.metrics.customer_satisfaction}% satisfaction
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Delivery Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.metrics.monthly_orders.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Swiggy + Zomato</p>
                  <p className="text-sm text-purple-600 mt-1">
                    AOV: {formatCurrency(data.metrics.avg_order_value)}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Performance Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.metrics.performance_score}/100
                  </p>
                  <p className="text-sm text-yellow-600 mt-1">
                    Efficiency: {formatCurrency(data.metrics.efficiency_ratio)}/day
                  </p>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold mb-4">30-Day Revenue Trend</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={data.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatShortDate}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tickFormatter={(value) => `${value / 1000}K`} />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={formatShortDate}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#0ea5e9" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Platform Mix */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold mb-4">Platform Distribution</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {platformData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Store Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Store Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Operating Hours</span>
                      <span className="font-medium">{data.metrics.operating_hours}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Staff Count</span>
                      <span className="font-medium">{data.metrics.staff_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Opened Since</span>
                      <span className="font-medium">{data.metrics.metadata.opened}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Repeat Rate</span>
                      <span className="font-medium">{formatPercentage(data.metrics.repeat_customer_rate)}</span>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {data.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-sm text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};