from sqlalchemy import Column, Integer, String, ForeignKey,Date,Text
from sqlalchemy.orm import relationship
from .database import Base

class TaskHead(Base):
    __tablename__ = "Eve_TaskHead"

    taskno = Column(Integer, primary_key=True, index=True, autoincrement=True)
    doc_date = Column(Date,nullable=True)
    purpose = Column(String(255), nullable=True)
    taskdesc = Column(Text, nullable=True)
    tasktype = Column(Integer, nullable=True)
    category = Column(Integer, nullable=True)
    deadlinedate = Column(Date,nullable=True)
    startdate =  Column(Date,nullable=True)
    enddate = Column(Date,nullable=True)
    remindtask = Column(Integer, nullable = True)
    reminddate = Column(Date,nullable=True)
    day = Column(Integer, nullable = True)
    weekday = Column(Integer, nullable = True)
    month = Column(Integer, nullable = True)
    time = Column(String, nullable=True)
    priority = Column(Integer, nullable = True)
    Company_Code = Column(Integer, nullable=True)
    Created_By = Column(String, nullable=True)
    Modified_By = Column(String, nullable=True)
    tran_type = Column(String, nullable=True)
    Authorised_User = Column(Integer,nullable=True)

    details = relationship(
        "TaskDetail", 
        back_populates="task",
        cascade="all, delete-orphan",
        lazy="selectin" 
    )

    # systemmaster = relationship(
    #     "SystemMaster",
    #     back_populates="systemmaster",
    # )

class TaskDetail(Base):
    __tablename__ = "Eve_TaskDetail"

    id = Column(Integer, primary_key=True, autoincrement=True)
    taskno = Column(Integer, ForeignKey("Eve_TaskHead.taskno"))
    userId = Column(Integer,nullable=True)

    task = relationship("TaskHead", back_populates="details")


    
   