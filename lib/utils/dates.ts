import { format, parseISO, isValid, differenceInDays, startOfMonth, endOfMonth, isSameMonth, isSameYear } from 'date-fns';

// Format date for display
export const formatDate = (date: string | Date, formatString: string = 'MMM dd, yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, formatString) : 'Invalid Date';
  } catch (error) {
    return 'Invalid Date';
  }
};

// Format date for form inputs (YYYY-MM-DD)
export const formatDateForInput = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, 'yyyy-MM-dd') : '';
  } catch (error) {
    return '';
  }
};

// Get relative time description
export const getRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid Date';
    
    const daysDiff = differenceInDays(new Date(), dateObj);
    
    if (daysDiff === 0) return 'Today';
    if (daysDiff === 1) return 'Yesterday';
    if (daysDiff === -1) return 'Tomorrow';
    if (daysDiff > 0) return `${daysDiff} days ago`;
    if (daysDiff < 0) return `In ${Math.abs(daysDiff)} days`;
    
    return formatDate(dateObj);
  } catch (error) {
    return 'Invalid Date';
  }
};

// Check if date is overdue
export const isOverdue = (date: string | Date): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) && differenceInDays(new Date(), dateObj) > 0;
  } catch (error) {
    return false;
  }
};

// Get month name
export const getMonthName = (monthNumber: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1] || 'Invalid Month';
};

// Get month options for select
export const getMonthOptions = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: getMonthName(i + 1)
  }));
};

// Get year options for select
export const getYearOptions = (startYear?: number, endYear?: number) => {
  const currentYear = new Date().getFullYear();
  const start = startYear || currentYear - 5;
  const end = endYear || currentYear + 1;
  
  return Array.from({ length: end - start + 1 }, (_, i) => ({
    value: start + i,
    label: (start + i).toString()
  }));
};

// Check if payment is for current month
export const isCurrentMonth = (year: number, month: number): boolean => {
  const now = new Date();
  return isSameYear(now, new Date(year, 0)) && isSameMonth(now, new Date(year, month - 1));
};

// Get month boundaries
export const getMonthBoundaries = (year: number, month: number) => {
  const date = new Date(year, month - 1);
  return {
    start: startOfMonth(date),
    end: endOfMonth(date)
  };
};

// Validate date string
export const isValidDate = (dateString: string): boolean => {
  try {
    const date = parseISO(dateString);
    return isValid(date);
  } catch (error) {
    return false;
  }
};

// Get current Islamic date (approximation)
export const getIslamicDate = (): string => {
  // This is a simplified approximation
  // For production, you'd want to use a proper Islamic calendar library
  const hijriOffset = 579; // Approximate difference in years
  const currentYear = new Date().getFullYear();
  const islamicYear = currentYear - hijriOffset;
  
  return `${islamicYear} AH`;
};
