#!/bin/bash

# Multi-Organization Attendance System - Supabase Setup Script
# This script helps set up the Supabase project

set -e

echo "=========================================="
echo "Supabase Setup for Multi-Org Attendance"
echo "=========================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "Please install it first:"
    echo "  npm install -g supabase"
    echo "  or"
    echo "  brew install supabase/tap/supabase"
    exit 1
fi

echo "✅ Supabase CLI is installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo "⚠️  Please edit .env and add your Supabase credentials"
    echo ""
fi

# Ask user what they want to do
echo "What would you like to do?"
echo "1) Start local Supabase instance"
echo "2) Link to existing remote project"
echo "3) Create new remote project"
echo "4) Apply migrations to local instance"
echo "5) Push migrations to remote project"
echo "6) Exit"
echo ""
read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo ""
        echo "Starting local Supabase instance..."
        supabase start
        echo ""
        echo "✅ Local Supabase is running!"
        echo "📊 Studio URL: http://localhost:54323"
        echo "🔌 API URL: http://localhost:54321"
        echo "🗄️  DB URL: postgresql://postgres:postgres@localhost:54322/postgres"
        ;;
    2)
        echo ""
        read -p "Enter your Supabase project ref: " project_ref
        supabase link --project-ref "$project_ref"
        echo "✅ Linked to remote project"
        ;;
    3)
        echo ""
        echo "Please create a new project at https://app.supabase.com"
        echo "Then run this script again and choose option 2 to link it."
        ;;
    4)
        echo ""
        echo "Applying migrations to local instance..."
        supabase db reset
        echo "✅ Migrations applied successfully"
        ;;
    5)
        echo ""
        echo "Pushing migrations to remote project..."
        supabase db push
        echo "✅ Migrations pushed successfully"
        ;;
    6)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid choice. Exiting..."
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "Setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Update your .env file with Supabase credentials"
echo "2. Run the migrations if you haven't already"
echo "3. Start building the application!"
echo ""
