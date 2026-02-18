-- ==========================================
-- DATABASE SCHEMA - MAIN ENTRY POINT
-- ==========================================
-- This file orchestrates the database schema by running all SQL files in order.
-- Run this file in Supabase SQL Editor, or run individual files for targeted updates.

-- The schema is organized into:
-- 1. Extensions (vector search, etc.)
-- 2. Tables by domain
-- 3. Indexes
-- 4. Functions
-- 5. RLS Policies

-- For manual execution, run each file in this order:
-- 1. migrations/01_extensions.sql
-- 2. migrations/02_tables.sql
-- 3. migrations/03_indexes.sql
-- 4. migrations/04_functions.sql
-- 5. migrations/05_policies.sql
-- 6. migrations/06_service_products.sql
-- 7. migrations/07_order_management.sql

-- Note: Each migration file can be run independently for targeted updates.
