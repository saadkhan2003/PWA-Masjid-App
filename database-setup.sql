-- Mosque Committee Management Database Setup
-- Execute this script in your Supabase SQL Editor

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

-- Create debts table
CREATE TABLE debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    description TEXT,
    type VARCHAR(20) NOT NULL DEFAULT 'monthly_dues' CHECK (type IN ('monthly_dues', 'custom', 'late_fee')),
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_join_date ON members(join_date);
CREATE INDEX idx_payments_member_id ON payments(member_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_month_year ON payments(month, year);
CREATE INDEX idx_payments_receipt_number ON payments(receipt_number);
CREATE INDEX idx_debts_member_id ON debts(member_id);
CREATE INDEX idx_debts_due_date ON debts(due_date);
CREATE INDEX idx_debts_status ON debts(status);
CREATE INDEX idx_debts_month_year ON debts(month, year);
CREATE INDEX idx_debts_type ON debts(type);
CREATE INDEX idx_debts_status ON debts(status);
CREATE INDEX idx_debts_due_date ON debts(due_date);

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

-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (you can restrict this later based on authentication)
CREATE POLICY "Allow all operations on members" ON members FOR ALL USING (true);
CREATE POLICY "Allow all operations on payments" ON payments FOR ALL USING (true);
CREATE POLICY "Allow all operations on debts" ON debts FOR ALL USING (true);

-- Insert sample data
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
