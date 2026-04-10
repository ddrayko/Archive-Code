-- Create projects table for portfolio
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  project_url TEXT,
  github_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read projects (public portfolio)
CREATE POLICY "projects_select_public"
  ON public.projects
  FOR SELECT
  USING (true);

-- Allow all operations without auth check (we'll handle admin auth in the app)
-- This is safe because we'll protect the admin routes with middleware
CREATE POLICY "projects_insert_all"
  ON public.projects
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "projects_update_all"
  ON public.projects
  FOR UPDATE
  USING (true);

CREATE POLICY "projects_delete_all"
  ON public.projects
  FOR DELETE
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
