CREATE TABLE invite_code (code TEXT PRIMARY KEY, max_uses INTEGER NOT NULL CHECK(max_uses > 0), used_count INTEGER NOT NULL DEFAULT 0 CHECK(used_count >= 0 AND used_count <= max_uses), expires_at INTEGER, created_at INTEGER NOT NULL, deleted_at INTEGER);
CREATE TABLE invite_redemption (user_id TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE, code TEXT NOT NULL REFERENCES invite_code(code), created_at INTEGER NOT NULL);
CREATE INDEX invite_redemption_code_idx ON invite_redemption(code);
