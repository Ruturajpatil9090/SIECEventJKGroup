from sqlalchemy import Column, Integer, String, DateTime, Text, Numeric
from .database import Base

class TaskMaster(Base):
    __tablename__ = "Eve_TaskMaster"

    Id = Column(Integer, primary_key=True, autoincrement=True)
    taskno = Column(Integer,nullable=True)
    taskdate = Column((DateTime),nullable=True)
    userId = Column(String(255), nullable=True)
    srno = Column(Integer, nullable=True)
    purpose = Column(String(255), nullable=True)
    tasktime = Column(String(255), nullable=True)
    taskdesc = Column(Text, nullable=True)
    deadline = Column(DateTime, nullable=True)
    startdate = Column(DateTime, nullable=True)
    enddate = Column(DateTime, nullable=True)
    category = Column(Integer, nullable=True)
    reminder = Column(String(255), nullable=True)
    tasktype = Column(Integer, nullable=True)  # Changed to Integer
    reminddate = Column(DateTime, nullable=True)
    completed = Column(String(255), nullable=True)
    comp_hrs = Column(Integer, nullable=True)
    comp_days = Column(Integer, nullable=True)
    comp_date = Column(DateTime, nullable=True)
    remark = Column(String(255), nullable=True)
    companycode = Column(Integer, nullable=True)
    authanticated = Column(String(255), nullable=True)
    reopened = Column(String(255), nullable=True)
    marks = Column(Numeric(10, 2), nullable=True)
    reopenedmarks = Column(Numeric(10, 2), nullable=True)
    prioritys = Column(Integer, nullable=True)
    tran_type = Column(String(255), nullable=True)
    authanticateremak = Column(String(255), nullable=True)
    timetask = Column(String(255), nullable=True)
    Authorised_User  = Column(Integer, nullable=True)
    Authorised = Column(String(1), nullable=True)
    authoriser_remark = Column(String(255), nullable=True)

    def __repr__(self):
        return f"<TaskMaster taskno={self.taskno} userId={self.userId}>"
