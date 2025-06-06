-- Database Cleanup Script
-- This script will remove all mock/test data from the database
-- Run this script carefully in your Supabase dashboard SQL editor

-- WARNING: This will permanently delete all data!
-- Make sure you have a backup if needed

-- First, let's see what data we have
SELECT 'members' as table_name, count(*) as record_count FROM members
UNION ALL
SELECT 'payments' as table_name, count(*) as record_count FROM payments
UNION ALL
SELECT 'debts' as table_name, count(*) as record_count FROM debts;

-- Display some sample data to confirm it's mock data
SELECT 'Sample Members:' as info;
SELECT id, name, phone, email, created_at FROM members LIMIT 5;

SELECT 'Sample Payments:' as info;
SELECT id, member_id, amount, payment_date, created_at FROM payments LIMIT 5;

SELECT 'Sample Debts:' as info;
SELECT id, member_id, amount, month, year, created_at FROM debts LIMIT 5;

-- Uncomment the following lines to DELETE ALL DATA
-- WARNING: This action cannot be undone!

-- Delete all payments first (due to foreign key constraints)
DELETE FROM payments;

Delete all debts
DELETE FROM debts;

Delete all members
DELETE FROM members;

-- Reset auto-increment sequences if needed
ALTER SEQUENCE members_id_seq RESTART WITH 1;
ALTER SEQUENCE payments_id_seq RESTART WITH 1;
ALTER SEQUENCE debts_id_seq RESTART WITH 1;

-- Verify cleanup
SELECT 'After cleanup:' as info;
SELECT 'members' as table_name, count(*) as record_count FROM members
UNION ALL
SELECT 'payments' as table_name, count(*) as record_count FROM payments
UNION ALL
SELECT 'debts' as table_name, count(*) as record_count FROM debts;
