import json
import logging
import os
import threading
from abc import ABC, abstractmethod
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

_BACKEND_DIR = Path(__file__).resolve().parent.parent
_DATA_DIR = _BACKEND_DIR / "data"
_SHARES_FILE = _DATA_DIR / "shares.json"


@dataclass
class SharedStory:
    code: str
    title: str
    pages: list[dict]
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class IStoryRepository(ABC):
    @abstractmethod
    def save(self, story: SharedStory) -> None:
        ...

    @abstractmethod
    def get(self, code: str) -> Optional[SharedStory]:
        ...

    @abstractmethod
    def delete(self, code: str) -> None:
        ...


class FileStoryRepository(IStoryRepository):
    def __init__(self, file_path: Path = _SHARES_FILE) -> None:
        self._file_path = file_path
        self._lock = threading.Lock()
        self._ensure_file()

    def _ensure_file(self) -> None:
        self._file_path.parent.mkdir(parents=True, exist_ok=True)
        if not self._file_path.exists():
            self._file_path.write_text("{}")

    def _read_all(self) -> dict[str, dict]:
        try:
            return json.loads(self._file_path.read_text())
        except (json.JSONDecodeError, FileNotFoundError):
            logger.warning("Corrupt or missing shares file, resetting.")
            self._file_path.write_text("{}")
            return {}

    def _write_all(self, data: dict[str, dict]) -> None:
        self._file_path.write_text(json.dumps(data, indent=2))

    def save(self, story: SharedStory) -> None:
        with self._lock:
            data = self._read_all()
            data[story.code] = asdict(story)
            self._write_all(data)
            logger.info("Saved share code=%s title=%.40r", story.code, story.title)

    def get(self, code: str) -> Optional[SharedStory]:
        with self._lock:
            data = self._read_all()
            raw = data.get(code)
            if raw is None:
                return None
            return SharedStory(**raw)

    def delete(self, code: str) -> None:
        with self._lock:
            data = self._read_all()
            data.pop(code, None)
            self._write_all(data)
            logger.info("Deleted share code=%s", code)
