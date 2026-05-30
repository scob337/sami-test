import { buildPricingPlansFromBookPrices } from '@/lib/book-pricing'

export type PackageId = 'free' | 'book-report' | 'book-only' | 'report-only'

export interface BookPackage {
  id: PackageId
  name: string
  price: number
  oldPrice?: number
  features: string[]
  isFeatured?: boolean
  badge?: string
  includesTest: boolean
  includesBook: boolean
  includesReport: boolean
  ctaLabel: string
  kind: 'book' | 'test'
}

export type DbPricingPlan = {
  id?: string
  packageId?: string
  name?: string
  price?: number | string
  oldPrice?: number | string
  features?: string[]
  isFeatured?: boolean
  badge?: string
  includesTest?: boolean
  includesBook?: boolean
  includesReport?: boolean
  ctaLabel?: string
}

export type BookForPackages = {
  id: number
  title: string
  price: number
  reportPrice?: number
  bookOnlyPrice?: number
  pricingPlans?: DbPricingPlan[] | null
  hasActiveTest?: boolean
}

const PACKAGE_IDS: PackageId[] = [
  'free',
  'report-only',
  'book-report',
  'book-only',
]

function parsePrice(
  value: number | string | undefined,
  fallback: number
): number {
  if (value === undefined || value === null || value === '') {
    return fallback
  }

  const n =
    typeof value === 'number'
      ? value
      : parseFloat(String(value).replace(/[^\d.]/g, ''))

  return Number.isFinite(n) ? n : fallback
}

function inferPackageId(
  plan: DbPricingPlan,
  index: number
): PackageId {
  const raw = (plan.packageId || plan.id || '')
    .toString()
    .toLowerCase()

  if (raw === 'free' || raw.includes('مجان')) return 'free'
  if (raw === 'report-only') return 'report-only'
  if (raw === 'book-report' || raw.includes('باقة')) return 'book-report'
  if (raw === 'book-only' || raw.includes('كتاب فقط')) return 'book-only'

  return PACKAGE_IDS[Math.min(index, PACKAGE_IDS.length - 1)]
}

/**
 * يحول DbPricingPlan إلى BookPackage
 * بدون أي استدعاءات متبادلة Recursion
 */
function planToPackage(
  plan: DbPricingPlan,
  index: number
): BookPackage {
  const id = inferPackageId(plan, index)

  const price = parsePrice(plan.price, 0)

  return {
    id,
    name: plan.name || '',
    price,
    oldPrice:
      plan.oldPrice != null
        ? parsePrice(plan.oldPrice, 0)
        : undefined,
    features: Array.isArray(plan.features)
      ? plan.features
      : [],
    isFeatured: plan.isFeatured,
    badge: plan.badge,
    includesTest: plan.includesTest ?? false,
    includesBook: plan.includesBook ?? false,
    includesReport: plan.includesReport ?? false,
    ctaLabel: plan.ctaLabel || 'ابدأ الآن',
    kind:
      id === 'free' || id === 'report-only'
        ? 'test'
        : 'book',
  }
}

function plansToPackages(
  plans: DbPricingPlan[]
): BookPackage[] {
  return plans.map((plan, index) =>
    planToPackage(plan, index)
  )
}

function autoPackagesForBook(
  book: BookForPackages
): BookPackage[] {
  const generatedPlans = buildPricingPlansFromBookPrices({
    title: book.title,
    price: book.price,
    reportPrice: book.reportPrice ?? 0,
    bookOnlyPrice: book.bookOnlyPrice ?? 0,
    hasActiveTest: book.hasActiveTest,
  })

  return plansToPackages(generatedPlans)
}

/** يبني الباقات من بيانات الكتاب الحقيقية */
export function buildBookPackages(
  book: BookForPackages | null | undefined
): BookPackage[] {
  if (!book) return []

  const dbPlans = Array.isArray(book.pricingPlans)
    ? book.pricingPlans.filter((p) => p && p.name)
    : []

  if (dbPlans.length > 0) {
    return plansToPackages(dbPlans)
  }

  return autoPackagesForBook(book)
}

/** @deprecated */
export function mergePricingPlans(
  dbPlans: DbPricingPlan[] | null | undefined
): BookPackage[] {
  return buildBookPackages({
    id: 0,
    title: 'الكتاب',
    price: 49,
    pricingPlans: dbPlans,
    hasActiveTest: true,
  })
}

export function getPackageById(
  packageId: string | null | undefined,
  book: BookForPackages | null | undefined
): BookPackage | null {
  if (!packageId || !book) return null

  return (
    buildBookPackages(book).find(
      (p) => p.id === packageId
    ) ?? null
  )
}

export function getCheckoutUrl(
  bookId: number | string,
  packageId: PackageId
): string {
  return `/checkout?type=package&bookId=${bookId}&package=${packageId}`
}

export function getTestUrl(
  testSlug?: string | null,
  testId?: number | null
): string {
  if (testSlug) {
    return `/test?testId=${encodeURIComponent(testSlug)}`
  }

  if (testId) {
    return `/test?testId=${testId}`
  }

  return '/test-library'
}

export function getPackageActionUrl(
  bookId: number | string,
  pkg: BookPackage,
  testSlug?: string | null,
  testId?: number | null
): string {
  if (pkg.id === 'free') {
    return getTestUrl(testSlug, testId)
  }

  return getCheckoutUrl(bookId, pkg.id)
}