-- Fix the onboarding_sessions table to allow temporary business IDs
-- Drop the foreign key constraint that's preventing temporary business IDs
ALTER TABLE public.onboarding_sessions 
DROP CONSTRAINT IF EXISTS onboarding_sessions_business_id_fkey;

-- The business_id column will now accept any text value
-- We'll handle the business relationship logic in our application code 