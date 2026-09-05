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
    recordings = relationship("LoopKeeperRecording", back_populates="meeting", cascade="all, delete-orphan")

class LoopKeeperRecording(Base):
    __tablename__ = "loopkeeper_recordings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("loopkeeper_meetings.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(String, nullable=False)
    file_name = Column(String, nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    format = Column(String, nullable=False, default="mp3")
    status = Column(String, nullable=False, default="uploaded")  # uploaded, transcribing, completed, failed
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    meeting = relationship("LoopKeeperMeeting", back_populates="recordings")

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
    first_seen_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    last_seen_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    meeting = relationship("LoopKeeperMeeting", back_populates="action_items")
    history = relationship("LoopKeeperActionItemHistory", back_populates="action_item", cascade="all, delete-orphan")
    jira_links = relationship("LoopKeeperJiraLink", back_populates="action_item", cascade="all, delete-orphan")
    proof_of_work = relationship("LoopKeeperProofOfWork", back_populates="action_item", cascade="all, delete-orphan")

class LoopKeeperProofOfWork(Base):
    __tablename__ = "loopkeeper_proof_of_work"
    __table_args__ = (
        UniqueConstraint("provider", "repository", "pr_number", "external_event_type", name="loopkeeper_pow_unique_event"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    action_item_id = Column(UUID(as_uuid=True), ForeignKey("loopkeeper_action_items.id", ondelete="CASCADE"), nullable=False)
    provider = Column(String, nullable=False, default="github")
    external_event_type = Column(String, nullable=False, default="pr_opened")
    external_event_id = Column(String, nullable=False)
    repository = Column(String, nullable=False)
    pr_number = Column(Integer, nullable=False)
    pr_title = Column(String, nullable=False)
    pr_url = Column(String, nullable=False)
    author_login = Column(String, nullable=False)
    author_email = Column(String, nullable=True)
    resolution_method = Column(String, nullable=False)  # explicit_key, vector_similarity
    similarity_score = Column(Numeric(5, 4), nullable=True)
    evidence_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    action_item = relationship("LoopKeeperActionItem", back_populates="proof_of_work")


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

class LoopKeeperIntegration(Base):
    __tablename__ = "loopkeeper_integrations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=True)
    provider = Column(String, nullable=False)  # google_meet, jira, ms_teams, zoom, slack
    status = Column(String, nullable=False, default="not_connected") # connected, not_connected, reauthorization_required, authorization_required, admin_consent_required, error
    is_connected = Column(Boolean, nullable=False, default=False)
    account_email = Column(String, nullable=True)
    account_name = Column(String, nullable=True)
    encrypted_access_token = Column(Text, nullable=True)
    encrypted_refresh_token = Column(Text, nullable=True)
    token_type = Column(String, nullable=True, default="Bearer")
    expires_at = Column(DateTime(timezone=True), nullable=True)
    scopes = Column(JSONB, nullable=True)
    config = Column(JSONB, nullable=True)
    last_synced_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

class LoopKeeperJiraLink(Base):
    __tablename__ = "loopkeeper_jira_links"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    action_item_id = Column(UUID(as_uuid=True), ForeignKey("loopkeeper_action_items.id", ondelete="CASCADE"), nullable=False)
    jira_issue_key = Column(String, nullable=False)
    jira_issue_id = Column(String, nullable=True)
    jira_issue_url = Column(String, nullable=True)
    jira_status = Column(String, nullable=False, default="To Do")
    jira_assignee = Column(String, nullable=True)
    synced_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    action_item = relationship("LoopKeeperActionItem", back_populates="jira_links")

class LoopKeeperExecutionDrift(Base):
    __tablename__ = "loopkeeper_execution_drift"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    action_item_id = Column(UUID(as_uuid=True), ForeignKey("loopkeeper_action_items.id", ondelete="CASCADE"), nullable=False)
    meeting_statement = Column(Text, nullable=False)
    external_system = Column(String, nullable=False)  # jira, github, valixis
    external_evidence = Column(Text, nullable=False)
    drift_status = Column(String, nullable=False)  # aligned, execution_evidence_present, execution_drift, insufficient_evidence
    discrepancy_reason = Column(Text, nullable=True)
    confidence = Column(Numeric(4, 3), nullable=False, default=1.000)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
