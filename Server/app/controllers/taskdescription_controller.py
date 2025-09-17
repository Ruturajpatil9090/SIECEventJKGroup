from fastapi import APIRouter, Depends, HTTPException, status,Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ..models.database import get_db
from ..schemas.taskdescriptionschema import TaskUpdate
from ..schemas.TaskMaster_Schema import TaskMasterUpdate
from datetime import date
from ..schemas.taskdescriptionschema import (
    Task,
    TaskCreate,
    TaskUpdate
)

from ..services.taskdescriptionservices import (
    get_taskDescription,
    get_tasks_description,
    get_max_taskDescription_id,
    get_task,
    create_task,
    update_task,
    delete_task,
    get_all_data_with_details,
    get_all_data_ofTaskmaster,
    generate_task_reminders,
    update_task_completion,
    get_user_tasks,
    get_systemmaster,
    get_all_data_ToAuthoriser,
    get_TaskReport,
    get_TaskReportPending,
    get_TaskReportCategorwise,
    get_TaskReportUsersCategorwise,
    get_TaskReportUserWisePending,

)


router = APIRouter(
    prefix="/taskDescription",
    tags=["taskDescription"]
)



# @router.get("/get_taskall", response_model=List[Task])
# async def get_task_data(db: AsyncSession = Depends(get_db)):
#     results = await get_tasks_description(db)
#     return results

@router.get("/get_taskall")
async def get_task_data(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    results = await get_all_data_with_details(db, skip, limit)
    print("DEBUG RESULTS:", results)   # 👈 check what type it is

    grouped_results = {}
    for row in results:
        taskid = row['taskno']

        if taskid not in grouped_results:
            grouped_results[taskid] = {
                "taskno": taskid,
                "taskno": row['taskno'],
                "doc_date": row['doc_date'],
                "purpose": row['purpose'],
                "taskdesc": row['taskdesc'],
                "tasktype": row['tasktype'],
                "category": row['category'],
                "deadlinedate": row['deadlinedate'],
                "startdate": row['startdate'],
                "enddate": row['enddate'],
                "remindtask": row['remindtask'],
                "reminddate": row['reminddate'],
                "day": row['day'],
                "weekday": row['weekday'],
                "month": row['month'],
                "time": row['time'],
                "priority": row['priority'],
                "Company_Code": row['Company_Code'],
                "Created_By": row['Created_By'],
                "Modified_By": row['Modified_By'],
                "tran_type": row['tran_type'],
                "details": []
            }

        if row['User_Id'] is not None:
            grouped_results[taskid]["details"].append({
                "User_Id": row['User_Id'],
                "User_Name": row['User_Name'],
                "id": row['id']
            })

    return list(grouped_results.values())


@router.get("/get_taskall_ofTaskmasterDashboard")
async def get_task_data(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    results = await get_all_data_ofTaskmaster(db, skip, limit)
    print("DEBUG RESULTS:", results)   
    # grouped_results = {}
    # for row in results:
    #     taskid = row['Id']

        # if taskid not in grouped_results:
        #     grouped_results[taskid] = {
        #         "Id": taskid,
        #         "taskno": row['taskno'],
        #         "purpose": row['purpose'],
        #         "reminddate": row['reminddate'],
        #         "deadline": row['deadline'],
        #         "prioritys": row['prioritys'],
        #     }
    return results
    # return list(grouped_results.values())


@router.get("/get_taskall_ofAuthoriser")
async def get_taskall_of_authoriser(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    results = await get_all_data_ToAuthoriser(db, skip, limit)
    print("DEBUG RESULTS:", results)
    return results


@router.get("/getlasttaskDescriptionId", response_model=int)
async def get(
    db: AsyncSession = Depends(get_db),
):
    return await get_max_taskDescription_id(db)

@router.post("/", response_model=Task, status_code=status.HTTP_201_CREATED)
async def create_taskdescription_endpoint(
    task_data: TaskCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        return await create_task(db, task_data)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/getbytaskno/{taskno}", response_model=Task)
async def read_task(
    taskno: int,
    db: AsyncSession = Depends(get_db),
):
    db_task = await get_taskDescription(db, taskno=taskno)
    if db_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return db_task

@router.put("/{taskno}", response_model=Task)
async def update_existing_task(
    taskno: int,
    task_data: TaskUpdate,
    db: AsyncSession = Depends(get_db),
):
    updated_task = await update_task(
        db=db, 
        taskno=taskno, 
        task_data=task_data
    )
    if updated_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return updated_task

@router.delete("/{taskno}")
async def delete_existing_task(
    taskno: int,
    db: AsyncSession = Depends(get_db),
):
    success = await delete_task(db=db, taskno=taskno)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return {"message": "Task deleted successfully"}


# Controllers For Table TaskMaster As Below

@router.post("/generate-reminders", status_code=200)
async def generate_reminders_endpoint(db: AsyncSession = Depends(get_db)):
    try:
        await generate_task_reminders(db)  # This calls the service function
        return {"message": "Reminders generated successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/tasksUpdateById/{Id}")
async def complete_task(
    Id: int,
    task_update: TaskMasterUpdate,
    db: AsyncSession = Depends(get_db)
):
    updated_task = await update_task_completion(
        db=db,
        Id=Id,
        completed=task_update.completed,
        comp_days=task_update.comp_days,
        comp_hrs=task_update.comp_hrs,
        comp_date=task_update.comp_date,
        Authorised=task_update.Authorised,
    )
    return {"message": "Task updated successfully", "task": updated_task}

@router.get("/userById/{Id}", response_model=List[dict])
async def get_tasks_for_user(Id: str, db: AsyncSession = Depends(get_db)):
    try:
        tasks = await get_user_tasks(db, Id)
        return tasks
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/systemmaster")
async def get_systemmasterr_data(db: AsyncSession = Depends(get_db)):
    results = await get_systemmaster(db)
    return results

#Task Reports Controllers as follows
@router.get("/get_taskall_Report")
async def get_taskall_ForReport(
    from_date: date,
    to_date: date,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    
    results = await get_TaskReport(from_date, to_date, db, skip, limit)
    return results

@router.get("/get_taskall_PendingReport")
async def get_taskall_PendingReport(
    from_date: date,
    to_date: date,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    
    results = await get_TaskReportPending(from_date, to_date, db, skip, limit)
    return results

@router.get("/get_taskall_CategoryWiseReport")
async def get_taskall_CategoryWiseReport(
    from_date: date,
    to_date: date,
    category: str = Query(...),
    skip: int = 0,                
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):

    category_list = [int(c) for c in category.split(",") if c.strip().isdigit()]

    results = await get_TaskReportCategorwise(from_date, to_date, category_list, db, skip, limit)
    return results


@router.get("/get_taskall_UsersCategoryWiseReport")
async def get_taskall_UsersCategoryWiseReport(
    from_date: date,
    to_date: date,
    user_id: str = Query(...),
    category: str = Query(...),
    skip: int = 0,                
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):

    category_list = [int(c) for c in category.split(",") if c.strip().isdigit()]
    user_id_list = [int(c) for c in user_id.split(",") if c.strip().isdigit()]

    results = await get_TaskReportUsersCategorwise(from_date, to_date ,user_id_list, category_list, db, skip, limit)
    return results


@router.get("/get_taskall_TaskReportUserWisePending")
async def get_taskall_TaskReportUserWisePending(
    from_date: date,
    to_date: date, 
    user_id: str = Query(...),
    skip: int = 0,                
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):

    user_id_list = [int(c) for c in user_id.split(",") if c.strip().isdigit()]
    results = await get_TaskReportUserWisePending(from_date, to_date,user_id_list, db, skip, limit)
    return {
        "from_date": from_date,
        "to_date": to_date,
        "user_id": user_id,
        "count": len(results),
        "data": results
    }
