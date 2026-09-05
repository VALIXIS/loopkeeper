import uuid
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.models import LoopKeeperIntegration
from app.core.database import SessionLocal
from app.core.token_encryption import token_encryption_service

logger = logging.getLogger("app.repositories.integration")

class IntegrationRepository:
    def __init__(self, db_session: Optional[Session] = None):
        self.db = db_session
        self._in_memory_integrations: Dict[str, dict] = {}

    def _get_db(self):
        if self.db is not None:
            return self.db, False
        if SessionLocal is not None:
            try:
                session = SessionLocal()
                return session, True
            except Exception:
                return None, False
        return None, False

    def save_integration(
        self,
        provider: str,
        status: str,
        is_connected: bool,
        account_email: Optional[str] = None,
        account_name: Optional[str] = None,
        access_token: Optional[str] = None,
        refresh_token: Optional[str] = None,
        token_type: Optional[str] = "Bearer",
        expires_at: Optional[datetime] = None,
        scopes: Optional[List[str]] = None,
        config: Optional[dict] = None,
        user_id: Optional[UUID] = None
    ) -> dict:
        provider_clean = provider.strip().lower()
        now = datetime.utcnow()

        enc_access = token_encryption_service.encrypt_token(access_token) if access_token else None
        enc_refresh = token_encryption_service.encrypt_token(refresh_token) if refresh_token else None

        db, is_local = self._get_db()
        if db:
            try:
                query = db.query(LoopKeeperIntegration).filter(
                    LoopKeeperIntegration.provider == provider_clean
                )
                if user_id:
                    query = query.filter(LoopKeeperIntegration.user_id == user_id)
                
                existing = query.first()
                if existing:
                    existing.status = status
                    existing.is_connected = is_connected
                    if account_email is not None:
                        existing.account_email = account_email
                    if account_name is not None:
                        existing.account_name = account_name
                    if enc_access is not None:
                        existing.encrypted_access_token = enc_access
                    if enc_refresh is not None:
                        existing.encrypted_refresh_token = enc_refresh
                    if token_type is not None:
                        existing.token_type = token_type
                    if expires_at is not None:
                        existing.expires_at = expires_at
                    if scopes is not None:
                        existing.scopes = scopes
                    if config is not None:
                        existing.config = config
                    existing.updated_at = now

                    db.commit()
                    db.refresh(existing)
                    return self._to_dict(existing, raw_access=access_token, raw_refresh=refresh_token)

                record_id = uuid.uuid4()
                integ_obj = LoopKeeperIntegration(
                    id=record_id,
                    user_id=user_id,
                    provider=provider_clean,
                    status=status,
                    is_connected=is_connected,
                    account_email=account_email,
                    account_name=account_name,
                    encrypted_access_token=enc_access,
                    encrypted_refresh_token=enc_refresh,
                    token_type=token_type,
                    expires_at=expires_at,
                    scopes=scopes,
                    config=config,
                    created_at=now,
                    updated_at=now
                )
                db.add(integ_obj)
                db.commit()
                db.refresh(integ_obj)
                return self._to_dict(integ_obj, raw_access=access_token, raw_refresh=refresh_token)
            except Exception as e:
                db.rollback()
                logger.warning(f"DB error saving integration {provider_clean}: {e}")
            finally:
                if is_local:
                    db.close()

        # In-memory fallback
        key = f"{provider_clean}_{user_id}" if user_id else provider_clean
        rec = {
            "id": uuid.uuid4(),
            "user_id": user_id,
            "provider": provider_clean,
            "status": status,
            "is_connected": is_connected,
            "account_email": account_email,
            "account_name": account_name,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": token_type,
            "expires_at": expires_at,
            "scopes": scopes,
            "config": config or {},
            "last_synced_at": None,
            "created_at": now,
            "updated_at": now
        }
        self._in_memory_integrations[key] = rec
        return rec

    def get_integration(self, provider: str, user_id: Optional[UUID] = None) -> Optional[dict]:
        provider_clean = provider.strip().lower()
        db, is_local = self._get_db()
        if db:
            try:
                query = db.query(LoopKeeperIntegration).filter(
                    LoopKeeperIntegration.provider == provider_clean
                )
                if user_id:
                    query = query.filter(LoopKeeperIntegration.user_id == user_id)
                
                existing = query.first()
                if existing:
                    raw_access = token_encryption_service.decrypt_token(existing.encrypted_access_token)
                    raw_refresh = token_encryption_service.decrypt_token(existing.encrypted_refresh_token)
                    return self._to_dict(existing, raw_access=raw_access, raw_refresh=raw_refresh)
            except Exception as e:
                logger.warning(f"DB error fetching integration {provider_clean}: {e}")
            finally:
                if is_local:
                    db.close()

        key = f"{provider_clean}_{user_id}" if user_id else provider_clean
        return self._in_memory_integrations.get(key) or self._in_memory_integrations.get(provider_clean)

    def update_sync_timestamp(self, provider: str, user_id: Optional[UUID] = None) -> None:
        provider_clean = provider.strip().lower()
        now = datetime.utcnow()
        db, is_local = self._get_db()
        if db:
            try:
                query = db.query(LoopKeeperIntegration).filter(
                    LoopKeeperIntegration.provider == provider_clean
                )
                if user_id:
                    query = query.filter(LoopKeeperIntegration.user_id == user_id)
                existing = query.first()
                if existing:
                    existing.last_synced_at = now
                    existing.updated_at = now
                    db.commit()
            except Exception as e:
                db.rollback()
                logger.warning(f"DB error updating sync timestamp for {provider_clean}: {e}")
            finally:
                if is_local:
                    db.close()

        key = f"{provider_clean}_{user_id}" if user_id else provider_clean
        if key in self._in_memory_integrations:
            self._in_memory_integrations[key]["last_synced_at"] = now

    def disconnect_integration(self, provider: str, user_id: Optional[UUID] = None) -> bool:
        provider_clean = provider.strip().lower()
        db, is_local = self._get_db()
        if db:
            try:
                query = db.query(LoopKeeperIntegration).filter(
                    LoopKeeperIntegration.provider == provider_clean
                )
                if user_id:
                    query = query.filter(LoopKeeperIntegration.user_id == user_id)
                existing = query.first()
                if existing:
                    existing.status = "not_connected"
                    existing.is_connected = False
                    existing.encrypted_access_token = None
                    existing.encrypted_refresh_token = None
                    existing.account_email = None
                    existing.account_name = None
                    existing.updated_at = datetime.utcnow()
                    db.commit()
            except Exception as e:
                db.rollback()
                logger.warning(f"DB error disconnecting {provider_clean}: {e}")
            finally:
                if is_local:
                    db.close()

        key = f"{provider_clean}_{user_id}" if user_id else provider_clean
        if key in self._in_memory_integrations:
            self._in_memory_integrations[key]["status"] = "not_connected"
            self._in_memory_integrations[key]["is_connected"] = False
            self._in_memory_integrations[key]["access_token"] = None
            self._in_memory_integrations[key]["refresh_token"] = None
        return True

    def _to_dict(
        self,
        obj: LoopKeeperIntegration,
        raw_access: Optional[str] = None,
        raw_refresh: Optional[str] = None
    ) -> dict:
        return {
            "id": obj.id,
            "user_id": obj.user_id,
            "provider": obj.provider,
            "status": obj.status,
            "is_connected": obj.is_connected,
            "account_email": obj.account_email,
            "account_name": obj.account_name,
            "access_token": raw_access,
            "refresh_token": raw_refresh,
            "token_type": obj.token_type,
            "expires_at": obj.expires_at,
            "scopes": obj.scopes,
            "config": obj.config or {},
            "last_synced_at": obj.last_synced_at,
            "created_at": obj.created_at,
            "updated_at": obj.updated_at
        }
