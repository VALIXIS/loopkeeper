import hashlib
import logging

def hash_input(text: str) -> str:
    """Generate SHA-256 hash for raw transcript input tracking."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def sanitize_input(text: str) -> str:
    """Sanitize transcript input before sending to AI processing."""
    if not text:
        return ""
    return text.strip()
