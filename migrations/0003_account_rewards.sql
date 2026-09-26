CREATE TABLE account_checkin (user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, day TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY(user_id, day));
CREATE TABLE account_share (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, url TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')), created_at INTEGER NOT NULL);
CREATE INDEX account_share_user ON account_share(user_id, created_at DESC);
CREATE UNIQUE INDEX account_share_unique_url ON account_share(user_id, url);
CREATE TABLE account_referral_code (user_id TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE, code TEXT NOT NULL UNIQUE);
CREATE TABLE account_referral (referred_id TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE, inviter_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, created_at INTEGER NOT NULL, CHECK(referred_id <> inviter_id));
CREATE INDEX account_referral_inviter ON account_referral(inviter_id);
