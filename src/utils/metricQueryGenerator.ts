/**
 * Generates contextual AI queries based on metric keys.
 * Maps metric identifiers to meaningful analysis prompts.
 */

const metricQueries: Record<string, string> = {
  // Revenue & Sales Metrics
  total_revenue: 'Analyze the total revenue performance, identify key drivers, and suggest areas for improvement.',
  daily_revenue: 'Break down daily revenue patterns, highlight anomalies, and identify trends over time.',
  revenue_trend: 'Examine revenue trends over recent periods and forecast potential future performance.',
  outlet_performance: 'Compare performance across all outlets, identify top and underperforming locations.',

  // Customer Metrics
  customer_segments: 'Analyze customer segmentation data and provide insights on targeting strategies.',
  customer_retention: 'Evaluate customer retention rates and suggest strategies to improve loyalty.',
  acquisition_channels: 'Break down customer acquisition by channel and assess ROI for each.',
  avg_clv: 'Analyze customer lifetime value patterns and identify high-value customer characteristics.',
  first_timer_repeat_enhanced: 'Compare first-time vs repeat customer behavior and conversion opportunities.',
  engagement_metrics: 'Assess customer engagement metrics and recommend improvement strategies.',

  // Platform Metrics
  platform_distribution: 'Compare performance across Website, App, and In-Store channels.',
  platform_trends: 'Analyze platform-specific trends and identify growth opportunities.',
  commission_analysis: 'Evaluate commission structures and their impact on profitability by platform.',

  // Menu & Product Metrics
  top_selling_platform_items: 'Identify best-selling items and analyze what drives their popularity.',

  // Operational Metrics
  kitchen_prep_efficiency: 'Analyze fulfillment time efficiency and identify bottlenecks.',
  covers_tables_utilization: 'Evaluate store utilization rates and suggest optimization strategies.',
  footfall_patterns: 'Examine traffic patterns throughout the day and week.',

  // Rating & Reputation Metrics
  online_ratings: 'Analyze online ratings across platforms and identify factors affecting scores.',
  customer_ratings: 'Break down customer rating trends and sentiment analysis.',

  // Marketing Metrics
  marketing_roi: 'Evaluate marketing ROI and campaign effectiveness.',
  instagram_marketing_spend: 'Analyze Instagram marketing spend efficiency and engagement.',
  zomato_marketing_budget_2024: 'Review App marketing budget allocation and returns for 2024.',
  zomato_marketing_budget_2025: 'Assess App marketing budget plans and expected outcomes for 2025.',
  swiggy_click_budget: 'Analyze Website click-based advertising budget and conversion rates.',
  brand_planning: 'Review brand planning initiatives and strategic positioning.',
  competitor_keywords: 'Analyze competitor keyword strategies and market positioning.',

  // Predictive & Forecasting Metrics
  demand_forecast: 'Review demand forecasting accuracy and upcoming predictions.',
  price_optimization: 'Analyze price optimization opportunities and elasticity.',

  // Store Metrics
  total_stores: 'Provide overview of store network performance and expansion opportunities.',
  top_performer: 'Analyze what makes top-performing stores successful.',
  needs_attention: 'Identify stores needing attention and provide improvement recommendations.',
  regional_performance: 'Compare regional performance and market dynamics.',
};

/**
 * Generates a contextual AI query for a given metric.
 *
 * @param metricKey - The metric identifier
 * @param title - Optional fallback title if metric key is not mapped
 * @returns A contextual query string for AI analysis
 */
export const generateMetricQuery = (metricKey: string, title?: string): string => {
  const query = metricQueries[metricKey];

  if (query) {
    return query;
  }

  // Fallback: Generate a generic query from the title or metric key
  const displayName = title || metricKey.replace(/_/g, ' ');
  return `Analyze the ${displayName} in detail and provide actionable insights.`;
};

/**
 * Gets all available metric keys with their queries.
 * Useful for debugging and documentation.
 */
export const getAllMetricQueries = (): Record<string, string> => {
  return { ...metricQueries };
};
