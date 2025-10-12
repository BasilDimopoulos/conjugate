#!/bin/bash

# SRS & Content Library Database Migration Script
echo "================================================"
echo "Migrating Database for SRS & Content Library"
echo "================================================"
echo ""

# Generate migration
echo "Step 1: Creating migration..."
npx prisma migrate dev --name add_srs_and_content_library

# Generate Prisma client
echo ""
echo "Step 2: Generating Prisma client..."
npx prisma generate

echo ""
echo "================================================"
echo "Migration Complete!"
echo "================================================"
echo ""
echo "Your database has been updated with:"
echo " - SRS fields (spaced repetition)"
echo " - UserContent model (content library)"
echo ""
echo "You can now:"
echo " - Review words at /learn"
echo " - Add content at /learn/add-content"
echo " - Browse library at /learn/library"
echo ""

