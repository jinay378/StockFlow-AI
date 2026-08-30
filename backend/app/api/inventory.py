from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user_model import User
from app.core.dependencies import get_tenant_user, require_roles
from app.schemas.inventory_schema import InventoryCreate

from app.services.inventory_service import (
    create_inventory,
    get_inventory,
    get_inventory_by_id,
    update_inventory,
    delete_inventory,
)

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)


@router.post("/")
def add_inventory(
    inventory: InventoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    created = create_inventory(db, inventory, user_id=current_user.tenant_id)

    return {
        "message": "Inventory created successfully",
        "id": created.id,
    }


@router.get("/")
def all_inventory(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    return get_inventory(db, user_id=current_user.tenant_id)


@router.get("/{inventory_id}")
def inventory(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    res = get_inventory_by_id(db, inventory_id, user_id=current_user.tenant_id)
    if not res:
        raise HTTPException(status_code=404, detail="Inventory not found")
    return res


@router.put("/{inventory_id}")
def update(
    inventory_id: int,
    inventory: InventoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    updated = update_inventory(db, inventory_id, inventory, user_id=current_user.tenant_id)

    if not updated:
        raise HTTPException(status_code=404, detail="Inventory not found")

    return {"message": "Inventory updated successfully"}


@router.delete("/{inventory_id}")
def delete(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "manager")),
):
    deleted = delete_inventory(db, inventory_id, user_id=current_user.tenant_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Inventory not found")

    return {"message": "Inventory deleted successfully"}
