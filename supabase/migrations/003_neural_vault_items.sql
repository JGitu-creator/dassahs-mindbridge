-- Per-user saved hooks and metaphors. Document text is never stored here.
CREATE TABLE IF NOT EXISTS public.neural_vault_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  heading TEXT NOT NULL CHECK (char_length(heading) <= 120),
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  type TEXT NOT NULL CHECK (type IN ('hook', 'metaphor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT neural_vault_items_unique_item UNIQUE (user_id, type, content)
);

CREATE INDEX IF NOT EXISTS neural_vault_items_user_created_idx
  ON public.neural_vault_items (user_id, created_at ASC);

ALTER TABLE public.neural_vault_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own vault items" ON public.neural_vault_items;
CREATE POLICY "Users can view their own vault items" ON public.neural_vault_items
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add their own vault items" ON public.neural_vault_items;
CREATE POLICY "Users can add their own vault items" ON public.neural_vault_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own vault items" ON public.neural_vault_items;
CREATE POLICY "Users can delete their own vault items" ON public.neural_vault_items
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access to vault items" ON public.neural_vault_items;
CREATE POLICY "Service role full access to vault items" ON public.neural_vault_items
  FOR ALL USING (auth.role() = 'service_role');
