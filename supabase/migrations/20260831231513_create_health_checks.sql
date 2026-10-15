/*
# Create health_checks table (single-tenant, no auth)

1. New Tables
- `health_checks`
  - `id` (uuid, primary key)
  - `patient_name` (text, name of the person assessed — optional, defaults to "Self")
  - `age` (int, optional age of the person)
  - `symptoms` (jsonb, array of symptom IDs the user selected during the questionnaire)
  - `symptom_count` (int, number of symptoms flagged — denormalized for quick display)
  - `risk_level` (text, computed risk level: "low" | "moderate" | "high" | "critical")
  - `risk_score` (int, 0–100 numeric risk score)
  - `signals` (jsonb, placeholder physical signal readings like heart rate, temperature, spo2)
  - `insights` (jsonb, array of generated insight strings shown on the results screen)
  - `recommendations` (jsonb, array of recommended next-step strings)
  - `notes` (text, optional free-text notes)
  - `created_at` (timestamptz, when the check was recorded)

2. Security
- Enable RLS on `health_checks`.
- This is a single-tenant app with no sign-in screen, so the anon-key frontend
  must be able to read and write its own data. Allow anon + authenticated CRUD
  because the data is intentionally shared/public within this deployment.

3. Important Notes
- No user_id column and no auth dependency — the app has no login screen.
- jsonb columns store structured symptom selections, signal readings, and
  generated guidance so the results screen can render any past check fully.
- Index on created_at so the dashboard's "recent checks" query is fast.
*/

CREATE TABLE IF NOT EXISTS health_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL DEFAULT 'Self',
  age int,
  symptoms jsonb NOT NULL DEFAULT '[]'::jsonb,
  symptom_count int NOT NULL DEFAULT 0,
  risk_level text NOT NULL DEFAULT 'low',
  risk_score int NOT NULL DEFAULT 0,
  signals jsonb NOT NULL DEFAULT '{}'::jsonb,
  insights jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_checks_created_at
  ON health_checks (created_at DESC);

ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_health_checks" ON health_checks;
CREATE POLICY "anon_select_health_checks" ON health_checks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_health_checks" ON health_checks;
CREATE POLICY "anon_insert_health_checks" ON health_checks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_health_checks" ON health_checks;
CREATE POLICY "anon_update_health_checks" ON health_checks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_health_checks" ON health_checks;
CREATE POLICY "anon_delete_health_checks" ON health_checks FOR DELETE
  TO anon, authenticated USING (true);
