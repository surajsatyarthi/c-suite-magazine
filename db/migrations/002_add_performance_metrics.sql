-- Migration: Add performance metrics to compensation table
-- This stores specific performance targets and achievement levels for each compensation component

ALTER TABLE compensation
ADD COLUMN IF NOT EXISTS performance_metrics JSONB;

-- Add index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_compensation_performance_metrics
ON compensation USING GIN (performance_metrics);

COMMENT ON COLUMN compensation.performance_metrics IS
'Stores detailed performance targets and achievement data as JSON. Example structure:
{
  "fiscal_year": 2023,
  "performance_period": "October 1, 2022 - September 30, 2023",
  "metrics": [
    {
      "category": "Revenue Growth",
      "weight": 50,
      "target": 400000000000,
      "actual": 383285000000,
      "achievement_pct": 95.8,
      "payout_pct": 92
    }
  ],
  "stock_vesting": {
    "rsu_grant_date": "2023-09-01",
    "vesting_schedule": "25% per year over 4 years",
    "performance_conditions": "Continued employment"
  },
  "annual_incentive_targets": {
    "revenue_target": 400000000000,
    "operating_income_target": 120000000000,
    "strategic_objectives": ["Product innovation", "ESG goals"]
  },
  "notes": "Additional context about compensation decisions"
}';
