// Aza Fashions Luxury Color Palette for Analytics Dashboard
export const AZA_COLORS = {
  // Primary Brand Colors - Luxury & Editorial
  primary: '#BC3D19',      // Burnt Terracotta
  secondary: '#EC7C5D',    // Warm Coral/Salmon
  success: '#388E3C',      // Green
  warning: '#D7BA54',      // Luxury Gold
  danger: '#DC2626',       // Red
  info: '#2563EB',         // Blue
  neutral: '#737373',      // Text Light

  // Luxury-specific colors
  gold: '#D7BA54',         // Luxury Gold
  blush: '#FFF3F0',        // Warm Tint BG
  champagne: '#F9F0E4',    // Champagne

  // Legacy names mapped to new Aza palette
  fortuneRed: '#BC3D19',      // Terracotta
  sunsetMandarin: '#EC7C5D',  // Coral
  sakuraPink: '#FFF3F0',      // Blush
  bambooGreen: '#388E3C',     // Sage Green
  mistBlue: '#1A1A2E',        // Navy
  goldenSesame: '#D7BA54',    // Gold

  // Chart Color Palette (ordered for best visual appeal)
  chartColors: [
    '#BC3D19', // Terracotta
    '#388E3C', // Sage Green
    '#D7BA54', // Gold
    '#1A1A2E', // Navy
    '#EC7C5D', // Coral
    '#DC2626', // Red
    '#2563EB', // Blue
    '#737373', // Neutral
  ],

  // Platform Specific Colors (Fashion channels)
  platforms: {
    website: '#BC3D19',    // Terracotta (Website/online)
    app: '#EC7C5D',        // Coral (App/mobile)
    inStore: '#388E3C',    // Sage (In-Store/physical retail)
    google: '#4285F4',     // Google Blue
    tripadvisor: '#00AF87',  // Tripadvisor Green
    // Legacy aliases
    swiggy: '#BC3D19',
    zomato: '#EC7C5D',
    dineIn: '#388E3C',
  },

  // Gray Scale
  gray: {
    light: '#E5E7EB',   // Light gray for borders, backgrounds
    medium: '#D1D5DB',  // Medium gray for subtle elements
    dark: '#737373',    // Dark gray for secondary text
  },

  // Gradients for Charts - Terracotta to Coral
  gradients: {
    primary: ['#BC3D19', '#EC7C5D'],    // Terracotta to Coral
    revenue: ['#BC3D19', '#D4654A'],    // Terracotta gradient
    positive: ['#388E3C', '#4CAF50'],   // Sage to Green
    negative: ['#DC2626', '#EF4444'],   // Red gradient
    neutral: ['#737373', '#9CA3AF'],    // Neutral gradient
    info: ['#2563EB', '#3B82F6'],       // Blue gradient
    warning: ['#D7BA54', '#E5CC72'],    // Gold gradient
  },

  // Background and Surface Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#FFFBFA',
    dark: '#1A1A2E',
    card: '#FFFFFF',
    hover: '#FFF3F0',
  },

  // Text Colors
  text: {
    primary: '#333333',
    secondary: '#737373',
    muted: '#9CA3AF',
    inverse: '#FFFFFF',
  },

  // Border Colors
  border: {
    light: '#E5E7EB',
    default: '#D1D5DB',
    dark: '#737373',
  }
};

// Keep backward compatibility
export const FOO_COLORS = AZA_COLORS;

// Customer Segment Colors - Using Aza palette
export const CUSTOMER_SEGMENT_COLORS = {
  Champions: '#388E3C',          // Sage Green
  'Loyal Customers': '#BC3D19',  // Terracotta
  'Potential Loyalists': '#2563EB', // Blue
  'New Customers': '#EC7C5D',    // Coral
  'At Risk': '#D7BA54',          // Gold
  'Cant Lose Them': '#DC2626',   // Red
  Others: '#9CA3AF',              // Light Gray
};

// Peak Hours Colors - Using Aza palette
export const PEAK_HOURS_COLORS = {
  lunch: '#D7BA54',   // Gold
  dinner: '#BC3D19',  // Terracotta
  others: '#2563EB',  // Blue
};

// Status Colors for various states
export const STATUS_COLORS = {
  excellent: '#388E3C',  // Sage Green
  good: '#2563EB',       // Blue
  warning: '#D7BA54',    // Gold
  critical: '#DC2626',   // Red
  neutral: '#737373',    // Neutral
};
