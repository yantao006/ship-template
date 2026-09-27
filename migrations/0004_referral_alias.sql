CREATE TABLE account_referral_alias (code TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE);
CREATE INDEX account_referral_alias_user ON account_referral_alias(user_id);
