from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class CategorySubMaster(Base):
    __tablename__ = "Eve_CategorySubMaster"

    CategorySubMasterId = Column(Integer, primary_key=True, autoincrement=True)
    CategorySub_Name = Column(String(255), nullable=False)
    CategoryId = Column(Integer, ForeignKey('Eve_CategoryMaster.CategoryId'))

    category = relationship("Category", back_populates="subcategories")

    def __repr__(self):
        return f"<CategorySubMaster {self.CategorySub_Name}>"