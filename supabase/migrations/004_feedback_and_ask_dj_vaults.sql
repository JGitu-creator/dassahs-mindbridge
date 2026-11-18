-- Keep product feedback separate from questions asked to Ask DJ.
ALTER TABLE public.feedback_vault
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'feedback'
  CHECK (type = 'feedback');

CREATE TABLE IF NOT EXISTS public.ask_dj_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL CHECK (char_length(question) BETWEEN 1 AND 2000),
  answer TEXT NOT NULL CHECK (char_length(answer) BETWEEN 1 AND 12000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ask_dj_questions_user_created_idx
  ON public.ask_dj_questions (user_id, created_at DESC);

ALTER TABLE public.ask_dj_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own Ask DJ questions" ON public.ask_dj_questions;
CREATE POLICY "Users can view their own Ask DJ questions" ON public.ask_dj_questions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own Ask DJ questions" ON public.ask_dj_questions;
CREATE POLICY "Users can delete their own Ask DJ questions" ON public.ask_dj_questions
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages Ask DJ questions" ON public.ask_dj_questions;
CREATE POLICY "Service role manages Ask DJ questions" ON public.ask_dj_questions
  FOR ALL USING (auth.role() = 'service_role');

REVOKE INSERT ON public.ask_dj_questions FROM anon, authenticated;
GRANT SELECT, DELETE ON public.ask_dj_questions TO authenticated;
