// Shared types for chat and conversation components

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: any;
  thinkingChain?: any[];
  toolChain?: any[];
  activities?: any[];
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
  lastMessage?: string;
  timestamp?: Date;
  messages?: Message[];
}

export interface Activity {
  id: number;
  icon: string;
  message: string;
  timestamp: Date;
}

export interface LiveMetrics {
  day_label?: string;
  revenue: {
    formatted: string;
    vs_avg: number;
  };
  orders: {
    total: number;
    avg_value: string;
  };
  customers: {
    unique: number;
    repeat_rate: string;
  };
  platform_breakdown: {
    swiggy: { percentage: string };
    zomato: { percentage: string };
    dine_in: { percentage: string };
  };
}

export interface KPIs {
  operational_efficiency: {
    footfall_per_day: {
      value: number;
      peak_times: Record<string, number>;
      trend: string;
      status: string;
    };
    table_turnover_rate: {
      value: number;
      unit: string;
      target: number;
      status: string;
    };
    seat_utilization: {
      percentage: number;
      peak_utilization: number;
      target: number;
      status: string;
    };
    avg_table_dwell_time: {
      minutes: number;
      target: number;
      status: string;
    };
    kitchen_fulfillment_time: {
      minutes: number;
      target: number;
      status: string;
    };
  };
  financial_performance: {
    revpash: {
      value: number;
      currency: string;
      target: number;
      status: string;
    };
    aov_by_channel: {
      swiggy: number;
      zomato: number;
      dine_in: number;
      overall_avg: number;
    };
    gross_profit_margin: {
      percentage: number;
      target: number;
      monthly_profit: number;
      status: string;
    };
    peak_hour_performance: {
      index: number;
      description: string;
      status: string;
    };
  };
  customer_service: {
    customer_mix: {
      new_customers: {
        percentage: number;
        count: number;
        trend: string;
      };
      returning_customers: {
        percentage: number;
        count: number;
        trend: string;
      };
      loyalty_strength: string;
    };
    review_ratings: {
      overall_average: number;
      google: number;
      zomato: number;
      swiggy: number;
      status: string;
    };
    customer_acquisition_cost: {
      value: number;
      currency: string;
      target: number;
      status: string;
    };
    service_rating_comparison: {
      delivery_rating: number;
      dine_in_rating: number;
      gap: number;
      status: string;
    };
  };
  channel_analytics: {
    platform_dependency: {
      percentage: number;
      target: number;
      status: string;
      risk_level: string;
    };
    channel_split: {
      swiggy: {
        percentage: number;
        revenue: number;
      };
      zomato: {
        percentage: number;
        revenue: number;
      };
      dine_in: {
        percentage: number;
        revenue: number;
      };
      most_profitable: string;
      diversification: string;
    };
  };
  summary?: {
    total_kpis: number;
    last_updated: string;
    data_period: string;
    outlets_analyzed: number;
  };
}

export interface LiveActivity {
  activity: string;
  isActive: boolean;
}