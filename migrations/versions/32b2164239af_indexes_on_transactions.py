"""indexes on transactions

Revision ID: 32b2164239af
Revises: 38943faf4400
Create Date: 2026-11-22 10:32:41.442258

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '32b2164239af'
down_revision: Union[str, Sequence[str], None] = '38943faf4400'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index("ix_transactions_user_id", "transactions", ["user_id"])
    op.create_index("ix_transactions_category", "transactions", ["category"])
    op.create_index("ix_transactions_created_at", "transactions", ["created_at"])
    op.create_index("ix_transactions_type", "transactions", ["type"])


def downgrade() -> None:
    op.drop_index("ix_transactions_user_id", table_name="transactions")
    op.drop_index("ix_transactions_category", table_name="transactions")
    op.drop_index("ix_transactions_created_at", table_name="transactions")
    op.drop_index("ix_transactions_type", table_name="transactions")
