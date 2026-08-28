from typing import List, Optional, Tuple
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_, update
from fastapi import HTTPException, status
from app.models.goal import GoalModel
from app.models.goal_contribution import GoalContributionModel
from app.models.money_source import MoneySourceModel
from app.models.transaction import TransactionModel
from app.schemas.goal import (
    GoalCreate,
    GoalUpdate,
    GoalResponse,
    GoalListResponse,
    GoalContributionCreate,
    GoalContributionResponse,
    GoalContributionListResponse,
    GoalAnalytics
)

class GoalService:
    @classmethod
    async def create_goal(cls, db: AsyncSession, user_id: str, payload: GoalCreate) -> GoalResponse:
        init_amount = payload.current_amount or Decimal("0.00")
        initial_status = "COMPLETED" if init_amount >= payload.target_amount else "ACTIVE"
        completed_at = datetime.now(timezone.utc) if initial_status == "COMPLETED" else None

        goal = GoalModel(
            id=str(uuid.uuid4()),
            user_id=user_id,
            name=payload.name,
            description=payload.description,
            target_amount=payload.target_amount,
            current_amount=init_amount,
            target_date=payload.target_date,
            priority=payload.priority,
            status=initial_status,
            category=payload.category,
            color_hex=payload.color_hex or "#C57CF9",
            icon=payload.icon or "savings",
            completed_at=completed_at
        )
        db.add(goal)

        # If user provided initial saved amount
        if init_amount > Decimal("0.00"):
            c_date = date.today()
            tx_id = None

            if payload.money_source_id and payload.record_transaction:
                ms_stmt = select(MoneySourceModel).where(
                    MoneySourceModel.id == payload.money_source_id,
                    MoneySourceModel.user_id == user_id
                )
                source = (await db.execute(ms_stmt)).scalar_one_or_none()
                if source:
                    tx = TransactionModel(
                        id=str(uuid.uuid4()),
                        user_id=user_id,
                        money_source_id=source.id,
                        type="EXPENSE",
                        amount=init_amount,
                        merchant=f"Goal: {goal.name}",
                        description=f"Initial seed allocation to {goal.name}",
                        transaction_date=c_date,
                        source="MANUAL"
                    )
                    db.add(tx)
                    source.current_balance -= init_amount
                    tx_id = tx.id

            contrib = GoalContributionModel(
                id=str(uuid.uuid4()),
                goal_id=goal.id,
                user_id=user_id,
                amount=init_amount,
                contribution_date=c_date,
                money_source_id=payload.money_source_id,
                transaction_id=tx_id,
                note="Initial saved balance"
            )
            db.add(contrib)

        await db.commit()
        await db.refresh(goal)
        return await cls._enrich_goal(db, goal)

    @classmethod
    async def get_goals(cls, db: AsyncSession, user_id: str) -> GoalListResponse:
        stmt = (
            select(GoalModel)
            .where(GoalModel.user_id == user_id)
            .order_by(
                GoalModel.status.asc(),
                GoalModel.priority.desc(),
                GoalModel.created_at.desc()
            )
        )
        goals = (await db.execute(stmt)).scalars().all()

        enriched: List[GoalResponse] = []
        tot_target = Decimal("0.00")
        tot_current = Decimal("0.00")
        tot_req_monthly = Decimal("0.00")
        active_cnt = 0
        comp_cnt = 0

        for g in goals:
            resp = await cls._enrich_goal(db, g)
            enriched.append(resp)
            tot_target += resp.target_amount
            tot_current += resp.current_amount
            if resp.analytics and resp.status == "ACTIVE":
                tot_req_monthly += resp.analytics.required_monthly_contribution
            if resp.status == "ACTIVE":
                active_cnt += 1
            elif resp.status == "COMPLETED":
                comp_cnt += 1

        return GoalListResponse(
            items=enriched,
            total_target_amount=tot_target,
            total_current_amount=tot_current,
            total_required_monthly=tot_req_monthly,
            total_count=len(enriched),
            active_count=active_cnt,
            completed_count=comp_cnt
        )

    @classmethod
    async def get_goal_by_id(cls, db: AsyncSession, user_id: str, goal_id: str) -> GoalResponse:
        stmt = select(GoalModel).where(GoalModel.id == goal_id, GoalModel.user_id == user_id)
        goal = (await db.execute(stmt)).scalar_one_or_none()
        if not goal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
        return await cls._enrich_goal(db, goal)

    @classmethod
    async def update_goal(cls, db: AsyncSession, user_id: str, goal_id: str, payload: GoalUpdate) -> GoalResponse:
        stmt = select(GoalModel).where(GoalModel.id == goal_id, GoalModel.user_id == user_id)
        goal = (await db.execute(stmt)).scalar_one_or_none()
        if not goal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")

        update_data = payload.model_dump(exclude_unset=True)
        for k, v in update_data.items():
            setattr(goal, k, v)

        if goal.current_amount >= goal.target_amount and goal.status != "COMPLETED":
            goal.status = "COMPLETED"
            goal.completed_at = datetime.now(timezone.utc)
        elif goal.current_amount < goal.target_amount and goal.status == "COMPLETED":
            goal.status = "ACTIVE"
            goal.completed_at = None

        await db.commit()
        await db.refresh(goal)
        return await cls._enrich_goal(db, goal)

    @classmethod
    async def delete_goal(cls, db: AsyncSession, user_id: str, goal_id: str) -> bool:
        stmt = select(GoalModel).where(GoalModel.id == goal_id, GoalModel.user_id == user_id)
        goal = (await db.execute(stmt)).scalar_one_or_none()
        if not goal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
        await db.delete(goal)
        await db.commit()
        return True

    @classmethod
    async def add_contribution(
        cls,
        db: AsyncSession,
        user_id: str,
        goal_id: str,
        payload: GoalContributionCreate
    ) -> GoalContributionResponse:
        stmt = select(GoalModel).where(GoalModel.id == goal_id, GoalModel.user_id == user_id)
        goal = (await db.execute(stmt)).scalar_one_or_none()
        if not goal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")

        c_date = payload.contribution_date or date.today()
        tx_id = None

        # Optional: Deduct from money source and record ledger transaction
        if payload.money_source_id and payload.record_transaction:
            ms_stmt = select(MoneySourceModel).where(
                MoneySourceModel.id == payload.money_source_id,
                MoneySourceModel.user_id == user_id
            )
            source = (await db.execute(ms_stmt)).scalar_one_or_none()
            if source:
                # Log transaction as EXPENSE / SAVINGS allocation
                tx = TransactionModel(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    money_source_id=source.id,
                    type="EXPENSE",
                    amount=payload.amount,
                    merchant=f"Goal: {goal.name}",
                    description=payload.note or f"Contribution to {goal.name}",
                    transaction_date=c_date,
                    source="MANUAL"
                )
                db.add(tx)
                source.current_balance -= payload.amount
                tx_id = tx.id

        # Update goal progress
        goal.current_amount += payload.amount
        if goal.current_amount >= goal.target_amount and goal.status != "COMPLETED":
            goal.status = "COMPLETED"
            goal.completed_at = datetime.now(timezone.utc)

        contrib = GoalContributionModel(
            id=str(uuid.uuid4()),
            goal_id=goal.id,
            user_id=user_id,
            amount=payload.amount,
            contribution_date=c_date,
            money_source_id=payload.money_source_id,
            transaction_id=tx_id,
            note=payload.note
        )
        db.add(contrib)
        await db.commit()
        await db.refresh(contrib)
        return GoalContributionResponse.model_validate(contrib)

    @classmethod
    async def get_contributions(
        cls,
        db: AsyncSession,
        user_id: str,
        goal_id: str
    ) -> GoalContributionListResponse:
        stmt = (
            select(GoalContributionModel)
            .where(GoalContributionModel.goal_id == goal_id, GoalContributionModel.user_id == user_id)
            .order_by(desc(GoalContributionModel.contribution_date), desc(GoalContributionModel.created_at))
        )
        rows = (await db.execute(stmt)).scalars().all()
        items = [GoalContributionResponse.model_validate(r) for r in rows]
        tot = sum(i.amount for i in items) if items else Decimal("0.00")
        return GoalContributionListResponse(items=items, total_amount=tot, total_count=len(items))

    @classmethod
    async def _enrich_goal(cls, db: AsyncSession, goal: GoalModel) -> GoalResponse:
        target = Decimal(str(goal.target_amount))
        current = Decimal(str(goal.current_amount))
        remaining = max(Decimal("0.00"), target - current)
        progress_pct = min(100.0, round(float((current / target) * 100), 1)) if target > 0 else 0.0

        today = date.today()
        days_rem = None
        req_monthly = Decimal("0.00")
        req_weekly = Decimal("0.00")

        if goal.target_date:
            days_rem = (goal.target_date - today).days
            if days_rem > 0 and remaining > 0:
                months_rem = max(0.5, days_rem / 30.4)
                weeks_rem = max(1.0, days_rem / 7.0)
                req_monthly = round(remaining / Decimal(str(months_rem)), 2)
                req_weekly = round(remaining / Decimal(str(weeks_rem)), 2)
            elif days_rem <= 0 and remaining > 0 and goal.status != "COMPLETED":
                goal.status = "OVERDUE"

        # Trailing 90-day contribution velocity
        hist_start = today - timedelta(days=90)
        c_stmt = select(func.coalesce(func.sum(GoalContributionModel.amount), 0.00)).where(
            GoalContributionModel.goal_id == goal.id,
            GoalContributionModel.contribution_date >= hist_start
        )
        recent_contributions = Decimal(str((await db.execute(c_stmt)).scalar_one()))
        current_pace_monthly = round(recent_contributions / Decimal("3.0"), 2) if recent_contributions > 0 else Decimal("0.00")

        pace_ratio = 0.0
        if req_monthly > Decimal("0.00"):
            pace_ratio = round(float((current_pace_monthly / req_monthly) * 100), 1)
        elif current >= target:
            pace_ratio = 100.0

        # Determine pace status
        if goal.status == "COMPLETED" or current >= target:
            pace_status = "COMPLETED"
        elif goal.target_date and goal.target_date < today and remaining > 0:
            pace_status = "OVERDUE"
        elif req_monthly == 0 or pace_ratio >= 90.0:
            pace_status = "ON_TRACK"
        elif pace_ratio >= 50.0:
            pace_status = "AT_RISK"
        else:
            pace_status = "BEHIND"

        # Dynamic forecast completion date
        est_completion = None
        if remaining > Decimal("0.00") and current_pace_monthly > Decimal("0.00"):
            daily_pace = current_pace_monthly / Decimal("30.4")
            days_needed = int(remaining / daily_pace)
            est_completion = today + timedelta(days=days_needed)

        analytics = GoalAnalytics(
            progress_pct=progress_pct,
            remaining_amount=remaining,
            required_monthly_contribution=req_monthly,
            required_weekly_contribution=req_weekly,
            current_pace_monthly=current_pace_monthly,
            pace_status=pace_status,
            pace_ratio_pct=pace_ratio,
            estimated_completion_date=est_completion,
            days_remaining=days_rem
        )

        return GoalResponse(
            id=goal.id,
            user_id=goal.user_id,
            name=goal.name,
            description=goal.description,
            target_amount=goal.target_amount,
            current_amount=goal.current_amount,
            target_date=goal.target_date,
            priority=goal.priority,
            status=goal.status,
            category=goal.category,
            color_hex=goal.color_hex,
            icon=goal.icon,
            created_at=goal.created_at,
            updated_at=goal.updated_at,
            completed_at=goal.completed_at,
            analytics=analytics
        )
