from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from decimal import Decimal

class TaskMasterBase(BaseModel):
    taskdate: Optional[datetime] = None
    userId: Optional[str] = None
    srno: Optional[int] = None
    purpose: Optional[str] = None
    tasktime: Optional[str] = None
    taskdesc: Optional[str] = None
    deadline: Optional[datetime] = None
    startdate: Optional[datetime] = None
    enddate: Optional[datetime] = None
    category: Optional[int] = None
    reminder: Optional[str] = None
    tasktype: Optional[str] = None
    reminddate: Optional[datetime] = None
    completed: Optional[str] = None
    comp_hrs: Optional[int] = None
    comp_days: Optional[int] = None
    comp_date: Optional[datetime] = None
    remark: Optional[str] = None
    companycode: Optional[int] = None
    authanticaled: Optional[str] = None
    reopened: Optional[str] = None
    marks: Optional[Decimal] = None
    reopenedmarks: Optional[Decimal] = None
    prioritys: Optional[int] = None
    tran_type: Optional[str] = None
    authanticateremak: Optional[str] = None
    timetask: Optional[str] = None
    Created_By: Optional[str] = None
    Authorised: Optional[str] = None
    authoriser_remark: Optional[str] = None

class TaskMasterCreate(TaskMasterBase):
    pass  


class TaskMasterUpdate(BaseModel):
    purpose: Optional[str] = None
    tasktime: Optional[str] = None
    taskdesc: Optional[str] = None
    deadline: Optional[datetime] = None
    reminddate: Optional[datetime] = None
    completed: Optional[str] = None
    comp_hrs: Optional[int] = None
    comp_days: Optional[int] = None
    comp_date: Optional[datetime] = None
    remark: Optional[str] = None
    Authorised: Optional[str] = None
    authoriser_remark: Optional[str] = None
    # Add more fields if you want to allow updating them


class TaskMasterOut(TaskMasterBase):
    taskno: int

    class Config:
        orm_mode = True
