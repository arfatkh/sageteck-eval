/**
 * Format a number as currency
 * @param amount - The number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a large number with abbreviations (K, M, B)
 * @param value - The number to format
 * @returns Formatted number string
 */
export const formatLargeNumber = (value: number): string => {
  if (value >= 1e9) {
    return (value / 1e9).toFixed(1) + 'B';
  }
  if (value >= 1e6) {
    return (value / 1e6).toFixed(1) + 'M';
  }
  if (value >= 1e3) {
    return (value / 1e3).toFixed(1) + 'K';
  }
  return value.toString();
};

/**
 * Format a percentage
 * @param value - The number to format as percentage
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}; 