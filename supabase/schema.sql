-- 1. Create custom types
CREATE TYPE question_category AS ENUM ('Persepsi Bahaya', 'Wawasan', 'Pengetahuan');

-- 2. Create Profiles table (linked to auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT DEFAULT 'admin' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Questions table
CREATE TABLE questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category question_category NOT NULL,
    text TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT, -- 'video' or 'image'
    options JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of string options
    correct_answer TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Test Results table
CREATE TABLE test_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    participant_name TEXT NOT NULL,
    participant_email TEXT NOT NULL,
    sim_type TEXT NOT NULL CHECK (sim_type IN ('A', 'C')),
    score_persepsi INTEGER NOT NULL DEFAULT 0,
    score_wawasan INTEGER NOT NULL DEFAULT 0,
    score_pengetahuan INTEGER NOT NULL DEFAULT 0,
    total_score INTEGER NOT NULL DEFAULT 0,
    pass_status BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Setup RLS (Row Level Security)

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Profiles: Only admins can view profiles
CREATE POLICY "Admins can view profiles" ON profiles
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Questions: Admins can do everything, public can only read
CREATE POLICY "Admins can manage questions" ON questions
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Public can view questions" ON questions
    FOR SELECT TO public
    USING (true);

-- Test Results: Admins can do everything, public can only insert
CREATE POLICY "Admins can manage test results" ON test_results
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Public can insert test results" ON test_results
    FOR INSERT TO public
    WITH CHECK (true);
    
-- Public can view their own test results right after submission (optional, but good if you need to fetch it by ID on the results page)
CREATE POLICY "Public can view their own test results" ON test_results
    FOR SELECT TO public
    USING (true);

-- 6. Setup Storage
-- Note: You may need to create the bucket 'question-media' manually in the Supabase Dashboard
-- or using API. Then apply policies:

-- Storage Policies (Assuming bucket 'question-media' exists)
-- Allow public to read
CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'question-media' );

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Auth Insert"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK ( bucket_id = 'question-media' );

CREATE POLICY "Auth Update"
    ON storage.objects FOR UPDATE TO authenticated
    USING ( bucket_id = 'question-media' );

CREATE POLICY "Auth Delete"
    ON storage.objects FOR DELETE TO authenticated
    USING ( bucket_id = 'question-media' );
