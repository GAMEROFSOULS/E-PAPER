-- Complete Supabase Database Schema for Epaper CMS
-- Run this in your Supabase SQL Editor to set up all required tables

-- Clients table (main tenant/client data)
CREATE TABLE IF NOT EXISTS clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  site_name text NOT NULL,
  theme_color text DEFAULT '#dc2626',
  logo_url text,
  subdomain text UNIQUE,           -- e.g. 'dawn' → dawn.epaper.edgemindlab.cloud
  custom_domain text UNIQUE,       -- e.g. 'epaper.dawngroup.com' (client's own domain)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Epapers table (digital publications)
CREATE TABLE IF NOT EXISTS epapers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  title text,
  file_url text NOT NULL,
  published_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Posts table (news articles/content)
CREATE TABLE IF NOT EXISTS posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  image_url text,
  is_headline boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ads table (advertisements)
CREATE TABLE IF NOT EXISTS ads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  position text NOT NULL DEFAULT 'sidebar',
  image_url text NOT NULL,
  link_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Epaper page mappings (area map editor)
CREATE TABLE IF NOT EXISTS epaper_page_mappings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id uuid NOT NULL REFERENCES epapers(id) ON DELETE CASCADE,
  article_id uuid NULL REFERENCES posts(id) ON DELETE SET NULL,
  title text NULL,
  shape text NOT NULL DEFAULT 'rect',
  x double precision NOT NULL,
  y double precision NOT NULL,
  width double precision NOT NULL,
  height double precision NOT NULL,
  coords_json jsonb NULL,
  target_type text NOT NULL DEFAULT 'article',
  target_value text NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT epaper_page_mappings_shape_check CHECK (shape IN ('rect')),
  CONSTRAINT epaper_page_mappings_target_type_check CHECK (target_type IN ('article', 'clipping', 'external_url', 'popup')),
  CONSTRAINT epaper_page_mappings_x_check CHECK (x >= 0 AND x <= 1),
  CONSTRAINT epaper_page_mappings_y_check CHECK (y >= 0 AND y <= 1),
  CONSTRAINT epaper_page_mappings_width_check CHECK (width > 0 AND width <= 1),
  CONSTRAINT epaper_page_mappings_height_check CHECK (height > 0 AND height <= 1),
  CONSTRAINT epaper_page_mappings_bounds_check CHECK (x + width <= 1.000001 AND y + height <= 1.000001)
);

-- Enable Row Level Security on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE epapers ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE epaper_page_mappings ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies for clients table
CREATE POLICY "Users can view their own clients" ON clients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own clients" ON clients
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own clients" ON clients
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own clients" ON clients
  FOR DELETE USING (user_id = auth.uid());

-- Row Level Security Policies for epapers table
CREATE POLICY "Users can view their own epapers" ON epapers
  FOR SELECT USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own epapers" ON epapers
  FOR INSERT WITH CHECK (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own epapers" ON epapers
  FOR UPDATE USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own epapers" ON epapers
  FOR DELETE USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

-- Row Level Security Policies for posts table
CREATE POLICY "Users can view their own posts" ON posts
  FOR SELECT USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own posts" ON posts
  FOR INSERT WITH CHECK (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

-- Row Level Security Policies for ads table
CREATE POLICY "Users can view their own ads" ON ads
  FOR SELECT USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own ads" ON ads
  FOR INSERT WITH CHECK (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own ads" ON ads
  FOR UPDATE USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own ads" ON ads
  FOR DELETE USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

-- Row Level Security Policies for epaper_page_mappings
CREATE POLICY "Public can view epaper page mappings" ON epaper_page_mappings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own epaper mappings" ON epaper_page_mappings
  FOR INSERT WITH CHECK (
    page_id IN (
      SELECT e.id
      FROM epapers e
      INNER JOIN clients c ON c.id = e.client_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own epaper mappings" ON epaper_page_mappings
  FOR UPDATE USING (
    page_id IN (
      SELECT e.id
      FROM epapers e
      INNER JOIN clients c ON c.id = e.client_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own epaper mappings" ON epaper_page_mappings
  FOR DELETE USING (
    page_id IN (
      SELECT e.id
      FROM epapers e
      INNER JOIN clients c ON c.id = e.client_id
      WHERE c.user_id = auth.uid()
    )
  );

-- Add subdomain and custom_domain columns if they don't exist (for domain mapping)
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS subdomain TEXT UNIQUE;       -- platform subdomain slug
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE;   -- fully custom domain

-- Enforce subdomain format: lowercase alphanumeric + hyphens only
ALTER TABLE clients
  DROP CONSTRAINT IF EXISTS clients_subdomain_format;
ALTER TABLE clients
  ADD CONSTRAINT clients_subdomain_format
  CHECK (subdomain ~ '^[a-z0-9][a-z0-9\-]*[a-z0-9]$' OR subdomain IS NULL);

-- Create indexes for fast domain lookups
CREATE INDEX IF NOT EXISTS idx_clients_subdomain ON clients(subdomain);
CREATE INDEX IF NOT EXISTS idx_clients_custom_domain ON clients(custom_domain);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_epapers_client_id ON epapers(client_id);
CREATE INDEX IF NOT EXISTS idx_posts_client_id ON posts(client_id);
CREATE INDEX IF NOT EXISTS idx_ads_client_id ON ads(client_id);
CREATE INDEX IF NOT EXISTS idx_epaper_page_mappings_page_id ON epaper_page_mappings(page_id);
CREATE INDEX IF NOT EXISTS idx_epaper_page_mappings_sort_order ON epaper_page_mappings(page_id, sort_order);
