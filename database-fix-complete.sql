-- COMPREHENSIVE DATABASE FIX
-- Run this script in your Supabase SQL Editor to fix all database schema issues

-- Step 1: Check current debts table structure
SELECT 'Current debts table structure:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'debts' 
ORDER BY ordinal_position;

-- Step 2: Add missing columns to debts table (if they don't exist)
DO $$
BEGIN
    -- Add month column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'debts' AND column_name = 'month') THEN
        ALTER TABLE debts ADD COLUMN month INTEGER;
        RAISE NOTICE 'Added month column to debts table';
    END IF;
    
    -- Add year column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'debts' AND column_name = 'year') THEN
        ALTER TABLE debts ADD COLUMN year INTEGER;
        RAISE NOTICE 'Added year column to debts table';
    END IF;
    
    -- Add type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'debts' AND column_name = 'type') THEN
        ALTER TABLE debts ADD COLUMN type VARCHAR(20);
        RAISE NOTICE 'Added type column to debts table';
    END IF;
END
$$;

-- Step 3: Update existing records with default values
UPDATE debts 
SET 
    month = COALESCE(month, EXTRACT(MONTH FROM due_date)::INTEGER),
    year = COALESCE(year, EXTRACT(YEAR FROM due_date)::INTEGER),
    type = COALESCE(type, 'custom')
WHERE month IS NULL OR year IS NULL OR type IS NULL;

-- Step 4: Add constraints to the new columns
ALTER TABLE debts 
ALTER COLUMN month SET NOT NULL,
ALTER COLUMN year SET NOT NULL,
ALTER COLUMN type SET NOT NULL;

-- Add check constraints
ALTER TABLE debts 
ADD CONSTRAINT IF NOT EXISTS check_debts_month CHECK (month >= 1 AND month <= 12),
ADD CONSTRAINT IF NOT EXISTS check_debts_year CHECK (year >= 1900 AND year <= 2100),
ADD CONSTRAINT IF NOT EXISTS check_debts_type CHECK (type IN ('monthly_dues', 'custom', 'late_fee'));

-- Set default for type column
ALTER TABLE debts 
ALTER COLUMN type SET DEFAULT 'monthly_dues';

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_debts_month_year ON debts(month, year);
CREATE INDEX IF NOT EXISTS idx_debts_type ON debts(type);
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
CREATE INDEX IF NOT EXISTS idx_debts_due_date ON debts(due_date);

-- Step 6: Verify the final structure
SELECT 'Updated debts table structure:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'debts' 
ORDER BY ordinal_position;

-- Step 7: Show current data count
SELECT 'Current record counts:' as info;
SELECT 
    'members' as table_name, 
    count(*) as record_count 
FROM members
UNION ALL
SELECT 
    'payments' as table_name, 
    count(*) as record_count 
FROM payments
UNION ALL
SELECT 
    'debts' as table_name, 
    count(*) as record_count 
FROM debts;

-- Step 8: Enable Row Level Security (RLS) if not already enabled
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

-- Create policies for full access (adjust as needed for your security requirements)
-- For development, we'll allow all operations
DO $$
BEGIN
    -- Members policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'members' AND policyname = 'Allow all operations') THEN
        CREATE POLICY "Allow all operations" ON members FOR ALL USING (true) WITH CHECK (true);
    END IF;
    
    -- Payments policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Allow all operations') THEN
        CREATE POLICY "Allow all operations" ON payments FOR ALL USING (true) WITH CHECK (true);
    END IF;
    
    -- Debts policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'debts' AND policyname = 'Allow all operations') THEN
        CREATE POLICY "Allow all operations" ON debts FOR ALL USING (true) WITH CHECK (true);
    END IF;
END
$$;

-- Final success message
SELECT 'Database schema has been successfully updated! You can now create debts with month, year, and type columns.' as success_message;
