from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: str = Field("EXPENSE", max_length=20)  # EXPENSE, INCOME
    icon: str = Field("category", max_length=50)
    color_hex: str = Field("#3869D2", max_length=20)
    is_discretionary: bool = True

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    type: Optional[str] = Field(None, max_length=20)
    icon: Optional[str] = Field(None, max_length=50)
    color_hex: Optional[str] = Field(None, max_length=20)
    is_discretionary: Optional[bool] = None

class CategoryResponse(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: Optional[str] = None
    is_default: bool
    created_at: datetime

class CategoryListResponse(BaseModel):
    items: List[CategoryResponse]
    total_count: int
