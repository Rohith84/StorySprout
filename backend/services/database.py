import os
import logging
from typing import List, Optional
from datetime import datetime, timezone
from pymongo import MongoClient
from models import UserSettings, SavedStory

logger = logging.getLogger(__name__)

class MongoDBManager:
    def __init__(self) -> None:
        self._uri = os.getenv("MONGODB_URI")
        self._client = None
        self._db = None
        self._settings_col = None
        self._stories_col = None

        if self._uri:
            try:
                import certifi
                self._client = MongoClient(self._uri, tlsCAFile=certifi.where())
                # Test connection
                self._client.admin.command('ping')
                self._db = self._client["storysprout"]
                self._settings_col = self._db["settings"]
                self._stories_col = self._db["stories"]
                
                # Create unique indexes
                self._settings_col.create_index("userId", unique=True)
                self._stories_col.create_index("storyId", unique=True)
                self._stories_col.create_index("userId")
                logger.info("Successfully connected to MongoDB.")
            except Exception as e:
                logger.error(f"Failed to connect to MongoDB: {e}")
                self._client = None
                self._db = None
        else:
            logger.warning("MONGODB_URI environment variable is missing. MongoDBManager is disabled.")

    @property
    def is_connected(self) -> bool:
        return self._client is not None

    def get_settings(self, user_id: str) -> Optional[dict]:
        if not self.is_connected:
            return None
        doc = self._settings_col.find_one({"userId": user_id})
        if doc:
            doc.pop("_id", None)
            return doc
        return None

    def save_settings(self, settings: UserSettings) -> bool:
        if not self.is_connected:
            return False
        try:
            data = settings.model_dump()
            data["updatedAt"] = datetime.now(timezone.utc).isoformat()
            self._settings_col.update_one(
                {"userId": settings.userId},
                {"$set": data},
                upsert=True
            )
            return True
        except Exception as e:
            logger.error(f"Error saving settings to MongoDB: {e}")
            return False

    def save_story(self, story: SavedStory) -> bool:
        if not self.is_connected:
            return False
        try:
            data = story.model_dump()
            if not data.get("createdAt"):
                data["createdAt"] = datetime.now(timezone.utc).isoformat()
            self._stories_col.update_one(
                {"storyId": story.storyId},
                {"$set": data},
                upsert=True
            )
            return True
        except Exception as e:
            logger.error(f"Error saving story to MongoDB: {e}")
            return False

    def get_story(self, story_id: str) -> Optional[dict]:
        if not self.is_connected:
            return None
        doc = self._stories_col.find_one({"storyId": story_id})
        if doc:
            doc.pop("_id", None)
            return doc
        return None

    def list_stories(self, user_id: str) -> List[dict]:
        if not self.is_connected:
            return []
        try:
            # Sort by createdAt descending (newest first)
            cursor = self._stories_col.find({"userId": user_id}).sort("createdAt", -1)
            results = []
            for doc in cursor:
                doc.pop("_id", None)
                results.append(doc)
            return results
        except Exception as e:
            logger.error(f"Error listing stories from MongoDB: {e}")
            return []

    def delete_story(self, story_id: str) -> bool:
        if not self.is_connected:
            return False
        try:
            res = self._stories_col.delete_one({"storyId": story_id})
            return res.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting story from MongoDB: {e}")
            return False
