from pydantic import BaseModel
from typing import List, Optional,Literal
from datetime import date


class TaskDetailBase(BaseModel):
    id: Optional[int] = None
    taskno: Optional[int] = None
    userId: Optional[int] = None

class TaskDetailCreate(TaskDetailBase):
    action: Literal["add", "delete", "update"]
    pass

class TaskDetail(TaskDetailBase):
    id: int 
    taskno: int

    class Config:
        from_attributes = True


class TaskHeadBase(BaseModel):
    doc_date: Optional[date] = None
    purpose: Optional[str] = None
    taskdesc: Optional[str] = None
    tasktype: Optional[int] = None
    category: Optional[int] = None
    deadlinedate: Optional[date] = None
    startdate: Optional[date] = None
    enddate: Optional[date] = None
    remindtask: Optional[int] = None
    reminddate: Optional[date] = None
    day: Optional[int] = None
    weekday: Optional[int] = None
    month: Optional[int] = None
    time: Optional[str] = None
    priority: Optional[int] = None
    Company_Code: Optional[int] = None
    Created_By: Optional[str] = None
    Modified_By: Optional[str] = None
    tran_type: Optional[str] = None
    Authorised_User: Optional[int] = None
    details: List[TaskDetailCreate] = []
    
class TaskCreate(TaskHeadBase):
    details: List[TaskDetailCreate] = []
    pass

class TaskUpdate(BaseModel):
    doc_date: Optional[date] = None
    purpose: Optional[str] = None
    taskdesc: Optional[str] = None
    tasktype: Optional[int] = None
    category: Optional[int] = None
    deadlinedate: Optional[date] = None
    startdate: Optional[date] = None
    enddate: Optional[date] = None
    remindtask: Optional[int] = None
    reminddate: Optional[date] = None
    day: Optional[int] = None
    weekday: Optional[int] = None
    month: Optional[int] = None
    time: Optional[str] = None
    priority: Optional[int] = None
    Company_Code: Optional[int] = None
    Created_By: Optional[str] = None
    Modified_By: Optional[str] = None
    tran_type: Optional[str] = None
    details: Optional[List[TaskDetailCreate]] = None

class Task(TaskHeadBase):
    taskno: int
    details: List[TaskDetail] = []

    class Config:
        from_attributes = True
    
