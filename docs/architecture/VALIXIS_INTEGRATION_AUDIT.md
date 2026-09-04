# VALIXIS Portal Integration Audit

## 1. Existing Supabase Schema
The VALIXIS Portal uses a PostgreSQL database hosted on Supabase. The `public` schema contains the following primary tables:
- `employees`
- `tasks`
- `task_assignments`
- `submissions`
- `audit_logs`
- `employee_tasks` (View)

## 2. Relevant Tables and Columns
- **`employees`**: `id` (UUID, PK), `auth_id` (UUID, FK to auth), `name`, `email`, `role`, `department`, `created_at`, `updated_at`, `phone`
- **`tasks`**: `id` (UUID, PK), `title`, `description`, `objective`, `ai_prompt`, `expected_output`, `branch_name`, `github_repository`, `priority` (Enum), `deadline` (Timestamptz), `created_at`, `updated_at`
- **`task_assignments`**: `id` (UUID, PK), `task_id` (UUID, FK), `employee_id` (UUID, FK), `status` (Enum), `assigned_at`, `reviewed_at`, `reviewed_by` (UUID, FK)
- **`submissions`**: `id` (UUID, PK), `assignment_id` (UUID, FK), `pr_url`, `review_status` (Enum), `manager_feedback`, `submitted_at`, `reviewed_at`
- **`audit_logs`**: `id`, `actor`, `actor_id` (UUID, FK), `action`, `category`, `timestamp`, `ip_address`, `status`, `last_seen`, `metadata` (JSONB)

## 3. Relationships
- **Task Assignments**: Links `employees` (assignees) and `employees` (reviewers) to `tasks` (`task_id`).
- **Submissions**: Links code submissions (PR URLs) to a specific `task_assignment` (`assignment_id`).
- **Audit Logs**: Links actions to `employees` (`actor_id`).

## 4. Existing Realtime Capabilities
An audit of `pg_publication_tables` reveals that no tables in the `public` schema are currently configured for Supabase Realtime publications. The `supabase_realtime` publication exists but tracks no public tables.

## 5. Authentication & Access Model
- Authentication is handled via **Supabase Auth**. The `employees.auth_id` column maps to the internal `auth.users` table.
- **Row Level Security (RLS)** is enabled on all tables.
- **Roles**: Differentiated by the `role` column in the `employees` table (e.g., 'employee', 'manager'). A custom `is_manager()` function is used in RLS policies.
- **Policies**: Managers have full CRUD access across tables. Employees are restricted to viewing their own profiles/assignments and inserting/updating their own submissions and audit logs.

## 6. Data We Can Reuse Directly
- **Authentication**: We can rely on the same Supabase Auth layer.
- **Users/Team Members**: The `employees` table can be used to resolve action item owners.
- **Tasks**: We can optionally map LoopKeeper action items to VALIXIS `tasks` as an "export" feature.

## 7. Data LoopKeeper Still Needs to Create
- **Meeting Records**: Tables for meeting metadata, transcripts, and dates.
- **Action Items**: A table to store extracted action items (status, deadline, assignee, source meeting).
- **Semantic Embeddings**: `pgvector` columns storing vector embeddings of action item descriptions to detect repeated tasks and wording changes across multiple meetings.

## 8. Recommended Read/Write Boundaries
- **READ-ONLY Integration initially**: LoopKeeper should read from `employees` to map names to user IDs.
- **WRITE Isolation**: LoopKeeper should avoid writing directly to `tasks` or `task_assignments` during the MVP phase to avoid corrupting existing production workflows. LoopKeeper-specific entities should live in isolated tables (e.g., `loopkeeper_meetings`, `loopkeeper_action_items`).

## 9. Security/RLS Considerations
- Since LoopKeeper has its own Python FastAPI backend orchestrating the AI pipeline, the backend will likely use a **Supabase Service Role Key** (or explicit server-side auth) to bypass RLS when querying VALIXIS employee data securely.
- RLS should be applied to the new LoopKeeper tables in alignment with the existing `is_manager()` and `auth_id` paradigms.

## 10. Recommended Integration Architecture
1. **Database Layer**: Deploy LoopKeeper's new tables directly alongside the VALIXIS tables in the same Supabase database. Enable `pgvector` on this database.
2. **Backend (Python)**: Acts as the orchestrator. It receives meeting transcripts, calls the SLM to extract action items, generates embeddings, and queries Supabase.
3. **Frontend**: Connects primarily to the LoopKeeper FastAPI backend for meeting ingestion, but can query Supabase directly for standard UI views (utilizing existing RLS).

*Note: No existing VALIXIS data will be modified, deleted, or migrated to support LoopKeeper.*
