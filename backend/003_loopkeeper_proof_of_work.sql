-- Migration: 003_loopkeeper_proof_of_work.sql
-- Description: Production database migration for GitHub Proof-of-Work table
-- Target Project: Existing LoopKeeper PostgreSQL Instance

CREATE TABLE IF NOT EXISTS public.loopkeeper_proof_of_work (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_item_id UUID NOT NULL REFERENCES public.loopkeeper_action_items(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'github',
    external_event_type TEXT NOT NULL DEFAULT 'pr_opened',
    external_event_id TEXT NOT NULL,
    repository TEXT NOT NULL,
    pr_number INTEGER NOT NULL,
    pr_title TEXT NOT NULL,
    pr_url TEXT NOT NULL,
    author_login TEXT NOT NULL,
    author_email TEXT NULL,
    resolution_method TEXT NOT NULL CHECK (resolution_method IN ('explicit_key', 'vector_similarity')),
    similarity_score NUMERIC(5, 4) NULL,
    evidence_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT loopkeeper_pow_unique_event UNIQUE (provider, repository, pr_number, external_event_type)
);

CREATE INDEX IF NOT EXISTS idx_loopkeeper_pow_action_item ON public.loopkeeper_proof_of_work(action_item_id);
CREATE INDEX IF NOT EXISTS idx_loopkeeper_pow_provider_repo ON public.loopkeeper_proof_of_work(provider, repository);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.loopkeeper_proof_of_work ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select proof of work for accessible action items" ON public.loopkeeper_proof_of_work
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.loopkeeper_action_items a
            WHERE a.id = loopkeeper_proof_of_work.action_item_id
        )
    );
