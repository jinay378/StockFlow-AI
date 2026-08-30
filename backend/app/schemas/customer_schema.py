from pydantic import BaseModel


class CustomerCreate(BaseModel):
    name: str
    email: str
    phone: str
    address: str


class CustomerResponse(CustomerCreate):
    id: int

    class Config:
        from_attributes = True