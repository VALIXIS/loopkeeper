# LoopKeeper Product UX Specification

## Executive Overview
**LoopKeeper** is an AI-powered Meeting Accountability Engine designed to solve the critical organizational challenge of untracked commitments, vague meeting notes, recurring postponements, and team burnout. By converting unstructured meeting transcripts into persistent, semantically tracked action items, LoopKeeper ensures that promises made during meetings are automatically tracked through to completion.

This specification details the user experience architecture, screen-by-screen layouts, user flows, state behaviors, accessibility standards, and the signature **LoopKeeper Accountability Graph** visualization.

---

## User Personas & Roles

LoopKeeper supports two primary operational personas derived from the underlying organizational structure:

| Persona | Primary Role | Key Objectives | Core Screen Focus |
| :--- | :--- | :--- | :--- |
| **Engineering / Product Manager** | Manager | Monitor team commitments, detect project bottlenecks, identify overloaded team members, prevent repeated postponements, verify task continuity. | Dashboard, Team Workload, Accountability Insights, Meeting Details, AI Processing Status |
| **Individual Contributor (IC)** | Employee | Review assigned tasks, view deadline changes, check meeting transcript evidence context, update task progress, manage personal workload. | My Tasks, Action Item Details/History, Mobile Home, Meeting Details |

---

## System Navigation & Layout Framework

### Web Application Layout Hierarchy
1. **Global Navigation Sidebar (Collapsible, 240px wide)**:
   - Header: Brand logo + Workspace selector ("Apex FinTech Engineering").
   - Navigation Items:
     - Dashboard (`/`)
     - Meetings (`/meetings`)
     - Action Items (`/action-items`)
     - Team Workload (`/team`)
     - Accountability Insights (`/insights`)
     - AI Processing (`/ai-status`)
     - Settings (`/settings`)
   - Footer: User Profile pill + Quick theme toggle (Dark / Light).
2. **Top Application Bar (64px height)**:
   - Global Search (`Cmd + K` / `Ctrl + K`) for instant lookup of tasks, meetings, and team members.
   - AI Processing Badge ("SLM Active • 98.4% Accuracy").
   - Notifications Bell with active risk alerts counter pill.
3. **Main Content Canvas (Fluid width, max-w-7xl)**:
   - Dynamic view container rendering active screen components.

### Mobile Application Layout Hierarchy
1. **Top Bar**: Minimalist app header with screen title, quick search icon, and notification bell.
2. **Bottom Navigation Bar (5 Primary Tabs)**:
   - Home (`/mobile`)
   - Meetings (`/mobile/meetings`)
   - My Tasks (`/mobile/tasks`)
   - Team (`/mobile/team`)
   - Profile/Alerts (`/mobile/alerts`)

---

## Detailed Web Screen Specifications

---

### Web Screen 1: Login (`/login`)
- **Purpose**: Authenticate users via Supabase Auth and establish security session context.
- **Primary User**: All Users (Managers & Employees).
- **Information Displayed**:
  - LoopKeeper brand emblem and tagline ("Meeting Accountability Engine").
  - Single Sign-On (SSO) login prompt (Google / GitHub / Corporate SAML).
  - Work Email & Password fallback input fields.
  - Security compliance notice ("End-to-end encrypted meeting transcript processing").
- **Primary Actions**:
  - `Sign In with SSO` (Primary button)
  - `Log In with Password` (Secondary button)
  - `Forgot Password?` (Text link)
- **Empty State**: Clean, centered login card with dark theme surface backdrop.
- **Loading State**: Button spinner with text "Authenticating session...".
- **Error State**: Red alert banner: *"Invalid email or password. Please check your credentials or contact your administrator."*
- **Mobile Behavior**: Single-column responsive card centered vertically; full-width input controls.
- **Accessibility**: ARIA labels on inputs, high-contrast text ratios (> 4.5:1), full keyboard tab order.

---

### Web Screen 2: Dashboard (`/`)
- **Purpose**: Provide managers and team members with an immediate executive summary of overall task health, open commitments, overdue items, postponed tasks, and team workload alerts.
- **Primary User**: Managers & Team Leads.
- **Information Displayed**:
  - **4 Top Metric Cards**:
    - Total Open Tasks (with week-over-week trend indicator).
    - Overdue Tasks (highlighted in Rose alert theme if > 0).
    - Completed Tasks (this sprint).
    - Repeatedly Postponed Tasks (counter badge with risk warning icon).
  - **Overloaded Team Members Alert Panel**: List of employees exceeding capacity threshold (> 4 open tasks or > 1 overdue).
  - **Upcoming Deadlines Timeline Widget**: List of action items due within 48 hours.
  - **Recent Meetings Stream**: Quick summary of latest ingested transcripts and processing status.
- **Primary Actions**:
  - `Upload Transcript` (Top right primary action button).
  - `Filter Dashboard` (By date range or department).
  - `View All Overdue Tasks` (Shortcut navigation link).
- **Empty State**: Zero-state graphic with text *"No active meetings or action items found. Upload your first meeting transcript to begin tracking accountability."*
- **Loading State**: Animated skeleton placeholder grids for top metrics and list views.
- **Error State**: Inline banner: *"Failed to fetch dashboard metrics. Retrying automatically..."* with a manual `Retry` button.
- **Mobile Behavior**: Metric cards stack into 2x2 grid; lists collapse to expandable preview cards.
- **Accessibility**: Screen reader live region (`aria-live="polite"`) for real-time metric updates.

---

### Web Screen 3: Meetings (`/meetings`)
- **Purpose**: Display a searchable, filterable repository of all ingested meeting recordings, transcripts, and external calendar syncs.
- **Primary User**: All Users.
- **Information Displayed**:
  - Search bar with filter controls (Date, Source: Transcript/Google Meet, Created By).
  - Data Table / Grid of Meetings:
    - Title & External Source ID badge.
    - Meeting Date & Time.
    - Creator / Host avatar & name.
    - Total Action Items Extracted.
    - AI Processing Status (`Pending`, `Processing`, `Completed`, `Failed`).
- **Primary Actions**:
  - `Upload Transcript / Add Meeting` (Modal trigger).
  - `Reprocess Transcript` (Row action).
  - `Search Meetings` (Live filtering input).
- **Empty State**: Card stating *"No meetings ingested yet."* with an instant upload dropzone.
- **Loading State**: 5 rows of skeleton table animation.
- **Error State**: Table backdrop error banner with reload option.
- **Mobile Behavior**: Table transforms into vertical stacked card list showing Title, Date badge, and Action Item count.
- **Accessibility**: Keyboard navigable table rows (`ArrowUp`, `ArrowDown`, `Enter` to open).

---

### Web Screen 4: Meeting Details (`/meetings/:id`)
- **Purpose**: Deep-dive into a single meeting record, inspect the raw transcript, view extracted action items, examine AI confidence scores, and run reprocessing.
- **Primary User**: Managers & Meeting Participants.
- **Information Displayed**:
  - Header: Meeting Title, Date, Source Badge, Creator profile.
  - Split-Screen Layout:
    - **Left Panel (Transcript Reader)**: Text of transcript with timestamping and speaker tags.
    - **Right Panel (Extracted Action Items List)**: Cards detailing extracted title, owner, deadline, confidence score (`0.0 - 1.0`), and direct transcript excerpt highlight link.
- **Primary Actions**:
  - `Trigger AI Processing` (Runs SLM pipeline).
  - `Manually Add Action Item` (Override AI).
  - `Highlight Source Text` (Highlights corresponding line in transcript panel).
- **Empty State**: Left panel shows transcript text; Right panel shows *"No action items extracted yet. Click 'Process Transcript' to run AI engine."*
- **Loading State**: Progress bar overlay on right panel with step text: *"Extracting tasks... Calculating embeddings... Deduplicating..."*
- **Error State**: Notification banner: *"AI processing failed due to transcript formatting error. View fallback logs."*
- **Mobile Behavior**: Tabbed layout switching between `Transcript` tab and `Action Items` tab.
- **Accessibility**: Transcript scrolling synchronized with keyboard focus on action item cards.

---

### Web Screen 5: Action Items (`/action-items`)
- **Purpose**: Centralized operational view of all extracted action items across all meetings in the system.
- **Primary User**: All Users.
- **Information Displayed**:
  - Multi-select Filter Bar: Status (`pending`, `done`, `overdue`, `cancelled`), Assignee/Owner, Source Meeting, Date Range, Postponement Flag.
  - Action Items Table:
    - Task Title & Description.
    - Assigned Owner (Avatar + Employee Name or `Unassigned` warning badge).
    - Current Status Pill (`Pending` [Amber], `Done` [Green], `Overdue` [Red], `Cancelled` [Gray]).
    - Target Deadline date with relative distance ("Due in 2 days", "Overdue by 3 days").
    - Postponement Count Pill (e.g. `2x Postponed` [Rose badge]).
    - AI Extraction Confidence (e.g. `94%`).
- **Primary Actions**:
  - `Quick Edit Status / Deadline` (Inline row dropdown).
  - `Export to Task System` (Export to VALIXIS).
  - `Filter & Sort` (Sort by deadline urgency, status, owner).
- **Empty State**: *"No action items match the selected filter criteria."* with `Clear Filters` button.
- **Loading State**: Table row skeleton pulses.
- **Error State**: Banner: *"Error loading action items list."*
- **Mobile Behavior**: Filter drawer slide-over; table converted to list cards with swipe actions.
- **Accessibility**: Status changes announce screen reader feedback via polite announcements.

---

### Web Screen 6: Action-Item Details / History (`/action-items/:id`)
- **Purpose**: Comprehensive lifecycle tracking view for a single action item, exposing its origin meeting, wording transformations across meetings, deadline change audit log, and semantic vector match decisions.
- **Primary User**: Managers & Assigned Employees.
- **Information Displayed**:
  - **Task Summary Header**: Title, current status, owner, original vs current deadline.
  - **State Machine Timeline**: Chronological log of all events (`created`, `updated`, `deadline_changed`, `owner_changed`, `status_changed`, `postponed`, `completed`, `reopened`).
  - **Evidence Excerpt Panel**: Direct text snippet from the meeting transcript that triggered each change.
  - **Semantic Match Records**: List of past meeting tasks matched via vector similarity (`similarity_score: 0.887`), showing exact wording mutations across meetings.
- **Primary Actions**:
  - `Update Task State` (Change status, adjust deadline, reassign owner).
  - `View Source Meeting` (Link to origin meeting details).
  - `Mark as Resolved / Completed`.
- **Empty State**: N/A (Always shows task metadata or 404).
- **Loading State**: Skeleton timeline and header.
- **Error State**: 404 Not Found card if UUID is invalid or deleted.
- **Mobile Behavior**: Vertical linear timeline card layout with expandable evidence toggles.
- **Accessibility**: Timeline nodes marked up with standard semantic list HTML `<ol>` and step ARIA landmarks.

---

### Web Screen 7: Team Workload (`/team`)
- **Purpose**: Provide visibility into task distribution across team members to detect burnout, individual task concentration, overdue task bottlenecks, and assignee capacity.
- **Primary User**: Engineering Managers & Resource Allocators.
- **Information Displayed**:
  - **Team Member Capacity Cards**:
    - Employee Profile (Photo, Name, Role, Department).
    - Active Task Counter & Capacity Progress Bar (Green < 3 tasks, Amber = 3-4 tasks, Red >= 5 tasks or overdue > 1).
    - Breakdown of tasks by status (`Pending`, `Overdue`, `Completed`).
    - List of assigned action items with due dates.
  - **Overload Summary Banner**: Highlights specific individuals flagged as overloaded by the backend algorithm.
- **Primary Actions**:
  - `Reassign Task` (Drag and drop or modal selector to rebalance work).
  - `Filter Team` (By Department or Manager).
  - `View Individual Workload History`.
- **Empty State**: *"No team members found in the organization schema."*
- **Loading State**: Grid of 6 skeleton employee capacity cards.
- **Error State**: Error banner with `Retry` action.
- **Mobile Behavior**: Stacked cards with horizontal progress bars; single column layout.
- **Accessibility**: Progress bars feature `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` attributes.

---

### Web Screen 8: Accountability Insights (`/insights`)
- **Purpose**: Analytical dashboard highlighting organizational accountability patterns, task completion velocity, repeated postponement hot spots, and vague commitment detection.
- **Primary User**: Executive Leadership & Engineering Managers.
- **Information Displayed**:
  - **Postponement Heatmap / Chart**: Identifies which projects or team members frequently delay commitments.
  - **Task Continuity Success Rate**: Percentage of action items successfully tracked to completion across multiple meetings.
  - **Vague Commitment Radar**: List of action items created with low confidence or missing owners/deadlines.
  - **Meeting Efficiency Metric**: Average number of actionable commitments extracted per meeting.
- **Primary Actions**:
  - `Export Insights Report` (PDF / CSV summary download).
  - `Time Range Selector` (Last 7 days, Last 30 days, Quarter-to-date).
  - `Drill Down into Flagged Tasks`.
- **Empty State**: *"Insufficient historical data to calculate accountability analytics. Ingest at least 3 meetings to view trends."*
- **Loading State**: Skeleton charts and metric cards.
- **Error State**: Chart placeholder displaying error fallback graphic and message.
- **Mobile Behavior**: Charts scale down smoothly; touch tooltips for line charts and heatmaps.
- **Accessibility**: All charts accompanied by accessible data table fallbacks for screen reader users.

---

### Web Screen 9: AI Processing Status (`/ai-status`)
- **Purpose**: Telemetry and operational control center monitoring SLM execution performance, Fallback LLM invocation rates, embedding generation, vector similarity thresholds, and raw run logs (`loopkeeper_ai_runs`).
- **Primary User**: System Administrators & AI Lead.
- **Information Displayed**:
  - **AI Engine Health Indicator**: Current status (`SLM Ready`, `Fallback Active`).
  - **Pipeline Metrics Grid**:
    - Average SLM Latency (ms).
    - Fallback LLM Trigger Rate (% of total runs).
    - Average Extraction Confidence Score.
    - Vector Store Index Status (HNSW 1536-dim vector status).
  - **Recent AI Inferences Log Table**:
    - Timestamp, Meeting ID, Model Name (`loopkeeper-slm-v1` / `gemini-1.5-flash`), Provider (`slm` / `fallback_llm`), Confidence Score, Latency, Success Flag.
- **Primary Actions**:
  - `Test Extraction Pipeline` (Run test prompt sandbox).
  - `Adjust Confidence Threshold` (View-only indicator of `0.75` setting).
  - `Refresh Telemetry`.
- **Empty State**: *"No AI inference runs logged in telemetry history."*
- **Loading State**: Telemetry counter skeletons and log table loader.
- **Error State**: Operational error banner indicating telemetry service unreachable.
- **Mobile Behavior**: Condensed metrics view; scrollable log table container.
- **Accessibility**: Status badges with explicit text indicators (not relying solely on color).

---

### Web Screen 10: Settings / Integrations (`/settings`)
- **Purpose**: Configure system preferences, workspace settings, VALIXIS read-only integration status, and external notification hooks.
- **Primary User**: Managers & Workspace Admins.
- **Information Displayed**:
  - **Workspace Preferences**: Workspace Name, Default Task Thresholds, Timezone.
  - **VALIXIS Portal Connection Status**: Read-Only connection status indicator ("Connected to Supabase PostgreSQL • Read-Only Mode Active").
  - **AI Provider Configuration Overview**: Displaying SLM model name, embedding dimension (1536), and fallback settings.
  - **Notification Controls**: Email alerts for overdue tasks and repeated postponements.
- **Primary Actions**:
  - `Save Settings` (Primary action button).
  - `Test Connection` (Verify backend connectivity).
  - `Toggle Notifications`.
- **Empty State**: N/A.
- **Loading State**: Form field loading placeholders.
- **Error State**: Field-level validation messages.
- **Mobile Behavior**: Stacked tab navigation switching between `General`, `Integrations`, and `Notifications`.
- **Accessibility**: Form controls bound to explicit `<label>` elements with `htmlFor` attributes.

---

## Detailed Mobile Screen Specifications (Flutter App)

---

### Mobile Screen 1: Login (`/mobile/login`)
- **Purpose**: Secure mobile authentication entry point.
- **Primary User**: Mobile Employees & Managers.
- **Information Displayed**: LoopKeeper logo, compact welcome headline, SSO button, email/password form fields, bio-auth prompt (FaceID/Fingerprint if enabled).
- **Primary Actions**: `Sign In with SSO`, `Log In`, `Use Biometrics`.
- **Empty State**: Clean dark surface with logo.
- **Loading State**: Full-width button loader with progress indicator.
- **Error State**: Floating top snackbar error message.
- **Mobile Adaptation**: Fully touch-optimized with 48px minimum touch targets.
- **Accessibility**: High contrast controls and dynamic font scaling support.

---

### Mobile Screen 2: Home / Dashboard (`/mobile`)
- **Purpose**: Provide high-priority daily action items, quick task metrics, and upcoming deadlines directly on a mobile home feed.
- **Primary User**: All Mobile Users.
- **Information Displayed**:
  - Greeting header ("Good morning, Vignesh").
  - 3 Summary Counter Chips: `Overdue (1)`, `Pending (4)`, `Done (12)`.
  - "Requires Your Attention" Card Stack (Urgent overdue tasks & postponement alerts).
  - Quick Meeting Upload FAB (Floating Action Button).
- **Primary Actions**: `Tap Task Card` (Navigates to task detail), `Upload Transcript FAB`, `Filter Feed`.
- **Empty State**: Graphic showing all caught up with text *"No pending tasks requiring immediate attention."*
- **Loading State**: Skeleton card list shimmer effect.
- **Error State**: Pull-to-refresh control with error alert banner.
- **Mobile Adaptation**: Designed specifically for one-handed mobile thumb navigation.
- **Accessibility**: Screen reader focus order mapped sequentially top-to-bottom.

---

### Mobile Screen 3: Meetings (`/mobile/meetings`)
- **Purpose**: Mobile list of recorded meetings with status indicators and search.
- **Primary User**: All Users.
- **Information Displayed**: Search input, list of meeting cards showing meeting title, date chip, extracted task count badge, and AI status.
- **Primary Actions**: `Tap Meeting` (Opens meeting details), `Upload Transcript`, `Search`.
- **Empty State**: *"No meetings recorded."*
- **Loading State**: List view shimmer loader.
- **Error State**: Offline error banner.
- **Mobile Adaptation**: Native ListView with pull-to-refresh.
- **Accessibility**: Accessible labels for search input and filter buttons.

---

### Mobile Screen 4: Meeting Details (`/mobile/meeting-details`)
- **Purpose**: View transcript snippets and action items extracted from a meeting on mobile devices.
- **Primary User**: All Users.
- **Information Displayed**: Segmented tab control (`Action Items` | `Transcript`), meeting metadata header, action item list cards with owner avatars and deadlines.
- **Primary Actions**: `Switch Tab`, `Tap Action Item`, `Reprocess`.
- **Empty State**: *"No action items extracted from this meeting."*
- **Loading State**: Segment loader spinner.
- **Error State**: Error dialog with retry action.
- **Mobile Adaptation**: Segmented control for seamless tab navigation on narrow screens.
- **Accessibility**: Tab bar supports swipe gestures and screen reader announcements.

---

### Mobile Screen 5: My Tasks (`/mobile/tasks`)
- **Purpose**: Dedicated personal task manager for mobile users to track their assigned action items.
- **Primary User**: Employees.
- **Information Displayed**: Tab bar filters (`Pending`, `Overdue`, `Completed`), list of task cards with meeting source tag, deadline badge, and status button.
- **Primary Actions**: `Mark as Done` (Quick swipe or button tap), `Change Deadline`, `Tap for History`.
- **Empty State**: *"You have no pending tasks assigned."*
- **Loading State**: Card list shimmer placeholders.
- **Error State**: Inline error toast.
- **Mobile Adaptation**: Swipe left to complete, swipe right to request deadline extension.
- **Accessibility**: Accessible touch targets (> 48x48 dp) and custom action labels.

---

### Mobile Screen 6: Task Details (`/mobile/task-details`)
- **Purpose**: Mobile view of single task details, audit log history, and transcript evidence.
- **Primary User**: All Users.
- **Information Displayed**: Task title, owner profile chip, current status badge, deadline info, postponement counter warning, evidence snippet card from meeting transcript.
- **Primary Actions**: `Update Status`, `Edit Deadline`, `View Origin Meeting`.
- **Empty State**: N/A.
- **Loading State**: Detail screen skeleton loader.
- **Error State**: Task not found error dialog.
- **Mobile Adaptation**: Vertical scrolling container with bottom sheet action drawers.
- **Accessibility**: High contrast text and screen reader accessible step log.

---

### Mobile Screen 7: Notifications / Alerts (`/mobile/alerts`)
- **Purpose**: Mobile alert feed highlighting high-risk events (overdue deadlines, repeated task postponements, team overload flags).
- **Primary User**: Managers & Employees.
- **Information Displayed**: Chronological notification feed categorized by risk level (`Critical` [Rose], `Warning` [Amber], `Info` [Blue]).
- **Primary Actions**: `Tap Notification` (Deep links directly to affected task or team screen), `Mark All as Read`.
- **Empty State**: Bell graphic with *"No unread notifications."*
- **Loading State**: Shimmer list items.
- **Error State**: Failed to load alerts message.
- **Mobile Adaptation**: Native push notification integration and in-app feed.
- **Accessibility**: Unread items highlighted with aria-unread and visual status dots.

---

### Mobile Screen 8: Team Overview (`/mobile/team`)
- **Purpose**: Quick manager mobile view of team members' active task loads and capacity.
- **Primary User**: Managers.
- **Information Displayed**: List of team members with avatar, department, active task count, overdue count badge, and capacity status bar.
- **Primary Actions**: `Tap Employee Card` (Filters task list by employee), `Call/Message Member`.
- **Empty State**: *"No team members found."*
- **Loading State**: Shimmer team list.
- **Error State**: Network connection error banner.
- **Mobile Adaptation**: Compact list view optimized for quick scanning on mobile screens.
- **Accessibility**: Progress bars read out as "X open tasks, Y overdue".

---

## Signature "WOW" Experience: The LoopKeeper Accountability Graph

### Concept & Philosophy
The **LoopKeeper Accountability Graph** is a visual time-series DAG (Directed Acyclic Graph) designed to show hackathon judges and executive users how LoopKeeper tracks commitment state across multiple meetings over time.

$$\text{Meeting} \longrightarrow \text{Commitment} \longrightarrow \text{Person} \longrightarrow \text{Deadline} \longrightarrow \text{Changes} \longrightarrow \text{Outcome}$$

### Visual Architecture & Node Anatomy
The graph renders as an interactive node-link network superimposed on a chronological timeline axis:

```
[ Meeting 1: Sept 1 ] ─────(Extracted Task)─────> [ Task Node: Auth Screen ]
                                                        │
                                                        ▼ (Assigned)
                                                  [ Owner: Vignesh ]
                                                        │
                                                        ▼ (Initial Deadline: Sept 5)
                                                  [ Deadline Node 1 ]
                                                        │
[ Meeting 2: Sept 3 ] ──(Matched Similarity 0.89)───────┤ (Wording Change: "Login work")
                                                        │
                                                        ▼ (Postponed Event + 7 Days)
[ Meeting 3: Sept 5 ] ──(Matched Similarity 0.94)──> [ Deadline Node 2: Sept 12 ]
                                                        │
                                                        ▼ (Current Status)
                                                  [ Status: Overdue / High Risk ]
```

### Key Interactive Features
1. **Node Hover & Click Inspection**: Hovering over any node displays a popover containing:
   - Exact transcript excerpt evidence.
   - Vector similarity score (`similarity_score: 0.887`).
   - AI Model run details (`loopkeeper-slm-v1`, latency `142ms`).
2. **Temporal Time Scrubber**: Dragging a slider back in time reconstructs the graph as it existed at any historical date, showing how deadline extensions accumulated.
3. **Wording Mutation Diff View**: Clicking on a task match node highlights the wording transformation from Meeting 1 *"finish authentication screen"* to Meeting 2 *"get login work completed"*, displaying the semantic similarity score badge.
4. **Postponement Risk Highlight**: Tasks postponed $\ge 2$ times pulse with a subtle Rose glow (`#EF4444`) to immediately draw the eye of judges and managers.

### Graph Filter Controls
- **Date Range Picker**: Filter graph to specific sprint cycles.
- **Assignee Selector**: Isolate tasks owned by a specific team member to audit individual capacity.
- **Minimum Postponement Threshold**: Filter to show only tasks postponed $\ge 1, 2, \text{or } 3$ times.
- **AI Match Confidence Filter**: Slider to filter out match links below a selected confidence threshold.

### Mobile Adaptation of the Graph
On mobile viewports, the multi-branch SVG graph dynamically transforms into a touch-friendly **Vertical Linear Timeline Card View**:
- Nodes become step cards connected by a vertical line.
- Pinch-to-zoom is enabled on an optional full-screen interactive modal view.
- Wording mutations are rendered as inline text diff chips.

### Hackathon Judge Demonstration Strategy (90-Second Walkthrough)
1. **0:00 - 0:20 (The Ingestion)**: Upload Transcript for Meeting 1. Point out automatic extraction of "Vignesh to finish authentication screen by Friday".
2. **0:20 - 0:45 (The Continuity Magic)**: Upload Transcript for Meeting 2 ("Can we get login work completed?"). Open the **Accountability Graph**. Show the node link connecting Meeting 2 to Meeting 1's task via vector similarity matching (`0.887`), demonstrating that LoopKeeper recognized the task despite wording changes.
3. **0:45 - 1:10 (The Postponement Detection)**: Upload Transcript for Meeting 3 ("Auth work needs another week"). Show the graph node updating the deadline, incrementing the postponement counter to `2x`, and pulsing with a **High Risk Alert**.
4. **1:10 - 1:30 (The Workload & Impact)**: Switch to **Team Workload**. Show Vignesh flagged as **Overloaded**, proving how LoopKeeper connects meeting notes directly to burnout prevention.
