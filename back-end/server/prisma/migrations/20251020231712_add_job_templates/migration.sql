-- CreateEnum
CREATE TYPE "public"."TemplateCategory" AS ENUM ('TECHNOLOGY', 'SALES', 'MARKETING', 'HR', 'FINANCE', 'OPERATIONS', 'MANAGEMENT', 'GENERAL');

-- CreateTable
CREATE TABLE "public"."job_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "public"."TemplateCategory" NOT NULL DEFAULT 'TECHNOLOGY',
    "requiredSkills" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "experienceLevel" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_templates_pkey" PRIMARY KEY ("id")
);
