from sqlalchemy import Column, Integer, String, Boolean
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    name_of_company = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    phone_no = Column(String(20),unique=True,nullable=True)
    address = Column(String(200),nullable=True)
    is_active = Column(Boolean, default=True)

    def __repr__(self):
        return f"<User {self.email}>"