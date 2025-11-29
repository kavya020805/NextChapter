-- Add subscription fields to user_profiles if they don't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'Free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;

-- Add check constraint for subscription_plan
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_profiles_subscription_plan_check'
  ) THEN
    ALTER TABLE user_profiles 
    ADD CONSTRAINT user_profiles_subscription_plan_check 
    CHECK (subscription_plan IN ('Free', 'Pro', 'Premium'));
  END IF;
END $$;

-- Add check constraint for subscription_status
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_profiles_subscription_status_check'
  ) THEN
    ALTER TABLE user_profiles 
    ADD CONSTRAINT user_profiles_subscription_status_check 
    CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'paused'));
  END IF;
END $$;

-- Function to sync subscription to user profile
CREATE OR REPLACE FUNCTION sync_subscription_to_profile()
RETURNS TRIGGER AS $$
DECLARE
  plan_name TEXT;
BEGIN
  -- Get plan name from plan_id
  plan_name := INITCAP(NEW.plan_id);
  
  -- Update user profile
  UPDATE user_profiles
  SET 
    subscription_plan = plan_name,
    subscription_status = NEW.status,
    subscription_start_date = NEW.started_at,
    subscription_end_date = NEW.expires_at,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-sync subscriptions to profile
DROP TRIGGER IF EXISTS trigger_sync_subscription_to_profile ON user_subscriptions;
CREATE TRIGGER trigger_sync_subscription_to_profile
AFTER INSERT OR UPDATE ON user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION sync_subscription_to_profile();

-- Function to check and expire subscriptions
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void AS $$
BEGIN
  -- Update expired subscriptions in user_subscriptions
  UPDATE user_subscriptions
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
    
  -- Update user profiles for expired subscriptions
  UPDATE user_profiles
  SET 
    subscription_plan = 'Free',
    subscription_status = 'expired',
    updated_at = NOW()
  WHERE user_id IN (
    SELECT user_id 
    FROM user_subscriptions 
    WHERE status = 'expired'
      AND expires_at < NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION sync_subscription_to_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION expire_subscriptions() TO authenticated;

-- Insert default subscription plans if they don't exist
INSERT INTO subscription_plans (id, name, description, monthly_price, yearly_price, features, is_active)
VALUES 
  ('free', 'Free', 'Perfect for casual readers', 0, 0, 
   '["Access to 5,000+ books", "Basic AI recommendations", "Online reading", "Personal library", "Bookmarking and highlighting"]'::jsonb, 
   true),
  ('pro', 'Pro', 'For avid readers and book lovers', 49900, 49900,
   '["Access to 10,000+ books", "Advanced AI recommendations", "AI-powered summaries", "Unlimited personal library", "Reading history and progress tracking", "Multimedia content access", "Reading streaks and challenges", "Personalized reading analytics"]'::jsonb,
   true),
  ('premium', 'Premium', 'The ultimate reading experience', 99900, 99900,
   '["Access to all books", "Premium AI recommendations", "Unlimited AI summaries", "Unlimited personal library", "Personal AI custom character chatbot", "AI image generation for book scenes", "Multiple device reading", "Early access to new features", "Advanced personalized reading analytics"]'::jsonb,
   true)
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  monthly_price = EXCLUDED.monthly_price,
  yearly_price = EXCLUDED.yearly_price,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Set all existing users to Free plan if they don't have one
UPDATE user_profiles
SET subscription_plan = 'Free'
WHERE subscription_plan IS NULL;

UPDATE user_profiles
SET subscription_status = 'active'
WHERE subscription_status IS NULL;
