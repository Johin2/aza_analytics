export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '₹0';
  }
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(2)}K`;
  }
  return `₹${value.toFixed(0)}`;
};

export const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return new Intl.NumberFormat('en-IN').format(value);
};

export const formatPercentage = (value: number | undefined | null, decimals: number = 1): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0%';
  }
  return `${value.toFixed(decimals)}%`;
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const formatShortDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short'
  });
};