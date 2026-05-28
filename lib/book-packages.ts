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

const PACKAGE_IDS: PackageId[] = ['free', 'report-only', 'book-report', 'book-only']

function parsePrice(value: number | string | undefined, fallback: number): number {
  if (value === undefined || value === null || value === '') return fallback
  const n = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.]/g, ''))
  return Number.isFinite(n) ? n : fallback
}

function inferPackageId(plan: DbPricingPlan, index: number): PackageId {
  const raw = (plan.packageId || plan.id || '').toString().toLowerCase()
  if (raw === 'free' || raw.includes('مجان')) return 'free'
  if (raw === 'report-only') return 'report-only'
  if (raw === 'book-report' || raw.includes('باقة')) return 'book-report'
  if (raw === 'book-only' || raw.includes('كتاب فقط')) return 'book-only'
  return PACKAGE_IDS[Math.min(index, PACKAGE_IDS.length - 1)]
}

function autoPackagesForBook(book: BookForPackages): BookPackage[] {
  return plansToPackages(
    buildPricingPlansFromBookPrices({
      title: book.title,
      price: book.price,
      reportPrice: book.reportPrice ?? 0,
      bookOnlyPrice: book.bookOnlyPrice ?? 0,
      hasActiveTest: book.hasActiveTest,
    }),
    book
  )
}

function normalizeDbPlan(plan: DbPricingPlan, book: BookForPackages, index: number): BookPackage {
  const id = inferPackageId(plan, index)
  const auto = autoPackagesForBook(book)
  const fallback = auto.find((p) => p.id === id) ?? auto[0]

  const price = parsePrice(plan.price, fallback.price)
  const includesTest = plan.includesTest ?? fallback.includesTest
  const includesBook = plan.includesBook ?? fallback.includesBook
  const includesReport = plan.includesReport ?? fallback.includesReport

  return {
    id,
    name: plan.name || fallback.name,
    price,
    oldPrice:
      plan.oldPrice != null ? parsePrice(plan.oldPrice, fallback.oldPrice ?? 0) : fallback.oldPrice,
    features:
      Array.isArray(plan.features) && plan.features.length > 0
        ? plan.features
        : fallback.features,
    isFeatured: plan.isFeatured ?? fallback.isFeatured,
    badge: plan.badge ?? fallback.badge,
    includesTest,
    includesBook,
    includesReport,
    ctaLabel: plan.ctaLabel ?? fallback.ctaLabel,
    kind: id === 'free' || id === 'report-only' ? 'test' : 'book',
  }
}

/** يبني الباقات من بيانات الكتاب الحقيقية في قاعدة البيانات */
export function buildBookPackages(book: BookForPackages | null | undefined): BookPackage[] {
  if (!book) return []

  const dbPlans = Array.isArray(book.pricingPlans)
    ? book.pricingPlans.filter((p) => p && p.name)
    : []
  if (dbPlans.length > 0) {
    return dbPlans.map((plan, index) => normalizeDbPlan(plan, book, index))
  }

  return autoPackagesForBook(book)
}

function plansToPackages(plans: DbPricingPlan[], book: BookForPackages): BookPackage[] {
  return plans.map((plan, index) => normalizeDbPlan(plan, book, index))
}

/** @deprecated استخدم buildBookPackages */
export function mergePricingPlans(dbPlans: DbPricingPlan[] | null | undefined): BookPackage[] {
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
  return buildBookPackages(book).find((p) => p.id === packageId) ?? null
}

export function getCheckoutUrl(bookId: number | string, packageId: PackageId): string {
  return `/checkout?type=package&bookId=${bookId}&package=${packageId}`
}

export function getTestUrl(testSlug?: string | null, testId?: number | null): string {
  if (testSlug) return `/test?testId=${encodeURIComponent(testSlug)}`
  if (testId) return `/test?testId=${testId}`
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
