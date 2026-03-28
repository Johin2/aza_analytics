import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { ClickableCard } from '../components/ui/ClickableCard';
import { Loading } from '../components/ui/Loading';
import { StoreCard } from '../components/stores/StoreCard';
import { StoreDetailModal } from '../components/stores/StoreDetailModal';
import { IndiaStoreMap } from '../components/maps/IndiaStoreMap';
import DateFilter from '../components/filters/DateFilter';
import { storeApi } from '../services/storeApi';
import { analyticsApi } from '../services/api';
import { StoreAnalyticsSummary, ComparativeAnalysis } from '../types/stores';
import { AIRecommendations } from '../components/ui/AIRecommendations';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { AZA_COLORS } from '../constants/brandColors';
import { Store, TrendingUp, AlertTriangle, MapPin, Map, BarChart3, Trophy } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';

export const StorePerformance: React.FC = () => {
  const [data, setData] = useState<{
    summary: StoreAnalyticsSummary;
    comparative_analysis: ComparativeAnalysis;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'revenue' | 'growth' | 'rating'>('revenue');
  const [regionalView, setRegionalView] = useState<'map' | 'chart'>('map');
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [forecastData, setForecastData] = useState<any>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await storeApi.getStoresSummary(selectedYear, selectedMonth);
      setData(response);
      analyticsApi.getStoreRevenueForecast(6).then(res => {
        if (res?.success) setForecastData(res);
      }).catch(() => {});
    } catch (err) {
      setError('Failed to load store analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading size="lg" className="h-full" />;
  if (error || !data) return <div className="p-8 text-red-600">{error}</div>;

  // Sort stores based on selected criteria
  const sortedStores = [...data.summary.stores].sort((a, b) => {
    switch (sortBy) {
      case 'growth':
        return b.growth_rate - a.growth_rate;
      case 'rating':
        return b.customer_rating - a.customer_rating;
      default:
        return b.monthly_revenue - a.monthly_revenue;
    }
  });

  // Prepare data for regional chart
  const regionalData = Object.entries(data.comparative_analysis.regional_summary || {}).map(
    ([region, stats]) => ({
      region,
      stores: stats.store_count,
      avgRevenue: Math.round((stats.avg_revenue / 100000) * 10) / 10, // In lakhs, 1 decimal
      avgRating: stats.avg_rating,
    })
  );

  // Prepare data for rating distribution - sorted by rating descending
  const ratingData = [...data.summary.stores]
    .sort((a, b) => b.customer_rating - a.customer_rating)
    .map((store) => ({
      name: store.store_name,
      rating: store.customer_rating,
      fill: store.customer_rating >= 4.7 ? '#10b981' : // Green for excellent
            store.customer_rating >= 4.5 ? '#3b82f6' : // Blue for good
            store.customer_rating >= 4.3 ? '#f59e0b' : // Yellow for average
            '#ef4444', // Red for below average
    }));

  // Calculate average rating for reference line
  const avgRating = data.summary.summary.average_rating;

  // Helper to match store names to forecast data
  const getStoreForecast = (storeName: string) => {
    if (!forecastData?.outlets) return null;
    const normalized = storeName.toLowerCase().replace(/^foo\s+/i, '');
    for (const [outlet, info] of Object.entries(forecastData.outlets) as [string, any][]) {
      if (outlet.toLowerCase().includes(normalized) || normalized.includes(outlet.toLowerCase().replace(/^foo\s+/i, ''))) {
        return info;
      }
    }
    return null;
  };

  return (
    <>
      <Header
        title="Store Performance"
        subtitle="Detailed analytics for all Aza outlets"
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
        <AIRecommendations recommendations={(data as any)?.ai_recommendations} />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <ClickableCard 
            className="bg-gradient-to-br from-blue-50 to-white"
            metricKey="total_stores"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Stores</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {data.summary.total_stores}
                </p>
                <p className="text-sm text-gray-500 mt-1">Across all regions</p>
              </div>
              <Store className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </ClickableCard>

          <ClickableCard 
            className="bg-gradient-to-br from-green-50 to-white"
            metricKey="total_revenue"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {formatCurrency(data.summary.total_revenue || (data.summary as any).total_monthly_revenue || 0)}
                </p>
                <p className="text-sm text-gray-500 mt-1">Monthly combined</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </ClickableCard>

          <ClickableCard
            className="bg-gradient-to-br from-yellow-50 to-white"
            metricKey="top_performer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Monthly Peak Performer</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {data.summary.stores[0]?.store_name || 'N/A'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatCurrency(data.summary.stores[0]?.monthly_revenue || 0)}
                </p>
              </div>
              <MapPin className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </ClickableCard>

          <ClickableCard
            className={data.summary.summary.needs_attention.length > 0
              ? "bg-gradient-to-br from-red-100 via-red-50 to-white border-red-300 ring-2 ring-red-200/60"
              : "bg-gradient-to-br from-green-50 to-white"}
            metricKey="needs_attention"
          >
            {data.summary.summary.needs_attention.length === 0 ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600">Store Health</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-green-700">✓</p>
                  <p className="text-sm text-green-600 mt-1">All stores healthy</p>
                </div>
                <Store className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            ) : data.summary.summary.needs_attention.length <= 3 ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-red-700">⚠ Needs Attention</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-red-700">
                    {data.summary.summary.needs_attention.length}
                  </p>
                  <div className="mt-1.5 space-y-0.5">
                    {data.summary.summary.needs_attention.map((name: string) => {
                      const store = data.summary.stores.find(s => s.store_name === name);
                      const reason = store
                        ? (store.customer_rating < 4.3 ? `★ ${store.customer_rating}` : `${store.growth_rate > 0 ? '+' : ''}${store.growth_rate.toFixed(1)}%`)
                        : '';
                      return (
                        <p key={name} className="text-xs font-medium text-red-600">
                          {name} <span className="text-red-400">— {reason}</span>
                        </p>
                      );
                    })}
                  </div>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <AlertTriangle className="w-12 h-12 text-red-500" />
                </motion.div>
              </div>
            ) : (
              /* Many flagged stores — compact 2-column layout with scroll */
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-red-700">⚠ Needs Attention</p>
                    <p className="text-2xl font-bold text-red-700">
                      {data.summary.summary.needs_attention.length}
                      <span className="text-xs font-normal text-red-500 ml-1.5">
                        of {data.summary.stores.length} outlets
                      </span>
                    </p>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                  </motion.div>
                </div>
                <div className="max-h-[120px] overflow-y-auto pr-1 scrollbar-thin">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {data.summary.summary.needs_attention.map((name: string) => {
                      const store = data.summary.stores.find(s => s.store_name === name);
                      const isRating = store && store.customer_rating < 4.3;
                      const reason = store
                        ? (isRating ? `★ ${store.customer_rating}` : `${store.growth_rate > 0 ? '+' : ''}${store.growth_rate.toFixed(1)}%`)
                        : '';
                      return (
                        <div key={name} className="flex items-center gap-1 text-[11px] leading-tight text-red-600 font-medium truncate">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isRating ? 'bg-yellow-500' : 'bg-red-500'}`} />
                          <span className="truncate">{name}</span>
                          <span className="text-red-400 flex-shrink-0">{reason}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </ClickableCard>
        </div>

        {/* Regional Performance - Map or Charts */}
        <Card className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Regional Performance</h3>
              <p className="text-sm text-gray-500">Store distribution across India</p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setRegionalView('map')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    regionalView === 'map'
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Map className="w-4 h-4" />
                  Map
                </button>
                <button
                  onClick={() => setRegionalView('chart')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    regionalView === 'chart'
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Chart
                </button>
              </div>
            </div>
          </div>

          {regionalView === 'map' ? (
            <div className="h-[400px]">
              <IndiaStoreMap
                data={regionalData}
                stores={data.summary.stores}
                needsAttention={data.summary.summary.needs_attention}
                onStoreClick={setSelectedStore}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Average Revenue by Region */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Average Revenue by Region</h4>
                <p className="text-xs text-gray-500 mb-3">Monthly average in Lakhs</p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={regionalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="region"
                      interval={0}
                      tick={{ fontSize: 10 }}
                      angle={-25}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: number) => [`₹${value.toFixed(1)}L`, 'Avg Revenue']}
                    />
                    <Bar dataKey="avgRevenue" fill={AZA_COLORS.info} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Store Count by Region */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Store Count by Region</h4>
                <p className="text-xs text-gray-500 mb-3">Number of outlets per region</p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={regionalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="region"
                      interval={0}
                      tick={{ fontSize: 10 }}
                      angle={-25}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      formatter={(value: number) => [value, 'Stores']}
                    />
                    <Bar dataKey="stores" fill={AZA_COLORS.success} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </Card>

        {/* Rating Distribution */}
        <ClickableCard
          title="Rating Distribution by Outlet"
          subtitle={`Customer ratings across all stores (Avg: ${avgRating})`}
          className="mb-6 sm:mb-8"
          metricKey="outlet_ratings"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-600">Excellent (4.7+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs text-gray-600">Good (4.5-4.6)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-xs text-gray-600">Average (4.3-4.4)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-gray-600">Below Avg (&lt;4.3)</span>
            </div>
          </div>
          {/* Animated Dot plot / Lollipop chart — replays on every scroll into view */}
          <div className="space-y-3 mt-2">
            {ratingData.map((entry, index) => {
              const min = 3.8;
              const max = 5.0;
              const pct = ((entry.rating - min) / (max - min)) * 100;
              const avgPct = ((avgRating - min) / (max - min)) * 100;
              const staggerDelay = (ratingData.length - 1 - index) * 0.08;
              return (
                <motion.div
                  key={entry.name}
                  className="group flex items-center gap-3"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.4, delay: staggerDelay, ease: 'easeOut' }}
                >
                  <span className="text-xs font-medium text-gray-700 w-[140px] min-w-[140px] text-right">
                    {entry.name}
                  </span>
                  <div className="relative flex-1 h-6">
                    <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-200 -translate-y-1/2" />
                    <div
                      className="absolute top-0 bottom-0 w-[1px] border-l border-dashed border-gray-400"
                      style={{ left: `${avgPct}%` }}
                    />
                    <motion.div
                      className="absolute top-1/2 left-0 h-[3px] -translate-y-1/2 rounded-full"
                      style={{ backgroundColor: entry.fill, opacity: 0.3 }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: false, amount: 0.5 }}
                      transition={{ duration: 0.6, delay: staggerDelay + 0.2, ease: 'easeOut' }}
                    />
                    <motion.div
                      className="absolute -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-sm cursor-pointer"
                      style={{ left: `${pct}%`, top: '50%', marginTop: -8, backgroundColor: entry.fill }}
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: false, amount: 0.5 }}
                      transition={{
                        duration: 0.4,
                        delay: staggerDelay + 0.6,
                        type: 'spring',
                        stiffness: 400,
                        damping: 15,
                      }}
                    />
                    {/* Rating label next to the dot */}
                    <motion.span
                      className="absolute top-1/2 -translate-y-1/2 text-[11px] font-semibold text-gray-700"
                      style={{ left: `${pct}%`, marginLeft: 12 }}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: false, amount: 0.5 }}
                      transition={{ duration: 0.3, delay: staggerDelay + 0.7 }}
                    >
                      {entry.rating.toFixed(1)}
                    </motion.span>
                  </div>
                </motion.div>
              );
            })}
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: ratingData.length * 0.08 + 0.5 }}
            >
              <span className="w-[140px] min-w-[140px]" />
              <div className="relative flex-1 h-4">
                <span className="absolute left-0 text-[10px] text-gray-400">3.8</span>
                <span className="absolute text-[10px] text-gray-400" style={{ left: `${((avgRating - 3.8) / 1.2) * 100}%`, transform: 'translateX(-50%)' }}>Avg: {avgRating}</span>
                <span className="absolute right-0 text-[10px] text-gray-400">5.0</span>
              </div>
              <span className="w-0" />
            </motion.div>
          </div>
        </ClickableCard>

        {/* Top 3 Performers */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" /> Top 3 Performers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {sortedStores.slice(0, 3).map((store, i) => {
              const medalColors = [
                { bg: 'from-yellow-50 via-amber-50 to-white', border: 'border-yellow-200', badge: 'bg-yellow-400 text-yellow-900', icon: '🥇' },
                { bg: 'from-gray-100 via-slate-50 to-white', border: 'border-gray-300', badge: 'bg-gray-400 text-white', icon: '🥈' },
                { bg: 'from-orange-50 via-amber-50 to-white', border: 'border-orange-200', badge: 'bg-orange-400 text-orange-900', icon: '🥉' },
              ];
              const medal = medalColors[i];
              return (
                <motion.div
                  key={store.store_name}
                  onClick={() => setSelectedStore(store.store_name)}
                  className={`relative bg-gradient-to-br ${medal.bg} rounded-xl border ${medal.border} p-4 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1 overflow-hidden`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.4, delay: i * 0.12 }}
                >
                  {i === 0 && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-[spin_8s_linear_infinite] opacity-[0.04]"
                        style={{ background: 'conic-gradient(from 0deg, transparent, gold, transparent, gold, transparent)' }}
                      />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 text-xl">{medal.icon}</div>
                  <h4 className="text-base font-bold text-gray-900">{store.store_name}</h4>
                  <p className="text-xs text-gray-400 mb-3">{store.region} • {store.type}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-gray-900">{formatCurrency(store.monthly_revenue)}</div>
                      <div className="text-[10px] text-gray-400">Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">+{formatPercentage(store.growth_rate)}</div>
                      <div className="text-[10px] text-gray-400">Growth</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900"><span className="text-yellow-500">★</span> {store.customer_rating}</div>
                      <div className="text-[10px] text-gray-400">Rating</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* All Stores Table */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">All Stores</h3>
              {data.summary.summary.needs_attention.length > 0 && (
                <span className="text-xs text-red-600 font-medium">
                  ⚠️ {data.summary.summary.needs_attention.join(', ')} need attention (growth &lt; -10% or rating &lt; 4.3)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2 py-1 rounded border border-gray-200 text-xs"
              >
                <option value="revenue">Revenue</option>
                <option value="growth">Growth</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Store</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Revenue</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Growth</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Next Month Est.</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Rating</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedStores.map((store, index) => {
                  const isFlagged = data.summary.summary.needs_attention.includes(store.store_name);
                  return (
                    <tr
                      key={store.store_name}
                      className={`border-b cursor-pointer transition-colors ${
                        isFlagged
                          ? 'bg-red-50/70 border-red-100 hover:bg-red-100/70'
                          : 'border-gray-50 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedStore(store.store_name)}
                    >
                      <td className="py-2.5 px-3 text-gray-400 font-medium">{index + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{store.store_name}</span>
                          {isFlagged && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700" title={
                              store.customer_rating < 4.3
                                ? `Rating ${store.customer_rating} is below 4.3 threshold`
                                : `Growth ${store.growth_rate.toFixed(1)}% is below -10% threshold`
                            }>
                              <AlertTriangle className="w-3 h-3" />
                              {store.customer_rating < 4.3 ? `★ ${store.customer_rating}` : `${store.growth_rate.toFixed(1)}%`}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-400">{store.region} • {store.type}</div>
                      </td>
                      <td className="text-right py-2.5 px-3 font-semibold text-gray-900">{formatCurrency(store.monthly_revenue)}</td>
                      <td className="text-right py-2.5 px-3">
                        <span className={store.growth_rate > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {store.growth_rate > 0 ? '+' : ''}{formatPercentage(store.growth_rate)}
                        </span>
                      </td>
                      <td className="text-right py-2.5 px-3">
                        {(() => {
                          const forecast = getStoreForecast(store.store_name);
                          if (!forecast?.predictions?.[0]) return <span className="text-gray-300 text-xs">--</span>;
                          const val = forecast.predictions[0].forecast;
                          const trendPct = forecast.trend_pct ?? 0;
                          return (
                            <span className="font-semibold text-gray-800">
                              ₹{(val / 100000).toFixed(1)}L
                              {trendPct !== 0 && (
                                <span className={`ml-1 text-[10px] ${trendPct > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {trendPct > 0 ? '▲' : '▼'}
                                </span>
                              )}
                            </span>
                          );
                        })()}
                      </td>
                      <td className={`text-right py-2.5 px-3 font-medium ${isFlagged && store.customer_rating < 4.3 ? 'text-red-600' : ''}`}>
                        <span className="text-yellow-500">★</span> {store.customer_rating}
                      </td>
                      <td className="text-center py-2.5 px-3">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                          store.status === 'Excellent' ? 'bg-green-100 text-green-700' :
                          store.status === 'Good' ? 'bg-blue-100 text-blue-700' :
                          store.status === 'Average' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {store.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Insights */}
        {(data.comparative_analysis.insights || []).length > 0 && (
          <ClickableCard 
            title="Key Insights" 
            subtitle="Data-driven observations" 
            className="mt-6 sm:mt-8"
            metricKey="outlet_performance"
          >
            <div className="space-y-3">
              {(data.comparative_analysis.insights || []).map((insight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-700">{index + 1}</span>
                  </div>
                  <p className="text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </ClickableCard>
        )}
      </div>

      {/* Store Detail Modal */}
      {selectedStore && (
        <StoreDetailModal
          storeName={selectedStore}
          onClose={() => setSelectedStore(null)}
        />
      )}
    </>
  );
};
