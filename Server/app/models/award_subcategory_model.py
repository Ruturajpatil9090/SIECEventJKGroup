from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class EveAwardSubCategoryMaster(Base):
    __tablename__ = "Eve_AwardSubCategoryMaster"

    AwardSubCategoryId = Column(Integer, primary_key=True, autoincrement=True)
    AwardSubCategoryName = Column(String(255), nullable=False)
    AwardId = Column(Integer, ForeignKey('Eve_AwardMaster.AwardId'), nullable=False) 

    award = relationship("AwardMaster", back_populates="subcategories")

    def __repr__(self):
        return f"<EveAwardSubCategoryMaster {self.AwardSubCategoryId}: {self.AwardSubCategoryName}>"