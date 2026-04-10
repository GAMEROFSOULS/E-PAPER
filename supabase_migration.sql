-- Complete Supabase Database Schema for Epaper CMS
-- Run this in your Supabase SQL Editor to set up all required tables

-- Clients table (main tenant/client data)
CREATE TABLE IF NOT EXISTS clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  site_name text NOT NULL,
  theme_color text DEFAULT '#dc2626',
  logo_url text,
  custom_domain text UNIQUE,
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

-- Enable Row Level Security on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE epapers ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

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

-- Add custom_domain column if it doesn't exist (for domain mapping)
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE;

-- Create index for custom domain lookups
CREATE INDEX IF NOT EXISTS idx_clients_custom_domain ON clients(custom_domain);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_epapers_client_id ON epapers(client_id);
CREATE INDEX IF NOT EXISTS idx_posts_client_id ON posts(client_id);
CREATE INDEX IF NOT EXISTS idx_ads_client_id ON ads(client_id);
