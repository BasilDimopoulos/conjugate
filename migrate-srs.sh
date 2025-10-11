#!/bin/bash

# SRS Database Migration Script
echo "================================================"
echo "Migrating Database for SRS System"
echo "================================================"
echo ""

# Generate migration
echo "Step 1: Creating migration..."
npx prisma migrate dev --name add_srs_fields

# Generate Prisma client
echo ""
echo "Step 2: Generating Prisma client..."
npx prisma generate

echo ""
echo "================================================"
echo "Migration Complete!"
echo "================================================"
echo ""
echo "Your database has been updated with SRS fields."
echo "You can now use the review system at /learn"
echo ""

