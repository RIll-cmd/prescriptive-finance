from decimal import Decimal
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.scenario import ScenarioModel
from app.models.scenario_change import ScenarioChangeModel
from app.schemas.simulation import (
    RunSimulationRequest,
    SimulationResultResponse,
    ScenarioComparisonRequest,
    ScenarioComparisonResponse,
    SaveScenarioRequest,
    SavedScenarioResponse,
    SavedScenarioChangeResponse,
    SimulationChangeInput,
)
from app.services.simulation.scenario_engine import ScenarioEngine
from app.services.simulation.comparison_engine import ComparisonEngine


class SimulationService:
    @staticmethod
    async def run_simulation(
        db: AsyncSession,
        user_id: str,
        request: RunSimulationRequest,
    ) -> SimulationResultResponse:
        return await ScenarioEngine.execute_simulation(db, user_id, request)

    @staticmethod
    async def compare_scenarios(
        db: AsyncSession,
        user_id: str,
        request: ScenarioComparisonRequest,
    ) -> ScenarioComparisonResponse:
        results = []
        for scen in request.scenarios:
            res = await ScenarioEngine.execute_simulation(db, user_id, scen)
            results.append(res)
        return ComparisonEngine.compare_scenarios(results)

    @staticmethod
    async def save_scenario(
        db: AsyncSession,
        user_id: str,
        payload: SaveScenarioRequest,
    ) -> SavedScenarioResponse:
        scenario = ScenarioModel(
            user_id=user_id,
            name=payload.name,
            type=payload.type,
            description=payload.description,
        )
        db.add(scenario)
        await db.flush()

        for c in payload.changes:
            change = ScenarioChangeModel(
                scenario_id=scenario.id,
                change_type=c.change_type,
                field_name=c.field_name,
                operation=c.operation,
                amount=c.amount,
                interest_rate=c.interest_rate,
                term_months=c.term_months,
                start_date=c.start_date,
                end_date=c.end_date,
                category_name=c.category_name,
                metadata_json=c.metadata_json,
            )
            db.add(change)

        await db.commit()
        await db.refresh(scenario)

        return SavedScenarioResponse.model_validate(scenario)

    @staticmethod
    async def list_saved_scenarios(
        db: AsyncSession,
        user_id: str,
    ) -> List[SavedScenarioResponse]:
        result = await db.execute(
            select(ScenarioModel)
            .where(ScenarioModel.user_id == user_id)
            .order_by(ScenarioModel.created_at.desc())
        )
        scenarios = result.unique().scalars().all()

        return [SavedScenarioResponse.model_validate(s) for s in scenarios]

    @staticmethod
    async def get_saved_scenario(
        db: AsyncSession,
        user_id: str,
        scenario_id: str,
    ) -> Tuple[SavedScenarioResponse, SimulationResultResponse]:
        result = await db.execute(
            select(ScenarioModel).where(
                ScenarioModel.id == scenario_id,
                ScenarioModel.user_id == user_id,
            )
        )
        scenario = result.unique().scalar_one_or_none()
        if not scenario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Saved scenario not found",
            )

        changes_input = [
            SimulationChangeInput(
                change_type=c.change_type,
                field_name=c.field_name,
                operation=c.operation,
                amount=c.amount,
                interest_rate=c.interest_rate,
                term_months=c.term_months,
                start_date=c.start_date,
                end_date=c.end_date,
                category_name=c.category_name,
                metadata_json=c.metadata_json,
            )
            for c in scenario.changes
        ]

        req = RunSimulationRequest(
            name=scenario.name,
            type=scenario.type,
            description=scenario.description,
            changes=changes_input,
        )
        sim_result = await ScenarioEngine.execute_simulation(db, user_id, req)

        return SavedScenarioResponse.model_validate(scenario), sim_result

    @staticmethod
    async def delete_saved_scenario(
        db: AsyncSession,
        user_id: str,
        scenario_id: str,
    ) -> bool:
        result = await db.execute(
            select(ScenarioModel).where(
                ScenarioModel.id == scenario_id,
                ScenarioModel.user_id == user_id,
            )
        )
        scenario = result.unique().scalar_one_or_none()
        if not scenario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Saved scenario not found",
            )

        await db.delete(scenario)
        await db.commit()
        return True
