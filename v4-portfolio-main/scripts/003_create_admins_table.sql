-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policy: Anyone can read admins (for login verification)
CREATE POLICY "Anyone can read admins"
  ON admins
  FOR SELECT
  TO public
  USING (true);

-- Create policy: No one can insert/update/delete via API (only through admin panel)
CREATE POLICY "No direct modifications"
  ON admins
  FOR ALL
  TO public
  USING (false);
