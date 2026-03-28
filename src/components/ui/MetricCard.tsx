import React, { useState } from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { DataSourceModal } from './DataSourceModal';
import { useAIContext } from '../../hooks/useAIContext';
import { generateMetricQuery } from '../../utils/metricQueryGenerator';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  className?: string;
  metricKey?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendType = 'neutral',
  subtitle,
  className,
  metricKey,
}) => {
  const [showDataSource, setShowDataSource] = useState(false);
  const { sendToAI } = useAIContext();

  const handleAskAI = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!metricKey) return;

    sendToAI({
      source: title,
      data: { metricKey, value, trend, trendType },
      query: generateMetricQuery(metricKey, title)
    });
  };

  const getTrendIcon = () => {
    switch (trendType) {
      case 'positive':
        return <TrendingUp className="w-4 h-4" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    switch (trendType) {
      case 'positive':
        return 'text-success-600 bg-success-50';
      case 'negative':
        return 'text-danger-600 bg-danger-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <>
      <div className={clsx(
        'bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 relative group',
        metricKey && 'cursor-pointer hover:shadow-lg transition-all',
        className
      )}
      onClick={metricKey ? (e) => {
        e.stopPropagation();
        setShowDataSource(true);
      } : undefined}
      title={metricKey ? "Click to view data source" : undefined}>
        {/* Ask AI Button Overlay */}
        {metricKey && (
          <button
            onClick={handleAskAI}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-full shadow-md"
            title="Ask AI about this metric"
          >
            <Sparkles className="w-3 h-3" />
            <span>Ask AI</span>
          </button>
        )}

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className={clsx(
                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-3',
                getTrendColor()
              )}>
                {getTrendIcon()}
                <span>{trend}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center text-primary-600">
              {icon}
            </div>
          )}
        </div>
      </div>
      
      {metricKey && (
        <DataSourceModal
          metric={metricKey}
          isOpen={showDataSource}
          onClose={() => setShowDataSource(false)}
        />
      )}
    </>
  );
};