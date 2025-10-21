-- Drop columns from Job table
ALTER TABLE "Job" DROP COLUMN IF EXISTS "description";
ALTER TABLE "Job" DROP COLUMN IF EXISTS "experienceLevel";

-- Drop JobTemplate table if exists
DROP TABLE IF EXISTS "job_templates";

-- Drop TemplateCategory enum if exists
DROP TYPE IF EXISTS "TemplateCategory";

