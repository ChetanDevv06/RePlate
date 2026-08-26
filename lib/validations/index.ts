// ============================================================
// RePlate — Zod Validation Schemas
// ============================================================

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const createListingSchema = z.object({
  name: z
    .string()
    .min(2, 'Food name must be at least 2 characters')
    .max(100, 'Food name must be under 100 characters'),
  original_price: z
    .number({ error: 'Enter a valid price' })
    .positive('Original price must be greater than 0'),
  discounted_price: z
    .number({ error: 'Enter a valid price' })
    .positive('Discounted price must be greater than 0'),
  quantity: z
    .number({ error: 'Enter a valid quantity' })
    .int('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative'),
  pickup_start: z.string().min(1, 'Pickup start time is required'),
  pickup_deadline: z.string().min(1, 'Pickup deadline is required'),
  description: z.string().max(500, 'Description must be under 500 characters').optional(),
}).refine((data) => data.discounted_price < data.original_price, {
  message: 'Discounted price must be less than original price',
  path: ['discounted_price'],
}).refine((data) => {
  if (!data.pickup_start || !data.pickup_deadline) return true;
  return new Date(data.pickup_deadline) > new Date(data.pickup_start);
}, {
  message: 'Pickup deadline must be after pickup start time',
  path: ['pickup_deadline'],
});

export type CreateListingFormData = z.infer<typeof createListingSchema>;

// For updates — a flat partial schema without the cross-field refinements
export const updateListingSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100).optional(),
  original_price: z.number().positive().optional(),
  discounted_price: z.number().positive().optional(),
  quantity: z.number().int().positive().optional(),
  pickup_start: z.string().optional(),
  pickup_deadline: z.string().optional(),
  description: z.string().max(500).optional(),
});

export type UpdateListingFormData = z.infer<typeof updateListingSchema>;

export const reserveSchema = z.object({
  listing_id: z.string().uuid('Invalid listing'),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .positive('You must reserve at least 1 item'),
});

export type ReserveFormData = z.infer<typeof reserveSchema>;

export const predictionInputSchema = z.object({
  average_daily_sales: z
    .number({ error: 'Enter a valid number' })
    .min(0, 'Must be 0 or more'),
  current_stock: z
    .number({ error: 'Enter a valid number' })
    .positive('Current stock must be greater than 0'),
  expected_demand: z
    .number({ error: 'Enter a valid number' })
    .min(0, 'Must be 0 or more'),
});

export type PredictionInputFormData = z.infer<typeof predictionInputSchema>;

export const updateBusinessSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters'),
  location: z.string().min(2, 'Location is required'),
  address: z.string().optional(),
  contact: z.string().optional(),
});

export type UpdateBusinessFormData = z.infer<typeof updateBusinessSchema>;

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100, 'Name too long'),
  avatar_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const customerSignUpSchema = z.object({
  name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
  location: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type CustomerSignUpFormData = z.infer<typeof customerSignUpSchema>;

export const businessSignUpSchema = z.object({
  name: z.string().trim().min(2, 'Your name must be at least 2 characters'),
  businessName: z.string().trim().min(2, 'Business name must be at least 2 characters'),
  businessType: z.enum(['Restaurant', 'Café', 'Bakery', 'College Canteen', 'Other']),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
  location: z.string().trim().min(2, 'City / Area is required'),
  address: z.string().optional(),
  contact: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type BusinessSignUpFormData = z.infer<typeof businessSignUpSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
