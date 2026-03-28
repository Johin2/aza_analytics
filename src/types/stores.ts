export interface StoreMetrics {
  store_name: string;
  metadata: {
    region: string;
    type: string;
    size: string;
    opened: string;
  };
  monthly_revenue: number;
  monthly_orders: number;
  avg_order_value: number;
  customer_rating: number;
  staff_count: number;
  operating_hours: string;
  growth_rate: number;
  customer_satisfaction: number;
  repeat_customer_rate: number;
  platform_mix: {
    Swiggy: number;
    Zomato: number;
    'Dine-in': number;
  };
  performance_score: number;
  efficiency_ratio: number;
}

export interface StoreTrend {
  date: string;
  revenue: number;
  orders: number;
  avg_order_value: number;
}

export interface StoreDetails {
  metrics: StoreMetrics;
  trends: StoreTrend[];
  recommendations: string[];
}

export interface StoreSummary {
  store_name: string;
  region: string;
  type: string;
  monthly_revenue: number;
  growth_rate: number;
  customer_rating: number;
  performance_score: number;
  status: 'Excellent' | 'Good' | 'Average' | 'Warning';
  key_metric: {
    label: string;
    value: string;
    type: 'success' | 'danger' | 'warning' | 'info';
  };
  revenue_rank: number;
}

export interface StoreAnalyticsSummary {
  total_stores: number;
  total_revenue: number;
  avg_growth?: number;
  stores: StoreSummary[];
  summary: {
    total_stores?: number;
    total_monthly_revenue?: number;
    average_rating: number;
    top_performer?: string;
    needs_attention: string[];
  };
  data_period?: {
    start: string;
    end: string;
    days: number;
  };
}

export interface RegionalSummary {
  [region: string]: {
    store_count: number;
    avg_revenue: number;
    avg_rating: number;
    avg_growth: number;
    total_revenue: number;
  };
}

export interface ComparativeAnalysis {
  regional_summary: RegionalSummary;
  type_performance: {
    [type: string]: number;
  };
  insights: string[];
  correlation_factors: {
    size_impact: string;
    age_impact: string;
    location_impact: string;
  };
}