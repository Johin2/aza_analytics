// Trend data for YoY/MoM comparisons
export interface TrendData {
  percentage: number;
  direction: 'positive' | 'negative' | 'neutral';
  formatted: string;
  comparison_period?: string;
  previous_value?: number;
  current_value?: number;
}

// Data period information with actual month names (auto-detected)
export interface DataPeriod {
  start: string;
  end: string;
  current_month: string;
  current_month_short?: string;
  current_year: number;
  comparison_month_mom: string;
  comparison_month_mom_short?: string;
  comparison_year_mom: number;
  comparison_year_yoy: number;
  display_label?: string;
  data_range?: string;
  auto_detected?: boolean;
}

// Store performance with YoY/MoM data
export interface StorePerformance {
  store_name: string;
  monthly_revenue: number;
  dine_in_revenue?: number;
  delivery_revenue?: number;
  growth_rate: number;
  growth_rate_yoy?: number;
  customer_rating?: number;
  performance_score?: number;
  status?: string;
  region?: string;
  type?: string;
  yoy?: TrendData;
  mom?: TrendData;
  // Alternative property names for compatibility
  name?: string;
  outlet?: string;
  revenue?: number;
  overall?: number;
  growth?: number;
}

export interface ExecutiveSummary {
  total_revenue: number;
  outlets: string[];
  customer_metrics: {
    total_segments: number;
    champions_percentage: number;
    churn_rate: number;
    avg_clv: number;
  };
  platform_metrics: {
    website_share: number;
    app_share: number;
    in_store_share: number;
    platform_orders: number;
    total_orders?: number;
    online_orders?: number;
    has_in_store_data?: boolean;
    // Legacy aliases
    swiggy_share?: number;
    zomato_share?: number;
    dine_in_share?: number;
    digital_orders?: number;
    has_dine_in_data?: boolean;
  };
  forecast_metrics: {
    next_30_days_revenue: number;
    daily_average: number;
    growth_potential: number;
  };
  key_insights: {
    type: string;
    icon: string;
    title: string;
    subtitle?: string;
    value: string;
    trend: string;
    status: 'positive' | 'negative' | 'warning';
    period?: string;
    mom_comparison?: string;
    yoy_comparison?: string;
  }[];
  last_updated: string;
}

export interface ExtendedExecutiveSummary extends ExecutiveSummary {
  store_performance?: StorePerformance[];
  revenue_trend?: TrendData;
  yoy_trend?: TrendData;
  data_period?: DataPeriod;
  reputation_metrics?: any;
  operational_metrics?: any;
  marketing_metrics?: any;
  menu_performance?: any;
  verification?: any;
}

export interface SalesAnalytics {
  outlet_performance: {
    outlet: string;
    revenue: number;
    orders: number;
    growth: number;
    rating: number;
    rating_dining?: number;
    rating_delivery?: number;
  }[];
  daily_trends: {
    date: string;
    month?: string;
    revenue: number;
    orders: number;
  }[];
  peak_hours: {
    lunch: { time: string; percentage: number };
    dinner: { time: string; percentage: number };
    others: { time: string; percentage: number };
  };
  recommendations: Record<string, any>;
}

export interface CustomerAnalytics {
  segments: {
    name: string;
    value: number;
    color: string;
  }[];
  retention: {
    month: string;
    monthNumber: number;
    retention: number;
  }[];
  clv_by_segment: {
    segment: string;
    value: number;
  }[];
  metrics: {
    total_customers: number;
    active_customers: number;
    new_customers_monthly: number;
    avg_frequency: number;
  };
  insights: string[];
}

export interface PlatformAnalytics {
  market_share: {
    name: string;
    value: number;
    color: string;
  }[];
  profitability: {
    Platform: string;
    Revenue: number;
    Commission: number;
    Delivery_Cost: number;
    Packaging_Cost: number;
    Food_Cost: number;
    Net_Profit: number;
    Profit_Margin: number;
  }[];
  revenue_comparison: {
    platform: string;
    revenue: number;
  }[];
  order_metrics: Record<string, any>;
  commission_savings: string;
}

export interface PredictiveAnalytics {
  forecast: {
    date: string;
    forecast: number;
    lower: number;
    upper: number;
  }[];
  model_accuracy: number;
  inventory_metrics: {
    daily_requirement: number;
    safety_stock: number;
    optimization_potential: number;
  };
  pricing_strategy: {
    revenue_increase: number;
    recommended_adjustments: {
      time: string;
      adjustment: string;
    }[];
  };
}

// Business Vitality Index Types
export interface DataSources {
  revenue?: string;
  baseline?: string;
  baseline_period?: string;
  growth?: string;
  retention?: string;
  repeat_rate?: string;
  clv?: string;
  ratings?: string;
  delivery?: string;
  accuracy?: string;
  efficiency?: string;
}

export interface ComponentScores {
  baseline_performance?: number;
  growth_momentum?: number;
  retention_component?: number;
  repeat_rate_component?: number;
  clv_growth_component?: number;
  rating_component?: number;
  delivery_component?: number;
  accuracy_component?: number;
  efficiency_component?: number;
}

export interface MethodologyDetails {
  delivery_calc?: string;
  accuracy_calc?: string;
  efficiency_calc?: string;
}

export interface BVIComponent {
  score: number;
  weight: number;
  component_scores?: ComponentScores;
  metrics: {
    monthly_revenue?: number;
    baseline_revenue?: number;
    vs_baseline?: number;
    growth_rate?: number;
    growth?: number;
    retention_rate?: number;
    repeat_rate?: number;
    clv?: number;
    clv_growth?: number;
    avg_rating?: number;
    on_time_delivery?: number;
    order_accuracy?: number;
    kitchen_efficiency?: number;
    stores_evaluated?: number;
    high_performing_stores?: number;
    positive_growth_stores?: number;
  };
  data_sources?: DataSources | string[];
  calculation?: string;
  transparency?: string;
  methodology?: MethodologyDetails | string;
  data_type?: string;
}

export interface DataQuality {
  data_source: string;
  period: string;
  stores_included: number;
  last_updated: string;
  confidence: string;
  data_completeness?: {
    revenue_data?: string;
    store_data?: string;
    customer_data?: string;
    platform_data?: string;
  };
}

export interface BusinessVitalityIndex {
  bvi_score: number;
  data_quality: DataQuality;
  components: {
    revenue_momentum: BVIComponent;
    customer_loyalty: BVIComponent;
    operational_excellence: BVIComponent;
  };
  trend: {
    direction: string;
    percentage: number;
    sparkline_data: number[];
  };
  health_status: string;
  last_updated: string;
}