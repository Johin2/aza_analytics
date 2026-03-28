import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  BarChart3,
  DollarSign,
  Users,
  Package,
  Info
} from 'lucide-react';
import { BusinessVitalityIndex } from '../../types/analytics';

// Helper function to format snake_case to Title Case (e.g., "needs_attention" -> "Needs Attention")
const formatSnakeCase = (str: string): string => {
  if (!str) return '';
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

interface BVIPopupProps {
  isOpen: boolean;
  onClose: () => void;
  businessVitality: BusinessVitalityIndex | null;
}

export const BVIPopup: React.FC<BVIPopupProps> = ({ 
  isOpen, 
  onClose, 
  businessVitality 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 rounded p-1.5">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-0.5">Business Vitality Index</h2>
                <p className="text-slate-300 text-xs">
                  {businessVitality?.data_quality?.period} • {businessVitality?.data_quality?.stores_included} stores
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-3xl font-bold">{businessVitality?.bvi_score || 0}</div>
                <div className={`text-xs px-2 py-0.5 rounded-full mt-1 ${
                  (businessVitality?.bvi_score || 0) >= 80 ? 'bg-emerald-500 text-white' :
                  (businessVitality?.bvi_score || 0) >= 60 ? 'bg-amber-500 text-white' :
                  'bg-red-500 text-white'
                }`}>
                  {formatSnakeCase(businessVitality?.health_status || 'Unknown')}
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(92vh - 100px)' }}>
          <div className="px-4 py-3">
            
            {/* Two-Column Layout */}
            <div className="grid grid-cols-3 gap-4">
              
              {/* Left Column - Component Analysis */}
              <div className="col-span-2 space-y-3">
                
                {/* Component Performance Overview */}
                <div className="bg-slate-50 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Component Performance
                  </h3>
                  <div className="space-y-2.5">
                    {/* Revenue Momentum */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-700">Revenue Momentum</span>
                            <span className="text-xs font-bold text-slate-900">
                              {businessVitality?.components?.revenue_momentum?.score?.toFixed(0) || 0}/100
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                              <div 
                                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${businessVitality?.components?.revenue_momentum?.score || 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 w-8">40%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Customer Loyalty */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <Users className="w-4 h-4 text-blue-600" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-700">Customer Loyalty</span>
                            <span className="text-xs font-bold text-slate-900">
                              {businessVitality?.components?.customer_loyalty?.score?.toFixed(0) || 0}/100
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                              <div 
                                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${businessVitality?.components?.customer_loyalty?.score || 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 w-8">35%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Operational Excellence */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <Package className="w-4 h-4 text-violet-600" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-700">Operational Excellence</span>
                            <span className="text-xs font-bold text-slate-900">
                              {businessVitality?.components?.operational_excellence?.score?.toFixed(0) || 0}/100
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                              <div 
                                className="bg-violet-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${businessVitality?.components?.operational_excellence?.score || 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 w-8">25%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-white border border-slate-200 rounded p-2">
                    <p className="text-xs text-slate-600 mb-1">Revenue</p>
                    <p className="text-sm font-bold text-slate-900">
                      ₹{((businessVitality?.components?.revenue_momentum?.metrics?.monthly_revenue || 0) / 100000).toFixed(1)}L
                    </p>
                    <p className="text-xs text-slate-500">
                      {Array.isArray(businessVitality?.components?.revenue_momentum?.data_sources)
                        ? 'platform data'
                        : businessVitality?.components?.revenue_momentum?.data_sources?.baseline || 'current'}
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded p-2">
                    <p className="text-xs text-slate-600 mb-1">Growth</p>
                    <p className="text-sm font-bold text-slate-900">
                      {(businessVitality?.components?.revenue_momentum?.metrics?.growth || 0) > 0 ? '+' : ''}
                      {businessVitality?.components?.revenue_momentum?.metrics?.growth || 0}%
                    </p>
                    <p className="text-xs text-slate-500">MoM</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded p-2">
                    <p className="text-xs text-slate-600 mb-1">Retention</p>
                    <p className="text-sm font-bold text-slate-900">
                      {businessVitality?.components?.customer_loyalty?.metrics?.retention_rate || 0}%
                    </p>
                    <p className="text-xs text-slate-500">
                      {Array.isArray(businessVitality?.components?.customer_loyalty?.data_sources)
                        ? 'calculated'
                        : businessVitality?.components?.customer_loyalty?.data_sources?.retention || 'est'}
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded p-2">
                    <p className="text-xs text-slate-600 mb-1">Rating</p>
                    <p className="text-sm font-bold text-slate-900">
                      {businessVitality?.components?.operational_excellence?.metrics?.avg_rating || 0}★
                    </p>
                    <p className="text-xs text-slate-500">
                      {businessVitality?.components?.operational_excellence?.metrics?.stores_evaluated || 0} stores
                    </p>
                  </div>
                </div>
                
              </div>

              {/* Right Column - Data Transparency */}
              <div className="space-y-3">
                
                {/* Data Quality Badge */}
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${
                      businessVitality?.data_quality?.confidence === 'high' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />
                    <h4 className="font-semibold text-slate-900 text-xs">Data Source</h4>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="text-slate-600">
                      {businessVitality?.data_quality?.data_source || 'Multi-source aggregation'}
                    </div>
                    <div className="text-slate-500">
                      Updated: {businessVitality?.data_quality?.last_updated ? 
                        new Date(businessVitality.data_quality.last_updated).toLocaleString() : 'Unknown'}
                    </div>
                  </div>
                </div>

                {/* Calculation Formula */}
                <div className="bg-slate-100 rounded-lg p-3">
                  <h4 className="font-semibold text-slate-900 text-xs mb-2">Formula</h4>
                  <div className="text-xs text-slate-700 font-mono bg-white rounded p-2">
                    BVI = R×0.4 + C×0.35 + O×0.25
                  </div>
                  <div className="mt-2 text-xs text-slate-600">
                    R=Revenue, C=Customer, O=Operations
                  </div>
                </div>

                {/* Trend Indicator */}
                {businessVitality?.trend && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <h4 className="font-semibold text-slate-900 text-xs mb-2">Trend</h4>
                    <div className="flex items-center gap-2">
                      {businessVitality.trend.direction === 'up' ? 
                        <TrendingUp className="w-4 h-4 text-emerald-600" /> :
                        businessVitality.trend.direction === 'down' ?
                        <TrendingDown className="w-4 h-4 text-red-600" /> :
                        <Minus className="w-4 h-4 text-slate-600" />
                      }
                      <span className="text-xs font-medium text-slate-700">
                        {businessVitality.trend.direction === 'up' ? 'Improving' :
                         businessVitality.trend.direction === 'down' ? 'Declining' : 'Stable'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {businessVitality.trend.percentage}%
                      </span>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Enhanced Data Transparency Section */}
            <div className="mt-4 bg-slate-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Data Source Transparency
              </h3>
              <div className="grid grid-cols-3 gap-4 text-xs">
                
                {/* Revenue Sources */}
                <div className="bg-white rounded p-3 border border-slate-200">
                  <h4 className="font-semibold text-emerald-700 mb-2 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Revenue Data
                  </h4>
                  <div className="space-y-1 text-slate-600">
                    {Array.isArray(businessVitality?.components?.revenue_momentum?.data_sources) ? (
                      <div>
                        <div>Sources: {businessVitality?.components?.revenue_momentum?.data_sources?.join(', ')}</div>
                        <div className="text-emerald-600 font-medium">Multi-source aggregation</div>
                      </div>
                    ) : (
                      <div>
                        <div>Baseline: {businessVitality?.components?.revenue_momentum?.data_sources?.baseline || 'N/A'}</div>
                        <div>Period: {businessVitality?.components?.revenue_momentum?.data_sources?.baseline_period || 'N/A'}</div>
                        <div>Growth: {businessVitality?.components?.revenue_momentum?.data_sources?.growth || 'N/A'}</div>
                        <div className="text-emerald-600 font-medium">
                          {businessVitality?.components?.revenue_momentum?.transparency || 'Source unknown'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Sources */}
                <div className="bg-white rounded p-3 border border-slate-200">
                  <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Customer Data
                  </h4>
                  <div className="space-y-1 text-slate-600">
                    {Array.isArray(businessVitality?.components?.customer_loyalty?.data_sources) ? (
                      <div>
                        <div>Sources: {businessVitality?.components?.customer_loyalty?.data_sources?.join(', ')}</div>
                        <div className="text-blue-600 font-medium">Multi-source aggregation</div>
                      </div>
                    ) : (
                      <div>
                        <div>Retention: {businessVitality?.components?.customer_loyalty?.data_sources?.retention || 'N/A'}</div>
                        <div>Repeat Rate: {businessVitality?.components?.customer_loyalty?.data_sources?.repeat_rate || 'N/A'}</div>
                        <div>CLV: {businessVitality?.components?.customer_loyalty?.data_sources?.clv || 'N/A'}</div>
                        <div className="text-blue-600 font-medium">
                          {businessVitality?.components?.customer_loyalty?.transparency || 'Source unknown'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Operations Sources */}
                <div className="bg-white rounded p-3 border border-slate-200">
                  <h4 className="font-semibold text-violet-700 mb-2 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Operations Data
                  </h4>
                  <div className="space-y-1 text-slate-600">
                    {Array.isArray(businessVitality?.components?.operational_excellence?.data_sources) ? (
                      <div>
                        <div>Sources: {businessVitality?.components?.operational_excellence?.data_sources?.join(', ')}</div>
                        <div className="text-violet-600 font-medium">Mixed data sources</div>
                      </div>
                    ) : (
                      <div>
                        <div>Ratings: {businessVitality?.components?.operational_excellence?.data_sources?.ratings || 'N/A'}</div>
                        <div>Delivery: {businessVitality?.components?.operational_excellence?.data_sources?.delivery || 'N/A'}</div>
                        <div>Accuracy: {businessVitality?.components?.operational_excellence?.data_sources?.accuracy || 'N/A'}</div>
                        <div className="text-violet-600 font-medium">
                          {businessVitality?.components?.operational_excellence?.transparency || 'Source unknown'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Calculation Methodology */}
              <div className="mt-4 space-y-3">
                <h4 className="font-semibold text-slate-900 text-sm border-b border-slate-200 pb-2">
                  Calculation Methodology
                </h4>

                {/* Revenue Momentum Calculation */}
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                  <h5 className="font-semibold text-emerald-800 text-xs mb-2 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Revenue Momentum ({businessVitality?.components?.revenue_momentum?.weight}% weight)
                  </h5>
                  <div className="text-xs space-y-1">
                    <div className="text-emerald-700 font-mono text-xs bg-white rounded p-2">
                      {businessVitality?.components?.revenue_momentum?.calculation}
                    </div>
                    {businessVitality?.components?.revenue_momentum?.methodology && (
                      <div className="text-emerald-600 text-xs">
                        Formula: {typeof businessVitality.components.revenue_momentum.methodology === 'string'
                          ? businessVitality.components.revenue_momentum.methodology
                          : 'Custom calculation'}
                      </div>
                    )}
                    {Array.isArray(businessVitality?.components?.revenue_momentum?.data_sources) && (
                      <div className="text-emerald-600 text-xs">
                        Data: {businessVitality?.components?.revenue_momentum?.data_sources?.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Loyalty Calculation */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h5 className="font-semibold text-blue-800 text-xs mb-2 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Customer Loyalty ({businessVitality?.components?.customer_loyalty?.weight}% weight)
                  </h5>
                  <div className="text-xs space-y-1">
                    <div className="text-blue-700 font-mono text-xs bg-white rounded p-2">
                      {businessVitality?.components?.customer_loyalty?.calculation}
                    </div>
                    {businessVitality?.components?.customer_loyalty?.methodology && (
                      <div className="text-blue-600 text-xs">
                        Formula: {typeof businessVitality.components.customer_loyalty.methodology === 'string'
                          ? businessVitality.components.customer_loyalty.methodology
                          : 'Custom calculation'}
                      </div>
                    )}
                    {Array.isArray(businessVitality?.components?.customer_loyalty?.data_sources) && (
                      <div className="text-blue-600 text-xs">
                        Data: {businessVitality?.components?.customer_loyalty?.data_sources?.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Operational Excellence Calculation */}
                <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
                  <h5 className="font-semibold text-violet-800 text-xs mb-2 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Operational Excellence ({businessVitality?.components?.operational_excellence?.weight}% weight)
                  </h5>
                  <div className="text-xs space-y-1">
                    <div className="text-violet-700 font-mono text-xs bg-white rounded p-2">
                      {businessVitality?.components?.operational_excellence?.calculation}
                    </div>
                    {businessVitality?.components?.operational_excellence?.methodology && (
                      <div className="text-violet-600 text-xs">
                        Formula: {typeof businessVitality.components.operational_excellence.methodology === 'string'
                          ? businessVitality.components.operational_excellence.methodology
                          : 'Custom calculation'}
                      </div>
                    )}
                    {Array.isArray(businessVitality?.components?.operational_excellence?.data_sources) && (
                      <div className="text-violet-600 text-xs">
                        Data: {businessVitality?.components?.operational_excellence?.data_sources?.join(', ')}
                      </div>
                    )}
                    {businessVitality?.components?.operational_excellence?.data_type && (
                      <div className="text-violet-500 text-xs italic">
                        Note: {businessVitality.components.operational_excellence.data_type} data sources
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Legacy Methodology Details (keeping for backward compatibility) */}
              {businessVitality?.components?.operational_excellence?.methodology &&
               typeof businessVitality.components.operational_excellence.methodology === 'object' && (
                <div className="mt-3 bg-amber-50 rounded p-3 border border-amber-200">
                  <h4 className="font-semibold text-amber-800 text-xs mb-2">Legacy Calculation Details</h4>
                  <div className="space-y-1 text-xs text-amber-700">
                    <div>• Delivery: {businessVitality.components.operational_excellence.methodology.delivery_calc}</div>
                    <div>• Accuracy: {businessVitality.components.operational_excellence.methodology.accuracy_calc}</div>
                    <div>• Efficiency: {businessVitality.components.operational_excellence.methodology.efficiency_calc}</div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};