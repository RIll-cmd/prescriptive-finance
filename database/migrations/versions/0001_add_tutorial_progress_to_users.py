"""add tutorial_progress to users

Revision ID: 0001_add_tutorial_progress
Revises: 
Create Date: 2026-08-29 12:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0001_add_tutorial_progress'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add tutorial_progress column to users table
    try:
        op.add_column(
            'users',
            sa.Column('tutorial_progress', sa.String(length=1000), server_default='{}', nullable=False)
        )
    except Exception:
        # Column may already exist from init_db migration
        pass


def downgrade() -> None:
    try:
        op.drop_column('users', 'tutorial_progress')
    except Exception:
        pass
