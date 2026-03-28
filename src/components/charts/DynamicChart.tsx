import React from 'react';
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend,
} from 'recharts';
import { AZA_COLORS } from '../../constants/brandColors';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatters';

export interface ChartSeries {
  dataKey: string;
  label: string;
  color?: string;
}

export interface ChartConfig {
  chartType: 'bar' | 'line' | 'area' | 'pie';
  title: string;
  data: Record<string, any>[];
  xKey?: string;
  series?: ChartSeries[];
  format?: 'currency' | 'number' | 'percentage';
}

interface DynamicChartProps {
  config: ChartConfig;
  compact?: boolean;
}

const formatValue = (value: number, format?: string) => {
  switch (format) {
    case 'currency': return formatCurrency(value);
    case 'percentage': return formatPercentage(value);
    default: return formatNumber(value);
  }
};

const CustomTooltip = ({ active, payload, label, format }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white px-3 py-2 border border-gray-200 rounded-lg shadow-lg text-xs">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: entry.color }} />
          {entry.name}: <span className="font-semibold">{formatValue(entry.value, format)}</span>
        </p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload, format }: any) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-white px-3 py-2 border border-gray-200 rounded-lg shadow-lg text-xs">
      <p className="font-medium text-gray-700 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full inline-block" style={{ background: entry.payload.fill }} />
        {entry.name}: <span className="font-semibold">{formatValue(entry.value, format)}</span>
      </p>
    </div>
  );
};

export const DynamicChart: React.FC<DynamicChartProps> = ({ config, compact = false }) => {
  const { chartType, title, data, xKey = 'name', series = [], format } = config;
  const height = compact ? 180 : 260;
  const colors = AZA_COLORS.chartColors;

  if (!data || data.length === 0) return null;

  const tickFormatter = (v: number) => {
    if (format === 'currency') {
      if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
      if (v >= 100000) return `₹${(v / 100000).toFixed(0)}L`;
      if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
      return `₹${v}`;
    }
    if (format === 'percentage') return `${v}%`;
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
    return String(v);
  };

  const renderBarOrLine = () => {
    const isArea = chartType === 'area';
    const isLine = chartType === 'line';
    const Chart = isArea ? AreaChart : isLine ? LineChart : BarChart;

    return (
      <Chart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: compact ? 10 : 11, fill: '#64748B' }}
          tickLine={false}
          axisLine={{ stroke: '#E2E8F0' }}
          interval={compact ? 'preserveStartEnd' : 0}
          angle={data.length > 6 ? -35 : 0}
          textAnchor={data.length > 6 ? 'end' : 'middle'}
          height={data.length > 6 ? 50 : 30}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#94A3B8' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={tickFormatter}
          width={50}
        />
        <Tooltip content={<CustomTooltip format={format} />} />
        {!compact && series.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            iconSize={8}
            iconType="circle"
          />
        )}
        {series.map((s, i) => {
          const color = s.color || colors[i % colors.length];
          if (isArea) {
            return (
              <Area
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.label}
                stroke={color}
                fill={color}
                fillOpacity={0.15}
                strokeWidth={2}
                dot={false}
              />
            );
          }
          if (isLine) {
            return (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.label}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 3, fill: color }}
                activeDot={{ r: 5 }}
              />
            );
          }
          return (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.label}
              fill={color}
              radius={[3, 3, 0, 0]}
              maxBarSize={compact ? 28 : 40}
            />
          );
        })}
      </Chart>
    );
  };

  const renderPie = () => {
    const dataKey = series[0]?.dataKey || 'value';
    return (
      <PieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={xKey}
          cx="50%"
          cy="50%"
          outerRadius={compact ? 60 : 85}
          innerRadius={compact ? 30 : 45}
          paddingAngle={2}
          label={compact ? false : ({ name, percent }: any) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          labelLine={!compact}
        >
          {data.map((_: any, i: number) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<PieTooltip format={format} />} />
        {compact && (
          <Legend
            wrapperStyle={{ fontSize: 10 }}
            iconSize={7}
            iconType="circle"
            layout="horizontal"
            align="center"
          />
        )}
      </PieChart>
    );
  };

  return (
    <div className="mt-3">
      <p className="text-xs font-medium text-gray-500 mb-2">{title}</p>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'pie' ? renderPie() : renderBarOrLine()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
