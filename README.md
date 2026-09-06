# ⚡ LoopKeeper

> **Tagline:** *From Spoken Commitments to Verified Deliverables.*  
> **Status:** Production Ready | 100% Audited & Presentation-Grade  
> **Repository:** [https://github.com/VALIXIS/loopkeeper.git](https://github.com/VALIXIS/loopkeeper.git)

---

## 🎯 Executive Overview

In modern engineering teams, up to 30% of critical technical decisions made during meetings vanish without being executed because no one manually creates a ticket. 

**LoopKeeper** closes the loop between unstructured meeting speech and verified code delivery:
1. **Speech & Audio Ingestion**: Ingests meeting recordings and live microphone/screen audio from Google Meet and Zoom.
2. **AI Action Item Extraction**: Fine-tuned Small Language Model (`loopkeeper-slm-v1`) extracts explicit commitments, assignees, and target dates with fallback to Google Gemini Flash.
3. **Vector Semantic Deduplication**: Computes 384-dimensional embeddings to match new action items against existing project tasks, avoiding duplicate tickets.
4. **Atlassian Jira Synchronization**: Automatically creates and links Jira Cloud issues (`LOOP-xxx`).
5. **GitHub Proof-of-Work Verification**: Listens to GitHub Pull Request webhooks to automatically flip commitments to **COMPLETED** upon code merge.

---

## 🌟 Key Platform Modules & Highlights

### 🕸️ 1. Interactive 3D Accountability Holodeck
- **Native Browser Fullscreen (F11)**: Click **Fullscreen** or press <kbd>F11</kbd> / <kbd>F</kbd> for a 100% monitor takeover view.
- **5 Concentric Spatial Orbits**:
  - **Center Nucleus (Indigo Sphere)**: LoopKeeper AI Vector Engine (384-dim).
  - **Inner Orbit (Blue Capsules)**: Ingested Meetings.
  - **Middle Orbit (Glowing Spheres)**: Extracted Commitments with confidence ratings.
  - **Outer Orbit (Purple Octagons)**: Responsible Owners & Leads.
  - **External Orbit (Diamonds)**: Synced Jira issues & verified GitHub PRs.
- **Lineage Beam Tracing**: Click any node to illuminate its 3D beam connection to the originating meeting, assigned lead, and verified PR.
- **Global Hotkeys**: <kbd>S</kbd> (Toggle 360° Auto-Spin), <kbd>R</kbd> (Reset Isometric Camera), <kbd>+</kbd>/<kbd>-</kbd> (Zoom).

### 🔐 2. Role-Based Access Control (RBAC)
- **Managers (Subhash & Jyothsna)**: Complete administrative oversight, cross-team workload radar, postponement drift alerts, and 3D lineage inspection.
- **Employees (Individual Assignees)**: Simplified, restricted portal showing **only their assigned tasks** without administrative clutter.
- **Session Management**: One-click **Sign Out Session** button located in the bottom-left sidebar navigation.

### 🎙️ 3. Meeting Studio & Automated Notifications
- **Google Meet Auto-URL Generator**: Automatically generates unique Google Meet links (`https://meet.google.com/lk-xxx-yyy`) upon meeting creation.
- **Automated Delivery Alerts**: Sends email invitations and triggers real-time in-app toast notifications.
- **Live Recording Studio**: Real-time microphone and screen audio capture with browser speech-to-text diarization.

### 📊 4. Execution Drift & Workload Radar
- **Postponement Drift Detection**: Tracks deadline extensions across meetings and triggers alert badges (`2x Postponed`) to prevent sprint cascades.
- **AI Capacity Rebalancer**: Automatically redistributes tasks from overloaded engineers to team members with free capacity.

### 🎨 5. Audited Light & Dark Theme Support
- **Dark Mode**: Cyber neon visualizer with glassmorphism panels.
- **Light Mode**: High-contrast black typography and clear borders (100% audited for zero illegible text).

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Web Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Canvas 3D Engine |
| **Mobile Client** | Flutter, Dart |
| **Backend API** | Python 3.11, FastAPI, Pydantic v2, Uvicorn, SQLAlchemy |
| **Vector Database** | PostgreSQL + pgvector (384-dim & 1536-dim embeddings) |
| **AI / SLM Engine** | Fine-tuned `loopkeeper-slm-v1` + Google Gemini Flash API Fallback |
| **Integrations** | Atlassian Jira Cloud REST API v3, GitHub Pull Request Webhooks |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+ (for backend)

### 1. Web Frontend Setup
```bash
# Navigate to web directory
cd web

# Install dependencies
npm install

# Run local development server
npm run dev

# Run production build & typecheck
npm run build
```

### 2. Backend FastAPI Server Setup
```bash
# Quick Launch on Windows:
Double-click start-backend.bat

# Or run manually via Terminal:
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## 📁 Repository Structure

```
loopkeeper/
├── web/                           # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── graph/             # 3D Holodeck Knowledge Graph
│   │   │   ├── meetings/          # Meeting Ingestion & Pipeline Visualizer
│   │   │   ├── tasks/             # Commitments & Lineage Inspection
│   │   │   ├── dashboard/         # Executive Dashboard & Workload Cards
│   │   │   ├── common/            # Icons, Navbar, Sidebar, AI Chatbot
│   │   │   └── auth/              # Role-Based Login & Profile Management
│   │   ├── context/               # AuthContext, AppContext, RouterContext
│   │   └── services/              # API Client & Mock Data Fallbacks
├── docs/                          # Comprehensive Technical Specifications
│   ├── architecture/              # AI Architecture & Database Schemas
│   ├── api/                       # OpenAPI Contracts
│   └── USER_GUIDE.md              # User Onboarding Guide
├── mobile/                        # Flutter Mobile Application
├── app/                           # FastAPI Python Backend
└── README.md                      # Master Repository Guide
```

---

## 👥 Project Leadership

- **Jyothsna (Product Lead & System Architecture)**: Manager Account & Product Oversight.
- **Subhash (Technical Lead & Full-Stack AI Engineer)**: Lead Developer & Manager Account.

---

## 📄 License & Attribution

Developed for **GENESIS Hackathon Evaluation**. All rights reserved. LoopKeeper Platform v2.0.
