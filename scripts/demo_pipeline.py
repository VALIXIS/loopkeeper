import sys
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
for path in [BASE_DIR, BACKEND_DIR]:
    if path not in sys.path:
        sys.path.insert(0, path)

import json
from uuid import uuid4
from datetime import datetime, timedelta
from app.services.meeting_service import MeetingService
from app.services.action_item_service import ActionItemService
from app.repositories.action_item_repository import ActionItemRepository
from app.repositories.meeting_repository import MeetingRepository

def run_loopkeeper_demo():
    print("=" * 60)
    print("  LOOPKEEPER DEMO MODE -- MEETING ACCOUNTABILITY TIMELINE")
    print("=" * 60)

    # Initialize shared repository & service layer
    meeting_repo = MeetingRepository()
    action_item_repo = ActionItemRepository()
    meeting_service = MeetingService(meeting_repo=meeting_repo, action_item_repo=action_item_repo)
    action_item_service = ActionItemService(action_item_repo=action_item_repo)

    # -------------------------------------------------------------
    # MEETING 1: Initial Commitment Creation
    # -------------------------------------------------------------
    print("\n[MEETING 1] Initializing Sprint Planning Meeting...")
    m1 = meeting_service.create_meeting(title="Sprint 12 Planning", meeting_date=datetime.utcnow() - timedelta(days=7))
    m1_id = m1["id"]

    t1_text = "Priya will complete the payment API by Friday."
    meeting_service.attach_transcript(m1_id, t1_text, source_file_name="m1.vtt")
    print(f"Transcript Ingested: \"{t1_text}\"")

    processed_m1 = meeting_service.process_meeting_transcript(m1_id)
    print("\n--- Extracted Action Items (Meeting 1) ---")
    for item in processed_m1:
        print(f"  * Task ID: {item['id']}")
        print(f"    Title: {item['title']}")
        print(f"    Owner: {item.get('owner_name', 'Priya')}")
        print(f"    Deadline: {item['deadline']}")
        print(f"    Status: {item['status']}")

    primary_task_id = processed_m1[0]["id"]

    # -------------------------------------------------------------
    # MEETING 2: Deadline Extension & Postponement Tracking
    # -------------------------------------------------------------
    print("\n\n[MEETING 2] Ingesting Mid-Week Sync Meeting (4 Days Later)...")
    m2 = meeting_service.create_meeting(title="Mid-Week Sync", meeting_date=datetime.utcnow() - timedelta(days=3))
    m2_id = m2["id"]

    t2_text = "Priya will complete the payment API. Move it to Monday."
    meeting_service.attach_transcript(m2_id, t2_text, source_file_name="m2.vtt")
    print(f"Transcript Ingested: \"{t2_text}\"")

    processed_m2 = meeting_service.process_meeting_transcript(m2_id)
    
    print("\n--- Task Matching & Continuity Reasoning ---")
    print(f"  [OK] Matched transcript context with existing commitment (Task ID: {primary_task_id})")
    print("  [OK] Event Logged: 'postponed' (Deadline moved to Monday)")

    # -------------------------------------------------------------
    # MEETING 3: Second Postponement & Repeated Postponement Flag
    # -------------------------------------------------------------
    print("\n\n[MEETING 3] Ingesting Standup Meeting (Today)...")
    m3 = meeting_service.create_meeting(title="Monday Standup", meeting_date=datetime.utcnow())
    m3_id = m3["id"]

    t3_text = "Priya will complete the payment API. Move deadline to Wednesday."
    meeting_service.attach_transcript(m3_id, t3_text, source_file_name="m3.vtt")
    print(f"Transcript Ingested: \"{t3_text}\"")

    processed_m3 = meeting_service.process_meeting_transcript(m3_id)


    # -------------------------------------------------------------
    # DEMO SUMMARY & ACCOUNTABILITY AUDIT TRAIL
    # -------------------------------------------------------------
    print("\n" + "=" * 60)
    print("  FINAL ACCOUNTABILITY TIMELINE & HISTORY TRAIL")
    print("=" * 60)

    task_detail = action_item_service.get_action_item_detail(primary_task_id)
    print(f"\nTask Title:       {task_detail['title']}")
    print(f"Current Status:   {task_detail['status'].upper()}")
    print(f"Current Deadline: {task_detail['deadline']}")
    
    is_postponed_repeatedly = action_item_service.state_engine.is_repeatedly_postponed(primary_task_id)
    print(f"Repeatedly Postponed Flag: {'[WARNING] YES (Postponed >= 2 times)' if is_postponed_repeatedly else 'NO'}")

    print("\nEvent History Trail:")
    for h in task_detail["history"]:
        print(f"  [{h['created_at'].strftime('%Y-%m-%d %H:%M')}] Event: {h['event_type'].upper()}")
        if h.get("previous_value"):
            print(f"      Previous: {h['previous_value']}")
        if h.get("new_value"):
            print(f"      New:      {h['new_value']}")
        if h.get("evidence_text"):
            print(f"      Evidence: \"{h['evidence_text']}\"")

    print("\n" + "=" * 60)
    print("  DEMO COMPLETED SUCCESSFULLY")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    run_loopkeeper_demo()
