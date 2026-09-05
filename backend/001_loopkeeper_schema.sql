-- Migration: 001_loopkeeper_schema.sql
-- Description: Foundation schema for LoopKeeper AI Meeting Accountability Engine
-- Target Project: Existing VALIXIS Supabase PostgreSQL Instance

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create Table: loopkeeper_meetings
CREATE TABLE IF NOT EXISTS public.loopkeeper_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    meeting_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    source TEXT NOT NULL DEFAULT 'transcript',
    external_source_id TEXT NULL,
    created_by UUID NULL REFERENCES public.employees(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create Table: loopkeeper_transcripts
CREATE TABLE IF NOT EXISTS public.loopkeeper_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES public.loopkeeper_meetings(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    source_file_name TEXT NULL,
    transcript_format TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create Table: loopkeeper_action_items
-- Note: Embedding vector dimension is set to 1536 (Standard for text-embedding-3-small and Gemini embeddings)
CREATE TABLE IF NOT EXISTS public.loopkeeper_action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES public.loopkeeper_meetings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NULL,
    owner_employee_id UUID NULL REFERENCES public.employees(id) ON DELETE SET NULL,
    deadline TIMESTAMPTZ NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'overdue', 'cancelled')),
    confidence NUMERIC(4, 3) NOT NULL DEFAULT 1.000,
    source_text TEXT NULL,
    embedding vector(1536) NULL,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create Table: loopkeeper_action_item_history
CREATE TABLE IF NOT EXISTS public.loopkeeper_action_item_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_item_id UUID NOT NULL REFERENCES public.loopkeeper_action_items(id) ON DELETE CASCADE,
    meeting_id UUID NOT NULL REFERENCES public.loopkeeper_meetings(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('created', 'updated', 'deadline_changed', 'owner_changed', 'status_changed', 'postponed', 'completed', 'reopened')),
    previous_value JSONB NULL,
    new_value JSONB NULL,
    evidence_text TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create Table: loopkeeper_task_matches
CREATE TABLE IF NOT EXISTS public.loopkeeper_task_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_item_id UUID NOT NULL REFERENCES public.loopkeeper_action_items(id) ON DELETE CASCADE,
    matched_action_item_id UUID NULL REFERENCES public.loopkeeper_action_items(id) ON DELETE SET NULL,
    matched_valixis_task_id UUID NULL REFERENCES public.tasks(id) ON DELETE SET NULL,
    similarity_score NUMERIC(5, 4) NULL,
    ai_confidence NUMERIC(4, 3) NULL,
    match_reason TEXT NULL,
    decision TEXT NOT NULL CHECK (decision IN ('matched', 'new', 'uncertain')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Create Table: loopkeeper_ai_runs
CREATE TABLE IF NOT EXISTS public.loopkeeper_ai_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NULL REFERENCES public.loopkeeper_meetings(id) ON DELETE SET NULL,
    action_item_id UUID NULL REFERENCES public.loopkeeper_action_items(id) ON DELETE SET NULL,
    model_name TEXT NOT NULL,
    model_version TEXT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('slm', 'fallback_llm')),
    input_hash TEXT NULL,
    confidence NUMERIC(4, 3) NULL,
    latency_ms INTEGER NULL,
    success BOOLEAN NOT NULL DEFAULT true,
    fallback_used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Create Table: loopkeeper_meeting_participants
CREATE TABLE IF NOT EXISTS public.loopkeeper_meeting_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES public.loopkeeper_meetings(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT loopkeeper_mp_unique UNIQUE (meeting_id, employee_id)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_loopkeeper_meetings_created_by ON public.loopkeeper_meetings(created_by);
CREATE INDEX IF NOT EXISTS idx_loopkeeper_meetings_date ON public.loopkeeper_meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_loopkeeper_transcripts_meeting_id ON public.loopkeeper_transcripts(meeting_id);
CREATE INDEX IF NOT EXISTS idx_loopkeeper_action_items_meeting_id ON public.loopkeeper_action_items(meeting_id);
CREATE INDEX IF NOT EXISTS idx_loopkeeper_action_items_owner ON public.loopkeeper_action_items(owner_employee_id);
CREATE INDEX IF NOT EXISTS idx_loopkeeper_action_items_status ON public.loopkeeper_action_items(status);
CREATE INDEX IF NOT EXISTS idx_loopkeeper_action_items_deadline ON public.loopkeeper_action_items(deadline);
CREATE INDEX IF NOT EXISTS idx_loopkeeper_action_items_embedding ON public.loopkeeper_action_items USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_loopkeeper_history_action_item ON public.loopkeeper_action_item_history(action_item_id);
CREATE INDEX IF NOT EXISTS idx_loopkeeper_history_meeting ON public.loopkeeper_action_item_history(meeting_id);
CREATE INDEX IF NOT EXISTS idx_loopkeeper_matches_action_item ON public.loopkeeper_task_matches(action_item_id);
CREATE INDEX IF NOT EXISTS idx_loopkeeper_matches_valixis_task ON public.loopkeeper_task_matches(matched_valixis_task_id);
CREATE INDEX IF NOT EXISTS idx_loopkeeper_ai_runs_meeting ON public.loopkeeper_ai_runs(meeting_id);
CREATE INDEX IF NOT EXISTS idx_loopkeeper_participants_meeting ON public.loopkeeper_meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_loopkeeper_participants_employee ON public.loopkeeper_meeting_participants(employee_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.loopkeeper_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loopkeeper_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loopkeeper_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loopkeeper_action_item_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loopkeeper_task_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loopkeeper_ai_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loopkeeper_meeting_participants ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- loopkeeper_meetings
CREATE POLICY "Managers and participants select meetings" ON public.loopkeeper_meetings
    FOR SELECT TO authenticated
    USING (
        is_manager() OR 
        created_by IN (SELECT id FROM public.employees WHERE auth_id = auth.uid()) OR
        id IN (SELECT meeting_id FROM public.loopkeeper_meeting_participants WHERE employee_id IN (SELECT id FROM public.employees WHERE auth_id = auth.uid()))
    );

CREATE POLICY "Managers and creators manage meetings" ON public.loopkeeper_meetings
    FOR ALL TO authenticated
    USING (
        is_manager() OR 
        created_by IN (SELECT id FROM public.employees WHERE auth_id = auth.uid())
    );

-- loopkeeper_transcripts
CREATE POLICY "Select transcripts for accessible meetings" ON public.loopkeeper_transcripts
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.loopkeeper_meetings m
            WHERE m.id = loopkeeper_transcripts.meeting_id
            AND (
                is_manager() OR 
                m.created_by IN (SELECT id FROM public.employees WHERE auth_id = auth.uid()) OR
                m.id IN (SELECT meeting_id FROM public.loopkeeper_meeting_participants WHERE employee_id IN (SELECT id FROM public.employees WHERE auth_id = auth.uid()))
            )
        )
    );

CREATE POLICY "Manage transcripts for accessible meetings" ON public.loopkeeper_transcripts
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.loopkeeper_meetings m
            WHERE m.id = loopkeeper_transcripts.meeting_id
            AND (
                is_manager() OR 
                m.created_by IN (SELECT id FROM public.employees WHERE auth_id = auth.uid())
            )
        )
    );

-- loopkeeper_action_items
CREATE POLICY "Select action items" ON public.loopkeeper_action_items
    FOR SELECT TO authenticated
    USING (
        is_manager() OR
        owner_employee_id IN (SELECT id FROM public.employees WHERE auth_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.loopkeeper_meetings m
            WHERE m.id = loopkeeper_action_items.meeting_id
            AND (
                m.created_by IN (SELECT id FROM public.employees WHERE auth_id = auth.uid()) OR
                m.id IN (SELECT meeting_id FROM public.loopkeeper_meeting_participants WHERE employee_id IN (SELECT id FROM public.employees WHERE auth_id = auth.uid()))
            )
        )
    );

CREATE POLICY "Manage action items" ON public.loopkeeper_action_items
    FOR ALL TO authenticated
    USING (
        is_manager() OR
        owner_employee_id IN (SELECT id FROM public.employees WHERE auth_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.loopkeeper_meetings m
            WHERE m.id = loopkeeper_action_items.meeting_id
            AND m.created_by IN (SELECT id FROM public.employees WHERE auth_id = auth.uid())
        )
    );

-- loopkeeper_action_item_history
CREATE POLICY "Select action item history" ON public.loopkeeper_action_item_history
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Manage action item history" ON public.loopkeeper_action_item_history
    FOR ALL TO authenticated
    USING (
        is_manager() OR
        EXISTS (
            SELECT 1 FROM public.employees WHERE auth_id = auth.uid()
        )
    );

-- loopkeeper_task_matches
CREATE POLICY "Select task matches" ON public.loopkeeper_task_matches
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Manage task matches" ON public.loopkeeper_task_matches
    FOR ALL TO authenticated
    USING (
        is_manager() OR
        EXISTS (
            SELECT 1 FROM public.employees WHERE auth_id = auth.uid()
        )
    );

-- loopkeeper_ai_runs
CREATE POLICY "Select AI runs" ON public.loopkeeper_ai_runs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Manage AI runs" ON public.loopkeeper_ai_runs
    FOR ALL TO authenticated
    USING (
        is_manager() OR
        EXISTS (
            SELECT 1 FROM public.employees WHERE auth_id = auth.uid()
        )
    );

-- loopkeeper_meeting_participants
CREATE POLICY "Select meeting participants" ON public.loopkeeper_meeting_participants
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Manage meeting participants" ON public.loopkeeper_meeting_participants
    FOR ALL TO authenticated
    USING (
        is_manager() OR
        EXISTS (
            SELECT 1 FROM public.loopkeeper_meetings m
            WHERE m.id = loopkeeper_meeting_participants.meeting_id
            AND m.created_by IN (SELECT id FROM public.employees WHERE auth_id = auth.uid())
        )
    );
