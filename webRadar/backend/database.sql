

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    hwid TEXT,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    data JSONB NOT NULL,
    is_public BOOLEAN DEFAULT false,
    downloads INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS radar_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    share_code TEXT UNIQUE NOT NULL,
    map_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_code ON otp_codes(code);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires ON otp_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_configs_user_id ON configs(user_id);
CREATE INDEX IF NOT EXISTS idx_configs_public ON configs(is_public);
CREATE INDEX IF NOT EXISTS idx_radar_sessions_share_code ON radar_sessions(share_code);
CREATE INDEX IF NOT EXISTS idx_radar_sessions_user_id ON radar_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_radar_sessions_expires ON radar_sessions(expires_at);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE radar_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Service can manage OTP codes" ON otp_codes;
DROP POLICY IF EXISTS "Service can manage configs" ON configs;
DROP POLICY IF EXISTS "Service can manage radar sessions" ON radar_sessions;
DROP POLICY IF EXISTS "Users can read own configs" ON configs;
DROP POLICY IF EXISTS "Users can insert own configs" ON configs;
DROP POLICY IF EXISTS "Users can update own configs" ON configs;
DROP POLICY IF EXISTS "Users can delete own configs" ON configs;
DROP POLICY IF EXISTS "Users can read own radar sessions" ON radar_sessions;
DROP POLICY IF EXISTS "Users can insert own radar sessions" ON radar_sessions;
DROP POLICY IF EXISTS "Users can update own radar sessions" ON radar_sessions;
DROP POLICY IF EXISTS "Users can delete own radar sessions" ON radar_sessions;
DROP POLICY IF EXISTS "Public can read radar sessions by share code" ON radar_sessions;
CREATE POLICY "Service role can manage users" ON users FOR ALL USING (true);
CREATE POLICY "Service can manage OTP codes" ON otp_codes FOR ALL USING (true);
CREATE POLICY "Service can manage configs" ON configs FOR ALL USING (true);
CREATE POLICY "Service can manage radar sessions" ON radar_sessions FOR ALL USING (true);
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Users can read own configs" ON configs FOR SELECT USING (user_id::text = auth.uid()::text OR is_public = true);
CREATE POLICY "Users can insert own configs" ON configs FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "Users can update own configs" ON configs FOR UPDATE USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can delete own configs" ON configs FOR DELETE USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can read own radar sessions" ON radar_sessions FOR SELECT USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can insert own radar sessions" ON radar_sessions FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "Users can update own radar sessions" ON radar_sessions FOR UPDATE USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can delete own radar sessions" ON radar_sessions FOR DELETE USING (user_id::text = auth.uid()::text);
CREATE POLICY "Public can read radar sessions by share code" ON radar_sessions FOR SELECT USING (true);