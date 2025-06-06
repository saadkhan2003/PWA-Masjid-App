// Currency formatting utility for Pakistani Rupees
export const formatCurrency = (amount: number): string => {
  return `Rs ${amount.toLocaleString('en-PK')}`;
};

// Parse currency string to number
export const parseCurrency = (currencyString: string): number => {
  const cleanString = currencyString.replace(/[^0-9.-]+/g, '');
  return parseFloat(cleanString) || 0;
};

// Format number with locale
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-PK');
};

// Validate currency amount
export const validateAmount = (amount: string | number): boolean => {
  const num = typeof amount === 'string' ? parseCurrency(amount) : amount;
  return !isNaN(num) && num >= 0 && num <= 999999.99;
};

// Round to nearest rupee (no decimal places for Pakistani Rupees)
export const roundCurrency = (amount: number): number => {
  return Math.round(amount);
};

// Format Pakistani Rupees (simpler version)
export const formatPKR = (amount: number): string => {
  return `Rs ${Math.round(amount)}`;
};
