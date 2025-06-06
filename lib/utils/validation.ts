import { z } from 'zod';

// Member validation schema
export const memberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  phone: z.string().optional().refine(
    (phone) => !phone || /^[\+]?[1-9][\d]{0,15}$/.test(phone),
    'Invalid phone number format'
  ),
  address: z.string().max(500, 'Address too long').optional(),
  status: z.enum(['active', 'inactive']),
  monthly_dues: z.number().min(0, 'Monthly dues cannot be negative').max(9999.99, 'Amount too large'),
});

// Payment validation schema
export const paymentSchema = z.object({
  member_id: z.string().uuid('Invalid member ID'),
  amount: z.number().min(0.01, 'Amount must be greater than 0').max(9999.99, 'Amount too large'),
  payment_date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Invalid date format'
  ),
  month: z.number().min(1, 'Invalid month').max(12, 'Invalid month'),
  year: z.number().min(1900, 'Invalid year').max(2100, 'Invalid year'),
  notes: z.string().max(500, 'Notes too long').optional(),
  receipt_number: z.string().max(50, 'Receipt number too long').optional(),
});

// Debt validation schema
export const debtSchema = z.object({
  member_id: z.string().uuid('Invalid member ID'),
  amount: z.number().min(0.01, 'Amount must be greater than 0').max(99999.99, 'Amount too large'),
  due_date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Invalid date format'
  ),
  status: z.enum(['pending', 'paid', 'overdue']),
  description: z.string().max(500, 'Description too long').optional(),
});

// Search validation
export const searchSchema = z.object({
  query: z.string().max(100, 'Search query too long'),
});

// Filter validation
export const filterSchema = z.object({
  month: z.number().min(1).max(12).optional(),
  year: z.number().min(1900).max(2100).optional(),
  status: z.enum(['active', 'inactive', 'all']).optional(),
  member_id: z.string().uuid().optional(),
});

// Validation helper functions
export const validateMember = (data: unknown) => {
  return memberSchema.safeParse(data);
};

export const validatePayment = (data: unknown) => {
  return paymentSchema.safeParse(data);
};

export const validateDebt = (data: unknown) => {
  return debtSchema.safeParse(data);
};

// Form field validation helpers
export const validateRequired = (value: string, fieldName: string) => {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }
  return null;
};

export const validatePhone = (phone: string) => {
  if (!phone) return null;
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(phone)) {
    return 'Invalid phone number format';
  }
  return null;
};

export const validateAmount = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num) || num < 0) {
    return 'Amount must be a positive number';
  }
  if (num > 99999.99) {
    return 'Amount is too large';
  }
  return null;
};

// Sanitize input
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Generate validation errors for forms
export const getValidationErrors = (result: z.SafeParseReturnType<any, any>) => {
  if (result.success) return {};
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach(error => {
    const field = error.path.join('.');
    errors[field] = error.message;
  });
  
  return errors;
};

// Specific form validation functions
export const validateMemberForm = (data: any) => {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Name is too long';
  }

  if (data.phone && data.phone.trim()) {
    const phoneError = validatePhone(data.phone.trim());
    if (phoneError) {
      errors.phone = phoneError;
    }
  }

  if (data.address && data.address.trim().length > 500) {
    errors.address = 'Address is too long';
  }

  if (!data.join_date) {
    errors.join_date = 'Join date is required';
  }

  if (!data.monthly_dues || isNaN(parseFloat(data.monthly_dues))) {
    errors.monthly_dues = 'Monthly dues is required and must be a valid number';
  } else {
    const amount = parseFloat(data.monthly_dues);
    if (amount < 0) {
      errors.monthly_dues = 'Monthly dues cannot be negative';
    } else if (amount > 99999.99) {
      errors.monthly_dues = 'Monthly dues amount is too large';
    }
  }

  if (!data.status || !['active', 'inactive'].includes(data.status)) {
    errors.status = 'Status is required';
  }

  return errors;
};
