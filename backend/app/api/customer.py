from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user_model import User
from app.core.dependencies import get_tenant_user, require_roles
from app.schemas.customer_schema import CustomerCreate

from app.services.customer_service import (
    create_customer,
    get_customers,
    get_customer_by_id,
    update_customer,
    delete_customer,
)

router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)


@router.post("/")
def add_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    new_customer = create_customer(db, customer, user_id=current_user.tenant_id)

    return {
        "message": "Customer created successfully",
        "id": new_customer.id,
    }


@router.get("/")
def all_customers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    return get_customers(db, user_id=current_user.tenant_id)


@router.get("/{customer_id}")
def customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    res = get_customer_by_id(db, customer_id, user_id=current_user.tenant_id)
    if not res:
        raise HTTPException(status_code=404, detail="Customer not found")
    return res


@router.put("/{customer_id}")
def update(
    customer_id: int,
    customer: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tenant_user),
):
    updated = update_customer(db, customer_id, customer, user_id=current_user.tenant_id)

    if not updated:
        raise HTTPException(status_code=404, detail="Customer not found")

    return {"message": "Customer updated successfully"}


@router.delete("/{customer_id}")
def delete(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "manager")),
):
    deleted = delete_customer(db, customer_id, user_id=current_user.tenant_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Customer not found")

    return {"message": "Customer deleted successfully"}
