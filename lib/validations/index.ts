import { z } from 'zod'

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  confirmPassword: z.string(),
  phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
  fullName: z.string().min(2, 'الاسم الكامل مطلوب'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  identifier: z.string().min(3, 'البريد الإلكتروني أو رقم الهاتف مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
})

export const otpSchema = z.object({
  phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
  code: z.string().length(6, 'الكود يجب أن يكون 6 أرقام'),
})

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'الاسم الكامل مطلوب'),
  country: z.string().optional(),
  phone: z.string().min(10, 'رقم الهاتف غير صحيح').optional(),
})

// Test Schemas
export const testAnswerSchema = z.object({
  questionId: z.string(),
  answerId: z.string(),
})

// Payment Schemas
export const checkoutSchema = z.object({
  testResultId: z.string(),
  amount: z.number().positive('المبلغ يجب أن يكون موجب'),
  currency: z.string().length(3, 'العملة يجب أن تكون 3 أحرف'),
})

// Admin Schemas
export const personalityTypeSchema = z.object({
  code: z.string().length(4, 'الكود يجب أن يكون 4 أحرف'),
  nameAr: z.string().min(2, 'الاسم بالعربية مطلوب'),
  nameEn: z.string().min(2, 'الاسم بالإنجليزية مطلوب'),
  descriptionAr: z.string().min(10, 'الوصف بالعربية مطلوب'),
  descriptionEn: z.string().min(10, 'الوصف بالإنجليزية مطلوب'),
  strengths: z.array(z.string()).min(1, 'نقاط القوة مطلوبة'),
  weaknesses: z.array(z.string()).min(1, 'نقاط الضعف مطلوبة'),
})

export const questionSchema = z.object({
  questionAr: z.string().min(5, 'السؤال بالعربية مطلوب'),
  questionEn: z.string().min(5, 'السؤال بالإنجليزية مطلوب'),
  answers: z.array(z.object({
    textAr: z.string(),
    textEn: z.string(),
    typeScores: z.record(z.number()),
  })).min(2, 'السؤال يجب أن يحتوي على إجابتين على الأقل'),
  order: z.number().positive(),
})

export const aiPromptSchema = z.object({
  name: z.string().min(2, 'اسم الـ Prompt مطلوب'),
  promptText: z.string().min(50, 'نص الـ Prompt مطلوب (50 حرف على الأقل)'),
  personalityTypeId: z.string(),
})

// Types
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type OTPInput = z.infer<typeof otpSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type TestAnswerInput = z.infer<typeof testAnswerSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type PersonalityTypeInput = z.infer<typeof personalityTypeSchema>
export type QuestionInput = z.infer<typeof questionSchema>
export type AIPromptInput = z.infer<typeof aiPromptSchema>
