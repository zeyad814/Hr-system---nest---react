-- CreateEnum
CREATE TYPE "PackageCategory" AS ENUM ('TECHNOLOGY', 'SALES', 'MARKETING', 'HR', 'FINANCE', 'OPERATIONS', 'MANAGEMENT', 'GENERAL');

-- CreateTable
CREATE TABLE "skill_packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "PackageCategory" NOT NULL DEFAULT 'TECHNOLOGY',
    "skills" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_packages_pkey" PRIMARY KEY ("id")
);










