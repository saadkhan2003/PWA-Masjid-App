# Database Setup Guide

This document provides step-by-step instructions for setting up the Supabase database for the Mosque Committee Management PWA.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A new Supabase project created

## Database Schema

Execute the following SQL commands in your Supabase SQL editor to create the required tables:

### 1. Members Table

```sql
-- Create members table
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    status VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    join_date DATE NOT NULL,
    monthly_dues DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_debt DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on member status for faster queries
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_join_date ON members(join_date);
```

### 2. Payments Table

```sql
-- Create payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
    notes TEXT,
    receipt_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_payments_member_id ON payments(member_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_month_year ON payments(month, year);
CREATE INDEX idx_payments_receipt_number ON payments(receipt_number);
```

### 3. Debts Table

```sql
-- Create debts table
CREATE TABLE debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_debts_member_id ON debts(member_id);
CREATE INDEX idx_debts_status ON debts(status);
CREATE INDEX idx_debts_due_date ON debts(due_date);
```

### 4. Database Triggers for Updated At

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON debts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5. Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (you can restrict this later based on authentication)
CREATE POLICY "Allow all operations on members" ON members FOR ALL USING (true);
CREATE POLICY "Allow all operations on payments" ON payments FOR ALL USING (true);
CREATE POLICY "Allow all operations on debts" ON debts FOR ALL USING (true);
```

### 6. Sample Data (Optional)

```sql
-- Insert sample members
INSERT INTO members (name, phone, address, status, join_date, monthly_dues) VALUES
('Ahmed Ali', '+92-300-1234567', 'Block A, Gulberg, Lahore', 'active', '2023-01-01', 2000.00),
('Fatima Khan', '+92-301-2345678', 'Defense Phase 2, Karachi', 'active', '2023-03-15', 2500.00),
('Muhammad Hassan', '+92-302-3456789', 'Model Town, Islamabad', 'active', '2023-06-01', 1800.00),
('Aisha Siddiqui', '+92-303-4567890', 'Clifton, Karachi', 'active', '2023-09-10', 2200.00),
('Omar Sheikh', '+92-304-5678901', 'DHA Phase 5, Lahore', 'inactive', '2023-02-20', 1500.00);

-- Insert sample payments
INSERT INTO payments (member_id, amount, payment_date, month, year, notes, receipt_number) VALUES
((SELECT id FROM members WHERE name = 'Ahmed Ali'), 2000.00, '2024-01-15', 1, 2024, 'January dues payment', 'RCP-001'),
((SELECT id FROM members WHERE name = 'Fatima Khan'), 1500.00, '2024-01-14', 1, 2024, 'Partial payment for January', 'RCP-002'),
((SELECT id FROM members WHERE name = 'Muhammad Hassan'), 1800.00, '2024-01-12', 1, 2024, 'January dues payment', 'RCP-003');

-- Insert sample debts
INSERT INTO debts (member_id, amount, due_date, status, description) VALUES
((SELECT id FROM members WHERE name = 'Ahmed Ali'), 4000.00, '2024-02-01', 'overdue', 'Outstanding dues for November and December 2023'),
((SELECT id FROM members WHERE name = 'Fatima Khan'), 1000.00, '2024-01-31', 'pending', 'Partial payment pending for January dues'),
((SELECT id FROM members WHERE name = 'Muhammad Hassan'), 1500.00, '2024-03-15', 'pending', 'Special assessment for mosque renovation');
```

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase project details:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)

## Testing the Setup

After setting up the database and environment variables:

1. Start the development server: `npm run dev`
2. Navigate to `/dashboard` to see the app
3. Check if data loads correctly from the database
4. Test creating new members, payments, and debt records

## Real-time Subscriptions

The app uses Supabase real-time subscriptions for live updates. Make sure real-time is enabled in your Supabase project settings.

## Security Considerations

1. **Row Level Security**: The current setup allows all operations. In production, implement proper RLS policies based on user authentication.

2. **API Keys**: Keep your service role key secure and never expose it in client-side code.

3. **Data Validation**: All data validation is handled both client-side and server-side.

## Backup and Maintenance

1. **Regular Backups**: Set up automated backups in Supabase dashboard
2. **Data Export**: Use Supabase's export features for periodic data exports
3. **Monitoring**: Monitor database performance and query patterns in Supabase dashboard

## Troubleshooting

### Common Issues:

1. **Connection Error**: Verify environment variables are correctly set
2. **Permission Denied**: Check RLS policies and authentication
3. **Query Timeouts**: Review indexes and query performance
4. **Real-time Not Working**: Verify real-time is enabled in Supabase project

### Debug Steps:

1. Check Supabase logs in the dashboard
2. Verify table structure matches schema
3. Test queries directly in Supabase SQL editor
4. Check browser console for JavaScript errors

For additional help, refer to the [Supabase documentation](https://supabase.com/docs) or check the project's GitHub issues.
