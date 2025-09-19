import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import TableUtility from "../common/TableUtility/TableUtility";
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Trash2 } from 'lucide-react';
import Modal from '../common/Modal/Modal';
import {
    useGetTaskDescriptionQuery,
    useAddTaskDescriptionMutation,
    useUpdateTaskDescriptionMutation,
    useDeleteTaskDescriptionMutation,
    useGetMaxTaskDescriptionIdQuery,
    useGetSystemMasterQuery
} from '../services/taskdescriptionApi'
import CreateNewButton from "../common/Buttons/AddButton";
import { useGetUserMastersQuery } from '../services/userMasterApi';
import { decryptData } from '../common/Functions/DecryptData';
import { getCurrentDate } from '../common/Functions/GetCurrentdate';


function TaskDescriptionEntry() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [originalDetails, setOriginalDetails] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedAuthorisedUsers, setSelectedAuthorisedUsers] = useState([]);
    const [createdBy, setCreatedBy] = useState('');

    const user_id = sessionStorage.getItem("user_id")

    const [formData, setFormData] = useState({
        taskno: '',
        doc_date: getCurrentDate(),
        purpose: '',
        taskdesc: 0,
        tasktype: 1,
        category: '',
        deadlinedate: getCurrentDate(),
        startdate: getCurrentDate(),
        enddate: getCurrentDate(),
        remindtask: 1,
        reminddate: getCurrentDate(),
        day: 0,
        weekday: 1,
        month: 1,
        time: 0,
        priority: 1,
        Created_By: '',
        Authorised_User: "",
        details: []
    });



    const [editId, setEditId] = useState(null);
    const [enabled, setEnabled] = useState(false);
    const [selectedDeliverablesInModal, setSelectedDeliverablesInModal] = useState([]);

    const { data: tableData = [], isLoading: isTableLoading, isError, refetch } = useGetTaskDescriptionQuery({ user_id: sessionStorage.getItem("user_id") });

    const { data: maxTaskDescriptionId = 0, isLoading: isMaxIdLoading, refetch: refetchMaxId } = useGetMaxTaskDescriptionIdQuery();

    const { data: tbluser = [], isLoading: isTblUserLoading } = useGetUserMastersQuery();
    const { data: systemMaster = [], isLoading: issystemMasterLoading } = useGetSystemMasterQuery();
    const systemCodes = Array.isArray(systemMaster) ? systemMaster.map(item => item.System_Code) : [];

    const [addTaskDescription] = useAddTaskDescriptionMutation();
    const [updateTaskDescription] = useUpdateTaskDescriptionMutation();
    const [deleteTaskDescription] = useDeleteTaskDescriptionMutation();

    useEffect(() => {
        if (!editId && isModalOpen && !isMaxIdLoading) {
            const nextId = (typeof maxTaskDescriptionId === 'number' ? maxTaskDescriptionId : 0) + 1;
            setFormData(prev => ({
                ...prev,
                taskno: nextId
            }));
        }
    }, [maxTaskDescriptionId, isMaxIdLoading, editId, isModalOpen]);

    const [selectedOptions, setSelectedOptions] = useState({
        tbl: null,
        category: null
    });

    const tblOptions = useMemo(() => tbluser.map(tbl => ({
        value: tbl.User_Id,
        label: `${tbl.User_Id} - ${tbl.User_Name}`
    })), [tbluser]);

    const systemMasterOptions = useMemo(() => systemMaster.map(system => ({
        value: system.System_Code,
        label: `${system.System_Code} - ${system.System_Name_E}`
    })), [systemMaster]);


    useEffect(() => {
        const encryptedUserData = sessionStorage.getItem('user_data');
        const userData = decryptData(encryptedUserData);
        if (userData && userData.user_name) {
            setCreatedBy(userData.user_name);
        }
    }, []);


    const columns = [
        { header: 'ID', accessor: 'taskno' },
        {
            header: 'Purpose',
            accessor: 'purpose',
            cellRenderer: (value, row) => `${row.Event_Code} - ${value}`
        },
        {
            header: 'Task Description',
            accessor: 'taskdesc',
        },
        {
            header: 'Date',
            accessor: 'doc_date',
            cellRenderer: (value, row) => `${row.doc_date} - ${value}`
        },
        // {
        //     header: "Users",
        //     accessor: "Created_By"
        // },

        {
            header: "Users",
            accessor: "details",
            formatter: (value, row) => {
                if (Array.isArray(value) && value.length > 0) {
                    return value.map((d) => `${d.User_Name} (${d.User_Id})`).join(", ");
                }
                return "No Users";
            },
        },

        {
            header: 'Action',
            accessor: 'action',
            isAction: true,
            className: 'text-center',
            actionRenderer: (row) => (
                <div className="flex justify-center space-x-3">
                    <button
                        className="p-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
                        onClick={() => handleEdit(row)}
                        title="Edit"
                    >
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                        className="p-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-200"
                        onClick={() => openDeleteConfirm(row.taskno)}
                        title="Delete"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            )
        },
    ];

    const handleAddNew = async () => {
        setEditId(null);
        resetForm();
        await refetchMaxId();
        setIsModalOpen(true);
    };

    const handleEdit = (row) => {
        console.log('Row', row)
        const existingDetails = row.details?.map(d => ({
            id: d.id,
            taskno: d.taskno,
            action: "update",
            userId: d.User_Id
        })) || [];


        const isWeekly = row.tasktype === 3;
        const isYearly = row.tasktype === 5;


        setFormData({
            taskno: row.taskno.toString(),
            doc_date: row.doc_date || '',
            purpose: row.purpose,
            taskdesc: row.taskdesc,
            tasktype: row.tasktype,
            category: row.category,
            deadlinedate: row.deadlinedate || '',
            startdate: row.startdate || '',
            enddate: row.enddate || '',
            remindtask: row.remindtask,
            reminddate: row.reminddate || '',
            day: row.day,
            weekday: isWeekly ? row.weekday : 1,
            month: isYearly ? row.month : 1,
            time: row.time,
            priority: row.priority,
            Created_By: row.Created_By,
            Authorised_User: formData.Authorised_User || null,
            details: existingDetails
        });


        setOriginalDetails(row.details?.map(d => d.User_Id) || []);

        const selectedUsersFromRow = Array.isArray(row.details)
            ? row.details.map(d => {
                const user = tbluser.find(u => u.User_Id === d.userId);
                return {
                    ...user,
                    value: d.User_Id,
                    label: `${d.User_Id} - ${d.User_Name}`,
                    id: d.id,
                    userId: d.userId || d.User_Id,
                    action: "update"
                };
            })
            : [];


        setSelectedUsers(selectedUsersFromRow);

        const selectedCategoryOption = systemMasterOptions.find(option => option.value === row.category) || null;

        setSelectedOptions({
            tbl: selectedUsersFromRow,
            category: selectedCategoryOption
        });

        setEditId(row.taskno);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payloadData = {
            ...formData,
            taskno: Number(formData.taskno),
            category: formData.category || null,
            doc_date: formData.doc_date || null,
            purpose: formData.purpose,
            taskdesc: formData.taskdesc,
            deadlinedate: formData.deadlinedate || null,
            startdate: formData.startdate || null,
            enddate: formData.enddate || null,
            remindtask: formData.remindtask === 'Y' || formData.remindtask === 1 || formData.remindtask === '1',
            reminddate: formData.reminddate || null,
            day: formData.day || null,
            weekday: formData.weekday || 1,
            month: formData.month || 1,
            time: formData.time || null,
            Authorised_User: formData.Authorised_User || user_id,
            details: [],
            priority: Number(formData.priority) || 1,
            Created_By: createdBy,
        };

        const selectedUserIds = selectedUsers.map(user => user.value);
        const addedUserIds = selectedUserIds.filter(id => !originalDetails.includes(id));
        const removedUserIds = originalDetails.filter(id => !selectedUserIds.includes(id));
        const retainedUserIds = selectedUserIds.filter(id => originalDetails.includes(id));

        const finalDetails = [];
        for (const userId of addedUserIds) {
            finalDetails.push({
                taskno: Number(formData.taskno),
                userId,
                action: 'add'
            });
        }

        for (const userId of removedUserIds) {
            const detail = formData.details.find(d => d.userId === userId);
            finalDetails.push({
                id: detail?.id,
                taskno: Number(formData.taskno),
                userId,
                action: 'delete'
            });
        }

        for (const userId of retainedUserIds) {
            const detail = formData.details.find(d => d.userId === userId);
            finalDetails.push({
                id: detail?.id,
                taskno: Number(formData.taskno),
                userId,
                action: 'update'
            });
        }

        try {

            const payload = { ...payloadData, details: finalDetails };
            console.log('Payload sent to API:', payload);
            if (editId) {
                await updateTaskDescription({ id: editId, ...payload }).unwrap();
            } else {
                await addTaskDescription(payload).unwrap();
            }
            resetForm();
            setIsModalOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to save category wise deliverable:', error);
        }
    };

    const openDeleteConfirm = (id) => {
        setItemToDelete(id);
        setShowDeleteConfirmModal(true);
    };

    const confirmDelete = async () => {
        if (itemToDelete) {
            try {
                await deleteTaskDescription(itemToDelete).unwrap();
                refetch();
            } catch (error) {
                console.error('Failed to delete category wise deliverable:', error);
            } finally {
                setShowDeleteConfirmModal(false);
                setItemToDelete(null);
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === "Tab") {
            setEnabled(true);
        }
    };


    const handleSetDefaults = () => {
        const defaultCategory = systemMasterOptions[0] || null;
        const defaultUsers = tblOptions.slice(0, 1);
        setFormData(prev => ({
            ...prev,
            category: defaultCategory?.value || null,
            userIds: defaultUsers.map(u => u.value),
        }));
        setSelectedOptions(prev => ({
            ...prev,
            category: defaultCategory,
        }));

        setSelectedUsers(defaultUsers);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            let updated = {
                ...prev,
                [name]: ["tasktype", "weekday", "day", "month"].includes(name) ? Number(value) : value,
            };
            if (name === "tasktype") {
                const newTaskType = Number(value);
                if (newTaskType === 2) {
                    updated.deadlinedate = prev.deadlinedate || getCurrentDate();
                    updated.startdate = prev.startdate || getCurrentDate();
                    updated.enddate = prev.enddate || getCurrentDate();
                    updated.reminddate = prev.reminddate || getCurrentDate();
                } else {
                    updated.deadlinedate = getCurrentDate();
                    updated.startdate = getCurrentDate();
                    updated.enddate = getCurrentDate();
                    updated.reminddate = getCurrentDate();
                }

                updated.day = newTaskType === 4 || newTaskType === 5 ? (prev.day || 1) : 0;
                updated.weekday = newTaskType === 3 ? prev.weekday : 1;
                updated.month = newTaskType === 5 ? prev.month : 1;
            }

            return updated;
        });
    };



    const resetForm = () => {
        setFormData({
            taskno: '',
            doc_date: getCurrentDate(),
            purpose: '',
            taskdesc: '',
            tasktype: 1,
            category: '',
            deadlinedate: getCurrentDate(),
            startdate: getCurrentDate(),
            enddate: getCurrentDate(),
            remindtask: 'Y',
            reminddate: getCurrentDate(),
            day: '',
            weekday: '',
            month: '',
            time: '',
            priority: 'H',
            details: []
        });
        setSelectedDeliverablesInModal([]);
        setSelectedUsers(null)
        setSelectedOptions({
            tbl: null,
            category: null,
        });
        setEditId(null);
    };


    const transformedTableData = tableData.map(item => ({
        ...item,
        details: Array.isArray(item.details) ? item.details : []
    }));

    const isLoading = isTableLoading || isTblUserLoading || issystemMasterLoading || isMaxIdLoading;
    const isErrorOccurred = isError;

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isErrorOccurred) {
        return <div>An error occurred while loading Data.</div>;
    }

    return (
        <>
            <TableUtility
                headerContent={<CreateNewButton onClick={handleAddNew} />}
                title="Task Description"
                columns={columns}
                data={transformedTableData}
                pageSize={10}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                title={editId ? 'Edit Task' : 'Create Task'}
                size="2xl"
                width="1500px"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                            <div className="sm:col-span-1">
                                <label htmlFor="taskno" className="block text-sm font-medium text-gray-700">
                                    Task No
                                </label>
                                <input
                                    id="taskno"
                                    type="number"
                                    name="taskno"
                                    value={formData.taskno}
                                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
                                    readOnly
                                    aria-label="Task No (auto-generated)"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    {isMaxIdLoading ? 'Loading Max ID...' : 'Auto-generated'}
                                </p>
                            </div>

                            <div className="sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Date</label>
                                <input
                                    type="date"
                                    name="doc_date"
                                    value={formData.doc_date}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                />
                            </div>

                            <div className="sm:col-span-4">
                                <label className="block text-sm font-medium text-gray-700">Purpose</label>
                                <input
                                    type="text"
                                    name="purpose"
                                    value={formData.purpose}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    autoComplete="off"
                                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Task Description</label>
                            <textarea
                                name="taskdesc"
                                value={formData.taskdesc}
                                onChange={handleInputChange}
                                autoComplete='off'
                                className="w-full h-32 px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 resize-none"
                            />
                        </div>
                    </div>

                    <hr className="border-gray-200" />
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-gray-800">Scheduling</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700">Task Type</label>
                                <select
                                    name="tasktype"
                                    value={formData.tasktype}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                    required
                                >
                                    <option value={1}>Daily</option>
                                    <option value={2}>One Time</option>
                                    <option value={3}>Weekly</option>
                                    <option value={4}>Monthly</option>
                                    <option value={5}>Yearly</option>
                                </select>
                            </div>

                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700">Deadline Date</label>
                                <input
                                    type="date"
                                    name="deadlinedate"
                                    value={formData.deadlinedate}
                                    onChange={handleInputChange}
                                    disabled={formData.tasktype !== 2}
                                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700">Expected Start Date</label>
                                <input
                                    type="date"
                                    name="startdate"
                                    value={formData.startdate}
                                    onChange={handleInputChange}
                                    disabled={formData.tasktype !== 2}
                                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700">End Date</label>
                                <input
                                    type="date"
                                    name="enddate"
                                    value={formData.enddate}
                                    onChange={handleInputChange}
                                    disabled={formData.tasktype !== 2}
                                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Day</label>
                                <input
                                    type="number"
                                    name="day"
                                    value={formData.day}
                                    onChange={handleInputChange}
                                    min={1}
                                    max={31}
                                    disabled={formData.tasktype !== 4 && formData.tasktype !== 5}
                                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Week Day</label>
                                <select
                                    name="weekday"
                                    value={formData.weekday}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
                                    required
                                    disabled={formData.tasktype !== 3}
                                >
                                    <option value={1}>Sunday</option>
                                    <option value={2}>Monday</option>
                                    <option value={3}>Tuesday</option>
                                    <option value={4}>Wednesday</option>
                                    <option value={5}>Thursday</option>
                                    <option value={6}>Friday</option>
                                    <option value={7}>Saturday</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Month</label>
                                <select
                                    name="month"
                                    value={formData.month}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
                                    required
                                    disabled={formData.tasktype !== 5}
                                >
                                    <option value={1}>January</option>
                                    <option value={2}>February</option>
                                    <option value={3}>March</option>
                                    <option value={4}>April</option>
                                    <option value={5}>May</option>
                                    <option value={6}>June</option>
                                    <option value={7}>July</option>
                                    <option value={8}>August</option>
                                    <option value={9}>September</option>
                                    <option value={10}>October</option>
                                    <option value={11}>November</option>
                                    <option value={12}>December</option>
                                </select>
                            </div>

                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                        </div>
                    </div>

                    <hr className="border-gray-200" />
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-800">Assignment & Priority</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <Select
                                    id="category"
                                    options={systemMasterOptions}
                                    value={selectedOptions.category}
                                    onChange={(option) => {
                                        setSelectedOptions(prev => ({ ...prev, category: option }));
                                        setFormData(prev => ({ ...prev, category: option?.value || null }));
                                    }}
                                    placeholder="Select System Code..."
                                    isSearchable
                                    styles={{
                                        container: (provided) => ({ ...provided, width: '100%' }),
                                        placeholder: (provided) => ({
                                            ...provided,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }),
                                    }}
                                />
                            </div>
                            <div>
                                <label htmlFor="userId" className="block text-sm font-medium text-gray-700">Select User</label>
                                <Select
                                    id="userId"
                                    options={tblOptions}
                                    value={selectedUsers}
                                    onChange={(options) => {
                                        setSelectedUsers(options || []);
                                        setFormData(prev => ({ ...prev, userIds: (options || []).map(opt => opt.value) }));
                                    }}
                                    placeholder="Select Users..."
                                    isSearchable
                                    isMulti
                                    required
                                />
                            </div>

                            {/* <div>
                                <label htmlFor="Authorised_User" className="block text-sm font-medium text-gray-700">Authorised User</label>
                                <Select
                                    id="Authorised_User"
                                    options={tblOptions}
                                    value={selectedAuthorisedUsers}
                                    onChange={(option) => {
                                        setSelectedAuthorisedUsers(option || null);
                                        setFormData(prev => ({ ...prev, Authorised_User: option ? option.value : null, }));
                                    }}
                                    placeholder="Select Authorised User..."
                                    isSearchable
                                />
                            </div> */}
                            <div>
                                <label htmlFor="Authorised_User" className="block text-sm font-medium text-gray-700">Authorised User</label>
                                <Select
                                    id="Authorised_User"
                                    options={tblOptions}
                                    value={selectedAuthorisedUsers}
                                    onChange={(option) => {
                                        setSelectedAuthorisedUsers(option || null);
                                        setFormData(prev => ({ ...prev, Authorised_User: option ? option.value : null, }));
                                    }}
                                    placeholder="Select Authorised User..."
                                    isSearchable
                                    isClearable
                                    isMulti
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Task Priority</label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
                                    required
                                    disabled={!!editId}
                                >
                                    <option value={1}>High</option>
                                    <option value={2}>Medium</option>
                                    <option value={3}>Low</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Time Required</label>
                                <input
                                    type="text"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                        </div>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Remind Task</label>
                                <select
                                    name="remindtask"
                                    value={formData.remindtask}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                    required
                                >
                                    <option value={1}>Yes</option>
                                    <option value={0}>No</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Remind Date</label>
                                <input
                                    type="date"
                                    name="reminddate"
                                    value={formData.reminddate}
                                    onChange={handleInputChange}
                                    disabled={formData.tasktype !== 2}
                                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => { setIsModalOpen(false); resetForm(); }}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            {editId ? 'Update' : 'Save'}
                        </button>
                        <button
                            type="button"
                            onClick={handleSetDefaults}
                            disabled={!enabled}
                            className={`px-4 py-2 ml-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200
                    ${enabled ? "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" : "bg-gray-400 cursor-not-allowed"}`}
                        >
                            Default Way To Save
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={showDeleteConfirmModal}
                onClose={() => setShowDeleteConfirmModal(false)}
                title="Confirm Deletion"
            >
                <div className="p-4 text-center">
                    <p className="text-lg text-gray-700 mb-6">Are you sure you want to delete this Task?</p>
                    <div className="flex justify-center space-x-4">
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirmModal(false)}
                            className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelete}
                            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default TaskDescriptionEntry;
