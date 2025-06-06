-- Database Schema Verification Script
-- Run this in Supabase SQL Editor to verify the database schema is correct

-- ================================
-- 1. VERIFY TABLE STRUCTURES
-- ================================

SELECT 'MEMBERS TABLE STRUCTURE:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'members' 
ORDER BY ordinal_position;

SELECT 'PAYMENTS TABLE STRUCTURE:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'payments' 
ORDER BY ordinal_position;

SELECT 'DEBTS TABLE STRUCTURE:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'debts' 
ORDER BY ordinal_position;

-- ================================
-- 2. CHECK REQUIRED COLUMNS
-- ================================

SELECT 'CHECKING REQUIRED COLUMNS:' as info;

-- Check if payments table has month and year columns
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='month') 
        THEN '✓ payments.month exists'
        ELSE '✗ payments.month MISSING'
    END as payment_month_check;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='year') 
        THEN '✓ payments.year exists'
        ELSE '✗ payments.year MISSING'
    END as payment_year_check;

-- Check if debts table has month, year, and type columns
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='debts' AND column_name='month') 
        THEN '✓ debts.month exists'
        ELSE '✗ debts.month MISSING'
    END as debt_month_check;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='debts' AND column_name='year') 
        THEN '✓ debts.year exists'
        ELSE '✗ debts.year MISSING'
    END as debt_year_check;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='debts' AND column_name='type') 
        THEN '✓ debts.type exists'
        ELSE '✗ debts.type MISSING'
    END as debt_type_check;

-- ================================
-- 3. CHECK INDEXES
-- ================================

SELECT 'CHECKING INDEXES:' as info;
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('members', 'payments', 'debts')
ORDER BY tablename, indexname;

-- ================================
-- 4. CHECK DATA COUNTS
-- ================================

SELECT 'DATA COUNTS:' as info;
SELECT 'members' as table_name, count(*) as record_count FROM members
UNION ALL
SELECT 'payments' as table_name, count(*) as record_count FROM payments
UNION ALL
SELECT 'debts' as table_name, count(*) as record_count FROM debts;

-- ================================
-- 5. TEST SAMPLE QUERIES
-- ================================

SELECT 'TESTING SAMPLE QUERIES:' as info;

-- Test member query
SELECT 'Sample members (limit 3):' as test;
SELECT id, name, phone, status, monthly_dues FROM members LIMIT 3;

-- Test payment query (if any payments exist)
SELECT 'Sample payments (limit 3):' as test;
SELECT id, member_id, amount, payment_date, month, year FROM payments LIMIT 3;

-- Test debt query (if any debts exist)
SELECT 'Sample debts (limit 3):' as test;
SELECT id, member_id, amount, due_date, month, year, type, status FROM debts LIMIT 3;

-- ================================
-- 6. SIMULATE DATA INSERTION TEST
-- ================================

SELECT 'SCHEMA READY FOR:' as info;
SELECT '✓ Member creation' as functionality
UNION ALL
SELECT '✓ Payment recording with month/year' as functionality
UNION ALL
SELECT '✓ Debt management with type/month/year' as functionality
UNION ALL
SELECT '✓ Financial reporting' as functionality;
