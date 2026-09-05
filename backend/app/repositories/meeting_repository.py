import uuid
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.models import LoopKeeperMeeting, LoopKeeperTranscript, LoopKeeperMeetingParticipant
from app.core.database import SessionLocal

class MeetingRepository:
    def __init__(self, db_session: Optional[Session] = None):
        self.db = db_session
        self._in_memory_meetings: dict = {}
        self._in_memory_transcripts: dict = {}
        self._in_memory_participants: dict = {}

    def _get_db(self):
        if self.db is not None:
            return self.db, False
        if SessionLocal is not None:
            session = SessionLocal()
            return session, True
        return None, False

    def create_meeting(
        self,
        title: str,
        meeting_date: Optional[datetime] = None,
        source: str = "transcript",
        external_source_id: Optional[str] = None,
        created_by: Optional[UUID] = None,
        participant_ids: Optional[List[UUID]] = None
    ) -> dict:
        m_id = uuid.uuid4()
        now = datetime.utcnow()
        m_date = meeting_date or now

        db, is_local = self._get_db()
        if db:
            try:
                meeting_obj = LoopKeeperMeeting(
                    id=m_id,
                    title=title,
                    meeting_date=m_date,
                    source=source,
                    external_source_id=external_source_id,
                    created_by=created_by,
                    created_at=now,
                    updated_at=now
                )
                db.add(meeting_obj)
                
                if participant_ids:
                    for pid in participant_ids:
                        p_obj = LoopKeeperMeetingParticipant(
                            id=uuid.uuid4(),
                            meeting_id=m_id,
                            employee_id=pid,
                            created_at=now
                        )
                        db.add(p_obj)
                
                db.commit()
                db.refresh(meeting_obj)
                res = {
                    "id": meeting_obj.id,
                    "title": meeting_obj.title,
                    "meeting_date": meeting_obj.meeting_date,
                    "source": meeting_obj.source,
                    "external_source_id": meeting_obj.external_source_id,
                    "created_by": meeting_obj.created_by,
                    "created_at": meeting_obj.created_at,
                    "updated_at": meeting_obj.updated_at
                }
                return res
            except Exception:
                db.rollback()
                raise
            finally:
                if is_local:
                    db.close()

        # In-memory fallback if no database connection
        meeting = {
            "id": m_id,
            "title": title,
            "meeting_date": m_date,
            "source": source,
            "external_source_id": external_source_id,
            "created_by": created_by,
            "created_at": now,
            "updated_at": now
        }
        self._in_memory_meetings[m_id] = meeting
        if participant_ids:
            self._in_memory_participants[m_id] = list(participant_ids)
        return meeting

    def attach_transcript(
        self,
        meeting_id: UUID,
        content: str,
        source_file_name: Optional[str] = None,
        transcript_format: Optional[str] = None
    ) -> dict:
        t_id = uuid.uuid4()
        now = datetime.utcnow()

        db, is_local = self._get_db()
        if db:
            try:
                transcript_obj = LoopKeeperTranscript(
                    id=t_id,
                    meeting_id=meeting_id,
                    content=content,
                    source_file_name=source_file_name,
                    transcript_format=transcript_format,
                    created_at=now
                )
                db.add(transcript_obj)
                db.commit()
                db.refresh(transcript_obj)
                return {
                    "id": transcript_obj.id,
                    "meeting_id": transcript_obj.meeting_id,
                    "content": transcript_obj.content,
                    "source_file_name": transcript_obj.source_file_name,
                    "transcript_format": transcript_obj.transcript_format,
                    "created_at": transcript_obj.created_at
                }
            except Exception:
                db.rollback()
                raise
            finally:
                if is_local:
                    db.close()

        transcript = {
            "id": t_id,
            "meeting_id": meeting_id,
            "content": content,
            "source_file_name": source_file_name,
            "transcript_format": transcript_format,
            "created_at": now
        }
        self._in_memory_transcripts[meeting_id] = transcript
        return transcript

    def get_meeting(self, meeting_id: UUID) -> Optional[dict]:
        db, is_local = self._get_db()
        if db:
            try:
                m = db.query(LoopKeeperMeeting).filter(LoopKeeperMeeting.id == meeting_id).first()
                if m:
                    return {
                        "id": m.id,
                        "title": m.title,
                        "meeting_date": m.meeting_date,
                        "source": m.source,
                        "external_source_id": m.external_source_id,
                        "created_by": m.created_by,
                        "created_at": m.created_at,
                        "updated_at": m.updated_at
                    }
            finally:
                if is_local:
                    db.close()
        return self._in_memory_meetings.get(meeting_id)

    def get_transcript(self, meeting_id: UUID) -> Optional[dict]:
        db, is_local = self._get_db()
        if db:
            try:
                t = db.query(LoopKeeperTranscript).filter(LoopKeeperTranscript.id == meeting_id).first()
                if t:
                    return {
                        "id": t.id,
                        "meeting_id": t.meeting_id,
                        "content": t.content,
                        "source_file_name": t.source_file_name,
                        "transcript_format": t.transcript_format,
                        "created_at": t.created_at
                    }
            finally:
                if is_local:
                    db.close()
        return self._in_memory_transcripts.get(meeting_id)

    def list_meetings(self) -> List[dict]:
        db, is_local = self._get_db()
        if db:
            try:
                meetings = db.query(LoopKeeperMeeting).order_by(LoopKeeperMeeting.meeting_date.desc()).all()
                return [
                    {
                        "id": m.id,
                        "title": m.title,
                        "meeting_date": m.meeting_date,
                        "source": m.source,
                        "external_source_id": m.external_source_id,
                        "created_by": m.created_by,
                        "created_at": m.created_at,
                        "updated_at": m.updated_at
                    }
                    for m in meetings
                ]
            finally:
                if is_local:
                    db.close()
        return list(self._in_memory_meetings.values())

    def get_participants(self, meeting_id: UUID) -> List[UUID]:
        db, is_local = self._get_db()
        if db:
            try:
                parts = db.query(LoopKeeperMeetingParticipant).filter(LoopKeeperMeetingParticipant.meeting_id == meeting_id).all()
                return [p.employee_id for p in parts]
            finally:
                if is_local:
                    db.close()
        return self._in_memory_participants.get(meeting_id, [])

    def get_meeting_by_external_id(self, source: str, external_source_id: str) -> Optional[dict]:
        if not source or not external_source_id:
            return None
        source_clean = source.strip().lower()
        ext_clean = str(external_source_id).strip()

        db, is_local = self._get_db()
        if db:
            try:
                m = db.query(LoopKeeperMeeting).filter(
                    LoopKeeperMeeting.source == source_clean,
                    LoopKeeperMeeting.external_source_id == ext_clean
                ).first()
                if m:
                    return {
                        "id": m.id,
                        "title": m.title,
                        "meeting_date": m.meeting_date,
                        "source": m.source,
                        "external_source_id": m.external_source_id,
                        "created_by": m.created_by,
                        "created_at": m.created_at,
                        "updated_at": m.updated_at
                    }
            finally:
                if is_local:
                    db.close()

        for m in self._in_memory_meetings.values():
            if m.get("source", "").lower() == source_clean and str(m.get("external_source_id", "")).strip() == ext_clean:
                return m
        return None
