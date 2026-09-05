-- Migration: 002_loopkeeper_round2_schema.sql
-- Description: Production database migration for Round 2 LoopKeeper tables
-- Target Project: Existing VALIXIS Supabase PostgreSQL Instance

-- 1. Create Table: loopkeeper_recordings
CREATE TABLE IF NOT EXISTS public.loopkeeper_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES public.loopkeeper_meetings(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT NULL,
    file_size_bytes INTEGER NULL,
    duration_seconds INTEGER NULL,
    format TEXT NOT NULL DEFAULT 'mp3',
    status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('recording_active', 'uploaded', 'transcribing', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create Table: loopkeeper_integrations
CREATE TABLE IF NOT EXISTS public.loopkeeper_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL CHECK (provider IN ('google_drive', 'jira', 'teams', 'zoom', 'slack')),
    is_connected BOOLEAN NOT NULL DEFAULT false,
    account_email TEXT NULL,
    config JSONB NULL,
    last_synced_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT loopkeeper_integrations_provider_unique UNIQUE (provider)
);

-- 3. Create Table: loopkeeper_jira_links
CREATE TABLE IF NOT EXISTS public.loopkeeper_jira_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_item_id UUID NOT NULL REFERENCES public.loopkeeper_action_items(id) ON DELETE CASCADE,
    jira_issue_key TEXT NOT NULL,
    jira_issue_id TEXT NULL,
    jira_issue_url TEXT NULL,
    jira_status TEXT NOT NULL DEFAULT 'To Do',
    jira_assignee TEXT NULL,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create Table: loopkeeper_execution_drift
CREATE TABLE IF NOT EXISTS public.loopkeeper_execution_drift (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_item_id UUID NOT NULL REFERENCES public.loopkeeper_action_items(id) ON DELETE CASCADE,
    meeting_statement TEXT NOT NULL,
    external_system TEXT NOT NULL DEFAULT 'jira',
    external_evidence TEXT NOT NULL,
    drift_status TEXT NOT NULL CHECK (drift_status IN ('aligned', 'execution_evidence_present', 'execution_drift', 'unlinked', 'postponement', 'insufficient_evidence')),
    discrepancy_reason TEXT NULL,
    confidence NUMERIC(4, 3) NOT NULL DEFAULT 1.000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_loopkeeper_recordings_meeting ON public.loopkeeper_recordings(meeting_id);
CREATE INDEX IF NOT EXISTS idx_loopkeeper_integrations_provider ON public.loopkeeper_integrations(provider);
CREATE INDEX IF NOT EXISTS idx_loopkeeper_jira_links_action_item ON public.loopkeeper_jira_links(action_item_id);
CREATE INDEX IF NOT EXISTS idx_loopkeeper_jira_links_issue_key ON public.loopkeeper_jira_links(jira_issue_key);
CREATE INDEX IF NOT EXISTS idx_loopkeeper_execution_drift_action_item ON public.loopkeeper_execution_drift(action_item_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.loopkeeper_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loopkeeper_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loopkeeper_jira_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loopkeeper_execution_drift ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- loopkeeper_recordings
CREATE POLICY "Select recordings for accessible meetings" ON public.loopkeeper_recordings
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.loopkeeper_meetings m
            WHERE m.id = loopkeeper_recordings.meeting_id
            AND (
                is_manager() OR 
                m.created_by IN (SELECT id FROM public.employees WHERE auth_id = auth.uid()) OR
                m.id IN (SELECT meeting_id FROM public.loopkeeper_meeting_participants WHERE employee_id IN (SELECT id FROM public.employees WHERE auth_id = auth.uid()))
            )
        )
    );

CREATE POLICY "Manage recordings for accessible meetings" ON public.loopkeeper_recordings
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.loopkeeper_meetings m
            WHERE m.id = loopkeeper_recordings.meeting_id
            AND (
                is_manager() OR 
                m.created_by IN (SELECT id FROM public.employees WHERE auth_id = auth.uid())
            )
        )
    );

-- loopkeeper_integrations
CREATE POLICY "Select integrations" ON public.loopkeeper_integrations
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Manage integrations" ON public.loopkeeper_integrations
    FOR ALL TO authenticated
    USING (
        is_manager()
    );

-- loopkeeper_jira_links
CREATE POLICY "Select jira links" ON public.loopkeeper_jira_links
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Manage jira links" ON public.loopkeeper_jira_links
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees WHERE auth_id = auth.uid()
        )
    );

-- loopkeeper_execution_drift
CREATE POLICY "Select execution drift records" ON public.loopkeeper_execution_drift
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Manage execution drift records" ON public.loopkeeper_execution_drift
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees WHERE auth_id = auth.uid()
        )
    );
