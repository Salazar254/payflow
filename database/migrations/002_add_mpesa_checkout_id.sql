-- Migration: Add mpesa_checkout_request_id to locks table
ALTER TABLE locks ADD COLUMN mpesa_checkout_request_id VARCHAR(50);
CREATE INDEX idx_locks_mpesa_checkout_id ON locks(mpesa_checkout_request_id) WHERE mpesa_checkout_request_id IS NOT NULL;
