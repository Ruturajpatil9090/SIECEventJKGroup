from sqlalchemy import select, update, delete, asc, func,text,bindparam
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta,date
from sqlalchemy import select,delete,update
from ..models.taskdescription_models import TaskHead, TaskDetail
from ..schemas.taskdescriptionschema import TaskUpdate
from ..models.TaskMaster_model import TaskMaster
from ..websockets.connection_manager import ConnectionManager

from ..models.taskdescription_models import (
    TaskHead,
    TaskDetail
)

from ..schemas.taskdescriptionschema import (
    TaskCreate, 
    TaskUpdate
)


async def get_taskDescription(db: AsyncSession, taskno: int):
    result = await db.execute(
        select(TaskHead)
        .options(selectinload(TaskHead.details))
        .filter(TaskHead.taskno == taskno)
    )
    return result.scalars().first()


async def get_max_taskDescription_id(db: AsyncSession):
    result = await db.execute(select(func.max(TaskHead.taskno)))
    max_id = result.scalar()
    return max_id if max_id is not None else 0

async def get_all_data_with_details(db: AsyncSession, user_id: int, ) -> List[Dict[str, Any]]:
    query = text("""
     SELECT DISTINCT 
                         TOP (100) PERCENT dbo.Eve_TaskHead.taskno, dbo.Eve_TaskDetail.taskno AS Expr1, dbo.Eve_TaskHead.doc_date, dbo.Eve_TaskHead.purpose, dbo.Eve_TaskHead.taskdesc, dbo.Eve_TaskHead.tasktype, 
                         dbo.Eve_TaskHead.category, dbo.Eve_TaskHead.deadlinedate, dbo.Eve_TaskHead.enddate, dbo.Eve_TaskHead.startdate, dbo.Eve_TaskHead.remindtask, dbo.Eve_TaskHead.reminddate, dbo.Eve_TaskHead.day, 
                         dbo.Eve_TaskHead.weekday, dbo.Eve_TaskHead.month, dbo.Eve_TaskHead.time, dbo.Eve_TaskHead.priority, dbo.Eve_TaskHead.Company_Code, dbo.Eve_TaskHead.Created_By, dbo.Eve_TaskHead.Modified_By, 
                         dbo.Eve_TaskHead.tran_type, tbluser_1.User_Id, tbluser_1.User_Name, dbo.Eve_TaskDetail.id, dbo.Eve_TaskDetail.userId, dbo.tbluser.User_Name AS Expr2, dbo.Eve_TaskHead.Authorised_User AS AutherizedPerson
FROM            dbo.tbluser INNER JOIN
                         dbo.Eve_TaskHead ON dbo.tbluser.User_Id = dbo.Eve_TaskHead.Authorised_User LEFT OUTER JOIN
                         dbo.Eve_TaskDetail ON dbo.Eve_TaskHead.taskno = dbo.Eve_TaskDetail.taskno LEFT OUTER JOIN
                         dbo.tbluser AS tbluser_1 ON dbo.Eve_TaskDetail.userId = tbluser_1.User_Id
WHERE     dbo.Eve_TaskHead.Authorised_User = :user_id
ORDER BY dbo.Eve_TaskHead.taskno DESC
    """)
    
    result = await db.execute(query, {"user_id": user_id})
    return result.mappings().all()


async def get_all_data_ofTaskmaster(db: AsyncSession, skip: int = 0, limit: int = 100):
    query = text("""
SELECT DISTINCT 
        dbo.Eve_TaskMaster.Id, dbo.Eve_TaskMaster.purpose, dbo.Eve_TaskMaster.reminddate, dbo.Eve_TaskMaster.deadline, dbo.Eve_TaskMaster.prioritys, dbo.Eve_TaskMaster.taskno, 
                         dbo.Eve_TaskHead.Created_By, dbo.Eve_TaskMaster.userId, dbo.Eve_TaskMaster.taskdesc, dbo.Eve_TaskMaster.category, dbo.Eve_TaskMaster.tasktype, dbo.Eve_TaskMaster.completed
FROM            dbo.Eve_TaskMaster FULL OUTER JOIN
                         dbo.Eve_TaskHead ON dbo.Eve_TaskMaster.taskno = dbo.Eve_TaskHead.taskno
WHERE        (dbo.Eve_TaskMaster.completed = 'N') AND (dbo.Eve_TaskMaster.reminddate <= CAST(GETDATE() AS DATE))
ORDER BY dbo.Eve_TaskMaster.taskno DESC
    """)
    
    
    result = await db.execute(query, {"skip": skip, "limit": limit})
    return result.mappings().all()

async def get_all_data_ToAuthoriser(db: AsyncSession, skip: int = 0, limit: int = 100):
    query = text("""
        SELECT DISTINCT
            dbo.Eve_TaskMaster.Id,
            dbo.Eve_TaskMaster.taskno,
            dbo.Eve_TaskMaster.userId,
            dbo.Eve_TaskMaster.completed,
            dbo.Eve_TaskMaster.Authorised_User,
            dbo.Eve_TaskMaster.Authorised,
            dbo.Eve_TaskMaster.taskdesc,
            dbo.Eve_TaskMaster.taskdate,
            dbo.Eve_TaskMaster.enddate,
            dbo.Eve_TaskMaster.purpose,
            dbo.tbluser.User_Name
        FROM dbo.Eve_TaskMaster
        INNER JOIN dbo.tbluser ON dbo.Eve_TaskMaster.userId = dbo.tbluser.User_Id
        WHERE dbo.Eve_TaskMaster.completed IN ('S', 'Y')
          AND dbo.Eve_TaskMaster.Authorised = 'N'
        ORDER BY dbo.Eve_TaskMaster.taskno DESC
        OFFSET :skip ROWS FETCH NEXT :limit ROWS ONLY
    """)

    result = await db.execute(query, {"skip": skip, "limit": limit})
    return result.mappings().all()


async def get_tasks_description(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(TaskHead)
        .options(selectinload(TaskHead.details))
        .order_by(asc(TaskHead.taskno))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def create_task(db: AsyncSession, task_data: TaskCreate,ws_manager: Optional[ConnectionManager] = None):
    # Step 1: Create the main task
    db_task = TaskHead(**task_data.model_dump(exclude={"details"}))
    db.add(db_task)
    await db.flush() 
    taskno = db_task.taskno

    # Dictionary to track newly added details for later update/delete
    added_details = {}

    # Step 2: Process detail actions
    if task_data.details is not None:
        for detail in task_data.details:
            action = detail.action
            detail_id = detail.id
            user_id = detail.userId

            if action == "add":
                db_detail = TaskDetail(
                    **detail.model_dump(exclude={"id", "taskno", "action"}),
                    taskno=taskno
                )
                db.add(db_detail)
                await db.flush()  # Get autogenerated ID
                added_details[user_id] = db_detail.id  # Track added detail

            elif action == "update":
                # Check if detail exists in DB (from previous add or already there)
                if not detail_id and id in added_details:
                    detail_id = added_details[id]

                update_data = detail.model_dump(
                    exclude_unset=True,
                    exclude={"id", "taskno", "action"}
                )

               
                if detail_id and update_data:
                    await db.execute(
                        update(TaskDetail)
                        .where(TaskDetail.taskno == taskno, TaskDetail.id == detail_id)
                        .values(**update_data)
                    )

            elif action == "delete":
                if not detail_id and id in added_details:
                    detail_id = added_details[id]

                if detail_id:
                    await db.execute(
                        delete(TaskDetail)
                        .where(TaskDetail.taskno == taskno, TaskDetail.userId == user_id)
                    )

            else:
                raise HTTPException(status_code=400, detail=f"Invalid action '{action}'.")

    await db.commit()

    if ws_manager:
        await ws_manager.broadcast(message="refresh_taskdescription")
    return await get_task(db, taskno)


async def get_task(db: AsyncSession, taskno: int) -> TaskHead | None:
    stmt = select(TaskHead).options(selectinload(TaskHead.details)).where(TaskHead.taskno == taskno)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def update_task(db: AsyncSession, taskno: int, task_data: TaskUpdate,ws_manager: Optional[ConnectionManager] = None):
    db_task = await get_task(db, taskno)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found.")

    # 1. Update main task (if fields provided)
    update_fields = task_data.model_dump(exclude_unset=True, exclude={"details"})
    if update_fields:
        await db.execute(
            update(TaskHead)
            .where(TaskHead.taskno == taskno)
            .values(**update_fields)
        )

    # 3. Process details with row-level actions
    if task_data.details is not None:
        for detail in task_data.details:
            user_id = detail.userId
            action = detail.action
            id = detail.id

            if action == "delete":
                await db.execute(
                    delete(TaskDetail).where(
                        TaskDetail.taskno == taskno,
                        TaskDetail.userId == user_id
                    )
                )

            elif action == "add":
                # Check if already exists
                exists_stmt = select(TaskDetail).where(
                    TaskDetail.taskno == taskno,
                    TaskDetail.userId == user_id
                )
                result = await db.execute(exists_stmt)
                existing = result.scalar_one_or_none()

                if not existing:
                    db_detail = TaskDetail(taskno=taskno, userId=user_id, id = id)
                    db.add(db_detail)

            elif action == "update":
                print("actionupdate")
                update_data = detail.model_dump(exclude_unset=True, exclude={"action", "taskno", "id"})
                print("Update Data",update_data)
                if update_data:
                    await db.execute(
                        update(TaskDetail)
                        .where(TaskDetail.taskno == taskno, TaskDetail.id == id)
                        .values(**update_data)
                    )

    await db.commit()
    if ws_manager:
        await ws_manager.broadcast(message="refresh_taskdescription")
    return await get_task(db, taskno)

async def delete_task(db: AsyncSession, taskno: int):
    db_task  = await get_task(db, taskno)
    if not db_task :
        return False

    await db.delete(db_task )
    await db.commit()
    return True


# Services from TaskMaster Table AS Below

def to_datetime(d):
    if isinstance(d, datetime):
        return d
    if d is None:
        return None
    return datetime(d.year, d.month, d.day)


async def generate_task_reminders(db: AsyncSession):
    today = datetime.today().date()

    result = await db.execute(select(TaskHead).options(selectinload(TaskHead.details)))
    tasks = result.scalars().all()

    if not tasks:
        raise HTTPException(status_code=404, detail="No tasks found.")

    reminders_created = 0

    for task in tasks:
        for detail in task.details:
            if task.remindtask != 1:
                print(f"Skipping Task {task.taskno} for user {detail.userId}: remindtask is set to No.")
                continue

            deadlines = []

            if task.tasktype == 1:  # Daily
                for i in range(0,2):  # Next 2 days
                    deadline = today + timedelta(days=i)
                    deadlines.append(deadline)

            elif task.tasktype == 2:  # One-time
                if task.deadlinedate and task.deadlinedate >= today:
                    deadlines.append(task.deadlinedate)

            elif task.tasktype == 3 and task.weekday is not None:  # Weekly
                weekday_python = (task.weekday + 5) % 7
                base_date = today
                for i in range(0,2):  # Next 2 weeks
                    days_ahead = (weekday_python - base_date.weekday()) % 7
                    deadline = base_date + timedelta(days=days_ahead + i * 7)
                    if deadline >= today:
                        deadlines.append(deadline)

            elif task.tasktype == 4 and task.day:  # Monthly
                added = 0
                month_offset = 0  # Start from next month
                while added < 2:  # Get exactly 2 valid future deadlines
                    year = today.year + (today.month + month_offset - 1) // 12
                    month = (today.month + month_offset - 1) % 12 + 1
                    try:
                        deadline = datetime(year, month, task.day).date()
                        if deadline >= today:
                            deadlines.append(deadline)
                            added += 1
                    except ValueError:
                        pass
                    month_offset += 1


            elif task.tasktype == 5 and task.day and task.month:  # Yearly
                year = today.year
                while len(deadlines) < 2:
                    try:
                        deadline = datetime(year, task.month, task.day).date()
                        if deadline >= today:
                            deadlines.append(deadline)
                    except ValueError:
                        pass  # Skip invalid dates
                    year += 1

            # Process each generated deadline
            for deadline in deadlines:
                if not deadline or deadline < today:
                    continue

                # Determine reminddate
                if task.tasktype == 5:
                    reminddate = deadline - timedelta(days=30)
                elif task.tasktype == 4:
                    reminddate = deadline - timedelta(days=7)
                elif task.tasktype == 3:
                    reminddate = deadline - timedelta(days=7)
                elif task.tasktype == 2:
                    reminddate = task.reminddate
                else:
                    reminddate = deadline

                if deadline < today:
                    print(f"Skipping Task {task.taskno} for user {detail.userId}: deadline {deadline} is in the past.")
                    continue

                # Check for duplicate
                dup_check = await db.execute(
                    select(TaskMaster).where(
                        TaskMaster.taskno == task.taskno,
                        TaskMaster.userId == detail.userId,
                        TaskMaster.deadline == deadline
                    )
                )
                existing = dup_check.scalar_one_or_none()
                if existing:
                    print(f"Skipping duplicate: task {task.taskno}, user {detail.userId}, deadline {deadline}")
                    continue

                # Determine startdate and enddate
                # Determine startdate and enddate
                if task.tasktype in [1, 3, 4, 5]:  # Daily, Weekly, Monthly, Yearly
                    startdate = to_datetime(deadline)
                    enddate = to_datetime(deadline)
                else:  # One-time (2)
                    startdate = to_datetime(task.startdate)
                    enddate = to_datetime(task.enddate)

                # Create TaskMaster entry
                taskmaster = TaskMaster(
                    taskno=task.taskno,
                    userId=detail.userId,
                    purpose=task.purpose,
                    taskdesc=task.taskdesc,
                    tasktype=task.tasktype,
                    category=task.category,
                    deadline=to_datetime(deadline),
                    startdate=startdate,
                    enddate=enddate,
                    tasktime=task.time,
                    prioritys=task.priority,
                    tran_type=task.tran_type,
                    taskdate=to_datetime(today),
                    completed="N",
                    reminddate=to_datetime(reminddate),
                    companycode=task.Company_Code,
                    Authorised_User=task.Authorised_User,
                    Authorised="N"
                )

                db.add(taskmaster)
                reminders_created += 1
                print(f"Reminder created: task {task.taskno}, user {detail.userId}, deadline {deadline}")

    await db.commit()

    return {"message": "Reminders generated successfully.", "created": reminders_created}


async def update_task_completion(
    db: AsyncSession,
    Id: int,
    completed: str = None,
    comp_days: int = None,
    comp_hrs: int = None,
    comp_date: datetime = None,
    remark: str = None,
    Authorised: str = None,
):
    # Fetch the existing task
    result = await db.execute(select(TaskMaster).where(TaskMaster.Id == Id))
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail=f"Task with Id {Id} not found.")

    # Prepare update data dict, only include fields if they are not None
    update_data = {}
    if completed is not None:
        update_data['completed'] = completed
    if comp_days is not None:
        update_data['comp_days'] = comp_days
    if comp_hrs is not None:
        update_data['comp_hrs'] = comp_hrs
    if comp_date is not None:
        update_data['comp_date'] = comp_date
    if remark is not None:
        update_data['remark'] = remark
    if Authorised is not None:
        update_data['Authorised'] = Authorised

    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields provided to update.")

    # Perform update
    await db.execute(
        update(TaskMaster).
        where(TaskMaster.Id == Id).
        values(**update_data)
    )
    await db.commit()

    # Optionally, fetch the updated record and return it
    updated_result = await db.execute(select(TaskMaster).where(TaskMaster.Id == Id))
    updated_task = updated_result.scalar_one()

    return updated_task


async def get_user_tasks(db: AsyncSession, Id: str):
    query = select(TaskMaster).where(TaskMaster.Id == Id)

    result = await db.execute(query)
    tasks = result.scalars().all()

    if not tasks:
        raise HTTPException(status_code=404, detail="No tasks found for this user")

    # Prepare response filtering only required fields
    filtered_tasks = []
    for task in tasks:
        filtered_tasks.append({
            "Id": task.Id,
            "taskno": task.taskno,
            "purpose": task.purpose,
            "taskdesc": task.taskdesc,
            "reminddate": task.reminddate,
        })

    return filtered_tasks

async def get_systemmaster(db: AsyncSession, skip: int = 0, limit: int = 100):
    query = text("""
SELECT        System_Name_E, systemid, System_Code, System_Type
FROM            dbo.nt_1_systemmaster
WHERE        (System_Type = 'L')
    """)
    
    result = await db.execute(query, {"skip": skip, "limit": limit})
    return result.mappings().all()



#Task Reports functions as follows
async def get_TaskReport(from_date: date, to_date: date, db: AsyncSession, skip: int = 0, limit: int = 100):
    query = text("""
    SELECT dbo.Eve_TaskMaster.Id, dbo.Eve_TaskMaster.taskno, dbo.Eve_TaskMaster.taskdate,
           dbo.Eve_TaskMaster.purpose, dbo.Eve_TaskMaster.taskdesc, dbo.Eve_TaskMaster.reminddate,
           dbo.Eve_TaskMaster.deadline, dbo.Eve_TaskMaster.tasktype, dbo.Eve_TaskMaster.completed,dbo.Eve_TaskMaster.userId,
           dbo.tbluser.User_Name
    FROM dbo.Eve_TaskMaster
    INNER JOIN dbo.tbluser ON dbo.Eve_TaskMaster.userId = dbo.tbluser.User_Id
    WHERE dbo.Eve_TaskMaster.taskdate BETWEEN :from_date AND :to_date
    ORDER BY dbo.Eve_TaskMaster.taskdate
    OFFSET :skip ROWS FETCH NEXT :limit ROWS ONLY
    """)
    
    result = await db.execute(query, {
        "from_date": from_date,
        "to_date": to_date,
        "skip": skip,
        "limit": limit
    })
    print("Query Params:", {
    "from_date": from_date,
    "to_date": to_date,
    "skip": skip,
    "limit": limit
})


    return result.mappings().all()


async def get_TaskReportPending(from_date: date, to_date: date, db: AsyncSession, skip: int = 0, limit: int = 100):
    query = text("""
    SELECT dbo.Eve_TaskMaster.Id, dbo.Eve_TaskMaster.taskno, dbo.Eve_TaskMaster.taskdate,
           dbo.Eve_TaskMaster.purpose, dbo.Eve_TaskMaster.taskdesc, dbo.Eve_TaskMaster.reminddate,
           dbo.Eve_TaskMaster.deadline, dbo.Eve_TaskMaster.tasktype, dbo.Eve_TaskMaster.userId,dbo.Eve_TaskMaster.completed,
           dbo.tbluser.User_Name
    FROM dbo.Eve_TaskMaster
    INNER JOIN dbo.tbluser ON dbo.Eve_TaskMaster.userId = dbo.tbluser.User_Id
    WHERE dbo.Eve_TaskMaster.taskdate BETWEEN :from_date AND :to_date
            AND (dbo.Eve_TaskMaster.completed = 'N')
    ORDER BY dbo.Eve_TaskMaster.taskdate
    OFFSET :skip ROWS FETCH NEXT :limit ROWS ONLY
    """)
    
    result = await db.execute(query, {
        "from_date": from_date,
        "to_date": to_date,
        "skip": skip,
        "limit": limit
    })
    print("Query Params:", {
    "from_date": from_date,
    "to_date": to_date,
    "skip": skip,
    "limit": limit
})


    return result.mappings().all()


async def get_TaskReportCategorwise(
    from_date: date,
    to_date: date,
    category: List[int],
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100
):
    # Dynamically create placeholders like :cat_0, :cat_1, ...
    category_placeholders = ", ".join([f":cat_{i}" for i in range(len(category))])
    
    query = text(f"""
        SELECT 
            TM.Id, TM.taskno, TM.taskdate, TM.purpose, TM.taskdesc, 
            TM.reminddate, TM.deadline, TM.completed, TM.tasktype, 
            TM.userId, U.User_Name, SM.System_Name_E, TM.category
        FROM dbo.Eve_TaskMaster TM
        INNER JOIN dbo.tbluser U ON TM.userId = U.User_Id 
        INNER JOIN dbo.nt_1_systemmaster SM ON TM.category = SM.System_Code  
        WHERE TM.taskdate BETWEEN :from_date AND :to_date 
            AND SM.System_Type = 'L' 
            AND TM.completed = 'N' 
            AND TM.category IN ({category_placeholders})
        ORDER BY TM.taskdate
        OFFSET :skip ROWS FETCH NEXT :limit ROWS ONLY
    """)
   

    # Build parameter dictionary including dynamic category values
    category_params = {f"cat_{i}": cat for i, cat in enumerate(category)}
    base_params = {
        "from_date": from_date,
        "to_date": to_date,
        "skip": skip,
        "limit": limit,
    }
    params = {**base_params, **category_params}

    # Execute the query
    result = await db.execute(query, params)

    return result.mappings().all()

async def get_TaskReportUsersCategorwise(
    from_date: date,
    to_date: date,
    user_id: List[int],
    category: List[int], 
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100
):
    # Create placeholders for each category item
    category_placeholders = ", ".join([f":cat_{i}" for i in range(len(category))])
    user_placeholders = ", ".join([f":user_{i}" for i in range(len(user_id))])
    
    query = text(f"""
        SELECT 
            TM.Id, TM.taskno, TM.taskdate, TM.purpose, TM.taskdesc, TM.reminddate, TM.deadline, 
            TM.tasktype, TM.userId, U.User_Name, SM.System_Name_E, TM.category, TM.completed
        FROM dbo.Eve_TaskMaster TM
        INNER JOIN dbo.tbluser U ON TM.userId = U.User_Id
        INNER JOIN dbo.nt_1_systemmaster SM ON TM.category = SM.System_Code
        WHERE TM.taskdate BETWEEN :from_date AND :to_date
          AND SM.System_Type = 'L'
          AND TM.completed = 'N'
          AND TM.category IN ({category_placeholders})
          AND TM.userId IN ({user_placeholders})
        ORDER BY TM.taskdate
        OFFSET :skip ROWS FETCH NEXT :limit ROWS ONLY
    """)
    
    # Map category values to dynamic parameters
    category_params = {f"cat_{i}": cat for i, cat in enumerate(category)}
    user_params = {f"user_{i}": uid for i, uid in enumerate(user_id)}
    
    base_params = {
        "from_date": from_date,
        "to_date": to_date,
        "skip": skip,
        "limit": limit
    }
    
    params = {**base_params, **category_params,**user_params}
    
    result = await db.execute(query, params)
    
    print("Query Params:", params)
    
    return result.mappings().all()


async def get_TaskReportUserWisePending(from_date: date, to_date: date,user_id: List[int],db: AsyncSession, skip: int = 0, limit: int = 100):
    
    user_placeholders = ", ".join([f":user_{i}" for i in range(len(user_id))])

    query = f"""
    SELECT dbo.Eve_TaskMaster.Id, dbo.Eve_TaskMaster.taskno, dbo.Eve_TaskMaster.taskdate,
           dbo.Eve_TaskMaster.purpose, dbo.Eve_TaskMaster.taskdesc, dbo.Eve_TaskMaster.reminddate,
           dbo.Eve_TaskMaster.deadline, dbo.Eve_TaskMaster.tasktype, dbo.Eve_TaskMaster.userId,dbo.Eve_TaskMaster.completed,
           dbo.tbluser.User_Name
    FROM dbo.Eve_TaskMaster
    INNER JOIN dbo.tbluser ON dbo.Eve_TaskMaster.userId = dbo.tbluser.User_Id
    WHERE dbo.Eve_TaskMaster.taskdate BETWEEN :from_date AND :to_date
          AND dbo.Eve_TaskMaster.completed = 'N'
          AND dbo.Eve_TaskMaster.userId IN ({user_placeholders})
    ORDER BY dbo.Eve_TaskMaster.taskdate
    OFFSET :skip ROWS FETCH NEXT :limit ROWS ONLY
    """
    
    params = {
    "from_date": from_date,
    "to_date": to_date,
    "skip": skip,
    "limit": limit,
    }
    user_params = {f"user_{i}": uid for i, uid in enumerate(user_id)}

    all_params = {**params, **user_params}  # merge both dicts

    result = await db.execute(text(query), all_params)
    return result.mappings().all()



async def get_TaskReportForUsers(
    from_date: date,
    to_date: date,
    userIds: List[int],
    db,
    skip: int = 0,
    limit: int = 100
):
    # Build dynamic placeholders: :userId_0, :userId_1, etc.
    user_id_placeholders = [f":userId_{i}" for i in range(len(userIds))]
    user_id_clause = ", ".join(user_id_placeholders)

    sql = f"""
        SELECT 
            dbo.Eve_TaskMaster.Id,
            dbo.Eve_TaskMaster.taskno,
            dbo.Eve_TaskMaster.taskdate,
            dbo.Eve_TaskMaster.purpose,
            dbo.Eve_TaskMaster.taskdesc,
            dbo.Eve_TaskMaster.reminddate,
            dbo.Eve_TaskMaster.deadline,
            dbo.Eve_TaskMaster.tasktype,
            dbo.Eve_TaskMaster.completed,
            dbo.Eve_TaskMaster.userId,
            dbo.tbluser.User_Name
        FROM dbo.Eve_TaskMaster
        INNER JOIN dbo.tbluser ON dbo.Eve_TaskMaster.userId = dbo.tbluser.User_Id
        WHERE 
            dbo.Eve_TaskMaster.taskdate BETWEEN :from_date AND :to_date
            AND dbo.Eve_TaskMaster.userId IN ({user_id_clause})
        ORDER BY dbo.Eve_TaskMaster.taskdate
        OFFSET :skip ROWS FETCH NEXT :limit ROWS ONLY
    """

    # Create parameter dictionary
    params = {
        "from_date": from_date,
        "to_date": to_date,
        "skip": skip,
        "limit": limit,
    }
    params.update({f"userId_{i}": uid for i, uid in enumerate(userIds)})

    result = await db.execute(text(sql), params)
    return result.mappings().all()