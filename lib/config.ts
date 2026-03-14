export const siteConfig = {
  name: 'MindMatch',
  description: 'اكتشف شخصيتك الحقيقية من خلال اختبار متقدم يعتمد على الذكاء الاصطناعي',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  language: 'ar',
  dir: 'rtl',
  currency: 'SAR',
  currencySymbol: 'ر.س',
  locale: 'ar_SA',
}

export const featureFlags = {
  aiIntegration: true,
  paymentIntegration: true,
  pdfGeneration: true,
  emailNotifications: false,
  socialSharing: true,
  multiLanguage: false, // TODO: Implement full multilingual support
}

export const pricing = {
  premium: {
    amount: 99,
    currency: 'SAR',
    name: 'Premium Package',
    features: [
      'Detailed personality report',
      'Access to all books',
      'Personal development recommendations',
      'Unlimited retests',
      'Compatibility reports',
      'Priority support',
    ],
  },
}

export const personality_types = {
  INTJ: {
    code: 'INTJ',
    name_ar: 'الاستراتيجي',
    name_en: 'The Strategist',
    color: '#4F46E5',
  },
  INTP: {
    code: 'INTP',
    name_ar: 'المفكر',
    name_en: 'The Logician',
    color: '#7C3AED',
  },
  ENTJ: {
    code: 'ENTJ',
    name_ar: 'القائد',
    name_en: 'The Commander',
    color: '#DC2626',
  },
  ENTP: {
    code: 'ENTP',
    name_ar: 'المناظر',
    name_en: 'The Debater',
    color: '#F59E0B',
  },
  INFJ: {
    code: 'INFJ',
    name_ar: 'المستشار',
    name_en: 'The Counselor',
    color: '#0891B2',
  },
  INFP: {
    code: 'INFP',
    name_ar: 'المثالي',
    name_en: 'The Mediator',
    color: '#8B5CF6',
  },
  ENFJ: {
    code: 'ENFJ',
    name_ar: 'المعلم',
    name_en: 'The Teacher',
    color: '#06B6D4',
  },
  ENFP: {
    code: 'ENFP',
    name_ar: 'الحماسي',
    name_en: 'The Campaigner',
    color: '#EC4899',
  },
  ISTJ: {
    code: 'ISTJ',
    name_ar: 'المنطقي',
    name_en: 'The Logistician',
    color: '#059669',
  },
  ISFJ: {
    code: 'ISFJ',
    name_ar: 'الحامي',
    name_en: 'The Defender',
    color: '#14B8A6',
  },
  ESTJ: {
    code: 'ESTJ',
    name_ar: 'المدير',
    name_en: 'The Executive',
    color: '#CA8A04',
  },
  ESFJ: {
    code: 'ESFJ',
    name_ar: 'الدعم',
    name_en: 'The Consul',
    color: '#EF4444',
  },
  ISTP: {
    code: 'ISTP',
    name_ar: 'المهندس',
    name_en: 'The Virtuoso',
    color: '#6B7280',
  },
  ISFP: {
    code: 'ISFP',
    name_ar: 'الفنان',
    name_en: 'The Adventurer',
    color: '#A855F7',
  },
  ESTP: {
    code: 'ESTP',
    name_ar: 'الرائد',
    name_en: 'The Entrepreneur',
    color: '#FF6B6B',
  },
  ESFP: {
    code: 'ESFP',
    name_ar: 'الممثل',
    name_en: 'The Entertainer',
    color: '#FFA500',
  },
}
