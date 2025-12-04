-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "companyLogo" TEXT,
    "companyName" TEXT,
    "showTotalUsers" BOOLEAN NOT NULL DEFAULT true,
    "showTotalClients" BOOLEAN NOT NULL DEFAULT true,
    "showTotalJobs" BOOLEAN NOT NULL DEFAULT true,
    "showTotalContracts" BOOLEAN NOT NULL DEFAULT true,
    "showTotalApplicants" BOOLEAN NOT NULL DEFAULT true,
    "showMonthlyRevenue" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- Create initial system settings record
INSERT INTO "system_settings" ("id", "companyLogo", "companyName", "showTotalUsers", "showTotalClients", "showTotalJobs", "showTotalContracts", "showTotalApplicants", "showMonthlyRevenue", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, NULL, NULL, true, true, true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

