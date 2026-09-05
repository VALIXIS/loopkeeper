import re
from typing import List, Dict, Any, Optional

class GoogleMeetTranscriptParser:
    """Parses Google Meet export transcript formats (VTT, SBV, TXT, timestamped transcript) preserving speaker attribution."""

    @staticmethod
    def parse_transcript(content: str, filename: Optional[str] = None) -> Dict[str, Any]:
        if not content or not content.strip():
            return {
                "raw_content": "",
                "normalized_text": "",
                "utterances": [],
                "speakers": []
            }

        lines = content.splitlines()
        utterances: List[Dict[str, Any]] = []
        speakers = set()

        current_speaker = "Unresolved Speaker"
        current_timestamp = ""

        for line in lines:
            line_str = line.strip()
            if not line_str or line_str.startswith("WEBVTT") or line_str.isdigit() or "-->" in line_str:
                continue

            # Check timestamp patterns: [10:32:15] or [10:32]
            ts_match = re.search(r'\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?', line_str)
            if ts_match:
                current_timestamp = ts_match.group(1)
                # Strip timestamp prefix from line
                line_str = re.sub(r'^\[?\d{1,2}:\d{2}(?::\d{2})?\]?\s*:?', '', line_str).strip()

            # Check speaker attribution patterns: "Speaker Name:", "[Speaker Name]:", "Speaker Name -"
            speaker_match = re.match(r'^(?:\[([^\]]+)\]|([A-Z][a-zA-Z0-9_\s.]+):|([A-Z][a-zA-Z0-9_\s.]+)\s+-)\s*(.*)', line_str)
            if speaker_match:
                spk = speaker_match.group(1) or speaker_match.group(2) or speaker_match.group(3)
                dialogue = speaker_match.group(4)
                
                if spk and spk.strip():
                    current_speaker = spk.strip()
                    speakers.add(current_speaker)
                
                if dialogue and dialogue.strip():
                    utterances.append({
                        "speaker": current_speaker,
                        "timestamp": current_timestamp,
                        "text": dialogue.strip()
                    })
            elif line_str:
                # Text line without explicit speaker header
                utterances.append({
                    "speaker": current_speaker,
                    "timestamp": current_timestamp,
                    "text": line_str
                })

        # Construct normalized representation preserving speaker attribution
        normalized_lines = []
        for u in utterances:
            ts_prefix = f"[{u['timestamp']}] " if u['timestamp'] else ""
            spk_prefix = f"{u['speaker']}: " if u['speaker'] and u['speaker'] != "Unresolved Speaker" else ""
            normalized_lines.append(f"{ts_prefix}{spk_prefix}{u['text']}")

        normalized_text = "\n".join(normalized_lines) if normalized_lines else content.strip()

        return {
            "raw_content": content,
            "normalized_text": normalized_text,
            "utterances": utterances,
            "speakers": sorted(list(speakers))
        }
