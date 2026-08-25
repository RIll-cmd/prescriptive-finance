from sqlalchemy import Column, String, DateTime, func
from app.core.database import Base

class AiConversationModel(Base):
    __tablename__ = "ai_conversations"

    id = Column(String, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
