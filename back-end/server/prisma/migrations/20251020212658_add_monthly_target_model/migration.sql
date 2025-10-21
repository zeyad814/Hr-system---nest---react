-- CreateTable
CREATE TABLE "public"."MonthlyTarget" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "targetAmount" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyTarget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlyTarget_year_month_idx" ON "public"."MonthlyTarget"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyTarget_month_year_key" ON "public"."MonthlyTarget"("month", "year");
