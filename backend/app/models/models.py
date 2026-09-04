import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Numeric, Boolean, Integer, CheckConstraint, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Employee(Base):
    __tablename__ = "employees"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    auth_id = Column(UUID(as_uuid=True), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    role = Column(String, nullable=False, default="employee")
    department = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    phone = Column(String, nullable=True)

class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    objective = Column(Text, nullable=True)
    ai_prompt = Column(Text, nullable=False)
    expected_output = Column(Text, nullable=True)
    branch_name = Column(String, nullable=True)
    github_repository = Column(String, nullable=True)
    priority = Column(String, nullable=False)
    deadline = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class LoopKeeperMeeting(Base):
    __tablename__ = "loopkeeper_meetings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    meeting_date = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    source = Column(String, nullable=False, default="transcript")
    external_source_id = Column(String, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("public.employees.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    transcript = relationship("LoopKeeperTranscript", back_populates="meeting", uselist=False, cascade="all, delete-orphan")
    action_items = relationship("LoopKeeperActionItem", back_populates="meeting", cascade="all, delete-orphan")
    participants = relationship("LoopKeeperMeetingParticipant", back_populates="meeting", cascade="all, delete-orphan")

class LoopKeeperTranscript(Base):
    __tablename__ = "loopkeeper_transcripts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("loopkeeper_meetings.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    source_file_name = Column(String, nullable=True)
    transcript_format = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    meeting = relationship("LoopKeeperMeeting", back_populates="transcript")

class LoopKeeperActionItem(Base):
    __tablename__ = "loopkeeper_action_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("loopkeeper_meetings.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    owner_employee_id = Column(UUID(as_uuid=True), ForeignKey("public.employees.id", ondelete="SET NULL"), nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, nullable=False, default="pending")
    confidence = Column(Numeric(4, 3), nullable=False, default=1.000)
    source_text = Column(Text, nullable=True)
    # embedding column stored as vector
    first_seen_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    last_seen_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    meeting = relationship("LoopKeeperMeeting", back_populates="action_items")
    history = relationship("LoopKeeperActionItemHistory", back_populates="action_item", cascade="all, delete-orphan")

class LoopKeeperActionItemHistory(Base):
    __tablename__ = "loopkeeper_action_item_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    action_item_id = Column(UUID(as_uuid=True), ForeignKey("loopkeeper_action_items.id", ondelete="CASCADE"), nullable=False)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("loopkeeper_meetings.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String, nullable=False)
    previous_value = Column(JSONB, nullable=True)
    new_value = Column(JSONB, nullable=True)
    evidence_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    action_item = relationship("LoopKeeperActionItem", back_populates="history")

class LoopKeeperTaskMatch(Base):
    __tablename__ = "loopkeeper_task_matches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    action_item_id = Column(UUID(as_uuid=True), ForeignKey("loopkeeper_action_items.id", ondelete="CASCADE"), nullable=False)
    matched_action_item_id = Column(UUID(as_uuid=True), ForeignKey("loopkeeper_action_items.id", ondelete="SET NULL"), nullable=True)
    matched_valixis_task_id = Column(UUID(as_uuid=True), ForeignKey("public.tasks.id", ondelete="SET NULL"), nullable=True)
    similarity_score = Column(Numeric(5, 4), nullable=True)
    ai_confidence = Column(Numeric(4, 3), nullable=True)
    match_reason = Column(Text, nullable=True)
    decision = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

class LoopKeeperAIRun(Base):
    __tablename__ = "loopkeeper_ai_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("loopkeeper_meetings.id", ondelete="SET NULL"), nullable=True)
    action_item_id = Column(UUID(as_uuid=True), ForeignKey("loopkeeper_action_items.id", ondelete="SET NULL"), nullable=True)
    model_name = Column(String, nullable=False)
    model_version = Column(String, nullable=True)
    provider = Column(String, nullable=False)
    input_hash = Column(String, nullable=True)
    confidence = Column(Numeric(4, 3), nullable=True)
    latency_ms = Column(Integer, nullable=True)
    success = Column(Boolean, nullable=False, default=True)
    fallback_used = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

class LoopKeeperMeetingParticipant(Base):
    __tablename__ = "loopkeeper_meeting_participants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("loopkeeper_meetings.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("public.employees.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    meeting = relationship("LoopKeeperMeeting", back_populates="participants")
