/**
 * Static mock data for all API endpoints.
 * Replaces the Python mock server so the dashboard can be deployed as a static site.
 * Every constant matches the exact shape returned by mock_server.py.
 */

// ---------------------------------------------------------------------------
// Shared constants (mirrors mock_server.py)
// ---------------------------------------------------------------------------

const STORES = [
  "Palladium Mumbai", "DLF Emporio Delhi", "UB City Bangalore", "Bandra Boutique",
  "Kala Ghoda", "Khan Market Delhi", "Ambience Gurgaon", "Hyderabad Banjara Hills",
  "Phoenix Pune", "Jio World Plaza", "Kolkata Park Street", "Chennai Express Avenue",
  "Ahmedabad SG Highway", "Online Store",
];

const STORE_REGIONS: Record<string, string> = {
  "Palladium Mumbai": "West", "DLF Emporio Delhi": "North", "UB City Bangalore": "South",
  "Bandra Boutique": "West", "Kala Ghoda": "West", "Khan Market Delhi": "North",
  "Ambience Gurgaon": "North", "Hyderabad Banjara Hills": "South", "Phoenix Pune": "West",
  "Jio World Plaza": "West", "Kolkata Park Street": "East", "Chennai Express Avenue": "South",
  "Ahmedabad SG Highway": "West", "Online Store": "Online",
};

const STORE_TYPES: Record<string, string> = {
  "Palladium Mumbai": "Flagship", "DLF Emporio Delhi": "Flagship", "UB City Bangalore": "Flagship",
  "Bandra Boutique": "Boutique", "Kala Ghoda": "Boutique", "Khan Market Delhi": "Boutique",
  "Ambience Gurgaon": "Mall", "Hyderabad Banjara Hills": "Boutique", "Phoenix Pune": "Mall",
  "Jio World Plaza": "Flagship", "Kolkata Park Street": "Boutique", "Chennai Express Avenue": "Mall",
  "Ahmedabad SG Highway": "Mall", "Online Store": "Digital",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Outlets from the live JSON (used by several endpoints)
const OUTLETS_DATA = [
  { outlet: "Palladium Mumbai", overall: 68200000, growth: 18.4 },
  { outlet: "DLF Emporio Delhi", overall: 54800000, growth: 22.1 },
  { outlet: "Jio World Plaza", overall: 47600000, growth: 85.3 },
  { outlet: "Online Store", overall: 42500000, growth: 34.7 },
  { outlet: "UB City Bangalore", overall: 38900000, growth: 15.2 },
  { outlet: "Bandra Boutique", overall: 35200000, growth: 12.8 },
  { outlet: "Khan Market Delhi", overall: 31700000, growth: 19.6 },
  { outlet: "Ambience Gurgaon", overall: 28400000, growth: 21.3 },
  { outlet: "Kala Ghoda", overall: 26100000, growth: 8.5 },
  { outlet: "Phoenix Pune", overall: 24800000, growth: 27.4 },
  { outlet: "Hyderabad Banjara Hills", overall: 22300000, growth: 31.2 },
  { outlet: "Chennai Express Avenue", overall: 21900000, growth: 24.8 },
  { outlet: "Kolkata Park Street", overall: 19600000, growth: 16.9 },
  { outlet: "Ahmedabad SG Highway", overall: 18700000, growth: 28.6 },
];

const CATEGORIES = [
  { category: "Bridal Wear", revenue: 148200000, units_sold: 1820, avg_price: 81429, growth: 24.3, margin: 42.5 },
  { category: "Festive & Occasion", revenue: 96400000, units_sold: 3400, avg_price: 28353, growth: 18.7, margin: 38.2 },
  { category: "Contemporary & Fusion", revenue: 78600000, units_sold: 5200, avg_price: 15115, growth: 31.5, margin: 35.8 },
  { category: "Luxury Accessories", revenue: 62300000, units_sold: 4800, avg_price: 12979, growth: 22.1, margin: 44.6 },
  { category: "Men's Designer", revenue: 45800000, units_sold: 2600, avg_price: 17615, growth: 35.8, margin: 36.4 },
  { category: "Jewellery", revenue: 49400000, units_sold: 980, avg_price: 50408, growth: 15.2, margin: 28.3 },
];

// ---------------------------------------------------------------------------
// Full MOCK object (mirrors live_dashboard_output.json)
// ---------------------------------------------------------------------------

export const MOCK_LIVE_DASHBOARD = {
  success: true,
  data_source: "Google Sheets (LIVE)",
  timestamp: "2026-03-27T10:30:00.000000",
  period: "March 2026",
  sales: {
    period: "March 2026",
    totals: {
      in_store: 284500000,
      online: 196200000,
      overall: 480700000,
      formatted: {
        in_store: "\u20B9284,500,000",
        online: "\u20B9196,200,000",
        overall: "\u20B9480,700,000",
        overall_crores: "\u20B948.07 Cr",
      },
    },
    outlets: OUTLETS_DATA,
    outlet_count: 14,
  },
  customer_retention: {
    period: "February 2026",
    year: 2026,
    totals: {
      first_timers: 18420,
      repeat_regular: 12680,
      total: 31100,
      retention_rate: 40.8,
      formatted: {
        first_timers: "18,420",
        repeat_regular: "12,680",
        total: "31,100",
        retention_rate: "40.8%",
      },
    },
    outlets: [
      { outlet: "Aza Palladium Mumbai", first_timers: 2840, repeat_regular: 2120, total: 4960, retention_rate: 42.7 },
      { outlet: "Aza DLF Emporio Delhi", first_timers: 2150, repeat_regular: 1680, total: 3830, retention_rate: 43.9 },
      { outlet: "Aza Jio World Plaza", first_timers: 1980, repeat_regular: 920, total: 2900, retention_rate: 31.7 },
      { outlet: "Aza Online Store", first_timers: 3200, repeat_regular: 1850, total: 5050, retention_rate: 36.6 },
      { outlet: "Aza UB City Bangalore", first_timers: 1560, repeat_regular: 1240, total: 2800, retention_rate: 44.3 },
      { outlet: "Aza Bandra Boutique", first_timers: 1340, repeat_regular: 1080, total: 2420, retention_rate: 44.6 },
      { outlet: "Aza Khan Market Delhi", first_timers: 1120, repeat_regular: 890, total: 2010, retention_rate: 44.3 },
      { outlet: "Aza Ambience Gurgaon", first_timers: 980, repeat_regular: 720, total: 1700, retention_rate: 42.4 },
      { outlet: "Aza Kala Ghoda", first_timers: 760, repeat_regular: 640, total: 1400, retention_rate: 45.7 },
      { outlet: "Aza Phoenix Pune", first_timers: 680, repeat_regular: 520, total: 1200, retention_rate: 43.3 },
      { outlet: "Aza Hyderabad Banjara Hills", first_timers: 540, repeat_regular: 380, total: 920, retention_rate: 41.3 },
      { outlet: "Aza Chennai Express Avenue", first_timers: 510, repeat_regular: 350, total: 860, retention_rate: 40.7 },
      { outlet: "Aza Kolkata Park Street", first_timers: 420, repeat_regular: 180, total: 600, retention_rate: 30.0 },
      { outlet: "Aza Ahmedabad SG Highway", first_timers: 340, repeat_regular: 110, total: 450, retention_rate: 24.4 },
    ],
    outlet_count: 14,
  },
  platform_comparison: {
    period: "February 2026",
    totals: {
      website: 112500000,
      app: 83700000,
      total: 196200000,
      formatted: {
        website: "\u20B9112,500,000",
        app: "\u20B983,700,000",
        total: "\u20B9196,200,000",
      },
    },
    outlets: [
      { outlet: "Aza Website", website: 112500000, app: 0, total: 112500000 },
      { outlet: "Aza App (iOS)", website: 0, app: 52300000, total: 52300000 },
      { outlet: "Aza App (Android)", website: 0, app: 31400000, total: 31400000 },
    ],
    outlet_count: 3,
  },
  store_performance: {
    period: "March 2026",
    metrics: [
      { store: "Palladium Mumbai", revenue: 68200000, footfall: 8450, avg_ticket_size: 80710, conversion_rate: 32.4, top_designer: "Sabyasachi", top_category: "Bridal Wear" },
      { store: "DLF Emporio Delhi", revenue: 54800000, footfall: 6200, avg_ticket_size: 88387, conversion_rate: 28.6, top_designer: "Manish Malhotra", top_category: "Couture" },
      { store: "Jio World Plaza", revenue: 47600000, footfall: 9800, avg_ticket_size: 48571, conversion_rate: 35.1, top_designer: "Anamika Khanna", top_category: "Contemporary" },
      { store: "UB City Bangalore", revenue: 38900000, footfall: 5100, avg_ticket_size: 76275, conversion_rate: 30.2, top_designer: "Tarun Tahiliani", top_category: "Festive Wear" },
      { store: "Bandra Boutique", revenue: 35200000, footfall: 4800, avg_ticket_size: 73333, conversion_rate: 34.8, top_designer: "Rahul Mishra", top_category: "Ready-to-Wear" },
    ],
  },
  collection_performance: {
    period: "March 2026",
    categories: CATEGORIES,
    top_designers: [
      { designer: "Sabyasachi Mukherjee", revenue: 42800000, units_sold: 340, avg_price: 125882, growth: 12.4 },
      { designer: "Manish Malhotra", revenue: 38500000, units_sold: 420, avg_price: 91667, growth: 18.9 },
      { designer: "Anamika Khanna", revenue: 31200000, units_sold: 380, avg_price: 82105, growth: 25.3 },
      { designer: "Tarun Tahiliani", revenue: 28900000, units_sold: 350, avg_price: 82571, growth: 14.7 },
      { designer: "Rahul Mishra", revenue: 24600000, units_sold: 520, avg_price: 47308, growth: 42.1 },
      { designer: "Abu Jani Sandeep Khosla", revenue: 22100000, units_sold: 280, avg_price: 78929, growth: 8.6 },
      { designer: "Anita Dongre", revenue: 19800000, units_sold: 680, avg_price: 29118, growth: 21.4 },
      { designer: "Ritu Kumar", revenue: 16500000, units_sold: 720, avg_price: 22917, growth: 11.2 },
      { designer: "Gaurav Gupta", revenue: 15200000, units_sold: 190, avg_price: 80000, growth: 33.6 },
      { designer: "Masaba Gupta", revenue: 12800000, units_sold: 860, avg_price: 14884, growth: 48.2 },
    ],
  },
  marketing: {
    period: "February 2026",
    channels: [
      { channel: "Instagram", spend: 4200000, revenue_attributed: 28500000, roas: 6.8, conversions: 1840 },
      { channel: "Google Ads", spend: 3800000, revenue_attributed: 22100000, roas: 5.8, conversions: 1520 },
      { channel: "Facebook", spend: 2100000, revenue_attributed: 9800000, roas: 4.7, conversions: 680 },
      { channel: "Influencer Collaborations", spend: 5600000, revenue_attributed: 34200000, roas: 6.1, conversions: 2100 },
      { channel: "Email/CRM", spend: 800000, revenue_attributed: 18400000, roas: 23.0, conversions: 1200 },
      { channel: "WhatsApp Business", spend: 450000, revenue_attributed: 8900000, roas: 19.8, conversions: 520 },
    ],
  },
  reputation: {
    period: "March 2026",
    overall_rating: 4.6,
    total_reviews: 28400,
    platforms: [
      { platform: "Google Reviews", rating: 4.5, reviews: 12800, sentiment_positive: 82.4 },
      { platform: "App Store", rating: 4.7, reviews: 8600, sentiment_positive: 88.1 },
      { platform: "Trustpilot", rating: 4.3, reviews: 4200, sentiment_positive: 76.8 },
      { platform: "Social Media", rating: 4.8, reviews: 2800, sentiment_positive: 91.2 },
    ],
  },
};

// ---------------------------------------------------------------------------
// /api/executive-summary
// ---------------------------------------------------------------------------

export const MOCK_EXECUTIVE_SUMMARY = {
  total_revenue: 480700000,
  outlets: STORES,
  customer_metrics: {
    total_segments: 4,
    champions_percentage: 12.8,
    churn_rate: 18.4,
    avg_clv: 154600,
  },
  platform_metrics: {
    website_share: 23.4,
    app_share: 17.4,
    in_store_share: 59.2,
    platform_orders: 48200,
    total_orders: 48200,
    online_orders: 27000,
    has_in_store_data: true,
    swiggy_share: 23.4,
    zomato_share: 17.4,
    dine_in_share: 59.2,
  },
  forecast_metrics: {
    next_30_days_revenue: 42000000,
    daily_average: 1400000,
    growth_potential: 22.4,
  },
  key_insights: [
    { type: "revenue", icon: "trending-up", title: "Revenue Growth", value: "48.07 Cr", trend: "+22.4%", status: "positive", subtitle: "Total revenue FY 2025-26" },
    { type: "customers", icon: "users", title: "Customer Base", value: "31,100", trend: "+18.2%", status: "positive", subtitle: "Active customers this period" },
    { type: "retention", icon: "repeat", title: "Retention Rate", value: "40.8%", trend: "+3.2%", status: "positive", subtitle: "Returning customers" },
    { type: "aov", icon: "shopping-bag", title: "Avg Order Value", value: "99,730", trend: "+8.6%", status: "positive", subtitle: "Luxury basket size" },
    { type: "stores", icon: "store", title: "Top Store", value: "Palladium Mumbai", trend: "68.2 Cr", status: "positive", subtitle: "Highest revenue store" },
    { type: "designer", icon: "star", title: "Top Designer", value: "Sabyasachi", trend: "4.28 Cr", status: "positive", subtitle: "Best selling designer" },
  ],
  last_updated: "2026-03-27T10:30:00Z",
  store_performance: [
    { store_name: "Palladium Mumbai", monthly_revenue: 68200000, growth_rate: 18.4 },
    { store_name: "DLF Emporio Delhi", monthly_revenue: 54800000, growth_rate: 22.1 },
    { store_name: "Jio World Plaza", monthly_revenue: 47600000, growth_rate: 85.3 },
    { store_name: "Online Store", monthly_revenue: 42500000, growth_rate: 34.7 },
    { store_name: "UB City Bangalore", monthly_revenue: 38900000, growth_rate: 15.2 },
  ],
};

// ---------------------------------------------------------------------------
// /api/sales
// ---------------------------------------------------------------------------

export const MOCK_SALES_DATA = {
  period: { year: 2025, granularity: "yearly" },
  total_revenue: 4807000000,
  growth: 22.4,
  outlet_performance: OUTLETS_DATA.map((o) => ({
    outlet: o.outlet,
    revenue: o.overall,
    orders: Math.round(o.overall / 99000),
    growth: o.growth,
    rating: 4.5,
    rating_dining: 4.4,
    rating_delivery: 4.3,
  })),
  daily_trends: [
    { date: "2025-01-15", month: "Jan", revenue: 370000000, orders: 3800 },
    { date: "2025-02-15", month: "Feb", revenue: 388000000, orders: 3914 },
    { date: "2025-03-15", month: "Mar", revenue: 405000000, orders: 4028 },
    { date: "2025-04-15", month: "Apr", revenue: 418000000, orders: 4142 },
    { date: "2025-05-15", month: "May", revenue: 435000000, orders: 4256 },
    { date: "2025-06-15", month: "Jun", revenue: 390000000, orders: 4370 },
    { date: "2025-07-15", month: "Jul", revenue: 412000000, orders: 4484 },
    { date: "2025-08-15", month: "Aug", revenue: 448000000, orders: 4598 },
    { date: "2025-09-15", month: "Sep", revenue: 462000000, orders: 4712 },
    { date: "2025-10-15", month: "Oct", revenue: 510000000, orders: 4826 },
    { date: "2025-11-15", month: "Nov", revenue: 528000000, orders: 4940 },
    { date: "2025-12-15", month: "Dec", revenue: 545000000, orders: 5054 },
  ],
  peak_hours: {
    lunch: { time: "12:00 PM - 3:00 PM", percentage: 28.5 },
    dinner: { time: "7:00 PM - 10:00 PM", percentage: 42.3 },
    others: { time: "Other hours", percentage: 29.2 },
  },
  recommendations: {
    revenue_optimization: "Focus on evening shopping events at flagship stores to capitalize on 42.3% peak-hour traffic",
    growth_strategy: "Expand online exclusive collections \u2014 digital channel growing at 34.7% YoY",
    customer_engagement: "Launch VIP preview events at top 3 stores to increase average order value",
  },
  by_channel: {
    website: { revenue: 1125000000, share: 23.4, growth: 34.7 },
    app: { revenue: 837000000, share: 17.4, growth: 28.3 },
    in_store: { revenue: 2845000000, share: 59.2, growth: 18.4 },
  },
  by_category: CATEGORIES,
  by_store: OUTLETS_DATA,
  data_period: {
    start: "2025-01-01",
    end: "2025-12-31",
    months: 12,
    year: 2025,
  },
  available_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
};

// ---------------------------------------------------------------------------
// /api/stores
// ---------------------------------------------------------------------------

const _storeRows = [
  { store_name: "Palladium Mumbai", monthly_revenue: 78000000, growth_rate: 22.4, customer_rating: 4.8, performance_score: 92.5, status: "Excellent" as const },
  { store_name: "DLF Emporio Delhi", monthly_revenue: 72000000, growth_rate: 18.6, customer_rating: 4.7, performance_score: 89.2, status: "Excellent" as const },
  { store_name: "Jio World Plaza", monthly_revenue: 65000000, growth_rate: 24.2, customer_rating: 4.6, performance_score: 87.8, status: "Good" as const },
  { store_name: "UB City Bangalore", monthly_revenue: 58000000, growth_rate: 15.8, customer_rating: 4.5, performance_score: 84.5, status: "Good" as const },
  { store_name: "Bandra Boutique", monthly_revenue: 52000000, growth_rate: 12.4, customer_rating: 4.7, performance_score: 86.3, status: "Excellent" as const },
  { store_name: "Online Store", monthly_revenue: 48000000, growth_rate: 26.8, customer_rating: 4.4, performance_score: 82.1, status: "Good" as const },
  { store_name: "Khan Market Delhi", monthly_revenue: 44000000, growth_rate: 19.2, customer_rating: 4.6, performance_score: 85.4, status: "Good" as const },
  { store_name: "Ambience Gurgaon", monthly_revenue: 38000000, growth_rate: 14.5, customer_rating: 4.3, performance_score: 78.6, status: "Average" as const },
  { store_name: "Kala Ghoda", monthly_revenue: 35000000, growth_rate: 8.2, customer_rating: 4.5, performance_score: 80.2, status: "Good" as const },
  { store_name: "Phoenix Pune", monthly_revenue: 32000000, growth_rate: -6.2, customer_rating: 4.2, performance_score: 72.4, status: "Warning" as const },
  { store_name: "Hyderabad Banjara Hills", monthly_revenue: 28000000, growth_rate: 21.5, customer_rating: 4.4, performance_score: 79.8, status: "Good" as const },
  { store_name: "Chennai Express Avenue", monthly_revenue: 25000000, growth_rate: 16.8, customer_rating: 4.3, performance_score: 76.5, status: "Average" as const },
  { store_name: "Kolkata Park Street", monthly_revenue: 20000000, growth_rate: -3.4, customer_rating: 4.1, performance_score: 68.2, status: "Warning" as const },
  { store_name: "Ahmedabad SG Highway", monthly_revenue: 18000000, growth_rate: 10.8, customer_rating: 4.0, performance_score: 65.4, status: "Warning" as const },
].map((s, i) => ({
  ...s,
  region: STORE_REGIONS[s.store_name] || "West",
  type: STORE_TYPES[s.store_name] || "Boutique",
  key_metric: { label: "Revenue Rank", value: `#${i + 1}`, type: "info" },
  revenue_rank: i + 1,
}));

const _needsAttention = _storeRows
  .filter((s) => s.growth_rate < -5 || s.customer_rating < 4.3)
  .map((s) => s.store_name);

const _avgRating = Number((_storeRows.reduce((a, s) => a + s.customer_rating, 0) / _storeRows.length).toFixed(2));
const _totalRev = _storeRows.reduce((a, s) => a + s.monthly_revenue, 0);

// Build regional summary
const _regionalMap: Record<string, { count: number; revenues: number[]; ratings: number[]; growths: number[]; total: number }> = {};
_storeRows.forEach((s) => {
  const r = s.region;
  if (!_regionalMap[r]) _regionalMap[r] = { count: 0, revenues: [], ratings: [], growths: [], total: 0 };
  _regionalMap[r].count += 1;
  _regionalMap[r].revenues.push(s.monthly_revenue);
  _regionalMap[r].ratings.push(s.customer_rating);
  _regionalMap[r].growths.push(s.growth_rate);
  _regionalMap[r].total += s.monthly_revenue;
});

const _regionalSummary: Record<string, any> = {};
Object.entries(_regionalMap).forEach(([r, d]) => {
  _regionalSummary[r] = {
    store_count: d.count,
    avg_revenue: Math.round(d.revenues.reduce((a, b) => a + b, 0) / d.revenues.length),
    avg_rating: Number((d.ratings.reduce((a, b) => a + b, 0) / d.ratings.length).toFixed(2)),
    avg_growth: Number((d.growths.reduce((a, b) => a + b, 0) / d.growths.length).toFixed(1)),
    total_revenue: d.total,
  };
});

export const MOCK_STORES_DATA = {
  summary: {
    total_stores: _storeRows.length,
    total_revenue: _totalRev,
    stores: _storeRows,
    summary: {
      average_rating: _avgRating,
      needs_attention: _needsAttention,
      top_performer: _storeRows[0].store_name,
    },
  },
  comparative_analysis: {
    regional_summary: _regionalSummary,
    type_performance: {
      Flagship: 88.5,
      Boutique: 78.2,
      Mall: 72.4,
      Digital: 82.1,
    },
    insights: [
      "Palladium Mumbai leads all stores with consistent 20%+ growth over 6 months",
      "West region contributes 52% of total revenue across 5 outlets",
      "Online Store shows highest growth rate, suggesting strong digital adoption",
      "Boutique stores have highest customer ratings (avg 4.6) despite lower volume",
    ],
    correlation_factors: {
      size_impact: "Flagship stores generate 2.3x revenue of boutique stores on average",
      age_impact: "Stores open 3+ years show 15% higher retention rates",
      location_impact: "Mall locations see 40% higher footfall but 12% lower AOV",
    },
  },
  generated_at: "2026-03-27T10:30:00Z",
};

// ---------------------------------------------------------------------------
// /api/stores/{store_name}
// ---------------------------------------------------------------------------

export const MOCK_STORE_DETAIL = (storeName: string) => ({
  store_name: storeName,
  region: STORE_REGIONS[storeName] || "West",
  type: STORE_TYPES[storeName] || "Boutique",
  monthly_revenue: 52000000,
  growth_rate: 18.4,
  customer_rating: 4.5,
  monthly_trends: [
    { month: "Jan", revenue: 38000000, orders: 420 },
    { month: "Feb", revenue: 42000000, orders: 460 },
    { month: "Mar", revenue: 45000000, orders: 490 },
    { month: "Apr", revenue: 40000000, orders: 440 },
    { month: "May", revenue: 48000000, orders: 520 },
    { month: "Jun", revenue: 35000000, orders: 380 },
    { month: "Jul", revenue: 37000000, orders: 400 },
    { month: "Aug", revenue: 50000000, orders: 550 },
    { month: "Sep", revenue: 55000000, orders: 600 },
    { month: "Oct", revenue: 62000000, orders: 680 },
    { month: "Nov", revenue: 58000000, orders: 640 },
    { month: "Dec", revenue: 65000000, orders: 720 },
  ],
  top_categories: [
    { category: "Bridal Wear", revenue: 15000000 },
    { category: "Festive Wear", revenue: 10000000 },
    { category: "Contemporary", revenue: 7000000 },
  ],
});

// ---------------------------------------------------------------------------
// /api/customers
// ---------------------------------------------------------------------------

export const MOCK_CUSTOMERS_DATA = {
  metrics: {
    total_customers: 31100,
    active_customers: 24800,
    new_customers_monthly: 1840,
    avg_frequency: 2.4,
  },
  segments: [
    { name: "VIP Patrons", value: 2800, color: "#BC3D19" },
    { name: "Regular Shoppers", value: 8600, color: "#EC7C5D" },
    { name: "Occasion Buyers", value: 12400, color: "#D7BA54" },
    { name: "First-Timers", value: 7300, color: "#388E3C" },
  ],
  retention: [
    { month: "Jan", monthNumber: 1, retention: 38.2 },
    { month: "Feb", monthNumber: 2, retention: 36.8 },
    { month: "Mar", monthNumber: 3, retention: 40.1 },
    { month: "Apr", monthNumber: 4, retention: 37.5 },
    { month: "May", monthNumber: 5, retention: 42.3 },
    { month: "Jun", monthNumber: 6, retention: 35.6 },
    { month: "Jul", monthNumber: 7, retention: 39.4 },
    { month: "Aug", monthNumber: 8, retention: 41.8 },
    { month: "Sep", monthNumber: 9, retention: 43.2 },
    { month: "Oct", monthNumber: 10, retention: 44.5 },
    { month: "Nov", monthNumber: 11, retention: 40.7 },
    { month: "Dec", monthNumber: 12, retention: 38.9 },
  ],
  clv_by_segment: [
    { segment: "VIP Patrons", value: 245000 },
    { segment: "Regular Shoppers", value: 82000 },
    { segment: "Occasion Buyers", value: 45000 },
    { segment: "First-Timers", value: 28000 },
  ],
  repeat_by_outlet: [
    { outlet: "Palladium Mumbai", repeat_pct: 42.7, first_timer_pct: 57.3 },
    { outlet: "DLF Emporio Delhi", repeat_pct: 43.9, first_timer_pct: 56.1 },
    { outlet: "UB City Bangalore", repeat_pct: 44.3, first_timer_pct: 55.7 },
    { outlet: "Bandra Boutique", repeat_pct: 44.6, first_timer_pct: 55.4 },
    { outlet: "Kala Ghoda", repeat_pct: 45.7, first_timer_pct: 54.3 },
    { outlet: "Khan Market Delhi", repeat_pct: 44.3, first_timer_pct: 55.7 },
    { outlet: "Ambience Gurgaon", repeat_pct: 42.4, first_timer_pct: 57.6 },
    { outlet: "Hyderabad Banjara Hills", repeat_pct: 41.3, first_timer_pct: 58.7 },
    { outlet: "Phoenix Pune", repeat_pct: 43.3, first_timer_pct: 56.7 },
    { outlet: "Jio World Plaza", repeat_pct: 31.7, first_timer_pct: 68.3 },
  ],
  monthly_volume: [
    { month: "Jan", monthNumber: 1, first_timers: 1420, repeat_customers: 980, total: 2400 },
    { month: "Feb", monthNumber: 2, first_timers: 1580, repeat_customers: 1050, total: 2630 },
    { month: "Mar", monthNumber: 3, first_timers: 1650, repeat_customers: 1100, total: 2750 },
    { month: "Apr", monthNumber: 4, first_timers: 1380, repeat_customers: 920, total: 2300 },
    { month: "May", monthNumber: 5, first_timers: 1720, repeat_customers: 1080, total: 2800 },
    { month: "Jun", monthNumber: 6, first_timers: 1280, repeat_customers: 880, total: 2160 },
    { month: "Jul", monthNumber: 7, first_timers: 1350, repeat_customers: 950, total: 2300 },
    { month: "Aug", monthNumber: 8, first_timers: 1800, repeat_customers: 1120, total: 2920 },
    { month: "Sep", monthNumber: 9, first_timers: 1900, repeat_customers: 1150, total: 3050 },
    { month: "Oct", monthNumber: 10, first_timers: 1950, repeat_customers: 1200, total: 3150 },
    { month: "Nov", monthNumber: 11, first_timers: 1620, repeat_customers: 1080, total: 2700 },
    { month: "Dec", monthNumber: 12, first_timers: 1500, repeat_customers: 1000, total: 2500 },
  ],
  outlet_list: STORES.slice(0, 10),
  outlet_monthly: (() => {
    const rows: any[] = [];
    const outlets10 = STORES.slice(0, 10);
    // Fixed pseudo-random values per outlet/month
    const ftBase = [280, 310, 340, 260, 350, 220, 250, 380, 400, 380, 320, 300];
    const rrBase = [140, 160, 180, 130, 190, 110, 130, 200, 220, 210, 170, 150];
    outlets10.forEach((outlet, oi) => {
      MONTHS.forEach((m, mi) => {
        const ft = ftBase[mi] + oi * 12;
        const rr = rrBase[mi] + oi * 8;
        const total = ft + rr;
        rows.push({
          outlet,
          month: mi + 1,
          monthName: m,
          first_timer: ft,
          repeat_regular: rr,
          total,
          repeat_pct: Number(((rr / total) * 100).toFixed(1)),
        });
      });
    });
    return rows;
  })(),
  insights: [
    "VIP Patrons (9% of base) drive 38% of revenue \u2014 prioritize personalized styling services",
    "Bandra Boutique has highest repeat rate at 44.6% \u2014 study their clienteling approach",
    "First-timer conversion to repeat is strongest in bridal category (62%)",
  ],
  analysis_period: "Last 12 months",
  data_as_of: "2026-03-27T10:00:00Z",
};

// ---------------------------------------------------------------------------
// /api/platforms
// ---------------------------------------------------------------------------

export const MOCK_PLATFORMS_DATA = {
  market_share: [
    { name: "In-Store", value: 59.2, color: "#BC3D19" },
    { name: "Website", value: 23.4, color: "#EC7C5D" },
    { name: "App", value: 17.4, color: "#D7BA54" },
  ],
  profitability: [
    { Platform: "In-Store", Revenue: 284.5, Commission: 0, Delivery_Cost: 0, Packaging_Cost: 2.1, Food_Cost: 0, Net_Profit: 198.2, Profit_Margin: 69.7 },
    { Platform: "Website", Revenue: 112.5, Commission: 4.5, Delivery_Cost: 8.2, Packaging_Cost: 3.4, Food_Cost: 0, Net_Profit: 62.8, Profit_Margin: 55.8 },
    { Platform: "App", Revenue: 83.7, Commission: 2.1, Delivery_Cost: 5.6, Packaging_Cost: 2.8, Food_Cost: 0, Net_Profit: 48.4, Profit_Margin: 57.8 },
  ],
  revenue_comparison: [
    { platform: "In-Store", revenue: 284.5 },
    { platform: "Website", revenue: 112.5 },
    { platform: "App", revenue: 83.7 },
  ],
  order_metrics: {
    total_orders: 48200,
    avg_order_value: 99730,
    by_channel: { in_store: 21200, website: 15200, app: 11800 },
    DineIn: { total_orders: 21200, period_label: "FY 2025-26" },
    Swiggy: { total_orders: 15200, avg_aov: 98500, cities: 8 },
    Zomato: { total_orders: 11800, avg_aov: 95200, cities: 6 },
  },
  commission_savings: "Saved \u20B96.6L in commissions vs marketplace model",
};

// ---------------------------------------------------------------------------
// /api/operational
// ---------------------------------------------------------------------------

export const MOCK_OPERATIONAL_DATA = {
  period: { year: 2025, month: 0 },
  kitchen_efficiency: {
    prep_time_analysis: { avg_prep_time: 18.4, peak_hour_delay: 2.1 },
    efficiency_metrics: { items_per_hour: 145, kitchen_utilization: 78.5, order_accuracy: 96.2, table_turnover_rate: 3.8 },
  },
  table_utilization: [
    { Outlet: "Palladium Mumbai", Table_Count: 32, Utilization: 85.4, Revenue_Per_Hour: 28000, Turn_Around_Time: 45.2 },
    { Outlet: "DLF Emporio Delhi", Table_Count: 28, Utilization: 82.1, Revenue_Per_Hour: 25000, Turn_Around_Time: 48.6 },
    { Outlet: "Jio World Plaza", Table_Count: 35, Utilization: 78.8, Revenue_Per_Hour: 22000, Turn_Around_Time: 52.4 },
    { Outlet: "Online Store", Table_Count: 0, Utilization: 0, Revenue_Per_Hour: 0, Turn_Around_Time: 0 },
    { Outlet: "UB City Bangalore", Table_Count: 24, Utilization: 75.2, Revenue_Per_Hour: 20000, Turn_Around_Time: 55.8 },
    { Outlet: "Bandra Boutique", Table_Count: 18, Utilization: 88.6, Revenue_Per_Hour: 30000, Turn_Around_Time: 42.1 },
    { Outlet: "Khan Market Delhi", Table_Count: 22, Utilization: 72.4, Revenue_Per_Hour: 18000, Turn_Around_Time: 58.2 },
    { Outlet: "Ambience Gurgaon", Table_Count: 30, Utilization: 68.5, Revenue_Per_Hour: 15000, Turn_Around_Time: 62.4 },
  ],
  service_quality: {
    table_service_cycle: { order_taking: 8.5 },
    peak_hour_impact: { customer_wait: true },
  },
  alerts: [
    {
      type: "efficiency",
      priority: "medium",
      message: "Fulfillment time increasing at Bandra Boutique",
      outlet: "Bandra Boutique",
      action_required: "Review staffing levels during peak hours",
      impact: "Potential 5% customer satisfaction drop",
    },
  ],
};

// ---------------------------------------------------------------------------
// /api/reputation
// ---------------------------------------------------------------------------

export const MOCK_REPUTATION_DATA = {
  overall_ratings: {
    average_rating: 4.5,
    total_reviews: 28400,
    rating_trend: 0.15,
    platform_breakdown: { zomato: 4.4, swiggy: 4.5, google: 4.6, tripadvisor: 4.3 },
    platform_reviews: { zomato: 8200, swiggy: 6800, google: 9400, tripadvisor: 4000 },
  },
  rating_distribution: [
    { rating: 5, count: 14200, percentage: 50.0 },
    { rating: 4, count: 8520, percentage: 30.0 },
    { rating: 3, count: 3408, percentage: 12.0 },
    { rating: 2, count: 1420, percentage: 5.0 },
    { rating: 1, count: 852, percentage: 3.0 },
  ],
  outlet_ratings: [
    { outlet: "Palladium Mumbai", average_rating: 4.7, total_reviews: 4200, platform_ratings: { zomato: 4.6, swiggy: 4.7, google: 4.8 }, status: "excellent" },
    { outlet: "DLF Emporio Delhi", average_rating: 4.6, total_reviews: 3800, platform_ratings: { zomato: 4.5, swiggy: 4.6, google: 4.7 }, status: "excellent" },
    { outlet: "Jio World Plaza", average_rating: 4.5, total_reviews: 3200, platform_ratings: { zomato: 4.4, swiggy: 4.5, google: 4.6 }, status: "good" },
    { outlet: "Online Store", average_rating: 4.4, total_reviews: 2800, platform_ratings: { zomato: 4.3, swiggy: 4.4, google: 4.5 }, status: "good" },
    { outlet: "UB City Bangalore", average_rating: 4.5, total_reviews: 2600, platform_ratings: { zomato: 4.4, swiggy: 4.5, google: 4.6 }, status: "good" },
    { outlet: "Bandra Boutique", average_rating: 4.6, total_reviews: 2200, platform_ratings: { zomato: 4.5, swiggy: 4.6, google: 4.7 }, status: "excellent" },
    { outlet: "Khan Market Delhi", average_rating: 4.3, total_reviews: 1800, platform_ratings: { zomato: 4.2, swiggy: 4.3, google: 4.4 }, status: "good" },
    { outlet: "Ambience Gurgaon", average_rating: 4.1, total_reviews: 1600, platform_ratings: { zomato: 4.0, swiggy: 4.1, google: 4.2 }, status: "needs_attention" },
  ],
  rating_trends: [
    { month: "Jan", zomato_rating: 4.3, swiggy_rating: 4.4, google_rating: 4.5, tripadvisor_rating: 4.2, review_volume: 2200 },
    { month: "Feb", zomato_rating: 4.2, swiggy_rating: 4.3, google_rating: 4.4, tripadvisor_rating: 4.1, review_volume: 2400 },
    { month: "Mar", zomato_rating: 4.4, swiggy_rating: 4.5, google_rating: 4.6, tripadvisor_rating: 4.3, review_volume: 2600 },
    { month: "Apr", zomato_rating: 4.3, swiggy_rating: 4.4, google_rating: 4.5, tripadvisor_rating: 4.2, review_volume: 2100 },
    { month: "May", zomato_rating: 4.4, swiggy_rating: 4.5, google_rating: 4.6, tripadvisor_rating: 4.3, review_volume: 2500 },
    { month: "Jun", zomato_rating: 4.2, swiggy_rating: 4.3, google_rating: 4.4, tripadvisor_rating: 4.1, review_volume: 2000 },
    { month: "Jul", zomato_rating: 4.3, swiggy_rating: 4.4, google_rating: 4.5, tripadvisor_rating: 4.2, review_volume: 2300 },
    { month: "Aug", zomato_rating: 4.4, swiggy_rating: 4.5, google_rating: 4.6, tripadvisor_rating: 4.3, review_volume: 2800 },
    { month: "Sep", zomato_rating: 4.5, swiggy_rating: 4.6, google_rating: 4.7, tripadvisor_rating: 4.4, review_volume: 2900 },
    { month: "Oct", zomato_rating: 4.4, swiggy_rating: 4.5, google_rating: 4.6, tripadvisor_rating: 4.3, review_volume: 3100 },
    { month: "Nov", zomato_rating: 4.3, swiggy_rating: 4.4, google_rating: 4.5, tripadvisor_rating: 4.2, review_volume: 2700 },
    { month: "Dec", zomato_rating: 4.4, swiggy_rating: 4.5, google_rating: 4.6, tripadvisor_rating: 4.3, review_volume: 2500 },
  ],
  alerts: [
    {
      type: "rating_drop",
      outlet: "Phoenix Pune",
      platform: "Google",
      message: "Rating dropped below 4.0 on Google Reviews",
      severity: "high",
      action_required: "Review recent negative feedback and respond within 24 hours",
    },
  ],
};

// ---------------------------------------------------------------------------
// /api/marketing
// ---------------------------------------------------------------------------

export const MOCK_MARKETING_DATA = {
  instagram_roi: {
    total_spend: 2400000,
    total_revenue: 8640000,
    roi_percentage: 260.0,
    campaigns: [
      { name: "Bridal Season", spend: 600000, revenue: 2400000, roi: 300.0, reach: 850000, engagement: 42000 },
      { name: "Festive Collection", spend: 450000, revenue: 1620000, roi: 260.0, reach: 620000, engagement: 35000 },
      { name: "Designer Spotlight", spend: 350000, revenue: 1190000, roi: 240.0, reach: 480000, engagement: 28000 },
      { name: "New Arrivals", spend: 300000, revenue: 990000, roi: 230.0, reach: 420000, engagement: 22000 },
      { name: "End of Season", spend: 400000, revenue: 1440000, roi: 260.0, reach: 550000, engagement: 31000 },
      { name: "Celebrity Collab", spend: 300000, revenue: 1000000, roi: 233.3, reach: 380000, engagement: 19000 },
    ],
  },
  platform_budgets: {
    zomato: { budget_2024: 3600000, spent_2024: 3200000, budget_2025: 4200000, performance: 18.5 },
    swiggy: { budget_per_outlet_2024: 25000, budget_per_outlet_2025: 30000, total_outlets: 14, click_performance: 22.4 },
  },
  competitor_keywords: {
    total_budget: 1800000,
    locations: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune"],
    performance: { clicks: 45200, conversions: 3800, cost_per_acquisition: 474 },
  },
  monthly_trends: [
    { month: "Jan", instagram_spend: 200000, instagram_revenue: 720000, zomato_spend: 280000, zomato_performance: 16.2, swiggy_spend: 320000, swiggy_performance: 19.4 },
    { month: "Feb", instagram_spend: 220000, instagram_revenue: 790000, zomato_spend: 300000, zomato_performance: 17.8, swiggy_spend: 340000, swiggy_performance: 20.6 },
    { month: "Mar", instagram_spend: 250000, instagram_revenue: 900000, zomato_spend: 320000, zomato_performance: 19.2, swiggy_spend: 360000, swiggy_performance: 22.1 },
    { month: "Apr", instagram_spend: 180000, instagram_revenue: 650000, zomato_spend: 260000, zomato_performance: 15.4, swiggy_spend: 300000, swiggy_performance: 18.2 },
    { month: "May", instagram_spend: 280000, instagram_revenue: 1010000, zomato_spend: 340000, zomato_performance: 20.5, swiggy_spend: 380000, swiggy_performance: 23.8 },
    { month: "Jun", instagram_spend: 160000, instagram_revenue: 580000, zomato_spend: 240000, zomato_performance: 14.1, swiggy_spend: 280000, swiggy_performance: 16.8 },
    { month: "Jul", instagram_spend: 190000, instagram_revenue: 680000, zomato_spend: 270000, zomato_performance: 15.8, swiggy_spend: 310000, swiggy_performance: 18.9 },
    { month: "Aug", instagram_spend: 300000, instagram_revenue: 1080000, zomato_spend: 350000, zomato_performance: 21.4, swiggy_spend: 400000, swiggy_performance: 24.5 },
    { month: "Sep", instagram_spend: 320000, instagram_revenue: 1150000, zomato_spend: 370000, zomato_performance: 22.8, swiggy_spend: 420000, swiggy_performance: 26.2 },
    { month: "Oct", instagram_spend: 340000, instagram_revenue: 1200000, zomato_spend: 380000, zomato_performance: 24.0, swiggy_spend: 440000, swiggy_performance: 27.5 },
    { month: "Nov", instagram_spend: 260000, instagram_revenue: 940000, zomato_spend: 310000, zomato_performance: 18.6, swiggy_spend: 350000, swiggy_performance: 21.4 },
    { month: "Dec", instagram_spend: 240000, instagram_revenue: 860000, zomato_spend: 290000, zomato_performance: 17.2, swiggy_spend: 330000, swiggy_performance: 20.1 },
  ],
  alerts: [
    {
      type: "low_roi",
      message: "Website ad spend ROI dropped below target this month",
      severity: "medium",
      recommendation: "Reallocate 15% of website budget to Instagram campaigns which show 260% ROI",
    },
  ],
};

// ---------------------------------------------------------------------------
// /api/menu
// ---------------------------------------------------------------------------

export const MOCK_MENU_DATA = {
  menu_performance: {
    total_items: 248,
    active_items: 186,
    avg_item_revenue: 425000,
    top_performers: [
      { item_name: "Sabyasachi Mukherjee Signature Collection", category: "Bridal Wear", orders: 340, revenue: 22000000, profit_margin: 45.2, rating: 4.8, platforms: { dine_in: 160, swiggy: 100, zomato: 80 } },
      { item_name: "Manish Malhotra Signature Collection", category: "Festive Wear", orders: 280, revenue: 18500000, profit_margin: 42.8, rating: 4.7, platforms: { dine_in: 140, swiggy: 80, zomato: 60 } },
      { item_name: "Anamika Khanna Signature Collection", category: "Contemporary", orders: 250, revenue: 16000000, profit_margin: 40.5, rating: 4.6, platforms: { dine_in: 120, swiggy: 75, zomato: 55 } },
      { item_name: "Tarun Tahiliani Signature Collection", category: "Bridal Wear", orders: 220, revenue: 14500000, profit_margin: 43.1, rating: 4.7, platforms: { dine_in: 110, swiggy: 65, zomato: 45 } },
      { item_name: "Rahul Mishra Signature Collection", category: "Accessories", orders: 310, revenue: 12000000, profit_margin: 38.6, rating: 4.5, platforms: { dine_in: 150, swiggy: 90, zomato: 70 } },
      { item_name: "Abu Jani Sandeep Khosla Signature Collection", category: "Festive Wear", orders: 190, revenue: 15000000, profit_margin: 47.2, rating: 4.8, platforms: { dine_in: 95, swiggy: 55, zomato: 40 } },
      { item_name: "Anita Dongre Signature Collection", category: "Contemporary", orders: 420, revenue: 10000000, profit_margin: 36.4, rating: 4.4, platforms: { dine_in: 200, swiggy: 130, zomato: 90 } },
      { item_name: "Ritu Kumar Signature Collection", category: "Bridal Wear", orders: 380, revenue: 9000000, profit_margin: 34.8, rating: 4.3, platforms: { dine_in: 180, swiggy: 120, zomato: 80 } },
    ],
    underperformers: [
      { item_name: "Gaurav Gupta Limited Edition", category: "Contemporary", orders: 18, revenue: 600000, days_since_last_order: 28, recommendation: "Consider seasonal promotion or bundle offer" },
      { item_name: "Masaba Gupta Limited Edition", category: "Accessories", orders: 12, revenue: 420000, days_since_last_order: 35, recommendation: "Consider seasonal promotion or bundle offer" },
      { item_name: "Rohit Bal Limited Edition", category: "Contemporary", orders: 8, revenue: 350000, days_since_last_order: 42, recommendation: "Consider seasonal promotion or bundle offer" },
      { item_name: "JJ Valaya Limited Edition", category: "Accessories", orders: 15, revenue: 520000, days_since_last_order: 22, recommendation: "Consider seasonal promotion or bundle offer" },
    ],
  },
  category_analysis: {
    categories: [
      { name: "Bridal Wear", items_count: 45, total_revenue: 148200000, avg_margin: 42.5, popularity_score: 92.0, seasonal_trend: 24.3 },
      { name: "Festive & Occasion", items_count: 52, total_revenue: 96400000, avg_margin: 38.2, popularity_score: 88.0, seasonal_trend: 18.7 },
      { name: "Contemporary & Fusion", items_count: 68, total_revenue: 78600000, avg_margin: 35.8, popularity_score: 82.0, seasonal_trend: 31.5 },
      { name: "Luxury Accessories", items_count: 42, total_revenue: 62300000, avg_margin: 44.6, popularity_score: 75.0, seasonal_trend: 22.1 },
      { name: "Men's Designer", items_count: 38, total_revenue: 45800000, avg_margin: 36.4, popularity_score: 70.0, seasonal_trend: 35.8 },
      { name: "Jewellery", items_count: 30, total_revenue: 49400000, avg_margin: 28.3, popularity_score: 78.0, seasonal_trend: 15.2 },
    ],
  },
  profitability_analysis: {
    high_margin_items: [
      { item: "Sabyasachi Bridal Lehenga", margin: 52.0, revenue: 24000000, volume: 180 },
      { item: "Manish Malhotra Couture", margin: 48.5, revenue: 18000000, volume: 120 },
      { item: "Designer Jewelry Set", margin: 55.0, revenue: 12000000, volume: 250 },
      { item: "Anamika Khanna Drapes", margin: 46.0, revenue: 15000000, volume: 95 },
    ],
    cost_analysis: {
      food_cost_percentage: 32.0,
      labor_intensive_items: ["Custom Embroidery Pieces", "Handcrafted Jewelry", "Bespoke Tailoring"],
      supplier_cost_trends: [
        { ingredient: "Silk Fabric", cost_change: 8.5, impact_on_items: ["Bridal Collection", "Festive Sarees"] },
        { ingredient: "Zari Work", cost_change: 12.0, impact_on_items: ["Lehengas", "Sherwanis"] },
        { ingredient: "Semi-precious Stones", cost_change: -3.0, impact_on_items: ["Jewelry", "Accessories"] },
      ],
    },
  },
  platform_performance: {
    platform_bestsellers: {
      swiggy: [
        { item: "Contemporary Kurta Set", orders: 420, rating: 4.6 },
        { item: "Designer Dupatta", orders: 380, rating: 4.5 },
      ],
      zomato: [
        { item: "Festive Saree", orders: 350, rating: 4.7 },
        { item: "Indo-Western Gown", orders: 310, rating: 4.4 },
      ],
      dine_in: [
        { item: "Bridal Lehenga", orders: 280, rating: 4.8 },
        { item: "Couture Sherwani", orders: 220, rating: 4.7 },
      ],
    },
    platform_margins: {
      swiggy: { revenue: 112500000, commission: 4.5, net_margin: 55.8 },
      zomato: { revenue: 83700000, commission: 2.1, net_margin: 57.8 },
      dine_in: { revenue: 284500000, commission: 0, net_margin: 69.7 },
    },
  },
  customer_preferences: {
    dietary_preferences: [
      { type: "Bridal & Wedding", percentage: 35.0, growth_rate: 18.4, top_items: ["Lehenga", "Sherwani", "Saree"] },
      { type: "Festive & Occasion", percentage: 28.0, growth_rate: 24.2, top_items: ["Anarkali", "Kurta Set", "Gown"] },
      { type: "Contemporary & Casual", percentage: 22.0, growth_rate: 31.5, top_items: ["Indo-Western", "Fusion Wear", "Separates"] },
      { type: "Accessories & Jewelry", percentage: 15.0, growth_rate: 15.8, top_items: ["Statement Necklace", "Earrings", "Clutch"] },
    ],
    price_sensitivity: { budget_conscious: 15.0, mid_range: 45.0, premium: 40.0 },
    seasonal_favorites: [
      { season: "Wedding Season (Oct-Feb)", items: [{ name: "Bridal Lehenga", boost: 85 }, { name: "Sherwani", boost: 62 }] },
      { season: "Festive (Aug-Nov)", items: [{ name: "Festive Saree", boost: 72 }, { name: "Kurta Set", boost: 58 }] },
    ],
  },
  optimization_opportunities: {
    menu_engineering: [
      { item: "Sabyasachi Bridal Lehenga", current_position: "star", recommendation: "Maintain premium placement and increase visibility", potential_impact: "+\u20B92.4Cr revenue" },
      { item: "Contemporary Kurta Set", current_position: "plow_horse", recommendation: "Increase price by 8% \u2014 high demand absorbs premium", potential_impact: "+\u20B945L margin" },
      { item: "Designer Clutch Set", current_position: "puzzle", recommendation: "Bundle with bridal sets for cross-sell", potential_impact: "+\u20B918L revenue" },
      { item: "Basic Cotton Stole", current_position: "dog", recommendation: "Discontinue and replace with trending scarves", potential_impact: "Save \u20B95L inventory cost" },
    ],
    pricing_optimization: [
      { item: "Festive Kurta Set", current_price: 12500, optimal_price: 13800, revenue_impact: 1800000 },
      { item: "Designer Dupatta", current_price: 8500, optimal_price: 9200, revenue_impact: 950000 },
    ],
  },
  trends_insights: {
    emerging_trends: [
      { trend: "Sustainable Fashion", adoption_rate: 28.5, potential_items: ["Organic Silk Sarees", "Recycled Fabric Kurtas"] },
      { trend: "Gender-Fluid Designs", adoption_rate: 15.2, potential_items: ["Unisex Jackets", "Fluid Silhouettes"] },
    ],
    declining_items: [
      { item: "Heavy Embellished Gowns", decline_rate: -18.5, reason: "Shift to minimalist aesthetics", action: "Reduce inventory by 30%" },
      { item: "Traditional Churidar Sets", decline_rate: -12.0, reason: "Preference for contemporary silhouettes", action: "Replace with palazzo sets" },
    ],
  },
};

// ---------------------------------------------------------------------------
// /api/customer-journey
// ---------------------------------------------------------------------------

export const MOCK_CUSTOMER_JOURNEY_DATA = {
  acquisition_metrics: {
    new_customers_this_month: 1840,
    acquisition_rate: 5.9,
    acquisition_cost: 2800,
    channels: [
      { channel: "Instagram Ads", customers: 620, cost_per_acquisition: 1800, retention_rate: 42.0 },
      { channel: "Google Search", customers: 480, cost_per_acquisition: 2200, retention_rate: 38.5 },
      { channel: "Referral", customers: 340, cost_per_acquisition: 800, retention_rate: 55.0 },
      { channel: "Walk-in", customers: 280, cost_per_acquisition: 0, retention_rate: 48.0 },
      { channel: "Email Campaigns", customers: 120, cost_per_acquisition: 1500, retention_rate: 35.0 },
    ],
  },
  retention_analysis: {
    first_visit_to_second: 38.5,
    second_to_regular: 62.0,
    churn_rate: 18.4,
    average_lifetime: 285,
    cohort_data: [
      { month: "Oct 2025", new_customers: 1650, retained_30d: 825, retained_60d: 578, retained_90d: 446 },
      { month: "Nov 2025", new_customers: 1780, retained_30d: 890, retained_60d: 623, retained_90d: 480 },
      { month: "Dec 2025", new_customers: 2100, retained_30d: 1050, retained_60d: 735, retained_90d: 567 },
    ],
  },
  customer_segments: {
    champions: { count: 2800, percentage: 9.0, avg_spend: 245000 },
    loyal_customers: { count: 5400, percentage: 17.4, avg_spend: 125000 },
    potential_loyalists: { count: 6200, percentage: 19.9, avg_spend: 82000 },
    new_customers: { count: 7300, percentage: 23.5, avg_spend: 45000 },
    at_risk: { count: 5800, percentage: 18.6, avg_spend: 68000 },
    lost: { count: 3600, percentage: 11.6, avg_spend: 32000 },
  },
  behavioral_insights: {
    avg_order_frequency: 2.4,
    seasonal_patterns: [
      { month: "Jan", orders: 3600, new_customers: 1420, retention_rate: 38.2 },
      { month: "Feb", orders: 3750, new_customers: 1580, retention_rate: 36.8 },
      { month: "Mar", orders: 3900, new_customers: 1650, retention_rate: 40.1 },
      { month: "Apr", orders: 3500, new_customers: 1380, retention_rate: 37.5 },
      { month: "May", orders: 4100, new_customers: 1720, retention_rate: 42.3 },
      { month: "Jun", orders: 3200, new_customers: 1280, retention_rate: 35.6 },
      { month: "Jul", orders: 3400, new_customers: 1350, retention_rate: 39.4 },
      { month: "Aug", orders: 4300, new_customers: 1800, retention_rate: 41.8 },
      { month: "Sep", orders: 4500, new_customers: 1900, retention_rate: 43.2 },
      { month: "Oct", orders: 4700, new_customers: 1950, retention_rate: 44.5 },
      { month: "Nov", orders: 4200, new_customers: 1620, retention_rate: 40.7 },
      { month: "Dec", orders: 3800, new_customers: 1500, retention_rate: 38.9 },
    ],
    platform_preference: [
      { segment: "Champions", dine_in: 45, swiggy: 25, zomato: 18, direct_delivery: 12 },
      { segment: "Loyal", dine_in: 38, swiggy: 28, zomato: 22, direct_delivery: 12 },
      { segment: "New", dine_in: 22, swiggy: 35, zomato: 30, direct_delivery: 13 },
      { segment: "At Risk", dine_in: 30, swiggy: 32, zomato: 25, direct_delivery: 13 },
    ],
  },
  journey_funnel: {
    awareness: 485000,
    consideration: 142000,
    first_order: 38000,
    repeat_order: 22000,
    loyal_customer: 8200,
    champion: 2800,
  },
  geographic_insights: {
    top_locations: [
      { area: "South Mumbai", customers: 4800, avg_order_value: 128000, retention_rate: 48.0, growth_rate: 22.0 },
      { area: "South Delhi", customers: 3600, avg_order_value: 115000, retention_rate: 42.0, growth_rate: 18.5 },
      { area: "Indiranagar Bangalore", customers: 2800, avg_order_value: 98000, retention_rate: 40.0, growth_rate: 28.0 },
      { area: "Banjara Hills", customers: 2200, avg_order_value: 92000, retention_rate: 38.0, growth_rate: 15.0 },
      { area: "Koregaon Park Pune", customers: 1800, avg_order_value: 85000, retention_rate: 35.0, growth_rate: 32.0 },
    ],
  },
  engagement_metrics: {
    social_media_followers: 485000,
    email_open_rate: 24.8,
    app_active_users: 18500,
    loyalty_program_members: 12400,
    nps_score: 72,
  },
};

// ---------------------------------------------------------------------------
// /api/predictive
// ---------------------------------------------------------------------------

export const MOCK_PREDICTIVE_DATA = {
  forecast: [
    { date: "2026-04-01", forecast: 1350000, lower: 1150000, upper: 1580000 },
    { date: "2026-04-02", forecast: 1420000, lower: 1200000, upper: 1620000 },
    { date: "2026-04-03", forecast: 1280000, lower: 1100000, upper: 1540000 },
    { date: "2026-04-04", forecast: 1460000, lower: 1250000, upper: 1650000 },
    { date: "2026-04-05", forecast: 1380000, lower: 1180000, upper: 1600000 },
    { date: "2026-04-06", forecast: 1520000, lower: 1300000, upper: 1720000 },
    { date: "2026-04-07", forecast: 1440000, lower: 1220000, upper: 1640000 },
    { date: "2026-04-08", forecast: 1360000, lower: 1160000, upper: 1560000 },
    { date: "2026-04-09", forecast: 1490000, lower: 1270000, upper: 1690000 },
    { date: "2026-04-10", forecast: 1310000, lower: 1120000, upper: 1510000 },
    { date: "2026-04-11", forecast: 1450000, lower: 1240000, upper: 1660000 },
    { date: "2026-04-12", forecast: 1400000, lower: 1190000, upper: 1610000 },
    { date: "2026-04-13", forecast: 1530000, lower: 1310000, upper: 1740000 },
    { date: "2026-04-14", forecast: 1470000, lower: 1260000, upper: 1680000 },
    { date: "2026-04-15", forecast: 1340000, lower: 1140000, upper: 1550000 },
    { date: "2026-04-16", forecast: 1500000, lower: 1280000, upper: 1700000 },
    { date: "2026-04-17", forecast: 1260000, lower: 1080000, upper: 1460000 },
    { date: "2026-04-18", forecast: 1410000, lower: 1200000, upper: 1630000 },
    { date: "2026-04-19", forecast: 1480000, lower: 1260000, upper: 1700000 },
    { date: "2026-04-20", forecast: 1550000, lower: 1330000, upper: 1760000 },
    { date: "2026-04-21", forecast: 1370000, lower: 1170000, upper: 1590000 },
    { date: "2026-04-22", forecast: 1430000, lower: 1220000, upper: 1650000 },
    { date: "2026-04-23", forecast: 1320000, lower: 1130000, upper: 1530000 },
    { date: "2026-04-24", forecast: 1460000, lower: 1250000, upper: 1670000 },
    { date: "2026-04-25", forecast: 1510000, lower: 1290000, upper: 1720000 },
    { date: "2026-04-26", forecast: 1390000, lower: 1180000, upper: 1600000 },
    { date: "2026-04-27", forecast: 1440000, lower: 1230000, upper: 1660000 },
    { date: "2026-04-28", forecast: 1350000, lower: 1150000, upper: 1580000 },
    { date: "2026-04-29", forecast: 1480000, lower: 1260000, upper: 1700000 },
    { date: "2026-04-30", forecast: 1420000, lower: 1210000, upper: 1640000 },
  ],
  model_accuracy: 87.5,
  inventory_metrics: {
    daily_requirement: 1400000,
    safety_stock: 4200000,
    optimization_potential: 18.5,
  },
  pricing_strategy: {
    revenue_increase: 12.8,
    recommended_adjustments: [
      { time: "Wedding Season (Oct-Feb)", adjustment: "+15% on bridal collections" },
      { time: "Festive Period (Aug-Nov)", adjustment: "+10% on festive wear" },
      { time: "Off-Season (Mar-Jul)", adjustment: "-8% promotional pricing" },
      { time: "Weekend Events", adjustment: "+5% during trunk shows" },
    ],
  },
};

// ---------------------------------------------------------------------------
// /api/revenue-cost-analysis
// ---------------------------------------------------------------------------

export const MOCK_REVENUE_COST_DATA = {
  total_revenue: 4807000000,
  total_cost: 2884200000,
  gross_margin: 40.0,
  by_category: CATEGORIES.map((c) => ({
    category: c.category,
    revenue: c.revenue,
    margin: c.margin,
  })),
};

// ---------------------------------------------------------------------------
// /api/data-sources
// ---------------------------------------------------------------------------

export const MOCK_DATA_SOURCES = {
  sources: [
    { name: "POS System", type: "database", status: "connected", last_sync: "2026-03-27T10:00:00", records: 48200 },
    { name: "Website Analytics", type: "api", status: "connected", last_sync: "2026-03-27T09:45:00", records: 485000 },
    { name: "App Analytics", type: "api", status: "connected", last_sync: "2026-03-27T09:30:00", records: 312000 },
    { name: "CRM Database", type: "database", status: "connected", last_sync: "2026-03-27T08:00:00", records: 31100 },
    { name: "Marketing Platforms", type: "api", status: "connected", last_sync: "2026-03-27T07:00:00", records: 24600 },
    { name: "Google Reviews", type: "api", status: "connected", last_sync: "2026-03-27T06:00:00", records: 12800 },
  ],
};

// ---------------------------------------------------------------------------
// /api/data-lineage/{metric}
// ---------------------------------------------------------------------------

export const MOCK_DATA_LINEAGE = (metric: string) => ({
  metric,
  display_name: metric.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  source: "POS + CRM",
  source_files: [
    {
      filename: "sales_data.xlsx",
      sheet: "Monthly Summary",
      columns: ["Revenue", "Orders", "AOV"],
      calculation: "SUM / COUNT aggregation by period",
      filters: "FY 2025-26",
      date_range: "Jan 2025 - Dec 2025",
      update_frequency: "Daily",
    },
  ],
  transformations: ["aggregation", "normalization"],
  confidence: 0.95,
  confidence_level: "High",
  notes: "Data sourced from POS system and CRM database with daily reconciliation.",
  last_updated: "2026-03-27T10:30:00Z",
  data_quality_indicators: {
    high: { description: "Directly from verified source systems", color: "#22c55e" },
    medium: { description: "Calculated from multiple sources", color: "#eab308" },
    low: { description: "Estimated or modeled values", color: "#ef4444" },
  },
});

// ---------------------------------------------------------------------------
// /api/warnings/counts
// ---------------------------------------------------------------------------

export const MOCK_WARNING_COUNTS = {
  success: true,
  counts: {
    executive: 0,
    sales: 1,
    customers: 0,
    platforms: 0,
    operations: 2,
    reputation: 0,
    marketing: 0,
  },
};

// ---------------------------------------------------------------------------
// /api/forecast/{forecast_type}
// ---------------------------------------------------------------------------

export const MOCK_FORECAST = (forecastType: string, monthsAhead: number = 6) => ({
  type: forecastType,
  months_ahead: monthsAhead,
  predictions: Array.from({ length: monthsAhead }, (_, i) => ({
    month: MONTHS[i % 12],
    value: 420000000 + i * 15000000,
    lower: 320000000 + i * 10000000,
    upper: 540000000 + i * 12000000,
  })),
});

// ---------------------------------------------------------------------------
// /api/restaverse/hourly
// ---------------------------------------------------------------------------

export const MOCK_RESTAVERSE_HOURLY = {
  hours: [
    { hour: "9:00 - 10:00", orders: 120, revenue: 360000 },
    { hour: "10:00 - 11:00", orders: 180, revenue: 630000 },
    { hour: "11:00 - 12:00", orders: 650, revenue: 2275000 },
    { hour: "12:00 - 13:00", orders: 1200, revenue: 4800000 },
    { hour: "13:00 - 14:00", orders: 1450, revenue: 5800000 },
    { hour: "14:00 - 15:00", orders: 980, revenue: 3430000 },
    { hour: "15:00 - 16:00", orders: 720, revenue: 2520000 },
    { hour: "16:00 - 17:00", orders: 850, revenue: 2975000 },
    { hour: "17:00 - 18:00", orders: 1100, revenue: 4400000 },
    { hour: "18:00 - 19:00", orders: 1600, revenue: 6400000 },
    { hour: "19:00 - 20:00", orders: 1750, revenue: 7000000 },
    { hour: "20:00 - 21:00", orders: 1400, revenue: 5600000 },
    { hour: "21:00 - 22:00", orders: 150, revenue: 450000 },
  ],
  peak_hour: "19:00 - 20:00",
  peak_orders: 1750,
  total_orders: 12150,
};

// ---------------------------------------------------------------------------
// /api/restaverse/kpt-distribution
// ---------------------------------------------------------------------------

export const MOCK_RESTAVERSE_KPT = {
  buckets: [
    { range: "0-10 min", count: 4200, percentage: 28.0 },
    { range: "10-20 min", count: 5800, percentage: 38.7 },
    { range: "20-30 min", count: 3100, percentage: 20.7 },
    { range: "30-45 min", count: 1400, percentage: 9.3 },
    { range: "45+ min", count: 500, percentage: 3.3 },
  ],
  avg_kpt: 18.4,
  median_kpt: 15.2,
  total_orders: 15000,
  within_target: 86.7,
};

// ---------------------------------------------------------------------------
// /api/restaverse/day-patterns
// ---------------------------------------------------------------------------

export const MOCK_RESTAVERSE_DAY_PATTERNS = {
  days: [
    { day: "Monday", orders: 2200, revenue: 6600000, avg_order_value: 2400 },
    { day: "Tuesday", orders: 1800, revenue: 5040000, avg_order_value: 2200 },
    { day: "Wednesday", orders: 2400, revenue: 7200000, avg_order_value: 2500 },
    { day: "Thursday", orders: 2600, revenue: 8060000, avg_order_value: 2600 },
    { day: "Friday", orders: 3200, revenue: 10240000, avg_order_value: 2800 },
    { day: "Saturday", orders: 4200, revenue: 11340000, avg_order_value: 3100 },
    { day: "Sunday", orders: 3800, revenue: 9880000, avg_order_value: 2900 },
  ],
  busiest_day: "Saturday",
  busiest_orders: 4200,
};

// ---------------------------------------------------------------------------
// /api/restaverse/daily-aggregates
// ---------------------------------------------------------------------------

export const MOCK_RESTAVERSE_DAILY_AGGREGATES = {
  "Total Orders": { total: 148000, avg: 4933, count: 30 },
  "Delivered Orders": { total: 142000, avg: 4733, count: 30 },
  "Item Count": { total: 385000, avg: 12833, count: 30 },
  "Discount Per Order": { avg: 45.2, total: 6689600, count: 30 },
  "Average ADT (min)": { avg: 32.4, count: 30 },
  "MFR Compliance (%)": { avg: 94.2, count: 30 },
};

// ---------------------------------------------------------------------------
// /api/restaverse/complaints
// ---------------------------------------------------------------------------

export const MOCK_RESTAVERSE_COMPLAINTS = {
  total_complaints: 284,
  by_status: [
    { status: "RESOLVED", count: 198 },
    { status: "DISMISSED", count: 52 },
    { status: "OPEN", count: 24 },
    { status: "EXPIRED", count: 10 },
  ],
  by_reason: [
    { reason: "Delivery Delays", count: 82, percentage: 28.9 },
    { reason: "Sizing Issues", count: 68, percentage: 23.9 },
    { reason: "Product Quality", count: 54, percentage: 19.0 },
    { reason: "Wrong Item Sent", count: 42, percentage: 14.8 },
    { reason: "Packaging Damage", count: 38, percentage: 13.4 },
  ],
  top_reason: "Delivery Delays",
};

// ---------------------------------------------------------------------------
// /api/restaverse/* catch-all
// ---------------------------------------------------------------------------

export const MOCK_RESTAVERSE_CATCHALL = (endpoint: string) => ({
  data: [] as any[],
  message: `Mock data for ${endpoint}`,
});

// ---------------------------------------------------------------------------
// /api/refresh
// ---------------------------------------------------------------------------

export const MOCK_REFRESH = { status: "ok", message: "Data refreshed" };
