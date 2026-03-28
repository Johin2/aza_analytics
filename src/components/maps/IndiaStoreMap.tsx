import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { X, ChevronRight } from 'lucide-react';

const INDIA_TOPO_URL = 'https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson';

// City groupings
const CITY_CENTERS: Record<string, { center: [number, number]; outlets: string[] }> = {
  'Mumbai': {
    center: [72.8777, 19.0760],
    outlets: ['Bandra', 'Town', 'Andheri', 'Phoenix Palladium', 'JWD', 'Powai', 'NESCO', 'Inorbit', 'Viviana', 'KOPA'],
  },
  'Bangalore': {
    center: [77.5808, 12.9916],
    outlets: ['Brigade Road', 'Orion'],
  },
  'Ahmedabad': {
    center: [72.5558, 23.0339],
    outlets: ['Palladium Ahmedabad'],
  },
};

interface StoreData {
  store_name: string;
  monthly_revenue: number;
  growth_rate: number;
  customer_rating: number;
  region: string;
  type: string;
  status: string;
}

interface RegionData {
  region: string;
  stores: number;
  avgRevenue: number;
  avgRating: number;
}

interface IndiaStoreMapProps {
  data: RegionData[];
  stores?: StoreData[];
  needsAttention?: string[];
  onStoreClick?: (storeName: string) => void;
}

const formatRevenue = (value: number) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${value.toLocaleString()}`;
};

const getHealthColor = (storeName: string, needsAttention: string[]) => {
  if (needsAttention.includes(storeName)) return '#F43F5E';
  return '#10B981';
};

export const IndiaStoreMap: React.FC<IndiaStoreMapProps> = ({
  data,
  stores = [],
  needsAttention = [],
  onStoreClick,
}) => {
  const [tooltipContent, setTooltipContent] = useState<React.ReactNode | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([74.5, 18]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  // Build store lookup
  const storeMap = useMemo(() => {
    const map: Record<string, StoreData> = {};
    stores.forEach((s) => { map[s.store_name] = s; });
    return map;
  }, [stores]);

  const handleZoomIn = () => { if (zoom < 8) setZoom(zoom * 1.5); };
  const handleZoomOut = () => { if (zoom > 0.5) setZoom(zoom / 1.5); };

  const handleMoveEnd = (position: { coordinates: [number, number]; zoom: number }) => {
    setCenter(position.coordinates);
    setZoom(position.zoom);
  };

  const openCity = (cityName: string) => {
    setSelectedCity(cityName);
    // Zoom map to the city
    const city = CITY_CENTERS[cityName];
    if (city) {
      setCenter(city.center);
      setZoom(2);
    }
  };

  const closePanel = () => {
    setSelectedCity(null);
    setCenter([74.5, 18]);
    setZoom(1);
  };

  // Cluster tooltip (hover only, no individual markers on map)
  const handleClusterHover = (cityName: string, outlets: string[], event: React.MouseEvent) => {
    setTooltipContent(
      <div className="text-xs text-white">
        <span className="font-semibold">{cityName}</span>
        <span className="text-gray-400 ml-1">— {outlets.length} outlet{outlets.length > 1 ? 's' : ''}</span>
        <div className="text-gray-400 mt-0.5">Click to view details</div>
      </div>
    );
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => setTooltipContent(null);

  // Cluster data
  const clusters = useMemo(() => {
    return Object.entries(CITY_CENTERS).map(([cityName, { center: cityCenter, outlets }]) => {
      const hasAttention = outlets.some((name) => needsAttention.includes(name));
      return { cityName, center: cityCenter, count: outlets.length, outlets, hasAttention };
    });
  }, [needsAttention]);

  // City panel outlet list sorted by revenue
  const panelOutlets = useMemo(() => {
    if (!selectedCity) return [];
    const city = CITY_CENTERS[selectedCity];
    if (!city) return [];
    return city.outlets
      .map((name) => storeMap[name])
      .filter(Boolean)
      .sort((a, b) => b.monthly_revenue - a.monthly_revenue);
  }, [selectedCity, storeMap]);

  return (
    <div className="relative w-full h-full min-h-[350px] overflow-hidden">
      {/* Map — always shows clusters only */}
      <div className={`w-full h-full transition-opacity duration-300 ${selectedCity ? 'opacity-40' : ''}`}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 1800, center: [74.5, 18] }}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup
            zoom={zoom}
            center={center}
            onMoveEnd={handleMoveEnd}
            minZoom={0.5}
            maxZoom={8}
          >
            <Geographies geography={INDIA_TOPO_URL}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo: any) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#E5E7EB"
                    stroke="#9CA3AF"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: '#D1D5DB', outline: 'none' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Always cluster bubbles */}
            {clusters.map((cluster) => {
              const size = 16 + cluster.count * 2.5;
              const isActive = selectedCity === cluster.cityName;
              return (
                <Marker key={cluster.cityName} coordinates={cluster.center}>
                  {cluster.hasAttention && (
                    <circle
                      r={size + 5}
                      fill="none"
                      stroke="#F43F5E"
                      strokeWidth={2}
                      opacity={0.5}
                    />
                  )}
                  <circle
                    r={size}
                    fill={isActive ? '#3730A3' : '#4F46E5'}
                    fillOpacity={0.9}
                    stroke={isActive ? '#818CF8' : '#fff'}
                    strokeWidth={isActive ? 3 : 2}
                    style={{ cursor: 'pointer' }}
                    onClick={() => openCity(cluster.cityName)}
                    onMouseEnter={(e) =>
                      handleClusterHover(cluster.cityName, cluster.outlets, e as unknown as React.MouseEvent)
                    }
                    onMouseLeave={handleMouseLeave}
                  />
                  <text
                    textAnchor="middle"
                    y={5}
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      fill: '#fff',
                      fontWeight: 700,
                      pointerEvents: 'none',
                    }}
                  >
                    {cluster.count}
                  </text>
                  <text
                    textAnchor="middle"
                    y={size + 14}
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '11px',
                      fill: '#374151',
                      fontWeight: 600,
                      pointerEvents: 'none',
                    }}
                  >
                    {cluster.cityName}
                  </text>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Click overlay to close panel */}
      {selectedCity && (
        <div
          className="absolute inset-0 z-10"
          onClick={closePanel}
        />
      )}

      {/* Tooltip */}
      {tooltipContent && !selectedCity && (
        <div
          className="fixed z-50 px-3 py-2 bg-gray-900 rounded-lg shadow-xl pointer-events-none"
          style={{ left: tooltipPosition.x + 15, top: tooltipPosition.y - 10 }}
        >
          {tooltipContent}
        </div>
      )}

      {/* Zoom Controls */}
      {!selectedCity && (
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 bg-white/90 rounded shadow border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold text-sm"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 bg-white/90 rounded shadow border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold text-sm"
          >
            −
          </button>
        </div>
      )}

      {/* Bottom legend */}
      {!selectedCity && (
        <div className="absolute bottom-2 left-2 bg-white/90 rounded-md px-2 py-1.5 text-[10px] shadow border border-gray-200 flex items-center gap-3">
          <div className="flex items-center gap-1 text-gray-500">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            Click a cluster to view outlets
          </div>
          {needsAttention.length > 0 && (
            <div className="flex items-center gap-1 text-gray-500">
              <div className="w-2.5 h-2.5 rounded-full border-[1.5px] border-rose-400 bg-transparent" />
              Has flagged stores
            </div>
          )}
        </div>
      )}

      {/* SIDE PANEL — slides in from right */}
      <AnimatePresence>
        {selectedCity && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-0 right-0 bottom-0 w-[280px] bg-white shadow-2xl border-l border-gray-200 z-20 flex flex-col"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
              <div>
                <h4 className="text-sm font-bold text-gray-900">{selectedCity}</h4>
                <p className="text-[11px] text-gray-500">
                  {panelOutlets.length} outlet{panelOutlets.length > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={closePanel}
                className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>

            {/* Outlet list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {panelOutlets.map((store, i) => {
                const isFlagged = needsAttention.includes(store.store_name);
                return (
                  <motion.div
                    key={store.store_name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => onStoreClick?.(store.store_name)}
                    className={`group relative rounded-lg p-2.5 cursor-pointer transition-all hover:shadow-md ${
                      isFlagged
                        ? 'bg-rose-50 border border-rose-200 hover:bg-rose-100'
                        : 'bg-gray-50 border border-gray-100 hover:bg-white hover:border-gray-200'
                    }`}
                  >
                    {/* Store name row */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getHealthColor(store.store_name, needsAttention) }}
                        />
                        <span className="text-xs font-semibold text-gray-900">{store.store_name}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>

                    {/* Metrics row */}
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="font-semibold text-gray-700">{formatRevenue(store.monthly_revenue)}</span>
                      <span className={`font-medium ${store.growth_rate >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {store.growth_rate >= 0 ? '+' : ''}{store.growth_rate.toFixed(1)}%
                      </span>
                      <span className="text-gray-500">
                        <span className="text-yellow-500">★</span> {store.customer_rating}
                      </span>
                    </div>

                    {/* Type tag */}
                    <div className="mt-1">
                      <span className="text-[10px] text-gray-400">{store.type}</span>
                    </div>

                    {/* Flagged indicator */}
                    {isFlagged && (
                      <div className="absolute top-2 right-7 text-[9px] font-bold text-rose-500">
                        ⚠
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Panel footer */}
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span>Click outlet for full details</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Healthy
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Attention
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
