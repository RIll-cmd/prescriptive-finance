from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.models.user import UserModel
from app.schemas.simulation import (
    RunSimulationRequest,
    SimulationResultResponse,
    ScenarioComparisonRequest,
    ScenarioComparisonResponse,
    SaveScenarioRequest,
    SavedScenarioResponse,
)
from app.services.simulation.simulation_service import SimulationService

router = APIRouter(prefix="/simulations", tags=["What-If Simulator"])


@router.post("/run", response_model=SimulationResultResponse)
async def run_simulation(
    payload: RunSimulationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Executes a risk-free in-memory scenario simulation and evaluates impact on cash, health score, emergency coverage, and goals without DB mutation."""
    return await SimulationService.run_simulation(
        db=db,
        user_id=current_user.id,
        request=payload,
    )


@router.post("/compare", response_model=ScenarioComparisonResponse)
async def compare_scenarios(
    payload: ScenarioComparisonRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Compares 2 to 4 hypothetical scenarios side-by-side and ranks best options across cash, health, goals, and risk."""
    return await SimulationService.compare_scenarios(
        db=db,
        user_id=current_user.id,
        request=payload,
    )


@router.get("/saved", response_model=List[SavedScenarioResponse])
async def list_saved_scenarios(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Lists all saved simulation scenarios for the current user."""
    return await SimulationService.list_saved_scenarios(
        db=db,
        user_id=current_user.id,
    )


@router.post("/saved", response_model=SavedScenarioResponse, status_code=status.HTTP_201_CREATED)
async def save_scenario(
    payload: SaveScenarioRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Saves a simulation scenario configuration to the database."""
    return await SimulationService.save_scenario(
        db=db,
        user_id=current_user.id,
        payload=payload,
    )


@router.get("/saved/{scenario_id}")
async def get_saved_scenario(
    scenario_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Retrieves a saved scenario and runs the simulation dynamically against current live balances."""
    scenario, result = await SimulationService.get_saved_scenario(
        db=db,
        user_id=current_user.id,
        scenario_id=scenario_id,
    )
    return {
        "scenario": scenario,
        "result": result,
    }


@router.delete("/saved/{scenario_id}")
async def delete_saved_scenario(
    scenario_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Deletes a saved simulation scenario."""
    await SimulationService.delete_saved_scenario(
        db=db,
        user_id=current_user.id,
        scenario_id=scenario_id,
    )
    return {"message": "Scenario deleted successfully", "success": True}
