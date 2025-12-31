-- C-Suite Magazine: Programmatic SEO Database Schema
-- Phase 1 MVP: Executive Salary Intelligence Platform
--
-- Run this in Supabase SQL Editor after creating your project
-- https://app.supabase.com/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- COMPANIES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  ticker_symbol TEXT UNIQUE, -- NYSE/NASDAQ ticker (e.g., 'AAPL', 'MSFT')
  industry TEXT, -- e.g., 'Technology', 'Healthcare', 'Finance'
  sector TEXT, -- e.g., 'Information Technology', 'Health Care'
  market_cap BIGINT, -- Market capitalization in USD
  founded_year INTEGER,
  headquarters TEXT, -- City, State/Country
  website_url TEXT,
  logo_url TEXT, -- Company logo for display
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_companies_ticker ON companies(ticker_symbol);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);

-- =============================================================================
-- EXECUTIVES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS executives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly slug (e.g., 'tim-cook')
  current_title TEXT, -- e.g., 'Chief Executive Officer'
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  bio TEXT, -- Executive biography (from Wikidata or manual entry)
  wikidata_id TEXT, -- Wikidata entity ID (e.g., 'Q312129' for Tim Cook)
  linkedin_url TEXT,
  birth_year INTEGER,
  education TEXT, -- Degree(s) and institution(s)
  profile_image_url TEXT, -- Executive headshot
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_executives_slug ON executives(slug);
CREATE INDEX IF NOT EXISTS idx_executives_company ON executives(company_id);
CREATE INDEX IF NOT EXISTS idx_executives_name ON executives(full_name);

-- =============================================================================
-- COMPENSATION TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS compensation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  executive_id UUID NOT NULL REFERENCES executives(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  fiscal_year INTEGER NOT NULL, -- Year of compensation (e.g., 2023)

  -- Compensation components (all in USD)
  base_salary BIGINT NOT NULL DEFAULT 0,
  bonus BIGINT DEFAULT 0,
  stock_awards BIGINT DEFAULT 0, -- Fair value of stock awards granted
  option_awards BIGINT DEFAULT 0, -- Fair value of option awards granted
  non_equity_incentive BIGINT DEFAULT 0, -- Non-equity incentive plan compensation
  change_in_pension BIGINT DEFAULT 0, -- Change in pension value
  all_other_compensation BIGINT DEFAULT 0, -- All other compensation
  total_compensation BIGINT NOT NULL, -- Sum of all components

  -- Source documentation
  source_url TEXT NOT NULL, -- SEC EDGAR filing URL (DEF 14A proxy statement)
  filing_date DATE, -- Date the proxy statement was filed

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique compensation record per executive per year
  CONSTRAINT unique_executive_year UNIQUE(executive_id, fiscal_year)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_compensation_executive ON compensation(executive_id);
CREATE INDEX IF NOT EXISTS idx_compensation_company ON compensation(company_id);
CREATE INDEX IF NOT EXISTS idx_compensation_year ON compensation(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_compensation_total ON compensation(total_compensation DESC);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_executives_updated_at
  BEFORE UPDATE ON executives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compensation_updated_at
  BEFORE UPDATE ON compensation
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE executives ENABLE ROW LEVEL SECURITY;
ALTER TABLE compensation ENABLE ROW LEVEL SECURITY;

-- Allow public read access (data is public from SEC filings)
CREATE POLICY "Allow public read access on companies"
  ON companies FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on executives"
  ON executives FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on compensation"
  ON compensation FOR SELECT
  USING (true);

-- Only service role can insert/update/delete (via admin scripts)
CREATE POLICY "Service role can manage companies"
  ON companies
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage executives"
  ON executives
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage compensation"
  ON compensation
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================================================

-- Uncomment to insert sample data for testing
/*
-- Sample company: Apple Inc.
INSERT INTO companies (name, ticker_symbol, industry, sector, market_cap, founded_year, headquarters)
VALUES (
  'Apple Inc.',
  'AAPL',
  'Technology',
  'Information Technology',
  2800000000000, -- $2.8T market cap
  1976,
  'Cupertino, California'
) RETURNING id;

-- Sample executive: Tim Cook (use the company ID from above)
INSERT INTO executives (full_name, slug, current_title, company_id, wikidata_id)
VALUES (
  'Tim Cook',
  'tim-cook',
  'Chief Executive Officer',
  '<COMPANY_ID_FROM_ABOVE>', -- Replace with actual UUID
  'Q312129'
);

-- Sample compensation data (use executive and company IDs from above)
INSERT INTO compensation (
  executive_id,
  company_id,
  fiscal_year,
  base_salary,
  bonus,
  stock_awards,
  option_awards,
  non_equity_incentive,
  all_other_compensation,
  total_compensation,
  source_url,
  filing_date
)
VALUES (
  '<EXECUTIVE_ID_FROM_ABOVE>', -- Replace with actual UUID
  '<COMPANY_ID_FROM_ABOVE>', -- Replace with actual UUID
  2023,
  3000000, -- $3M base salary
  0,
  47260340, -- ~$47M stock awards
  0,
  10715000, -- ~$10.7M non-equity incentive
  46611, -- ~$46K other compensation
  60762011, -- ~$60.8M total
  'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000320193&type=DEF%2014A',
  '2024-01-11'
);
*/

-- =============================================================================
-- USEFUL QUERIES (For reference)
-- =============================================================================

-- Get executive with latest compensation
/*
SELECT
  e.*,
  c.name as company_name,
  c.ticker_symbol,
  comp.fiscal_year,
  comp.total_compensation
FROM executives e
LEFT JOIN companies c ON e.company_id = c.id
LEFT JOIN LATERAL (
  SELECT * FROM compensation
  WHERE executive_id = e.id
  ORDER BY fiscal_year DESC
  LIMIT 1
) comp ON true
WHERE e.slug = 'tim-cook';
*/

-- Get top 10 highest paid executives in a given year
/*
SELECT
  e.full_name,
  e.current_title,
  c.name as company_name,
  comp.total_compensation,
  comp.fiscal_year
FROM compensation comp
JOIN executives e ON comp.executive_id = e.id
JOIN companies c ON comp.company_id = c.id
WHERE comp.fiscal_year = 2023
ORDER BY comp.total_compensation DESC
LIMIT 10;
*/

-- Get executive compensation history (5-year trend)
/*
SELECT
  comp.fiscal_year,
  comp.base_salary,
  comp.stock_awards,
  comp.total_compensation
FROM compensation comp
WHERE comp.executive_id = '<EXECUTIVE_ID>'
ORDER BY comp.fiscal_year DESC
LIMIT 5;
*/
