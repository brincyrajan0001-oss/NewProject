const { z } = require('zod');

// Patient validation schema
const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsedDate = new Date(date);
      const today = new Date();
      return parsedDate < today;
    }, 'Date of birth must be in the past'),
  sex: z.enum(['male', 'female', 'other', 'unknown'], {
    errorMap: () => ({ message: 'Sex must be one of: male, female, other, unknown' })
  }),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g., +1234567890)'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  addressLine1: z.string().min(1, 'Address line 1 is required').max(200, 'Address too long'),
  city: z.string().min(1, 'City is required').max(100, 'City name too long'),
  postalCode: z.string().min(1, 'Postal code is required').max(20, 'Postal code too long'),
  countryCode: z.string().length(2, 'Country code must be exactly 2 characters')
    .regex(/^[A-Z]{2}$/, 'Country code must be uppercase ISO-3166-1 alpha-2')
});

// Update patient schema (all fields optional except id)
const updatePatientSchema = patientSchema.partial();

// Search query validation
const searchQuerySchema = z.object({
  search: z.string().optional(),
  mrn: z.string().optional(),
  lastName: z.string().optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100').optional(),
  cursor: z.string().optional()
});

// Error response helper
const createErrorResponse = (code, message, details = []) => ({
  error: {
    code,
    message,
    details
  }
});

// Validation error codes
const ERROR_CODES = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  CONFLICT: 'CONFLICT',
  NOT_FOUND: 'NOT_FOUND',
  PRECONDITION_REQUIRED: 'PRECONDITION_REQUIRED',
  PRECONDITION_FAILED: 'PRECONDITION_FAILED',
  RATE_LIMITED: 'RATE_LIMITED',
  UNAUTHORIZED: 'UNAUTHORIZED'
};

module.exports = {
  patientSchema,
  updatePatientSchema,
  searchQuerySchema,
  createErrorResponse,
  ERROR_CODES
};
