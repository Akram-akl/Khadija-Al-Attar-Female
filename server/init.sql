-- =====================================================
-- Schema for برنامج خديجة العطار - الحلقات النسائية
-- مشروع مستقل كلياً - Self-Hosted on VPS (Hostinger)
-- =====================================================

-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create anonymous role for PostgREST if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN;
    END IF;
    GRANT USAGE ON SCHEMA public TO anon;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
    GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon;
END $$;

-- 1. Students Table (الطالبات)
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    student_number TEXT,
    parent_phone TEXT,
    national_id TEXT,
    last_association_exam TEXT,
    level TEXT NOT NULL,
    icon TEXT,
    password TEXT,
    readings JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='national_id') THEN
        ALTER TABLE students ADD COLUMN national_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='last_association_exam') THEN
        ALTER TABLE students ADD COLUMN last_association_exam TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='readings') THEN
        ALTER TABLE students ADD COLUMN readings JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- 2. Competitions Table
CREATE TABLE IF NOT EXISTS competitions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '🏆',
    level TEXT NOT NULL,
    active BOOLEAN DEFAULT FALSE,
    criteria JSONB DEFAULT '[]'::jsonb,
    absent_excuse NUMERIC DEFAULT 1,
    absent_no_excuse NUMERIC DEFAULT 4,
    activity_points NUMERIC DEFAULT 0,
    activity_absent_points NUMERIC DEFAULT 0,
    memorization_points NUMERIC DEFAULT 0,
    memorization_negative_points NUMERIC DEFAULT 0,
    review_points NUMERIC DEFAULT 0,
    review_negative_points NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='competitions' AND column_name='activity_points') THEN
        ALTER TABLE competitions ADD COLUMN activity_points NUMERIC DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='competitions' AND column_name='activity_absent_points') THEN
        ALTER TABLE competitions ADD COLUMN activity_absent_points NUMERIC DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='competitions' AND column_name='memorization_points') THEN
        ALTER TABLE competitions ADD COLUMN memorization_points NUMERIC DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='competitions' AND column_name='memorization_negative_points') THEN
        ALTER TABLE competitions ADD COLUMN memorization_negative_points NUMERIC DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='competitions' AND column_name='review_points') THEN
        ALTER TABLE competitions ADD COLUMN review_points NUMERIC DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='competitions' AND column_name='review_negative_points') THEN
        ALTER TABLE competitions ADD COLUMN review_negative_points NUMERIC DEFAULT 0;
    END IF;
END $$;

-- 3. Groups Table
CREATE TABLE IF NOT EXISTS groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '🛡️',
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    level TEXT NOT NULL,
    leader TEXT,
    deputy TEXT,
    members TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Scores Table
CREATE TABLE IF NOT EXISTS scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    group_id UUID,
    criteria_id TEXT,
    criteria_name TEXT,
    points NUMERIC NOT NULL,
    type TEXT,
    level TEXT,
    "date" TEXT,
    timestamp BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    quran_type TEXT,
    quran_section TEXT,
    quran_start_sura INTEGER,
    quran_end_sura INTEGER,
    quran_start_aya INTEGER,
    quran_end_aya INTEGER,
    quran_grade TEXT,
    note_text TEXT,
    visibility TEXT,
    is_collective BOOLEAN DEFAULT FALSE
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scores' AND column_name='date') THEN
        ALTER TABLE scores ADD COLUMN "date" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scores' AND column_name='quran_end_aya') THEN
        ALTER TABLE scores ADD COLUMN quran_end_aya INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scores' AND column_name='quran_grade') THEN
        ALTER TABLE scores ADD COLUMN quran_grade TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scores' AND column_name='note_text') THEN
        ALTER TABLE scores ADD COLUMN note_text TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scores' AND column_name='visibility') THEN
        ALTER TABLE scores ADD COLUMN visibility TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scores' AND column_name='is_collective') THEN
        ALTER TABLE scores ADD COLUMN is_collective BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 5. Teachers Table (المعلمات)
CREATE TABLE IF NOT EXISTS teachers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    level TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Activity Days Table
CREATE TABLE IF NOT EXISTS activity_days (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    points NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Group Scores Table
CREATE TABLE IF NOT EXISTS group_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    reason TEXT,
    points NUMERIC NOT NULL,
    type TEXT,
    level TEXT,
    date TEXT,
    timestamp BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Student Plans Table
CREATE TABLE IF NOT EXISTS student_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    start_sura INTEGER NOT NULL,
    start_ayah INTEGER NOT NULL,
    end_sura INTEGER NOT NULL,
    end_ayah INTEGER NOT NULL,
    start_page NUMERIC NOT NULL,
    end_page NUMERIC NOT NULL,
    active_week_days JSONB DEFAULT '["sun","mon","tue","wed","thu"]'::jsonb,
    study_days JSONB DEFAULT '[0,1,2,3,4]'::jsonb,
    pages_per_day NUMERIC DEFAULT 1,
    original_snapshot JSONB,
    level TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Plan Daily Records Table
CREATE TABLE IF NOT EXISTS plan_daily_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id UUID REFERENCES student_plans(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    planned_start_page NUMERIC,
    planned_end_page NUMERIC,
    planned_sections JSONB DEFAULT '[]'::jsonb,
    planned_start_sura INTEGER,
    planned_start_ayah INTEGER,
    planned_end_sura INTEGER,
    planned_end_ayah INTEGER,
    actual_start_page NUMERIC,
    actual_end_page NUMERIC,
    actual_sections JSONB DEFAULT '[]'::jsonb,
    actual_start_sura INTEGER,
    actual_start_ayah INTEGER,
    actual_end_sura INTEGER,
    actual_end_ayah INTEGER,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    undo_snapshot JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Level Settings Table
CREATE TABLE IF NOT EXISTS level_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level TEXT NOT NULL,
    feature_name TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(level, feature_name)
);

ALTER TABLE level_settings ADD COLUMN IF NOT EXISTS feature_name TEXT;
ALTER TABLE level_settings ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE level_settings ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
ALTER TABLE level_settings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE level_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE level_settings DROP CONSTRAINT IF EXISTS level_settings_level_key;

-- 11. Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    level TEXT,
    role TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Transfer Requests Table
CREATE TABLE IF NOT EXISTS transfer_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    from_level TEXT NOT NULL,
    to_level TEXT NOT NULL,
    delete_old_data BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Tomorrow Plans Table
CREATE TABLE IF NOT EXISTS tomorrow_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    level TEXT,
    for_date TEXT NOT NULL,
    hifz_start_sura INTEGER,
    hifz_start_ayah INTEGER,
    hifz_end_sura INTEGER,
    hifz_end_ayah INTEGER,
    hifz_start_page NUMERIC,
    hifz_end_page NUMERIC,
    hifz_sections JSONB DEFAULT '[]'::jsonb,
    review_start_sura INTEGER,
    review_start_ayah INTEGER,
    review_end_sura INTEGER,
    review_end_ayah INTEGER,
    review_start_page NUMERIC,
    review_end_page NUMERIC,
    review_sections JSONB DEFAULT '[]'::jsonb,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, for_date)
);

-- 14. Forms (Surveys) Table
CREATE TABLE IF NOT EXISTS forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    level TEXT NOT NULL,
    fields JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    end_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS form_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    level TEXT NOT NULL,
    responses JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(form_id, student_id)
);

-- 15. Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    level TEXT,
    role TEXT,
    device_info TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Backups Table
CREATE TABLE IF NOT EXISTS backups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level TEXT NOT NULL,
    backup_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Enable Row Level Security (RLS)
-- =====================================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_daily_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tomorrow_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Create Policies
-- =====================================================

-- Students
DROP POLICY IF EXISTS "Allow public read students" ON students;
CREATE POLICY "Allow public read students" ON students FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert students" ON students;
CREATE POLICY "Allow public insert students" ON students FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update students" ON students;
CREATE POLICY "Allow public update students" ON students FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete students" ON students;
CREATE POLICY "Allow public delete students" ON students FOR DELETE USING (true);

-- Competitions
DROP POLICY IF EXISTS "Allow public read competitions" ON competitions;
CREATE POLICY "Allow public read competitions" ON competitions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert competitions" ON competitions;
CREATE POLICY "Allow public insert competitions" ON competitions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update competitions" ON competitions;
CREATE POLICY "Allow public update competitions" ON competitions FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete competitions" ON competitions;
CREATE POLICY "Allow public delete competitions" ON competitions FOR DELETE USING (true);

-- Groups
DROP POLICY IF EXISTS "Allow public read groups" ON groups;
CREATE POLICY "Allow public read groups" ON groups FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert groups" ON groups;
CREATE POLICY "Allow public insert groups" ON groups FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update groups" ON groups;
CREATE POLICY "Allow public update groups" ON groups FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete groups" ON groups;
CREATE POLICY "Allow public delete groups" ON groups FOR DELETE USING (true);

-- Scores
DROP POLICY IF EXISTS "Allow public read scores" ON scores;
CREATE POLICY "Allow public read scores" ON scores FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert scores" ON scores;
CREATE POLICY "Allow public insert scores" ON scores FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update scores" ON scores;
CREATE POLICY "Allow public update scores" ON scores FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete scores" ON scores;
CREATE POLICY "Allow public delete scores" ON scores FOR DELETE USING (true);

-- Teachers
DROP POLICY IF EXISTS "Allow public read teachers" ON teachers;
CREATE POLICY "Allow public read teachers" ON teachers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert teachers" ON teachers;
CREATE POLICY "Allow public insert teachers" ON teachers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update teachers" ON teachers;
CREATE POLICY "Allow public update teachers" ON teachers FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete teachers" ON teachers;
CREATE POLICY "Allow public delete teachers" ON teachers FOR DELETE USING (true);

-- Activity Days
DROP POLICY IF EXISTS "Allow public read activity_days" ON activity_days;
CREATE POLICY "Allow public read activity_days" ON activity_days FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert activity_days" ON activity_days;
CREATE POLICY "Allow public insert activity_days" ON activity_days FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update activity_days" ON activity_days;
CREATE POLICY "Allow public update activity_days" ON activity_days FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete activity_days" ON activity_days;
CREATE POLICY "Allow public delete activity_days" ON activity_days FOR DELETE USING (true);

-- Group Scores
DROP POLICY IF EXISTS "Allow public read group_scores" ON group_scores;
CREATE POLICY "Allow public read group_scores" ON group_scores FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert group_scores" ON group_scores;
CREATE POLICY "Allow public insert group_scores" ON group_scores FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update group_scores" ON group_scores;
CREATE POLICY "Allow public update group_scores" ON group_scores FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete group_scores" ON group_scores;
CREATE POLICY "Allow public delete group_scores" ON group_scores FOR DELETE USING (true);

-- Student Plans
DROP POLICY IF EXISTS "Allow public read student_plans" ON student_plans;
CREATE POLICY "Allow public read student_plans" ON student_plans FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert student_plans" ON student_plans;
CREATE POLICY "Allow public insert student_plans" ON student_plans FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update student_plans" ON student_plans;
CREATE POLICY "Allow public update student_plans" ON student_plans FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete student_plans" ON student_plans;
CREATE POLICY "Allow public delete student_plans" ON student_plans FOR DELETE USING (true);

-- Plan Daily Records
DROP POLICY IF EXISTS "Allow public read plan_daily_records" ON plan_daily_records;
CREATE POLICY "Allow public read plan_daily_records" ON plan_daily_records FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert plan_daily_records" ON plan_daily_records;
CREATE POLICY "Allow public insert plan_daily_records" ON plan_daily_records FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update plan_daily_records" ON plan_daily_records;
CREATE POLICY "Allow public update plan_daily_records" ON plan_daily_records FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete plan_daily_records" ON plan_daily_records;
CREATE POLICY "Allow public delete plan_daily_records" ON plan_daily_records FOR DELETE USING (true);

-- Level Settings (تأمين كلمات المرور)
DROP POLICY IF EXISTS "Hide passwords from level_settings" ON level_settings;
CREATE POLICY "Hide passwords from level_settings" ON level_settings FOR SELECT
  USING (feature_name NOT IN ('auth_passwords', 'master_password'));
DROP POLICY IF EXISTS "Allow public insert level_settings" ON level_settings;
CREATE POLICY "Allow public insert level_settings" ON level_settings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update level_settings" ON level_settings;
CREATE POLICY "Allow public update level_settings" ON level_settings FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete level_settings" ON level_settings;
CREATE POLICY "Allow public delete level_settings" ON level_settings FOR DELETE USING (true);

-- Feedback
DROP POLICY IF EXISTS "Allow public read feedback" ON feedback;
CREATE POLICY "Allow public read feedback" ON feedback FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert feedback" ON feedback;
CREATE POLICY "Allow public insert feedback" ON feedback FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update feedback" ON feedback;
CREATE POLICY "Allow public update feedback" ON feedback FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete feedback" ON feedback;
CREATE POLICY "Allow public delete feedback" ON feedback FOR DELETE USING (true);

-- Transfer Requests
DROP POLICY IF EXISTS "Allow public all transfer_requests" ON transfer_requests;
CREATE POLICY "Allow public all transfer_requests" ON transfer_requests FOR ALL USING (true) WITH CHECK (true);

-- Tomorrow Plans
DROP POLICY IF EXISTS "Allow public read tomorrow_plans" ON tomorrow_plans;
CREATE POLICY "Allow public read tomorrow_plans" ON tomorrow_plans FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert tomorrow_plans" ON tomorrow_plans;
CREATE POLICY "Allow public insert tomorrow_plans" ON tomorrow_plans FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update tomorrow_plans" ON tomorrow_plans;
CREATE POLICY "Allow public update tomorrow_plans" ON tomorrow_plans FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete tomorrow_plans" ON tomorrow_plans;
CREATE POLICY "Allow public delete tomorrow_plans" ON tomorrow_plans FOR DELETE USING (true);

-- Forms
DROP POLICY IF EXISTS "Allow public read forms" ON forms;
CREATE POLICY "Allow public read forms" ON forms FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert forms" ON forms;
CREATE POLICY "Allow public insert forms" ON forms FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update forms" ON forms;
CREATE POLICY "Allow public update forms" ON forms FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete forms" ON forms;
CREATE POLICY "Allow public delete forms" ON forms FOR DELETE USING (true);

-- Form Responses
DROP POLICY IF EXISTS "Allow public read form_responses" ON form_responses;
CREATE POLICY "Allow public read form_responses" ON form_responses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert form_responses" ON form_responses;
CREATE POLICY "Allow public insert form_responses" ON form_responses FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update form_responses" ON form_responses;
CREATE POLICY "Allow public update form_responses" ON form_responses FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete form_responses" ON form_responses;
CREATE POLICY "Allow public delete form_responses" ON form_responses FOR DELETE USING (true);

-- Audit Log
DROP POLICY IF EXISTS "Allow public insert audit_log" ON audit_log;
CREATE POLICY "Allow public insert audit_log" ON audit_log FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public read audit_log" ON audit_log;
CREATE POLICY "Allow public read audit_log" ON audit_log FOR SELECT USING (true);

-- Backups
DROP POLICY IF EXISTS "Allow public all backups" ON backups;
CREATE POLICY "Allow public all backups" ON backups FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- RPC Functions
-- =====================================================

-- VERIFY PASSWORD
CREATE OR REPLACE FUNCTION verify_password(p_level TEXT, p_role TEXT, p_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_settings JSONB;
    v_master JSONB;
    v_correct TEXT;
BEGIN
    -- Check master password first
    SELECT settings INTO v_master
    FROM level_settings
    WHERE level = '_global' AND feature_name = 'master_password' AND is_enabled = true
    LIMIT 1;
    
    IF v_master IS NOT NULL AND v_master->>'password' = p_password THEN
        RETURN true;
    END IF;
    
    -- Check level-specific password
    SELECT settings INTO v_settings
    FROM level_settings
    WHERE level = p_level AND feature_name = 'auth_passwords' AND is_enabled = true
    LIMIT 1;
    
    IF v_settings IS NULL THEN
        RETURN false;
    END IF;
    
    IF p_role = 'teacher' THEN
        v_correct := v_settings->>'teacherPass';
    ELSIF p_role = 'student' THEN
        v_correct := v_settings->>'studentPass';
    ELSE
        RETURN false;
    END IF;
    
    RETURN v_correct = p_password;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- GET LEADERBOARD
DROP FUNCTION IF EXISTS get_leaderboard(text, uuid);
CREATE OR REPLACE FUNCTION get_leaderboard(p_level TEXT, p_competition_id UUID DEFAULT NULL)
RETURNS TABLE(student_id UUID, student_name TEXT, total_points NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.name,
           COALESCE(SUM(sc.points), 0)::NUMERIC as total
    FROM students s
    LEFT JOIN scores sc ON sc.student_id = s.id
        AND sc.level = p_level
        AND (p_competition_id IS NULL OR sc.competition_id = p_competition_id)
    WHERE s.level = p_level
    GROUP BY s.id, s.name
    ORDER BY total DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Initial Auth Passwords - الحلقات النسائية الثماني فقط
-- =====================================================
DELETE FROM level_settings WHERE feature_name IN ('auth_passwords', 'master_password');

INSERT INTO level_settings (level, feature_name, is_enabled, settings)
VALUES 
    -- الحلقات النسائية الثماني (مسجد خديجة العطار)
    ('safaa',       'auth_passwords', true, '{"teacherPass": "6545"}'::jsonb),
    ('marwa',       'auth_passwords', true, '{"teacherPass": "8757"}'::jsonb),
    ('salwa',       'auth_passwords', true, '{"teacherPass": "5250"}'::jsonb),
    ('amal',        'auth_passwords', true, '{"teacherPass": "9889"}'::jsonb),
    ('abeer',       'auth_passwords', true, '{"teacherPass": "9422"}'::jsonb),
    ('hadeel',      'auth_passwords', true, '{"teacherPass": "5305"}'::jsonb),
    ('mona',        'auth_passwords', true, '{"teacherPass": "2742"}'::jsonb),
    ('afnan',       'auth_passwords', true, '{"teacherPass": "4654"}'::jsonb),
    
    -- Master Password (الكود الماستر)
    ('_global',     'master_password', true, '{"password": "779812"}'::jsonb);

-- =====================================================
-- Create Indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_activity_days_competition_id ON activity_days(competition_id);
CREATE INDEX IF NOT EXISTS idx_activity_days_date ON activity_days(date);
CREATE INDEX IF NOT EXISTS idx_scores_student_id ON scores(student_id);
CREATE INDEX IF NOT EXISTS idx_scores_competition_id ON scores(competition_id);
CREATE INDEX IF NOT EXISTS idx_scores_date ON scores(date);
CREATE INDEX IF NOT EXISTS idx_scores_level ON scores(level);
CREATE INDEX IF NOT EXISTS idx_scores_level_student_id ON scores(level, student_id);
CREATE INDEX IF NOT EXISTS idx_students_level ON students(level);
CREATE INDEX IF NOT EXISTS idx_students_parent_phone ON students(parent_phone);
CREATE INDEX IF NOT EXISTS idx_groups_competition_id ON groups(competition_id);
CREATE INDEX IF NOT EXISTS idx_teachers_level ON teachers(level);
CREATE INDEX IF NOT EXISTS idx_group_scores_group_id ON group_scores(group_id);
CREATE INDEX IF NOT EXISTS idx_group_scores_competition_id ON group_scores(competition_id);
CREATE INDEX IF NOT EXISTS idx_level_settings_level ON level_settings(level);
CREATE INDEX IF NOT EXISTS idx_tomorrow_plans_student_date ON tomorrow_plans(student_id, for_date);
CREATE INDEX IF NOT EXISTS idx_tomorrow_plans_level ON tomorrow_plans(level);

-- =====================================================
-- Trigger: auto update updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS set_timestamp ON %I', t);
        EXECUTE format('CREATE TRIGGER set_timestamp BEFORE UPDATE ON %I FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp()', t);
    END LOOP;
END;
$$;

-- Trigger: Cleanup student from groups on deletion
CREATE OR REPLACE FUNCTION cleanup_student_from_groups()
RETURNS TRIGGER AS $$
BEGIN
    -- Remove student from members array in groups (safe for both uuid[] and text[])
    BEGIN
        UPDATE groups
        SET members = array_remove(members, OLD.id)
        WHERE OLD.id = ANY(members);
    EXCEPTION WHEN OTHERS THEN
        UPDATE groups
        SET members = array_remove(members, OLD.id::text)
        WHERE OLD.id::text = ANY(members);
    END;

    -- Clear leader if the deleted student was the leader (safe comparison)
    UPDATE groups
    SET leader = NULL
    WHERE leader::text = OLD.id::text;

    -- Clear deputy if the deleted student was the deputy (safe comparison)
    UPDATE groups
    SET deputy = NULL
    WHERE deputy::text = OLD.id::text;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cleanup_student_groups ON students;
CREATE TRIGGER trigger_cleanup_student_groups
BEFORE DELETE ON students
FOR EACH ROW
EXECUTE FUNCTION cleanup_student_from_groups();

NOTIFY pgrst, 'reload schema';
