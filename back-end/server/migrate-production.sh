#!/bin/bash

# Script to apply Prisma migrations to production database

echo "🔄 Starting production migration process..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo "Please set your production database URL:"
    echo "export DATABASE_URL='postgresql://user:password@host:port/database'"
    exit 1
fi

echo "✅ Database URL found"
echo ""

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi
echo "✅ Prisma Client generated"
echo ""

# Deploy migrations
echo "🚀 Deploying migrations to production..."
npx prisma migrate deploy
if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy migrations"
    exit 1
fi
echo "✅ Migrations deployed successfully"
echo ""

# Show migration status
echo "📊 Migration Status:"
npx prisma migrate status
echo ""

echo "✅ Production migration completed successfully!"
echo ""
echo "Next steps:"
echo "1. Verify the changes in your production database"
echo "2. Test the new features on your production app"
echo "3. Monitor the application logs for any issues"
