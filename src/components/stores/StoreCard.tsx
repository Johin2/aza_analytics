import React from 'react';
import { clsx } from 'clsx';
import { StoreSummary } from '../../types/stores';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { TrendingUp, TrendingDown, AlertTriangle, Award } from 'lucide-react';

interface StoreCardProps {
  store: StoreSummary;
  onClick: (storeName: string) => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent':
        return 'bg-aza-sage/10 text-aza-sage border-aza-sage/20';
      case 'Good':
        return 'bg-aza-navy/10 text-aza-navy border-aza-navy/20';
      case 'Average':
        return 'bg-aza-coral/10 text-aza-coral border-aza-coral/20';
      case 'Warning':
        return 'bg-aza-terracotta/10 text-aza-terracotta border-aza-terracotta/20';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <TrendingUp className="w-4 h-4" />;
      case 'danger':
        return <TrendingDown className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  const getMetricColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-aza-sage';
      case 'danger':
        return 'text-aza-terracotta';
      case 'warning':
        return 'text-aza-coral';
      default:
        return 'text-aza-navy';
    }
  };

  return (
    <div
      onClick={() => onClick(store.store_name)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{store.store_name}</h3>
          <p className="text-sm text-gray-500">{store.region} • {store.type}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={clsx(
            'px-2 py-1 text-xs font-medium rounded-full border',
            getStatusColor(store.status)
          )}>
            {store.status}
          </span>
          <div className="bg-gray-100 rounded-full px-2 py-1 text-xs font-medium">
            #{store.revenue_rank}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Monthly Revenue</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(store.monthly_revenue)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Growth Rate</span>
          <span className={clsx(
            'font-semibold',
            store.growth_rate > 0 ? 'text-aza-sage' : 'text-aza-terracotta'
          )}>
            {store.growth_rate > 0 ? '+' : ''}{formatPercentage(store.growth_rate)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Customer Rating</span>
          <span className="font-semibold text-gray-900">
            <span className="text-aza-coral mr-1">★</span>
            {store.customer_rating}
          </span>
        </div>
      </div>

      {/* Performance Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">Performance Score</span>
          <span className="text-sm font-medium">{store.performance_score}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={clsx(
              'h-2 rounded-full transition-all',
              store.performance_score >= 80 ? 'bg-aza-sage' :
              store.performance_score >= 60 ? 'bg-aza-navy' :
              store.performance_score >= 40 ? 'bg-aza-coral' : 'bg-aza-terracotta'
            )}
            style={{ width: `${store.performance_score}%` }}
          />
        </div>
      </div>

      {/* Key Metric */}
      <div className={clsx(
        'flex items-center justify-between p-3 rounded-lg bg-gray-50',
        getMetricColor(store.key_metric.type)
      )}>
        <span className="text-sm font-medium">{store.key_metric.label}</span>
        <div className="flex items-center gap-1">
          {getMetricIcon(store.key_metric.type)}
          <span className="font-semibold">{store.key_metric.value}</span>
        </div>
      </div>
    </div>
  );
};