from sqlalchemy import Column, Integer, String, Float
from .database import Base

class DeliverablesMaster(Base):
    __tablename__ = "Eve_DeliverablesMaster"

    id = Column(Integer, primary_key=True, index=True)
    Deliverable_No = Column(Integer, index=True, unique=True)
    # event_code = Column(Integer, index=True)
    Category = Column(String(1), index=True)
    description = Column(String(1000))
    Deliverables = Column(String(1000))

    def __repr__(self):
        return f"<DeliverablesMaster {self.name}>"
