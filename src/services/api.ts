import axios from 'axios';
import {
  ExecutiveSummary,
  SalesAnalytics,
  CustomerAnalytics,
  PlatformAnalytics,
  PredictiveAnalytics
} from '../types/analytics';
import {
  MOCK_EXECUTIVE_SUMMARY,
  MOCK_SALES_DATA,
  MOCK_CUSTOMERS_DATA,
  MOCK_PLATFORMS_DATA,
  MOCK_OPERATIONAL_DATA,
  MOCK_REPUTATION_DATA,
  MOCK_MARKETING_DATA,
  MOCK_MENU_DATA,
  MOCK_CUSTOMER_JOURNEY_DATA,
  MOCK_PREDICTIVE_DATA,
  MOCK_REVENUE_COST_DATA,
  MOCK_LIVE_DASHBOARD,
  MOCK_DATA_SOURCES,
  MOCK_DATA_LINEAGE,
  MOCK_WARNING_COUNTS,
  MOCK_FORECAST,
  MOCK_RESTAVERSE_HOURLY,
  MOCK_RESTAVERSE_KPT,
  MOCK_RESTAVERSE_DAY_PATTERNS,
  MOCK_RESTAVERSE_DAILY_AGGREGATES,
  MOCK_RESTAVERSE_COMPLAINTS,
  MOCK_RESTAVERSE_CATCHALL,
  MOCK_REFRESH,
} from './mock-data';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 180000, // 180 seconds timeout (remote DB can be slow)
});

// Session cache kept for refreshData to clear.
const _sessionCache = new Map<string, any>();

export const analyticsApi = {
  getExecutiveSummary: async (year?: number, month?: number): Promise<ExecutiveSummary> => {
    return MOCK_EXECUTIVE_SUMMARY as any;
  },

  getSalesAnalytics: async (granularity: 'yearly' | 'monthly' = 'yearly', platform: string = 'all', month: number = 0): Promise<SalesAnalytics> => {
    return MOCK_SALES_DATA as any;
  },

  getCustomerAnalytics: async (year: number = 2025, month: number = 0): Promise<CustomerAnalytics> => {
    return MOCK_CUSTOMERS_DATA as any;
  },

  getPlatformAnalytics: async (year: number = 2025, month: number = 0): Promise<PlatformAnalytics> => {
    return MOCK_PLATFORMS_DATA as any;
  },

  getPredictiveAnalytics: async (): Promise<PredictiveAnalytics> => {
    return MOCK_PREDICTIVE_DATA as any;
  },

  getAllData: async (): Promise<any> => {
    return MOCK_LIVE_DASHBOARD;
  },

  getRevenueCostAnalysis: async (): Promise<any> => {
    return MOCK_REVENUE_COST_DATA;
  },

  refreshData: async (): Promise<any> => {
    _sessionCache.clear();
    return MOCK_REFRESH;
  },

  getDataLineage: async (metric: string): Promise<any> => {
    return MOCK_DATA_LINEAGE(metric);
  },

  getDataSources: async (): Promise<any> => {
    return MOCK_DATA_SOURCES;
  },

  // Get LIVE dashboard data directly from Google Sheets
  getLiveDashboard: async (): Promise<any> => {
    return MOCK_LIVE_DASHBOARD;
  },

  // Get warning counts for all dashboard pages (not cached — polled every 60s)
  getWarningCounts: async (): Promise<any> => {
    return MOCK_WARNING_COUNTS;
  },

  // ==================== NEW ENDPOINTS FOR REAL DATA ====================

  getOperationalData: async (year: number = 2025, month: number = 0): Promise<any> => {
    return MOCK_OPERATIONAL_DATA;
  },

  getReputationData: async (year: number = 2025, month: number = 0): Promise<any> => {
    return MOCK_REPUTATION_DATA;
  },

  getMarketingData: async (year: number = 2025, month: number = 0): Promise<any> => {
    return MOCK_MARKETING_DATA;
  },

  getMenuIntelligence: async (): Promise<any> => {
    return MOCK_MENU_DATA;
  },

  getCustomerJourney: async (): Promise<any> => {
    return MOCK_CUSTOMER_JOURNEY_DATA;
  },

  // ==================== RESTAVERSE DATA ENDPOINTS ====================

  getRestaverseAll: async (): Promise<any> => {
    return MOCK_LIVE_DASHBOARD;
  },

  getHourlyInsights: async (): Promise<any> => {
    return MOCK_RESTAVERSE_HOURLY;
  },

  getMealTimeInsights: async (): Promise<any> => {
    return MOCK_RESTAVERSE_CATCHALL("meal-times");
  },

  getDeliveryZones: async (): Promise<any> => {
    return MOCK_RESTAVERSE_CATCHALL("delivery-zones");
  },

  getKPTDistribution: async (): Promise<any> => {
    return MOCK_RESTAVERSE_KPT;
  },

  getComplaintAnalysis: async (): Promise<any> => {
    return MOCK_RESTAVERSE_COMPLAINTS;
  },

  getItemIssues: async (): Promise<any> => {
    return MOCK_RESTAVERSE_CATCHALL("item-issues");
  },

  getPlatformAOV: async (): Promise<any> => {
    return MOCK_RESTAVERSE_CATCHALL("platform-aov");
  },

  getDayPatterns: async (): Promise<any> => {
    return MOCK_RESTAVERSE_DAY_PATTERNS;
  },

  getBasketSize: async (): Promise<any> => {
    return MOCK_RESTAVERSE_CATCHALL("basket-size");
  },

  getConversionFunnel: async (): Promise<any> => {
    return MOCK_RESTAVERSE_CATCHALL("conversion-funnel");
  },

  getAdsEfficiency: async (): Promise<any> => {
    return MOCK_RESTAVERSE_CATCHALL("ads-efficiency");
  },

  getDiscountEfficiency: async (): Promise<any> => {
    return MOCK_RESTAVERSE_CATCHALL("discount-efficiency");
  },

  getMonthlyTrends: async (): Promise<any> => {
    return MOCK_RESTAVERSE_CATCHALL("monthly-trends");
  },

  getDailyAggregates: async (): Promise<any> => {
    return MOCK_RESTAVERSE_DAILY_AGGREGATES;
  },

  // ==================== FORECAST ENDPOINTS ====================

  getForecast30Day: async (): Promise<any> => {
    return MOCK_FORECAST("30-day", 6);
  },

  getForecastStatus: async (): Promise<any> => {
    return MOCK_FORECAST("status", 6);
  },

  getStoreRevenueForecast: async (monthsAhead: number = 6): Promise<any> => {
    return MOCK_FORECAST("store-revenue", monthsAhead);
  },

  getPlatformForecast: async (monthsAhead: number = 6): Promise<any> => {
    return MOCK_FORECAST("platform", monthsAhead);
  },

  getCustomerForecast: async (monthsAhead: number = 6): Promise<any> => {
    return MOCK_FORECAST("customers", monthsAhead);
  },

  getRatingForecast: async (monthsAhead: number = 6): Promise<any> => {
    return MOCK_FORECAST("ratings", monthsAhead);
  },

  getPrepTimeForecast: async (monthsAhead: number = 6): Promise<any> => {
    return MOCK_FORECAST("prep-time", monthsAhead);
  },

  getAllForecasts: async (): Promise<any> => {
    return MOCK_FORECAST("all", 6);
  },
};

export default api;
