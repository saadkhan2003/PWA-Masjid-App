-- Create settings table for app configuration
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  masjid_name VARCHAR(255) DEFAULT '',
  address TEXT DEFAULT '',
  phone VARCHAR(50) DEFAULT '',
  email VARCHAR(255) DEFAULT '',
  website VARCHAR(255) DEFAULT '',
  imam_name VARCHAR(255) DEFAULT '',
  monthly_dues_amount INTEGER DEFAULT 200,
  late_payment_fee INTEGER DEFAULT 50,
  grace_period_days INTEGER DEFAULT 7,
  auto_generate_debts BOOLEAN DEFAULT true,
  reminder_days INTEGER DEFAULT 7,
  reminder_method VARCHAR(20) DEFAULT 'sms' CHECK (reminder_method IN ('sms', 'whatsapp', 'both')),
  email_notifications BOOLEAN DEFAULT false,
  sms_notifications BOOLEAN DEFAULT true,
  whatsapp_notifications BOOLEAN DEFAULT false,
  payment_reminders BOOLEAN DEFAULT true,
  debt_alerts BOOLEAN DEFAULT true,
  currency VARCHAR(10) DEFAULT 'PKR',
  theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  primary_color VARCHAR(7) DEFAULT '#10B981',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings if none exist
INSERT INTO settings (
  masjid_name,
  address,
  phone,
  email,
  website,
  imam_name
) 
SELECT 
  'مسجد صدیق اکبر',
  'کراچی، پاکستان',
  '+92 300 1234567',
  'info@masjid.org',
  'www.masjid.org',
  'مولانا عبدالرحمن'
WHERE NOT EXISTS (SELECT 1 FROM settings);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_settings_updated_at 
    BEFORE UPDATE ON settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();