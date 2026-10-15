/*
# Create tables for mental wellness, maternal care, family health, and telemedicine

1. New Tables
- `mental_checkins`
  - `id` (uuid, primary key)
  - `mood` (text, mood level: "great" | "good" | "okay" | "low" | "poor")
  - `mood_score` (int, 1–5 numeric mood score)
  - `stress_level` (int, 1–5 stress level)
  - `sleep_hours` (numeric, hours of sleep)
  - `notes` (text, optional free-text journal entry)
  - `tags` (jsonb, array of tag strings like "anxious", "calm", "energetic")
  - `created_at` (timestamptz)

- `pregnancy_logs`
  - `id` (uuid, primary key)
  - `week` (int, gestational week)
  - `basal_temp` (numeric, basal body temperature in °C)
  - `missed_cycle` (boolean, whether a menstrual cycle was missed)
  - `symptoms` (jsonb, array of symptom IDs)
  - `hormonal_notes` (text, free-text hormonal change observations)
  - `risk_flags` (jsonb, array of warning sign strings like "preeclampsia", "bleeding")
  - `notes` (text, optional notes)
  - `created_at` (timestamptz)

- `family_members`
  - `id` (uuid, primary key)
  - `name` (text, family member name)
  - `relation` (text, relationship: "parent" | "grandparent" | "sibling" | "child" | "other")
  - `gender` (text, "male" | "female" | "other")
  - `age` (int, optional current age or age at death)
  - `deceased` (boolean, whether deceased)
  - `conditions` (jsonb, array of hereditary condition strings)
  - `dna_markers` (jsonb, array of genetic marker strings)
  - `notes` (text, optional)
  - `created_at` (timestamptz)

- `telemedicine_bookings`
  - `id` (uuid, primary key)
  - `provider_id` (text, identifier for the provider)
  - `provider_name` (text, provider display name)
  - `specialty` (text, medical specialty)
  - `session_type` (text, "video" | "chat" | "in-person" | "urgent-triage")
  - `scheduled_for` (timestamptz, when the session is booked)
  - `status` (text, "pending" | "confirmed" | "completed" | "cancelled")
  - `reason` (text, optional reason for the visit)
  - `created_at` (timestamptz)

2. Security
- Enable RLS on all new tables.
- Single-tenant app with no sign-in screen — allow anon + authenticated CRUD
  because the data is intentionally shared/public within this deployment.

3. Important Notes
- No user_id columns and no auth dependency — the app has no login screen.
- jsonb columns store structured data (symptoms, conditions, tags, markers)
  so each module can render rich detail views.
- Indexes on created_at for time-ordered queries.
*/

CREATE TABLE IF NOT EXISTS mental_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mood text NOT NULL DEFAULT 'okay',
  mood_score int NOT NULL DEFAULT 3,
  stress_level int NOT NULL DEFAULT 3,
  sleep_hours numeric,
  notes text,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mental_checkins_created_at ON mental_checkins (created_at DESC);
ALTER TABLE mental_checkins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_mental_checkins" ON mental_checkins;
CREATE POLICY "anon_select_mental_checkins" ON mental_checkins FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_mental_checkins" ON mental_checkins;
CREATE POLICY "anon_insert_mental_checkins" ON mental_checkins FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_mental_checkins" ON mental_checkins;
CREATE POLICY "anon_update_mental_checkins" ON mental_checkins FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_mental_checkins" ON mental_checkins;
CREATE POLICY "anon_delete_mental_checkins" ON mental_checkins FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS pregnancy_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week int,
  basal_temp numeric,
  missed_cycle boolean NOT NULL DEFAULT false,
  symptoms jsonb NOT NULL DEFAULT '[]'::jsonb,
  hormonal_notes text,
  risk_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pregnancy_logs_created_at ON pregnancy_logs (created_at DESC);
ALTER TABLE pregnancy_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_pregnancy_logs" ON pregnancy_logs;
CREATE POLICY "anon_select_pregnancy_logs" ON pregnancy_logs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_pregnancy_logs" ON pregnancy_logs;
CREATE POLICY "anon_insert_pregnancy_logs" ON pregnancy_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_pregnancy_logs" ON pregnancy_logs;
CREATE POLICY "anon_update_pregnancy_logs" ON pregnancy_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_pregnancy_logs" ON pregnancy_logs;
CREATE POLICY "anon_delete_pregnancy_logs" ON pregnancy_logs FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  relation text NOT NULL DEFAULT 'other',
  gender text,
  age int,
  deceased boolean NOT NULL DEFAULT false,
  conditions jsonb NOT NULL DEFAULT '[]'::jsonb,
  dna_markers jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_family_members_created_at ON family_members (created_at DESC);
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_family_members" ON family_members;
CREATE POLICY "anon_select_family_members" ON family_members FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_family_members" ON family_members;
CREATE POLICY "anon_insert_family_members" ON family_members FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_family_members" ON family_members;
CREATE POLICY "anon_update_family_members" ON family_members FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_family_members" ON family_members;
CREATE POLICY "anon_delete_family_members" ON family_members FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS telemedicine_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id text NOT NULL,
  provider_name text NOT NULL,
  specialty text NOT NULL,
  session_type text NOT NULL DEFAULT 'video',
  scheduled_for timestamptz,
  status text NOT NULL DEFAULT 'pending',
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_telemedicine_bookings_created_at ON telemedicine_bookings (created_at DESC);
ALTER TABLE telemedicine_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_telemedicine_bookings" ON telemedicine_bookings;
CREATE POLICY "anon_select_telemedicine_bookings" ON telemedicine_bookings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_telemedicine_bookings" ON telemedicine_bookings;
CREATE POLICY "anon_insert_telemedicine_bookings" ON telemedicine_bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_telemedicine_bookings" ON telemedicine_bookings;
CREATE POLICY "anon_update_telemedicine_bookings" ON telemedicine_bookings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_telemedicine_bookings" ON telemedicine_bookings;
CREATE POLICY "anon_delete_telemedicine_bookings" ON telemedicine_bookings FOR DELETE TO anon, authenticated USING (true);
