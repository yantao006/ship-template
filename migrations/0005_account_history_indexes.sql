CREATE INDEX credit_entry_user_history ON credit_entry(user_id, created_at DESC, id DESC);
CREATE INDEX credit_lot_user_source ON credit_lot(user_id, source, source_id);
