from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .database import Base

class Category(Base):
    __tablename__ = "Eve_CategoryMaster"

    CategoryId = Column(Integer, primary_key=True)
    category_name = Column(String(255), nullable=True)

    subcategories = relationship(
        "CategorySubMaster", 
        back_populates="category",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Category {self.category_name}>"