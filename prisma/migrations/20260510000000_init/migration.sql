CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "TripVisibility" AS ENUM ('PRIVATE', 'PUBLIC');
CREATE TYPE "TripStatus" AS ENUM ('PLANNING', 'UPCOMING', 'ONGOING', 'COMPLETED');
CREATE TYPE "ActivityCategory" AS ENUM ('SIGHTSEEING', 'FOOD', 'ADVENTURE', 'SHOPPING', 'CULTURE');
CREATE TYPE "BudgetCategory" AS ENUM ('TRANSPORT', 'FOOD', 'LODGING', 'ACTIVITIES', 'SHOPPING', 'MISCELLANEOUS');

CREATE TABLE "User" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'USER',
  "avatarUrl" TEXT,
  "city" TEXT,
  "country" TEXT,
  "language" TEXT NOT NULL DEFAULT 'en',
  "preferences" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RefreshToken" (
  "id" UUID NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "userId" UUID NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Trip" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "coverUrl" TEXT,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "visibility" "TripVisibility" NOT NULL DEFAULT 'PRIVATE',
  "status" "TripStatus" NOT NULL DEFAULT 'PLANNING',
  "budgetTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "shareSlug" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Stop" (
  "id" UUID NOT NULL,
  "tripId" UUID NOT NULL,
  "cityId" UUID,
  "title" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Stop_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "City" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "costIndex" INTEGER NOT NULL,
  "popularity" INTEGER NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Activity" (
  "id" UUID NOT NULL,
  "cityId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "category" "ActivityCategory" NOT NULL,
  "description" TEXT NOT NULL,
  "durationMins" INTEGER NOT NULL,
  "estimatedCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StopActivity" (
  "id" UUID NOT NULL,
  "stopId" UUID NOT NULL,
  "activityId" UUID,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "startTime" TIMESTAMP(3),
  "durationMins" INTEGER NOT NULL DEFAULT 60,
  "cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "order" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StopActivity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Budget" (
  "id" UUID NOT NULL,
  "tripId" UUID NOT NULL,
  "category" "BudgetCategory" NOT NULL,
  "planned" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Expense" (
  "id" UUID NOT NULL,
  "tripId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "category" "BudgetCategory" NOT NULL,
  "title" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "spentAt" TIMESTAMP(3) NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChecklistItem" (
  "id" UUID NOT NULL,
  "tripId" UUID NOT NULL,
  "category" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "packed" BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Note" (
  "id" UUID NOT NULL,
  "tripId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "stopId" UUID,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");
CREATE UNIQUE INDEX "Trip_shareSlug_key" ON "Trip"("shareSlug");
CREATE INDEX "Trip_userId_status_idx" ON "Trip"("userId", "status");
CREATE INDEX "Trip_visibility_idx" ON "Trip"("visibility");
CREATE INDEX "Trip_shareSlug_idx" ON "Trip"("shareSlug");
CREATE INDEX "Trip_startDate_endDate_idx" ON "Trip"("startDate", "endDate");
CREATE UNIQUE INDEX "Stop_tripId_order_key" ON "Stop"("tripId", "order");
CREATE INDEX "Stop_tripId_idx" ON "Stop"("tripId");
CREATE INDEX "Stop_cityId_idx" ON "Stop"("cityId");
CREATE UNIQUE INDEX "City_name_country_key" ON "City"("name", "country");
CREATE INDEX "City_region_idx" ON "City"("region");
CREATE INDEX "City_popularity_idx" ON "City"("popularity");
CREATE INDEX "City_costIndex_idx" ON "City"("costIndex");
CREATE INDEX "Activity_cityId_category_idx" ON "Activity"("cityId", "category");
CREATE INDEX "Activity_estimatedCost_idx" ON "Activity"("estimatedCost");
CREATE UNIQUE INDEX "StopActivity_stopId_order_key" ON "StopActivity"("stopId", "order");
CREATE INDEX "StopActivity_stopId_idx" ON "StopActivity"("stopId");
CREATE INDEX "StopActivity_activityId_idx" ON "StopActivity"("activityId");
CREATE UNIQUE INDEX "Budget_tripId_category_key" ON "Budget"("tripId", "category");
CREATE INDEX "Budget_tripId_idx" ON "Budget"("tripId");
CREATE INDEX "Expense_tripId_category_idx" ON "Expense"("tripId", "category");
CREATE INDEX "Expense_userId_idx" ON "Expense"("userId");
CREATE INDEX "Expense_spentAt_idx" ON "Expense"("spentAt");
CREATE INDEX "ChecklistItem_tripId_category_idx" ON "ChecklistItem"("tripId", "category");
CREATE INDEX "Note_tripId_idx" ON "Note"("tripId");
CREATE INDEX "Note_userId_idx" ON "Note"("userId");
CREATE INDEX "Note_stopId_idx" ON "Note"("stopId");

ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Stop" ADD CONSTRAINT "Stop_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Stop" ADD CONSTRAINT "Stop_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StopActivity" ADD CONSTRAINT "StopActivity_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "Stop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StopActivity" ADD CONSTRAINT "StopActivity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Note" ADD CONSTRAINT "Note_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Note" ADD CONSTRAINT "Note_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "Stop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
