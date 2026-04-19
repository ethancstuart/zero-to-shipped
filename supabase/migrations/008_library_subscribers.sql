CREATE TABLE IF NOT EXISTS public.library_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  source text NOT NULL DEFAULT 'library',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.library_subscribers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role only" ON public.library_subscribers
    USING (false) WITH CHECK (false);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
