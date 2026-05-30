-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "assistant" JSONB,
ADD COLUMN     "audience" JSONB,
ADD COLUMN     "bookDetails" JSONB,
ADD COLUMN     "bookOnlyPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "ctaDescription" TEXT,
ADD COLUMN     "ctaTitle" TEXT,
ADD COLUMN     "expertName" TEXT DEFAULT 'الخبير سامي',
ADD COLUMN     "features" JSONB,
ADD COLUMN     "heroDescription" TEXT,
ADD COLUMN     "heroImage" TEXT,
ADD COLUMN     "heroSubtitle" TEXT,
ADD COLUMN     "heroTitle" TEXT,
ADD COLUMN     "pricingPlans" JSONB,
ADD COLUMN     "reportPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "steps" JSONB;

-- AlterTable
ALTER TABLE "DiscountCode" ADD COLUMN     "bookId" INTEGER;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "productId" INTEGER,
ADD COLUMN     "subscriptionId" INTEGER;

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "reportData" JSONB,
ALTER COLUMN "reportText" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT,
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "WeeklyContent" (
    "id" SERIAL NOT NULL,
    "weekTitle" TEXT NOT NULL,
    "heroText" TEXT NOT NULL,
    "mainExample" TEXT NOT NULL,
    "sentenceOfWeek" TEXT NOT NULL,
    "offerText" TEXT,
    "ctaText" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentenceLibrary" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "suitableFor" TEXT NOT NULL,
    "unsuitableFor" TEXT,
    "whenToUse" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SentenceLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "oldPrice" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "planType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScenarioRequest" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "situation" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "otherType" TEXT,
    "analysis" TEXT,
    "mistake" TEXT,
    "sentenceToSay" TEXT,
    "sentenceToAvoid" TEXT,
    "actionStep" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScenarioRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountCode" ADD CONSTRAINT "DiscountCode_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioRequest" ADD CONSTRAINT "ScenarioRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
