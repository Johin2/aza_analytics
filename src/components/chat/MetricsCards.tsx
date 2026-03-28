import React from 'react';
import { Database, Info, TrendingUp, TrendingDown } from 'lucide-react';
import { BusinessVitalityIndex } from '../../types/analytics';
import { KPIs } from '../../types/chat';

interface LiveMetrics {
  day_label?: string;
  revenue: { formatted: string; vs_avg: number; total?: number };
  orders: { total: number; avg_value: string | number };
  customers: { unique: number; repeat_rate: string | number };
  platform_breakdown: {
    swiggy: { percentage: string | number };
    zomato: { percentage: string | number };
    dine_in: { percentage: string | number };
  };
}

interface MetricsCardsProps {
  businessVitality: BusinessVitalityIndex | null;
  liveMetrics: LiveMetrics | null;
  kpis: KPIs | null;
  setShowBVIInfo: (show: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

const getStatusColor = (status: string): string => {
  const s = status.toLowerCase();
  if (['excellent', 'good', 'optimal', 'fast', 'strong', 'low'].includes(s)) return 'text-green-600';
  if (['average', 'acceptable', 'moderate', 'medium', 'stable'].includes(s)) return 'text-yellow-600';
  if (['needs_improvement', 'poor', 'slow', 'weak', 'high', 'high_risk'].includes(s)) return 'text-red-600';
  return 'text-gray-600';
};

const formatStatus = (str: string): string => 
  str?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || '';

// Score Bar Component
const ScoreBar: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const color = value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : value >= 40 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-600 w-16">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-8">{Math.round(value)}</span>
    </div>
  );
};

// Battery Indicator Component
const BatteryIndicator: React.FC<{ value: number }> = ({ value }) => {
  const getColor = (): string => {
    if (value <= 20) return 'rgb(239, 68, 68)';
    if (value <= 40) return 'rgb(249, 115, 22)';
    if (value <= 60) return 'rgb(250, 204, 21)';
    if (value <= 80) return 'rgb(132, 204, 22)';
    return 'rgb(34, 197, 94)';
  };

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-28 h-14 bg-gray-200 rounded-xl border-2 border-gray-400 overflow-hidden shadow-inner">
        <div
          className="absolute bottom-0 left-0 top-0 transition-all duration-500 rounded-lg"
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%`, backgroundColor: getColor() }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            {Math.round(value)}
          </span>
        </div>
      </div>
      <div className="w-3 h-6 bg-gray-400 rounded-r-md" />
    </div>
  );
};

// Section Header Component
const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="flex items-center justify-between mb-3">
    <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
    {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
  </div>
);

// Metric Item Component
const MetricItem: React.FC<{ label: string; value: string | number; subtext?: string; status?: string }> = 
  ({ label, value, subtext, status }) => (
  <div className="text-center p-2">
    <div className="text-lg font-bold text-gray-900">{value}</div>
    {subtext && <div className={`text-xs ${status ? getStatusColor(status) : 'text-gray-500'}`}>{subtext}</div>}
    <div className="text-xs text-gray-600 font-medium mt-0.5">{label}</div>
  </div>
);

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  businessVitality,
  liveMetrics,
  kpis,
  setShowBVIInfo,
  isCollapsed = false,
  setIsCollapsed
}) => {
  return (
    <div className={`bg-white border-l border-gray-200 flex flex-col h-screen transition-all duration-300 ${isCollapsed ? 'w-12' : 'w-80 xl:w-96'}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-danger-600" />
            Live Dashboard
          </h3>
        )}
        {setIsCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 hover:bg-gray-100 rounded-lg transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
          >
            <svg className={`w-5 h-5 text-gray-600 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* MACRO METRICS */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-800">Macro Metrics</h4>
              <button onClick={() => setShowBVIInfo(true)} className="text-gray-400 hover:text-gray-600">
                <Info className="w-4 h-4" />
              </button>
            </div>
            
            {businessVitality ? (
              <div className="space-y-4">
                {/* BVI Score with Battery */}
                <div className="text-center">
                  <BatteryIndicator value={businessVitality.bvi_score} />
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {businessVitality.trend.direction === 'up' ? 
                      <TrendingUp className="w-4 h-4 text-green-500" /> : 
                      <TrendingDown className="w-4 h-4 text-red-500" />}
                    <span className={businessVitality.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}>
                      {businessVitality.trend.percentage}%
                    </span>
                    <span className="text-xs text-gray-500">• {formatStatus(businessVitality.health_status)}</span>
                  </div>
                </div>
                
                {/* Component Scores */}
                <div className="space-y-2 pt-3 border-t border-indigo-100">
                  <ScoreBar value={businessVitality.components.revenue_momentum.score} label="Revenue" />
                  <ScoreBar value={businessVitality.components.customer_loyalty.score} label="Loyalty" />
                  <ScoreBar value={businessVitality.components.operational_excellence.score} label="Operations" />
                </div>
              </div>
            ) : (
              <div className="animate-pulse h-24 bg-gray-200 rounded" />
            )}
          </div>

          {/* PLATFORM METRICS */}
          <div className="bg-gradient-to-r from-rose-50 to-red-50 rounded-xl p-4">
            <SectionHeader title="Platform Metrics" subtitle={liveMetrics?.day_label || 'Yesterday'} />
            
            {liveMetrics ? (
              <div className="grid grid-cols-3 gap-1">
                <MetricItem 
                  label="Revenue" 
                  value={liveMetrics.revenue.formatted}
                  subtext={`${liveMetrics.revenue.vs_avg >= 0 ? '+' : ''}${liveMetrics.revenue.vs_avg.toFixed(1)}%`}
                  status={liveMetrics.revenue.vs_avg >= 0 ? 'good' : 'poor'}
                />
                <MetricItem 
                  label="Orders" 
                  value={liveMetrics.orders.total.toLocaleString()}
                  subtext={`Avg ₹${liveMetrics.orders.avg_value}`}
                />
                <MetricItem 
                  label="Customers" 
                  value={liveMetrics.customers.unique.toLocaleString()}
                  subtext={`${liveMetrics.customers.repeat_rate}% repeat`}
                />
              </div>
            ) : (
              <div className="animate-pulse grid grid-cols-3 gap-2">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 rounded" />)}
              </div>
            )}
          </div>

          {/* OUTLET LEVEL */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <SectionHeader title="Outlet Level" />
            
            {liveMetrics ? (
              <div className="grid grid-cols-3 gap-1">
                <MetricItem label="Website" value={`${liveMetrics.platform_breakdown.swiggy.percentage}%`} />
                <MetricItem label="App" value={`${liveMetrics.platform_breakdown.zomato.percentage}%`} />
                <MetricItem label="In-Store" value={`${liveMetrics.platform_breakdown.dine_in.percentage}%`} />
              </div>
            ) : (
              <div className="animate-pulse grid grid-cols-3 gap-2">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-200 rounded" />)}
              </div>
            )}
          </div>

          {/* MEDIA & PERFORMANCE */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4">
            <SectionHeader title="Media & Performance" />
            
            {kpis ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="text-lg font-bold text-gray-900">{kpis.customer_service.review_ratings.overall_average}★</div>
                  <div className="text-xs text-gray-600">Avg Rating</div>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="text-lg font-bold text-gray-900">{kpis.customer_service.customer_mix.returning_customers.percentage}%</div>
                  <div className="text-xs text-gray-600">Repeat Customers</div>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="text-lg font-bold text-gray-900">{kpis.operational_efficiency.footfall_per_day.value.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Daily Footfall</div>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="text-lg font-bold text-gray-900">{kpis.operational_efficiency.table_turnover_rate.value}x</div>
                  <div className="text-xs text-gray-600">Table Turnover</div>
                </div>
              </div>
            ) : (
              <div className="animate-pulse grid grid-cols-2 gap-3">
                {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-200 rounded" />)}
              </div>
            )}
          </div>

          {/* FINANCE */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4">
            <SectionHeader title="Finance" subtitle={kpis?.summary ? `${kpis.summary.total_kpis} metrics` : ''} />
            
            {kpis ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-1">
                  <MetricItem 
                    label="RevPASH" 
                    value={`₹${kpis.financial_performance.revpash.value}`}
                    status={kpis.financial_performance.revpash.status}
                  />
                  <MetricItem 
                    label="AOV" 
                    value={`₹${kpis.financial_performance.aov_by_channel.overall_avg || 463}`}
                  />
                  <MetricItem 
                    label="Gross Margin" 
                    value={`${kpis.financial_performance.gross_profit_margin.percentage}%`}
                    status={kpis.financial_performance.gross_profit_margin.status}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-emerald-100">
                  <div className="flex justify-between items-center bg-white/60 rounded-lg p-2">
                    <span className="text-xs text-gray-600">Platform Dep.</span>
                    <span className="text-sm font-bold">{kpis.channel_analytics.platform_dependency.percentage}%</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/60 rounded-lg p-2">
                    <span className="text-xs text-gray-600">CAC</span>
                    <span className="text-sm font-bold">₹{kpis.customer_service.customer_acquisition_cost.value}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/60 rounded-lg p-2">
                    <span className="text-xs text-gray-600">Seat Util.</span>
                    <span className="text-sm font-bold">{kpis.operational_efficiency.seat_utilization.percentage}%</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/60 rounded-lg p-2">
                    <span className="text-xs text-gray-600">Kitchen Time</span>
                    <span className="text-sm font-bold">{kpis.operational_efficiency.kitchen_fulfillment_time.minutes}m</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-pulse space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-200 rounded" />)}
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};