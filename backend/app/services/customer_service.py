from sqlalchemy.orm import Session

from app.models.customer_model import Customer


def create_customer(db: Session, customer, user_id: int = 1):
    new_customer = Customer(
        name=customer.name,
        email=customer.email,
        phone=customer.phone,
        address=customer.address,
        user_id=user_id,
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer


def get_customers(db: Session, user_id: int = 1):
    return db.query(Customer).filter(Customer.user_id == user_id).all()


def get_customer_by_id(
    db: Session,
    customer_id: int,
    user_id: int = 1,
):
    return (
        db.query(Customer)
        .filter(Customer.id == customer_id, Customer.user_id == user_id)
        .first()
    )


def update_customer(
    db: Session,
    customer_id: int,
    customer,
    user_id: int = 1,
):
    existing_customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id, Customer.user_id == user_id)
        .first()
    )

    if not existing_customer:
        return None

    existing_customer.name = customer.name
    existing_customer.email = customer.email
    existing_customer.phone = customer.phone
    existing_customer.address = customer.address

    db.commit()
    db.refresh(existing_customer)

    return existing_customer


def delete_customer(
    db: Session,
    customer_id: int,
    user_id: int = 1,
):
    existing_customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id, Customer.user_id == user_id)
        .first()
    )

    if not existing_customer:
        return False

    db.delete(existing_customer)
    db.commit()

    return True
