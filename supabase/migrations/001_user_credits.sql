-- user_credits table
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 50,
  last_reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_credits_user_id_key UNIQUE (user_id),
  CONSTRAINT user_credits_balance_check CHECK (balance >= 0)
);

-- credit_purchases table
CREATE TABLE IF NOT EXISTS public.credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lemon_squeezy_order_id TEXT NOT NULL UNIQUE,
  credits_added INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credits" ON public.user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own purchases" ON public.credit_purchases
  FOR SELECT USING (auth.uid() = user_id);

-- Service role bypass (for server-side operations)
CREATE POLICY "Service role full access to credits" ON public.user_credits
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to purchases" ON public.credit_purchases
  FOR ALL USING (auth.role() = 'service_role');

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RPC: get or initialize user credits
CREATE OR REPLACE FUNCTION public.get_or_create_user_credits(p_user_id UUID)
RETURNS public.user_credits AS $$
DECLARE
  v_row public.user_credits;
BEGIN
  INSERT INTO public.user_credits (user_id, balance, last_reset_at)
  VALUES (p_user_id, 50, NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT * INTO v_row FROM public.user_credits WHERE user_id = p_user_id;
  RETURN v_row;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: atomic credit deduction
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id UUID, p_amount INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  -- Auto-create if not exists
  PERFORM public.get_or_create_user_credits(p_user_id);
  
  -- Daily reset: add 50 if last reset was > 24h ago
  UPDATE public.user_credits
  SET 
    balance = balance + 50,
    last_reset_at = NOW()
  WHERE user_id = p_user_id
    AND last_reset_at < NOW() - INTERVAL '24 hours';
  
  -- Attempt deduction
  UPDATE public.user_credits
  SET balance = balance - p_amount
  WHERE user_id = p_user_id AND balance >= p_amount
  RETURNING balance INTO v_balance;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;
  
  RETURN v_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: refund credits
CREATE OR REPLACE FUNCTION public.refund_credits(p_user_id UUID, p_amount INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  UPDATE public.user_credits
  SET balance = balance + p_amount
  WHERE user_id = p_user_id
  RETURNING balance INTO v_balance;
  
  RETURN v_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: top up credits (idempotent, keyed on order id)
CREATE OR REPLACE FUNCTION public.topup_credits(
  p_user_id UUID,
  p_lemon_squeezy_order_id TEXT,
  p_credits_amount INTEGER,
  p_amount_cents INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  -- Idempotent: skip if already processed
  IF EXISTS (SELECT 1 FROM public.credit_purchases WHERE lemon_squeezy_order_id = p_lemon_squeezy_order_id) THEN
    SELECT balance INTO v_balance FROM public.user_credits WHERE user_id = p_user_id;
    RETURN v_balance;
  END IF;
  
  -- Ensure user row exists
  PERFORM public.get_or_create_user_credits(p_user_id);
  
  -- Record purchase
  INSERT INTO public.credit_purchases (user_id, lemon_squeezy_order_id, credits_added, amount_cents)
  VALUES (p_user_id, p_lemon_squeezy_order_id, p_credits_amount, p_amount_cents);
  
  -- Add credits
  UPDATE public.user_credits
  SET balance = balance + p_credits_amount
  WHERE user_id = p_user_id
  RETURNING balance INTO v_balance;
  
  RETURN v_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
