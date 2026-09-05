import base64
import hashlib
import logging
from typing import Optional
from cryptography.fernet import Fernet
from app.core.config import settings

logger = logging.getLogger("app.core.token_encryption")

class TokenEncryptionService:
    """
    Token Encryption Service utilizing Fernet symmetric authenticated encryption
    (AES-128 in CBC mode with PKCS7 padding + HMAC with SHA256 for authentication).
    """
    def __init__(self, master_key_source: Optional[str] = None):
        key_material = (
            master_key_source
            or getattr(settings, "SUPABASE_SERVICE_ROLE_KEY", "")
            or getattr(settings, "SUPABASE_KEY", "")
            or "loopkeeper-master-encryption-secret-key-2026"
        )
        # Derive a 32-byte urlsafe base64 key suitable for Fernet (16 bytes HMAC key + 16 bytes AES-128 key)
        key_hash = hashlib.sha256(key_material.encode("utf-8")).digest()
        fernet_key = base64.urlsafe_b64encode(key_hash)
        self.fernet = Fernet(fernet_key)

    def encrypt_token(self, raw_token: Optional[str]) -> Optional[str]:
        if not raw_token or not raw_token.strip():
            return None
        try:
            encrypted_bytes = self.fernet.encrypt(raw_token.strip().encode("utf-8"))
            return encrypted_bytes.decode("utf-8")
        except Exception as e:
            logger.error(f"Failed to encrypt token: {e}")
            raise ValueError(f"Token encryption failed: {e}")

    def decrypt_token(self, encrypted_token: Optional[str]) -> Optional[str]:
        if not encrypted_token or not encrypted_token.strip():
            return None
        try:
            decrypted_bytes = self.fernet.decrypt(encrypted_token.strip().encode("utf-8"))
            return decrypted_bytes.decode("utf-8")
        except Exception as e:
            logger.warning(f"Failed to decrypt token (may be plaintext or key mismatch): {e}")
            # If not fernet encrypted (e.g. legacy or plaintext token), return as-is
            return encrypted_token

token_encryption_service = TokenEncryptionService()
