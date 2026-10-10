-- Per-user AI usage ledger. This stores accounting metadata only, never document text.
CREATE TABLE IF NOT EXISTS public.ai_usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0 CHECK (prompt_tokens >= 0),
  completion_tokens INTEGER NOT NULL DEFAULT 0 CHECK (completion_tokens >= 0),
  total_tokens INTEGER NOT NULL DEFAULT 0 CHECK (total_tokens >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_usage_events_user_created_idx
  ON public.ai_usage_events (user_id, created_at DESC);

ALTER TABLE public.ai_usage_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own AI usage" ON public.ai_usage_events;
CREATE POLICY "Users can view their own AI usage" ON public.ai_usage_events
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access to AI usage" ON public.ai_usage_events;
CREATE POLICY "Service role full access to AI usage" ON public.ai_usage_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.record_ai_usage(
  p_user_id UUID,
  p_provider TEXT,
  p_model TEXT,
  p_prompt_tokens INTEGER,
  p_completion_tokens INTEGER,
  p_total_tokens INTEGER
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.ai_usage_events (
    user_id, provider, model, prompt_tokens, completion_tokens, total_tokens
  ) VALUES (
    p_user_id,
    LEFT(COALESCE(p_provider, 'unknown'), 80),
    LEFT(COALESCE(p_model, 'unknown'), 160),
    GREATEST(COALESCE(p_prompt_tokens, 0), 0),
    GREATEST(COALESCE(p_completion_tokens, 0), 0),
    GREATEST(COALESCE(p_total_tokens, 0), 0)
  ) RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
