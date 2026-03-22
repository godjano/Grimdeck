-- Run this in Supabase SQL Editor
-- Community features: shared models, creator profiles

-- Shared painted models (community gallery)
CREATE TABLE IF NOT EXISTS shared_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_email TEXT,
  model_name TEXT NOT NULL,
  faction TEXT NOT NULL,
  photo_url TEXT,
  recipe JSONB, -- array of {name, hex, step}
  description TEXT,
  tags TEXT[], -- e.g. ['nmm', 'speed paint', 'display']
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creator profiles
CREATE TABLE IF NOT EXISTS creator_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  youtube_url TEXT,
  instagram_url TEXT,
  specialty TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Likes tracking
CREATE TABLE IF NOT EXISTS model_likes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  model_id UUID REFERENCES shared_models(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (user_id, model_id)
);

-- Enable RLS
ALTER TABLE shared_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_likes ENABLE ROW LEVEL SECURITY;

-- Everyone can read shared models and profiles
CREATE POLICY "Public read shared models" ON shared_models FOR SELECT USING (true);
CREATE POLICY "Public read profiles" ON creator_profiles FOR SELECT USING (true);
CREATE POLICY "Public read likes" ON model_likes FOR SELECT USING (true);

-- Users can manage their own content
CREATE POLICY "Users insert own models" ON shared_models FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own models" ON shared_models FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own models" ON shared_models FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users manage own profile" ON creator_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON creator_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users manage own likes" ON model_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own likes" ON model_likes FOR DELETE USING (auth.uid() = user_id);
