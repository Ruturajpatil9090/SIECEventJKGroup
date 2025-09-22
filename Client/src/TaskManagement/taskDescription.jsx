// import React, { useState, useEffect, useMemo } from 'react';
// import Select from 'react-select';
// import TableUtility from "../common/TableUtility/TableUtility";
// import { PencilSquareIcon } from '@heroicons/react/24/outline';
// import { Trash2 } from 'lucide-react';
// import Modal from '../common/Modal/Modal';
// import {
//     useGetTaskDescriptionQuery,
//     useAddTaskDescriptionMutation,
//     useUpdateTaskDescriptionMutation,
//     useDeleteTaskDescriptionMutation,
//     useGetMaxTaskDescriptionIdQuery,
//     useGetSystemMasterQuery
// } from '../services/taskdescriptionApi'
// import CreateNewButton from "../common/Buttons/AddButton";
// import { useGetUserMastersQuery } from '../services/userMasterApi';
// import { decryptData } from '../common/Functions/DecryptData';
// import { getCurrentDate } from '../common/Functions/GetCurrentdate';


// function TaskDescriptionEntry() {
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
//     const [itemToDelete, setItemToDelete] = useState(null);
//     const [originalDetails, setOriginalDetails] = useState([]);
//     const [selectedUsers, setSelectedUsers] = useState([]);
//     const [selectedAuthorisedUsers, setSelectedAuthorisedUsers] = useState([]);
//     const [createdBy, setCreatedBy] = useState('');

//     const user_id = sessionStorage.getItem("user_id")

//     const [formData, setFormData] = useState({
//         taskno: '',
//         doc_date: getCurrentDate(),
//         purpose: '',
//         taskdesc: 0,
//         tasktype: 1,
//         category: '',
//         deadlinedate: getCurrentDate(),
//         startdate: getCurrentDate(),
//         enddate: getCurrentDate(),
//         remindtask: 1,
//         reminddate: getCurrentDate(),
//         day: 0,
//         weekday: 1,
//         month: 1,
//         time: 0,
//         priority: 1,
//         Created_By: '',
//         Authorised_User: "",
//         details: []
//     });



//     const [editId, setEditId] = useState(null);
//     const [enabled, setEnabled] = useState(false);
//     const [selectedDeliverablesInModal, setSelectedDeliverablesInModal] = useState([]);

//     const { data: tableData = [], isLoading: isTableLoading, isError, refetch } = useGetTaskDescriptionQuery({ user_id: sessionStorage.getItem("user_id") });

//     const { data: maxTaskDescriptionId = 0, isLoading: isMaxIdLoading, refetch: refetchMaxId } = useGetMaxTaskDescriptionIdQuery();

//     const { data: tbluser = [], isLoading: isTblUserLoading } = useGetUserMastersQuery();
//     const { data: systemMaster = [], isLoading: issystemMasterLoading } = useGetSystemMasterQuery();
//     const systemCodes = Array.isArray(systemMaster) ? systemMaster.map(item => item.System_Code) : [];

//     const [addTaskDescription] = useAddTaskDescriptionMutation();
//     const [updateTaskDescription] = useUpdateTaskDescriptionMutation();
//     const [deleteTaskDescription] = useDeleteTaskDescriptionMutation();

//     useEffect(() => {
//         if (!editId && isModalOpen && !isMaxIdLoading) {
//             const nextId = (typeof maxTaskDescriptionId === 'number' ? maxTaskDescriptionId : 0) + 1;
//             setFormData(prev => ({
//                 ...prev,
//                 taskno: nextId
//             }));
//         }
//     }, [maxTaskDescriptionId, isMaxIdLoading, editId, isModalOpen]);

//     const [selectedOptions, setSelectedOptions] = useState({
//         tbl: null,
//         category: null
//     });

//     const tblOptions = useMemo(() => tbluser.map(tbl => ({
//         value: tbl.User_Id,
//         label: `${tbl.User_Id} - ${tbl.User_Name}`
//     })), [tbluser]);

//     const systemMasterOptions = useMemo(() => systemMaster.map(system => ({
//         value: system.System_Code,
//         label: `${system.System_Code} - ${system.System_Name_E}`
//     })), [systemMaster]);


//     useEffect(() => {
//         const encryptedUserData = sessionStorage.getItem('user_data');
//         const userData = decryptData(encryptedUserData);
//         if (userData && userData.user_name) {
//             setCreatedBy(userData.user_name);
//         }
//     }, []);



//     const columns = [
//         { header: 'ID', accessor: 'taskno' },
//         {
//             header: 'Task Purpose',
//             accessor: 'purpose',
//             cellRenderer: (value, row) => `${row.Event_Code} - ${value}`
//         },
//         {
//             header: 'Task Description',
//             accessor: 'taskdesc',
//         },
//         {
//             header: 'Task Assigned  Date',
//             accessor: 'doc_date',
//             // cellRenderer: (value, row) => `${row.doc_date} - ${value}`
//         },
//         // {
//         //     header: "Users",
//         //     accessor: "Created_By"
//         // },

//         {
//             header: "Assigned Users",
//             accessor: "details",
//             formatter: (value, row) => {
//                 if (Array.isArray(value) && value.length > 0) {
//                     return value.map((d) => `${d.User_Name}`).join(", ");
//                 }
//                 return "No Users";
//             },
//         },

//         {
//             header: 'Action',
//             accessor: 'action',
//             isAction: true,
//             className: 'text-center',
//             actionRenderer: (row) => (
//                 <div className="flex justify-center space-x-3">
//                     <button
//                         className="p-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
//                         onClick={() => handleEdit(row)}
//                         title="Edit"
//                     >
//                         <PencilSquareIcon className="h-5 w-5" />
//                     </button>
//                     <button
//                         className="p-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-200"
//                         onClick={() => openDeleteConfirm(row.taskno)}
//                         title="Delete"
//                     >
//                         <Trash2 className="h-5 w-5" />
//                     </button>
//                 </div>
//             )
//         },
//     ];

//     const handleAddNew = async () => {
//         setEditId(null);
//         resetForm();
//         await refetchMaxId();
//         setIsModalOpen(true);
//     };

//     const handleEdit = (row) => {
//         console.log('Row', row)
//         const existingDetails = row.details?.map(d => ({
//             id: d.id,
//             taskno: d.taskno,
//             action: "update",
//             userId: d.User_Id
//         })) || [];


//         const isWeekly = row.tasktype === 3;
//         const isYearly = row.tasktype === 5;


//         setFormData({
//             taskno: row.taskno.toString(),
//             doc_date: row.doc_date || '',
//             purpose: row.purpose,
//             taskdesc: row.taskdesc,
//             tasktype: row.tasktype,
//             category: row.category,
//             deadlinedate: row.deadlinedate || '',
//             startdate: row.startdate || '',
//             enddate: row.enddate || '',
//             remindtask: row.remindtask,
//             reminddate: row.reminddate || '',
//             day: row.day,
//             weekday: isWeekly ? row.weekday : 1,
//             month: isYearly ? row.month : 1,
//             time: row.time,
//             priority: row.priority,
//             Created_By: row.Created_By,
//             Authorised_User: formData.Authorised_User || null,
//             details: existingDetails
//         });


//         setOriginalDetails(row.details?.map(d => d.User_Id) || []);

//         const selectedUsersFromRow = Array.isArray(row.details)
//             ? row.details.map(d => {
//                 const user = tbluser.find(u => u.User_Id === d.userId);
//                 return {
//                     ...user,
//                     value: d.User_Id,
//                     label: `${d.User_Id} - ${d.User_Name}`,
//                     id: d.id,
//                     userId: d.userId || d.User_Id,
//                     action: "update"
//                 };
//             })
//             : [];


//         setSelectedUsers(selectedUsersFromRow);

//         const selectedCategoryOption = systemMasterOptions.find(option => option.value === row.category) || null;

//         setSelectedOptions({
//             tbl: selectedUsersFromRow,
//             category: selectedCategoryOption
//         });

//         setEditId(row.taskno);
//         setIsModalOpen(true);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const payloadData = {
//             ...formData,
//             taskno: Number(formData.taskno),
//             category: formData.category || null,
//             doc_date: formData.doc_date || null,
//             purpose: formData.purpose,
//             taskdesc: formData.taskdesc,
//             deadlinedate: formData.deadlinedate || null,
//             startdate: formData.startdate || null,
//             enddate: formData.enddate || null,
//             remindtask: formData.remindtask === 'Y' || formData.remindtask === 1 || formData.remindtask === '1',
//             reminddate: formData.reminddate || null,
//             day: formData.day || null,
//             weekday: formData.weekday || 1,
//             month: formData.month || 1,
//             time: formData.time || null,
//             Authorised_User: formData.Authorised_User || user_id,
//             details: [],
//             priority: Number(formData.priority) || 1,
//             Created_By: createdBy,
//         };

//         const selectedUserIds = selectedUsers.map(user => user.value);
//         const addedUserIds = selectedUserIds.filter(id => !originalDetails.includes(id));
//         const removedUserIds = originalDetails.filter(id => !selectedUserIds.includes(id));
//         const retainedUserIds = selectedUserIds.filter(id => originalDetails.includes(id));

//         const finalDetails = [];
//         for (const userId of addedUserIds) {
//             finalDetails.push({
//                 taskno: Number(formData.taskno),
//                 userId,
//                 action: 'add'
//             });
//         }

//         for (const userId of removedUserIds) {
//             const detail = formData.details.find(d => d.userId === userId);
//             finalDetails.push({
//                 id: detail?.id,
//                 taskno: Number(formData.taskno),
//                 userId,
//                 action: 'delete'
//             });
//         }

//         for (const userId of retainedUserIds) {
//             const detail = formData.details.find(d => d.userId === userId);
//             finalDetails.push({
//                 id: detail?.id,
//                 taskno: Number(formData.taskno),
//                 userId,
//                 action: 'update'
//             });
//         }

//         try {

//             const payload = { ...payloadData, details: finalDetails };
//             console.log('Payload sent to API:', payload);
//             if (editId) {
//                 await updateTaskDescription({ id: editId, ...payload }).unwrap();
//             } else {
//                 await addTaskDescription(payload).unwrap();
//             }
//             resetForm();
//             setIsModalOpen(false);
//             refetch();
//         } catch (error) {
//             console.error('Failed to save category wise deliverable:', error);
//         }
//     };

//     const openDeleteConfirm = (id) => {
//         setItemToDelete(id);
//         setShowDeleteConfirmModal(true);
//     };

//     const confirmDelete = async () => {
//         if (itemToDelete) {
//             try {
//                 await deleteTaskDescription(itemToDelete).unwrap();
//                 refetch();
//             } catch (error) {
//                 console.error('Failed to delete category wise deliverable:', error);
//             } finally {
//                 setShowDeleteConfirmModal(false);
//                 setItemToDelete(null);
//             }
//         }
//     };

//     const handleKeyDown = (e) => {
//         if (e.key === "Enter" || e.key === "Tab") {
//             setEnabled(true);
//         }
//     };


//     const handleSetDefaults = () => {
//         const defaultCategory = systemMasterOptions[0] || null;
//         const defaultUsers = tblOptions.slice(0, 1);
//         setFormData(prev => ({
//             ...prev,
//             category: defaultCategory?.value || null,
//             userIds: defaultUsers.map(u => u.value),
//         }));
//         setSelectedOptions(prev => ({
//             ...prev,
//             category: defaultCategory,
//         }));

//         setSelectedUsers(defaultUsers);
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;

//         setFormData(prev => {
//             let updated = {
//                 ...prev,
//                 [name]: ["tasktype", "weekday", "day", "month"].includes(name) ? Number(value) : value,
//             };
//             if (name === "tasktype") {
//                 const newTaskType = Number(value);
//                 if (newTaskType === 2) {
//                     updated.deadlinedate = prev.deadlinedate || getCurrentDate();
//                     updated.startdate = prev.startdate || getCurrentDate();
//                     updated.enddate = prev.enddate || getCurrentDate();
//                     updated.reminddate = prev.reminddate || getCurrentDate();
//                 } else {
//                     updated.deadlinedate = getCurrentDate();
//                     updated.startdate = getCurrentDate();
//                     updated.enddate = getCurrentDate();
//                     updated.reminddate = getCurrentDate();
//                 }

//                 updated.day = newTaskType === 4 || newTaskType === 5 ? (prev.day || 1) : 0;
//                 updated.weekday = newTaskType === 3 ? prev.weekday : 1;
//                 updated.month = newTaskType === 5 ? prev.month : 1;
//             }

//             return updated;
//         });
//     };



//     const resetForm = () => {
//         setFormData({
//             taskno: '',
//             doc_date: getCurrentDate(),
//             purpose: '',
//             taskdesc: '',
//             tasktype: 1,
//             category: '',
//             deadlinedate: getCurrentDate(),
//             startdate: getCurrentDate(),
//             enddate: getCurrentDate(),
//             remindtask: 'Y',
//             reminddate: getCurrentDate(),
//             day: '',
//             weekday: '',
//             month: '',
//             time: '',
//             priority: 'H',
//             details: []
//         });
//         setSelectedDeliverablesInModal([]);
//         setSelectedUsers(null)
//         setSelectedOptions({
//             tbl: null,
//             category: null,
//         });
//         setEditId(null);
//     };


//     const transformedTableData = tableData.map(item => ({
//         ...item,
//         details: Array.isArray(item.details) ? item.details : []
//     }));

//     const isLoading = isTableLoading || isTblUserLoading || issystemMasterLoading || isMaxIdLoading;
//     const isErrorOccurred = isError;

//     if (isLoading) {
//         return <div className="text-center space-y-4">
//             <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto" />

//             <p className="text-gray-700 text-lg font-medium">
//                 Loading
//                 <span className="inline-block animate-pulse ml-1 text-blue-600">...</span>
//             </p>
//         </div>;
//     }

//     if (isErrorOccurred) {
//         return <div>An error occurred while loading Data.</div>;
//     }

//     return (
//         <>
//             <div style={{ marginTop: "-70px" }}>
//                 <TableUtility
//                     headerContent={<CreateNewButton onClick={handleAddNew} />}
//                     title="Task Overview"
//                     columns={columns}
//                     data={transformedTableData}
//                     pageSize={10}
//                 />

//                 <Modal
//                     isOpen={isModalOpen}
//                     onClose={() => {
//                         setIsModalOpen(false);
//                         resetForm();
//                     }}
//                     title={editId ? 'Update Task' : 'Create New Task'}
//                     size="2xl"
//                     width="1200px"
//                 >
//                     <form onSubmit={handleSubmit} className="space-y-6">
//                         <div className="space-y-2">
//                             <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
//                                 <div className="sm:col-span-1">
//                                     <label htmlFor="taskno" className="block text-sm font-medium text-gray-700">
//                                         Task No
//                                     </label>
//                                     <input
//                                         id="taskno"
//                                         type="number"
//                                         name="taskno"
//                                         value={formData.taskno}
//                                         className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
//                                         readOnly
//                                         aria-label="Task No (auto-generated)"
//                                     />
//                                     <p className="mt-1 text-xs text-gray-500">
//                                         {isMaxIdLoading ? 'Loading Max ID...' : 'Auto-generated'}
//                                     </p>
//                                 </div>

//                                 <div className="sm:col-span-1">
//                                     <label className="block text-sm font-medium text-gray-700">Date</label>
//                                     <input
//                                         type="date"
//                                         name="doc_date"
//                                         value={formData.doc_date}
//                                         onChange={handleInputChange}
//                                         className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
//                                     />
//                                 </div>

//                                 <div className="sm:col-span-4">
//                                     <label className="block text-sm font-medium text-gray-700">Purpose</label>
//                                     <input
//                                         type="text"
//                                         name="purpose"
//                                         value={formData.purpose}
//                                         onChange={handleInputChange}
//                                         onKeyDown={handleKeyDown}
//                                         autoComplete="off"
//                                         className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
//                                         required
//                                     />
//                                 </div>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Task Description</label>
//                                 <textarea
//                                     name="taskdesc"
//                                     value={formData.taskdesc}
//                                     onChange={handleInputChange}
//                                     autoComplete='off'
//                                     className="w-full h-25 px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 resize-none"
//                                 />
//                             </div>
//                         </div>

//                         <div className="space-y-1">
//                             <h2 className="text-xl font-bold text-gray-800">Scheduling</h2>
//                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
//                                 <div className="w-full">
//                                     <label className="block text-sm font-medium text-gray-700">Task Type</label>
//                                     <select
//                                         name="tasktype"
//                                         value={formData.tasktype}
//                                         onChange={handleInputChange}
//                                         className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
//                                         required
//                                     >
//                                         <option value={1}>Daily</option>
//                                         <option value={2}>One Time</option>
//                                         <option value={3}>Weekly</option>
//                                         <option value={4}>Monthly</option>
//                                         <option value={5}>Yearly</option>
//                                     </select>
//                                 </div>

//                                 <div className="w-full">
//                                     <label className="block text-sm font-medium text-gray-700">Deadline Date</label>
//                                     <input
//                                         type="date"
//                                         name="deadlinedate"
//                                         value={formData.deadlinedate}
//                                         onChange={handleInputChange}
//                                         disabled={formData.tasktype !== 2}
//                                         className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
//                                     />
//                                 </div>

//                                 <div className="w-full">
//                                     <label className="block text-sm font-medium text-gray-700">Expected Start Date</label>
//                                     <input
//                                         type="date"
//                                         name="startdate"
//                                         value={formData.startdate}
//                                         onChange={handleInputChange}
//                                         disabled={formData.tasktype !== 2}
//                                         className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
//                                     />
//                                 </div>

//                                 <div className="w-full">
//                                     <label className="block text-sm font-medium text-gray-700">End Date</label>
//                                     <input
//                                         type="date"
//                                         name="enddate"
//                                         value={formData.enddate}
//                                         onChange={handleInputChange}
//                                         disabled={formData.tasktype !== 2}
//                                         className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700">Day</label>
//                                     <input
//                                         type="number"
//                                         name="day"
//                                         value={formData.day}
//                                         onChange={handleInputChange}
//                                         min={1}
//                                         max={31}
//                                         disabled={formData.tasktype !== 4 && formData.tasktype !== 5}
//                                         className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700">Week Day</label>
//                                     <select
//                                         name="weekday"
//                                         value={formData.weekday}
//                                         onChange={handleInputChange}
//                                         className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
//                                         required
//                                         disabled={formData.tasktype !== 3}
//                                     >
//                                         <option value={1}>Sunday</option>
//                                         <option value={2}>Monday</option>
//                                         <option value={3}>Tuesday</option>
//                                         <option value={4}>Wednesday</option>
//                                         <option value={5}>Thursday</option>
//                                         <option value={6}>Friday</option>
//                                         <option value={7}>Saturday</option>
//                                     </select>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700">Month</label>
//                                     <select
//                                         name="month"
//                                         value={formData.month}
//                                         onChange={handleInputChange}
//                                         className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
//                                         required
//                                         disabled={formData.tasktype !== 5}
//                                     >
//                                         <option value={1}>January</option>
//                                         <option value={2}>February</option>
//                                         <option value={3}>March</option>
//                                         <option value={4}>April</option>
//                                         <option value={5}>May</option>
//                                         <option value={6}>June</option>
//                                         <option value={7}>July</option>
//                                         <option value={8}>August</option>
//                                         <option value={9}>September</option>
//                                         <option value={10}>October</option>
//                                         <option value={11}>November</option>
//                                         <option value={12}>December</option>
//                                     </select>
//                                 </div>

//                             </div>
//                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

//                             </div>
//                         </div>

//                         <div className="space-y-2">
//                             <h2 className="text-xl font-bold text-gray-800">Assignment & Priority</h2>
//                             <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
//                                 <div className="flex-1 min-w-[200px]">
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
//                                     <Select
//                                         id="category"
//                                         options={systemMasterOptions}
//                                         value={selectedOptions.category}
//                                         onChange={(option) => {
//                                             setSelectedOptions(prev => ({ ...prev, category: option }));
//                                             setFormData(prev => ({ ...prev, category: option?.value || null }));
//                                         }}
//                                         placeholder="Select System Code..."
//                                         isSearchable
//                                         styles={{
//                                             container: (provided) => ({ ...provided, width: '100%' }),
//                                             placeholder: (provided) => ({
//                                                 ...provided,
//                                                 whiteSpace: 'nowrap',
//                                                 overflow: 'hidden',
//                                                 textOverflow: 'ellipsis',
//                                             }),
//                                         }}
//                                     />
//                                 </div>
//                                 <div>
//                                     <label htmlFor="userId" className="block text-sm font-medium text-gray-700">Select User</label>
//                                     <Select
//                                         id="userId"
//                                         options={tblOptions}
//                                         value={selectedUsers}
//                                         onChange={(options) => {
//                                             setSelectedUsers(options || []);
//                                             setFormData(prev => ({ ...prev, userIds: (options || []).map(opt => opt.value) }));
//                                         }}
//                                         placeholder="Select Users..."
//                                         isSearchable
//                                         isMulti
//                                         required
//                                     />
//                                 </div>

//                                 {/* <div>
//                                 <label htmlFor="Authorised_User" className="block text-sm font-medium text-gray-700">Authorised User</label>
//                                 <Select
//                                     id="Authorised_User"
//                                     options={tblOptions}
//                                     value={selectedAuthorisedUsers}
//                                     onChange={(option) => {
//                                         setSelectedAuthorisedUsers(option || null);
//                                         setFormData(prev => ({ ...prev, Authorised_User: option ? option.value : null, }));
//                                     }}
//                                     placeholder="Select Authorised User..."
//                                     isSearchable
//                                 />
//                             </div> */}
//                                 <div>
//                                     <label htmlFor="Authorised_User" className="block text-sm font-medium text-gray-700">Authorised User</label>
//                                     <Select
//                                         id="Authorised_User"
//                                         options={tblOptions}
//                                         value={selectedAuthorisedUsers}
//                                         onChange={(option) => {
//                                             setSelectedAuthorisedUsers(option || null);
//                                             setFormData(prev => ({ ...prev, Authorised_User: option ? option.value : null, }));
//                                         }}
//                                         placeholder="Authorised User..."
//                                         isSearchable
//                                         isClearable
//                                         isMulti
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700">Task Priority</label>
//                                     <select
//                                         name="priority"
//                                         value={formData.priority}
//                                         onChange={handleInputChange}
//                                         className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
//                                         required
//                                         disabled={!!editId}
//                                     >
//                                         <option value={1}>High</option>
//                                         <option value={2}>Medium</option>
//                                         <option value={3}>Low</option>
//                                     </select>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700">Time Required</label>
//                                     <input
//                                         type="text"
//                                         name="time"
//                                         value={formData.time}
//                                         onChange={handleInputChange}
//                                         className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
//                                     />
//                                 </div>
//                             </div>

//                         </div>
//                         <div className="space-y-2">
//                             <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
//                             <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700">Remind Task</label>
//                                     <select
//                                         name="remindtask"
//                                         value={formData.remindtask}
//                                         onChange={handleInputChange}
//                                         className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
//                                         required
//                                     >
//                                         <option value={1}>Yes</option>
//                                         <option value={0}>No</option>
//                                     </select>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700">Remind Date</label>
//                                     <input
//                                         type="date"
//                                         name="reminddate"
//                                         value={formData.reminddate}
//                                         onChange={handleInputChange}
//                                         disabled={formData.tasktype !== 2}
//                                         className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="flex justify-end space-x-3 pt-4">
//                             <button
//                                 type="button"
//                                 onClick={() => { setIsModalOpen(false); resetForm(); }}
//                                 className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 type="submit"
//                                 className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
//                             >
//                                 {editId ? 'Update' : 'Save'}
//                             </button>
//                             <button
//                                 type="button"
//                                 onClick={handleSetDefaults}
//                                 disabled={!enabled}
//                                 className={`px-4 py-2 ml-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200
//                     ${enabled ? "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" : "bg-gray-400 cursor-not-allowed"}`}
//                             >
//                                 Default Way To Save
//                             </button>
//                         </div>
//                     </form>
//                 </Modal>

//                 <Modal
//                     isOpen={showDeleteConfirmModal}
//                     onClose={() => setShowDeleteConfirmModal(false)}
//                     title="Confirm Deletion"
//                 >
//                     <div className="p-4 text-center">
//                         <p className="text-lg text-gray-700 mb-6">Are you sure you want to delete this Task?</p>
//                         <div className="flex justify-center space-x-4">
//                             <button
//                                 type="button"
//                                 onClick={() => setShowDeleteConfirmModal(false)}
//                                 className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 type="button"
//                                 onClick={confirmDelete}
//                                 className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
//                             >
//                                 Delete
//                             </button>
//                         </div>
//                     </div>
//                 </Modal>
//             </div>
//         </>
//     );
// }

// export default TaskDescriptionEntry;















// import React, { useState, useEffect, useMemo } from 'react';
// import Select from 'react-select';
// import { PencilSquareIcon, TrashIcon, CalendarIcon, ClockIcon, UserGroupIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
// import {
//     AlertTriangle
// } from 'lucide-react';
// import Modal from '../common/Modal/Modal';
// import {
//     useGetTaskDescriptionQuery,
//     useAddTaskDescriptionMutation,
//     useUpdateTaskDescriptionMutation,
//     useDeleteTaskDescriptionMutation,
//     useGetMaxTaskDescriptionIdQuery,
//     useGetSystemMasterQuery
// } from '../services/taskdescriptionApi'
// import CreateNewButton from "../common/Buttons/AddButton";
// import { useGetUserMastersQuery } from '../services/userMasterApi';
// import { decryptData } from '../common/Functions/DecryptData';
// import { getCurrentDate } from '../common/Functions/GetCurrentdate';

// function TaskDescriptionCardView() {
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
//     const [itemToDelete, setItemToDelete] = useState(null);
//     const [originalDetails, setOriginalDetails] = useState([]);
//     const [selectedUsers, setSelectedUsers] = useState([]);
//     const [selectedAuthorisedUsers, setSelectedAuthorisedUsers] = useState([]);
//     const [createdBy, setCreatedBy] = useState('');
//     const [selectedUserFilter, setSelectedUserFilter] = useState(null);
//     const [selectedPriorityFilter, setSelectedPriorityFilter] = useState(null);

//     const user_id = sessionStorage.getItem("user_id");

//     const [formData, setFormData] = useState({
//         taskno: '',
//         doc_date: getCurrentDate(),
//         purpose: '',
//         taskdesc: '',
//         tasktype: 1,
//         category: '',
//         deadlinedate: getCurrentDate(),
//         startdate: getCurrentDate(),
//         enddate: getCurrentDate(),
//         remindtask: 1,
//         reminddate: getCurrentDate(),
//         day: 0,
//         weekday: 1,
//         month: 1,
//         time: 0,
//         priority: 1,
//         Created_By: '',
//         Authorised_User: "",
//         details: []
//     });

//     const [editId, setEditId] = useState(null);
//     const [enabled, setEnabled] = useState(false);

//     const { data: tableData = [], isLoading: isTableLoading, isError, refetch } = useGetTaskDescriptionQuery({ user_id: sessionStorage.getItem("user_id") });
//     const { data: maxTaskDescriptionId = 0, isLoading: isMaxIdLoading, refetch: refetchMaxId } = useGetMaxTaskDescriptionIdQuery();
//     const { data: tbluser = [], isLoading: isTblUserLoading } = useGetUserMastersQuery();
//     const { data: systemMaster = [], isLoading: issystemMasterLoading } = useGetSystemMasterQuery();

//     const [addTaskDescription] = useAddTaskDescriptionMutation();
//     const [updateTaskDescription] = useUpdateTaskDescriptionMutation();
//     const [deleteTaskDescription] = useDeleteTaskDescriptionMutation();

//     useEffect(() => {
//         if (!editId && isModalOpen && !isMaxIdLoading) {
//             const nextId = (typeof maxTaskDescriptionId === 'number' ? maxTaskDescriptionId : 0) + 1;
//             setFormData(prev => ({
//                 ...prev,
//                 taskno: nextId
//             }));
//         }
//     }, [maxTaskDescriptionId, isMaxIdLoading, editId, isModalOpen]);

//     const [selectedOptions, setSelectedOptions] = useState({
//         tbl: null,
//         category: null
//     });

//     const tblOptions = useMemo(() => tbluser.map(tbl => ({
//         value: tbl.User_Id,
//         label: `${tbl.User_Id} - ${tbl.User_Name}`
//     })), [tbluser]);

//     const systemMasterOptions = useMemo(() => systemMaster.map(system => ({
//         value: system.System_Code,
//         label: `${system.System_Code} - ${system.System_Name_E}`
//     })), [systemMaster]);

//     useEffect(() => {
//         const encryptedUserData = sessionStorage.getItem('user_data');
//         const userData = decryptData(encryptedUserData);
//         if (userData && userData.user_name) {
//             setCreatedBy(userData.user_name);
//         }
//     }, []);

//     const filteredTasks = useMemo(() => {
//         let filtered = tableData;

//         if (selectedUserFilter) {
//             filtered = filtered.filter(task =>
//                 task.details?.some(detail => detail.User_Id === selectedUserFilter.value)
//             );
//         }

//         if (selectedPriorityFilter) {
//             filtered = filtered.filter(task => task.priority === parseInt(selectedPriorityFilter.value));
//         }

//         return filtered;
//     }, [tableData, selectedUserFilter, selectedPriorityFilter]);

//     const tasksByUser = useMemo(() => {
//         const grouped = {};

//         filteredTasks.forEach(task => {
//             if (task.details && Array.isArray(task.details)) {
//                 task.details.forEach(detail => {
//                     const userId = detail.User_Id;
//                     if (!grouped[userId]) {
//                         grouped[userId] = {
//                             user: detail,
//                             tasks: []
//                         };
//                     }
//                     grouped[userId].tasks.push(task);
//                 });
//             }
//         });

//         Object.keys(grouped).forEach(userId => {
//             grouped[userId].tasks.sort((a, b) => a.priority - b.priority);
//         });

//         return grouped;
//     }, [filteredTasks]);

//     const priorityConfig = {
//         1: {
//             label: 'High',
//             color: 'bg-red-400 border-red-400',
//             textColor: 'text-red-50',
//             icon: ExclamationTriangleIcon
//         },
//         2: {
//             label: 'Medium',
//             color: 'bg-yellow-800 border-yellow-900',
//             textColor: 'text-yellow-50',
//             icon: ClockIcon
//         },
//         3: {
//             label: 'Low',
//             color: 'bg-blue-500 border-blue-800',
//             textColor: 'text-blue-50',
//             icon: CalendarIcon
//         }
//     };

//     const taskTypeConfig = {
//         1: 'Daily',
//         2: 'One Time',
//         3: 'Weekly',
//         4: 'Monthly',
//         5: 'Yearly'
//     };

//     const handleAddNew = async () => {
//         setEditId(null);
//         resetForm();
//         await refetchMaxId();
//         setIsModalOpen(true);
//     };

//     const handleEdit = (task) => {
//         const existingDetails = task.details?.map(d => ({
//             id: d.id,
//             taskno: d.taskno,
//             action: "update",
//             userId: d.User_Id
//         })) || [];

//         const isWeekly = task.tasktype === 3;
//         const isYearly = task.tasktype === 5;

//         setFormData({
//             taskno: task.taskno.toString(),
//             doc_date: task.doc_date || '',
//             purpose: task.purpose,
//             taskdesc: task.taskdesc,
//             tasktype: task.tasktype,
//             category: task.category,
//             deadlinedate: task.deadlinedate || '',
//             startdate: task.startdate || '',
//             enddate: task.enddate || '',
//             remindtask: task.remindtask,
//             reminddate: task.reminddate || '',
//             day: task.day,
//             weekday: isWeekly ? task.weekday : 1,
//             month: isYearly ? task.month : 1,
//             time: task.time,
//             priority: task.priority,
//             Created_By: task.Created_By,
//             Authorised_User: task.Authorised_User || null,
//             details: existingDetails
//         });

//         setOriginalDetails(task.details?.map(d => d.User_Id) || []);

//         const selectedUsersFromTask = Array.isArray(task.details)
//             ? task.details.map(d => {
//                 const user = tbluser.find(u => u.User_Id === d.User_Id);
//                 return user ? {
//                     ...user,
//                     value: d.User_Id,
//                     label: `${d.User_Id} - ${d.User_Name}`,
//                     id: d.id,
//                     userId: d.User_Id,
//                     action: "update"
//                 } : null;
//             }).filter(Boolean)
//             : [];

//         setSelectedUsers(selectedUsersFromTask);

//         const selectedCategoryOption = systemMasterOptions.find(option => option.value === task.category) || null;

//         setSelectedOptions({
//             tbl: selectedUsersFromTask,
//             category: selectedCategoryOption
//         });

//         setEditId(task.taskno);
//         setIsModalOpen(true);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const payloadData = {
//             ...formData,
//             taskno: Number(formData.taskno),
//             category: formData.category || null,
//             doc_date: formData.doc_date || null,
//             purpose: formData.purpose,
//             taskdesc: formData.taskdesc,
//             deadlinedate: formData.deadlinedate || null,
//             startdate: formData.startdate || null,
//             enddate: formData.enddate || null,
//             remindtask: formData.remindtask === 'Y' || formData.remindtask === 1 || formData.remindtask === '1',
//             reminddate: formData.reminddate || null,
//             day: formData.day || null,
//             weekday: formData.weekday || 1,
//             month: formData.month || 1,
//             time: formData.time || null,
//             Authorised_User: formData.Authorised_User || user_id,
//             details: [],
//             priority: Number(formData.priority) || 1,
//             Created_By: createdBy,
//         };

//         const selectedUserIds = selectedUsers.map(user => user.value);
//         const addedUserIds = selectedUserIds.filter(id => !originalDetails.includes(id));
//         const removedUserIds = originalDetails.filter(id => !selectedUserIds.includes(id));
//         const retainedUserIds = selectedUserIds.filter(id => originalDetails.includes(id));

//         const finalDetails = [];
//         for (const userId of addedUserIds) {
//             finalDetails.push({
//                 taskno: Number(formData.taskno),
//                 userId,
//                 action: 'add'
//             });
//         }

//         for (const userId of removedUserIds) {
//             const detail = formData.details.find(d => d.userId === userId);
//             finalDetails.push({
//                 id: detail?.id,
//                 taskno: Number(formData.taskno),
//                 userId,
//                 action: 'delete'
//             });
//         }

//         for (const userId of retainedUserIds) {
//             const detail = formData.details.find(d => d.userId === userId);
//             finalDetails.push({
//                 id: detail?.id,
//                 taskno: Number(formData.taskno),
//                 userId,
//                 action: 'update'
//             });
//         }

//         try {
//             const payload = { ...payloadData, details: finalDetails };
//             if (editId) {
//                 await updateTaskDescription({ id: editId, ...payload }).unwrap();
//             } else {
//                 await addTaskDescription(payload).unwrap();
//             }
//             resetForm();
//             setIsModalOpen(false);
//             refetch();
//         } catch (error) {
//             console.error('Failed to save task:', error);
//         }
//     };

//     const openDeleteConfirm = (id) => {
//         setItemToDelete(id);
//         setShowDeleteConfirmModal(true);
//     };

//     const confirmDelete = async () => {
//         if (itemToDelete) {
//             try {
//                 await deleteTaskDescription(itemToDelete).unwrap();
//                 refetch();
//             } catch (error) {
//                 console.error('Failed to delete task:', error);
//             } finally {
//                 setShowDeleteConfirmModal(false);
//                 setItemToDelete(null);
//             }
//         }
//     };

//     const handleKeyDown = (e) => {
//         if (e.key === "Enter" || e.key === "Tab") {
//             setEnabled(true);
//         }
//     };

//     const handleSetDefaults = () => {
//         const defaultCategory = systemMasterOptions[0] || null;
//         const defaultUsers = tblOptions.slice(0, 1);
//         setFormData(prev => ({
//             ...prev,
//             category: defaultCategory?.value || null,
//             userIds: defaultUsers.map(u => u.value),
//         }));
//         setSelectedOptions(prev => ({
//             ...prev,
//             category: defaultCategory,
//         }));
//         setSelectedUsers(defaultUsers);
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;

//         setFormData(prev => {
//             let updated = {
//                 ...prev,
//                 [name]: ["tasktype", "weekday", "day", "month"].includes(name) ? Number(value) : value,
//             };
//             if (name === "tasktype") {
//                 const newTaskType = Number(value);
//                 if (newTaskType === 2) {
//                     updated.deadlinedate = prev.deadlinedate || getCurrentDate();
//                     updated.startdate = prev.startdate || getCurrentDate();
//                     updated.enddate = prev.enddate || getCurrentDate();
//                     updated.reminddate = prev.reminddate || getCurrentDate();
//                 } else {
//                     updated.deadlinedate = getCurrentDate();
//                     updated.startdate = getCurrentDate();
//                     updated.enddate = getCurrentDate();
//                     updated.reminddate = getCurrentDate();
//                 }

//                 updated.day = newTaskType === 4 || newTaskType === 5 ? (prev.day || 1) : 0;
//                 updated.weekday = newTaskType === 3 ? prev.weekday : 1;
//                 updated.month = newTaskType === 5 ? prev.month : 1;
//             }

//             return updated;
//         });
//     };

//     const resetForm = () => {
//         setFormData({
//             taskno: '',
//             doc_date: getCurrentDate(),
//             purpose: '',
//             taskdesc: '',
//             tasktype: 1,
//             category: '',
//             deadlinedate: getCurrentDate(),
//             startdate: getCurrentDate(),
//             enddate: getCurrentDate(),
//             remindtask: 1,
//             reminddate: getCurrentDate(),
//             day: '',
//             weekday: '',
//             month: '',
//             time: '',
//             priority: 1,
//             details: []
//         });
//         setSelectedUsers([]);
//         setSelectedOptions({
//             tbl: null,
//             category: null,
//         });
//         setEditId(null);
//     };

//     const TaskCard = ({ task }) => {
//         const priority = priorityConfig[task.priority];
//         const PriorityIcon = priority?.icon || ExclamationTriangleIcon;

//         const isOverdue = new Date(task.deadlinedate) < new Date();

//         return (
//             <div className="relative border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white overflow-hidden">
//                 <div className={`absolute top-0 left-0 bottom-0 w-1 ${priority?.color}`}></div>

//                 <div className="pl-2">
//                     <div className="flex justify-between items-center mb-3">
//                         <div className="flex items-center space-x-2">
//                             <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${priority?.color}`}>
//                                 {priority?.label.toUpperCase()} PRIORITY
//                             </span>
//                             {isOverdue && (
//                                 <span className="ml-2 text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-800 flex items-center">
//                                     <AlertTriangle className="h-3 w-3 mr-1" />
//                                     Overdue
//                                 </span>
//                             )}
//                         </div>
//                         <div className="flex space-x-2 text-gray-600">
//                             <button
//                                 onClick={() => handleEdit(task)}
//                                 className="p-1 hover:text-blue-800 transition-colors"
//                                 title="Edit"
//                             >
//                                 <PencilSquareIcon className="h-4 w-4" />
//                             </button>
//                             <button
//                                 onClick={() => openDeleteConfirm(task.taskno)}
//                                 className="p-1 hover:text-red-800 transition-colors"
//                                 title="Delete"
//                             >
//                                 <TrashIcon className="h-4 w-4" />
//                             </button>
//                         </div>
//                     </div>

//                     <h3 className="font-medium text-gray-900 mb-1">{task.purpose}</h3>
//                     <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.taskdesc}</p>

//                     <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 mt-2">
//                         <div className="flex items-center space-x-1">
//                             <UserGroupIcon className="h-3 w-3 text-gray-500" />
//                             <span>Creator: {task.Created_By}</span>
//                         </div>
//                         <div className="flex items-center space-x-1">
//                             <CalendarIcon className="h-3 w-3 text-gray-500" />
//                             <span>Remind Date: {task.reminddate}</span>
//                         </div>
//                         <div className="flex items-center space-x-1">
//                             <ClockIcon className="h-3 w-3 text-gray-500" />
//                             <span>Deadline: {task.deadlinedate}</span>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     const UserSection = ({ userId, userData }) => {
//         const user = tbluser.find(u => u.User_Id === userId) || userData.user;

//         return (
//             <div className="mb-8">
//                 <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg">
//                     <UserGroupIcon className="h-5 w-5 text-gray-600" />
//                     <h2 className="text-xl font-bold text-gray-800">
//                         {user?.User_Name || `User ${userId}`}
//                     </h2>
//                     <span className="text-sm text-gray-500">({userData.tasks.length} tasks)</span>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {userData.tasks.map(task => (
//                         <TaskCard key={task.taskno} task={task} />
//                     ))}
//                 </div>

//                 {userData.tasks.length === 0 && (
//                     <div className="text-center py-8 text-gray-500">
//                         No tasks assigned to this user
//                     </div>
//                 )}
//             </div>
//         );
//     };

//     const isLoading = isTableLoading || isTblUserLoading || issystemMasterLoading || isMaxIdLoading;
//     const isErrorOccurred = isError;

//     if (isLoading) {
//         return (
//             <div className="text-center space-y-4 py-12">
//                 <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto" />
//                 <p className="text-gray-700 text-lg font-medium">
//                     Loading
//                     <span className="inline-block animate-pulse ml-1 text-blue-600">...</span>
//                 </p>
//             </div>
//         );
//     }

//     if (isErrorOccurred) {
//         return (
//             <div className="text-center py-12">
//                 <div className="text-red-600 text-lg font-medium">An error occurred while loading data.</div>
//                 <button
//                     onClick={refetch}
//                     className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//                 >
//                     Retry
//                 </button>
//             </div>
//         );
//     }

//     return (
//         <div className="p-6">
//             <div className="mb-6">
//                 <div className="flex justify-between items-center mb-4">
//                     <h1 className="text-2xl font-bold text-gray-800">Task Overview</h1>
//                     <CreateNewButton onClick={handleAddNew} />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Priority</label>
//                         <Select
//                             options={[
//                                 { value: '1', label: 'High Priority' },
//                                 { value: '2', label: 'Medium Priority' },
//                                 { value: '3', label: 'Low Priority' }
//                             ]}
//                             value={selectedPriorityFilter}
//                             onChange={setSelectedPriorityFilter}
//                             placeholder="All Priorities"
//                             isClearable
//                         />
//                     </div>
//                     <div className="flex items-end">
//                         <button
//                             onClick={() => {
//                                 setSelectedUserFilter(null);
//                                 setSelectedPriorityFilter(null);
//                             }}
//                             className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
//                         >
//                             Clear Filters
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             <div>
//                 {Object.keys(tasksByUser).length === 0 ? (
//                     <div className="text-center py-12">
//                         <div className="text-gray-500 text-lg">No tasks found</div>
//                     </div>
//                 ) : (
//                     Object.entries(tasksByUser).map(([userId, userData]) => (
//                         <UserSection key={userId} userId={userId} userData={userData} />
//                     ))
//                 )}
//             </div>

//             <Modal
//                 isOpen={isModalOpen}
//                 onClose={() => {
//                     setIsModalOpen(false);
//                     resetForm();
//                 }}
//                 title={editId ? 'Update Task' : 'Create New Task'}
//                 size="2xl"
//                 width="1200px"
//             >
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     <div className="space-y-2">
//                         <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
//                             <div className="sm:col-span-1">
//                                 <label htmlFor="taskno" className="block text-sm font-medium text-gray-700">
//                                     Task No
//                                 </label>
//                                 <input
//                                     id="taskno"
//                                     type="number"
//                                     name="taskno"
//                                     value={formData.taskno}
//                                     className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
//                                     readOnly
//                                     aria-label="Task No (auto-generated)"
//                                 />
//                                 <p className="mt-1 text-xs text-gray-500">
//                                     {isMaxIdLoading ? 'Loading Max ID...' : 'Auto-generated'}
//                                 </p>
//                             </div>

//                             <div className="sm:col-span-1">
//                                 <label className="block text-sm font-medium text-gray-700">Date</label>
//                                 <input
//                                     type="date"
//                                     name="doc_date"
//                                     value={formData.doc_date}
//                                     onChange={handleInputChange}
//                                     className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
//                                 />
//                             </div>

//                             <div className="sm:col-span-4">
//                                 <label className="block text-sm font-medium text-gray-700">Purpose</label>
//                                 <input
//                                     type="text"
//                                     name="purpose"
//                                     value={formData.purpose}
//                                     onChange={handleInputChange}
//                                     onKeyDown={handleKeyDown}
//                                     autoComplete="off"
//                                     className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700">Task Description</label>
//                             <textarea
//                                 name="taskdesc"
//                                 value={formData.taskdesc}
//                                 onChange={handleInputChange}
//                                 autoComplete='off'
//                                 className="w-full h-25 px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 resize-none"
//                             />
//                         </div>
//                     </div>

//                     <div className="space-y-1">
//                         <h2 className="text-xl font-bold text-gray-800">Scheduling</h2>
//                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
//                             <div className="w-full">
//                                 <label className="block text-sm font-medium text-gray-700">Task Type</label>
//                                 <select
//                                     name="tasktype"
//                                     value={formData.tasktype}
//                                     onChange={handleInputChange}
//                                     className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
//                                     required
//                                 >
//                                     <option value={1}>Daily</option>
//                                     <option value={2}>One Time</option>
//                                     <option value={3}>Weekly</option>
//                                     <option value={4}>Monthly</option>
//                                     <option value={5}>Yearly</option>
//                                 </select>
//                             </div>

//                             <div className="w-full">
//                                 <label className="block text-sm font-medium text-gray-700">Deadline Date</label>
//                                 <input
//                                     type="date"
//                                     name="deadlinedate"
//                                     value={formData.deadlinedate}
//                                     onChange={handleInputChange}
//                                     disabled={formData.tasktype !== 2}
//                                     className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
//                                 />
//                             </div>

//                             <div className="w-full">
//                                 <label className="block text-sm font-medium text-gray-700">Expected Start Date</label>
//                                 <input
//                                     type="date"
//                                     name="startdate"
//                                     value={formData.startdate}
//                                     onChange={handleInputChange}
//                                     disabled={formData.tasktype !== 2}
//                                     className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
//                                 />
//                             </div>

//                             <div className="w-full">
//                                 <label className="block text-sm font-medium text-gray-700">End Date</label>
//                                 <input
//                                     type="date"
//                                     name="enddate"
//                                     value={formData.enddate}
//                                     onChange={handleInputChange}
//                                     disabled={formData.tasktype !== 2}
//                                     className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Day</label>
//                                 <input
//                                     type="number"
//                                     name="day"
//                                     value={formData.day}
//                                     onChange={handleInputChange}
//                                     min={1}
//                                     max={31}
//                                     disabled={formData.tasktype !== 4 && formData.tasktype !== 5}
//                                     className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Week Day</label>
//                                 <select
//                                     name="weekday"
//                                     value={formData.weekday}
//                                     onChange={handleInputChange}
//                                     className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
//                                     required
//                                     disabled={formData.tasktype !== 3}
//                                 >
//                                     <option value={1}>Sunday</option>
//                                     <option value={2}>Monday</option>
//                                     <option value={3}>Tuesday</option>
//                                     <option value={4}>Wednesday</option>
//                                     <option value={5}>Thursday</option>
//                                     <option value={6}>Friday</option>
//                                     <option value={7}>Saturday</option>
//                                 </select>
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Month</label>
//                                 <select
//                                     name="month"
//                                     value={formData.month}
//                                     onChange={handleInputChange}
//                                     className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
//                                     required
//                                     disabled={formData.tasktype !== 5}
//                                 >
//                                     <option value={1}>January</option>
//                                     <option value={2}>February</option>
//                                     <option value={3}>March</option>
//                                     <option value={4}>April</option>
//                                     <option value={5}>May</option>
//                                     <option value={6}>June</option>
//                                     <option value={7}>July</option>
//                                     <option value={8}>August</option>
//                                     <option value={9}>September</option>
//                                     <option value={10}>October</option>
//                                     <option value={11}>November</option>
//                                     <option value={12}>December</option>
//                                 </select>
//                             </div>

//                         </div>
//                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

//                         </div>
//                     </div>

//                     <div className="space-y-2">
//                         <h2 className="text-xl font-bold text-gray-800">Assignment & Priority</h2>
//                         <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
//                             <div className="flex-1 min-w-[200px]">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
//                                 <Select
//                                     id="category"
//                                     options={systemMasterOptions}
//                                     value={selectedOptions.category}
//                                     onChange={(option) => {
//                                         setSelectedOptions(prev => ({ ...prev, category: option }));
//                                         setFormData(prev => ({ ...prev, category: option?.value || null }));
//                                     }}
//                                     placeholder="Select System Code..."
//                                     isSearchable
//                                     styles={{
//                                         container: (provided) => ({ ...provided, width: '100%' }),
//                                         placeholder: (provided) => ({
//                                             ...provided,
//                                             whiteSpace: 'nowrap',
//                                             overflow: 'hidden',
//                                             textOverflow: 'ellipsis',
//                                         }),
//                                     }}
//                                 />
//                             </div>
//                             <div>
//                                 <label htmlFor="userId" className="block text-sm font-medium text-gray-700">Select User</label>
//                                 <Select
//                                     id="userId"
//                                     options={tblOptions}
//                                     value={selectedUsers}
//                                     onChange={(options) => {
//                                         setSelectedUsers(options || []);
//                                         setFormData(prev => ({ ...prev, userIds: (options || []).map(opt => opt.value) }));
//                                     }}
//                                     placeholder="Select Users..."
//                                     isSearchable
//                                     isMulti
//                                     required
//                                 />
//                             </div>

//                             {/* <div>
//                                 <label htmlFor="Authorised_User" className="block text-sm font-medium text-gray-700">Authorised User</label>
//                                 <Select
//                                     id="Authorised_User"
//                                     options={tblOptions}
//                                     value={selectedAuthorisedUsers}
//                                     onChange={(option) => {
//                                         setSelectedAuthorisedUsers(option || null);
//                                         setFormData(prev => ({ ...prev, Authorised_User: option ? option.value : null, }));
//                                     }}
//                                     placeholder="Select Authorised User..."
//                                     isSearchable
//                                 />
//                             </div> */}
//                             <div>
//                                 <label htmlFor="Authorised_User" className="block text-sm font-medium text-gray-700">Authorised User</label>
//                                 <Select
//                                     id="Authorised_User"
//                                     options={tblOptions}
//                                     value={selectedAuthorisedUsers}
//                                     onChange={(option) => {
//                                         setSelectedAuthorisedUsers(option || null);
//                                         setFormData(prev => ({ ...prev, Authorised_User: option ? option.value : null, }));
//                                     }}
//                                     placeholder="Authorised User..."
//                                     isSearchable
//                                     isClearable
//                                     isMulti
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Task Priority</label>
//                                 <select
//                                     name="priority"
//                                     value={formData.priority}
//                                     onChange={handleInputChange}
//                                     className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
//                                     required
//                                     disabled={!!editId}
//                                 >
//                                     <option value={1}>High</option>
//                                     <option value={2}>Medium</option>
//                                     <option value={3}>Low</option>
//                                 </select>
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Time Required</label>
//                                 <input
//                                     type="text"
//                                     name="time"
//                                     value={formData.time}
//                                     onChange={handleInputChange}
//                                     className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
//                                 />
//                             </div>
//                         </div>

//                     </div>
//                     <div className="space-y-2">
//                         <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
//                         <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Remind Task</label>
//                                 <select
//                                     name="remindtask"
//                                     value={formData.remindtask}
//                                     onChange={handleInputChange}
//                                     className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
//                                     required
//                                 >
//                                     <option value={1}>Yes</option>
//                                     <option value={0}>No</option>
//                                 </select>
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Remind Date</label>
//                                 <input
//                                     type="date"
//                                     name="reminddate"
//                                     value={formData.reminddate}
//                                     onChange={handleInputChange}
//                                     disabled={formData.tasktype !== 2}
//                                     className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed"
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     <div className="flex justify-end space-x-3 pt-4">
//                         <button
//                             type="button"
//                             onClick={() => { setIsModalOpen(false); resetForm(); }}
//                             className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
//                         >
//                             {editId ? 'Update' : 'Save'}
//                         </button>
//                         <button
//                             type="button"
//                             onClick={handleSetDefaults}
//                             disabled={!enabled}
//                             className={`px-4 py-2 ml-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200
//                     ${enabled ? "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" : "bg-gray-400 cursor-not-allowed"}`}
//                         >
//                             Default Way To Save
//                         </button>
//                     </div>
//                 </form>
//             </Modal>

//             <Modal
//                 isOpen={showDeleteConfirmModal}
//                 onClose={() => setShowDeleteConfirmModal(false)}
//                 title="Confirm Deletion"
//             >
//                 <div className="p-4 text-center">
//                     <p className="text-lg text-gray-700 mb-6">Are you sure you want to delete this task?</p>
//                     <div className="flex justify-center space-x-4">
//                         <button
//                             type="button"
//                             onClick={() => setShowDeleteConfirmModal(false)}
//                             className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="button"
//                             onClick={confirmDelete}
//                             className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
//                         >
//                             Delete
//                         </button>
//                     </div>
//                 </div>
//             </Modal>
//         </div>
//     );
// }

// export default TaskDescriptionCardView;


















































import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import { PencilSquareIcon, TrashIcon, CalendarIcon, ClockIcon, UserGroupIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import Modal from '../common/Modal/Modal';
import {
    AlertTriangle, PlusIcon
} from 'lucide-react';
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

function TaskDescriptionCardView() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [originalDetails, setOriginalDetails] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedAuthorisedUsers, setSelectedAuthorisedUsers] = useState([]);
    const [createdBy, setCreatedBy] = useState('');
    const [selectedUserFilter, setSelectedUserFilter] = useState(null);
    const [selectedPriorityFilter, setSelectedPriorityFilter] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);


    const priorityConfig = {
        1: {
            label: 'High',
            color: 'bg-red-400 border-red-400',
            textColor: 'text-red-50',
            icon: ExclamationTriangleIcon
        },
        2: {
            label: 'Medium',
            color: 'bg-yellow-800 border-yellow-900',
            textColor: 'text-yellow-50',
            icon: ClockIcon
        },
        3: {
            label: 'Low',
            color: 'bg-blue-500 border-blue-800',
            textColor: 'text-blue-50',
            icon: CalendarIcon
        }
    };

    const taskTypeConfig = {
        1: 'Daily',
        2: 'One Time',
        3: 'Weekly',
        4: 'Monthly',
        5: 'Yearly'
    };



    const user_id = sessionStorage.getItem("user_id");

    const [formData, setFormData] = useState({
        taskno: '',
        doc_date: getCurrentDate(),
        purpose: '',
        taskdesc: '',
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

    const { data: tableData = [], isLoading: isTableLoading, isError, refetch } = useGetTaskDescriptionQuery({ user_id: sessionStorage.getItem("user_id") });
    const { data: maxTaskDescriptionId = 0, isLoading: isMaxIdLoading, refetch: refetchMaxId } = useGetMaxTaskDescriptionIdQuery();
    const { data: tbluser = [], isLoading: isTblUserLoading } = useGetUserMastersQuery();
    const { data: systemMaster = [], isLoading: issystemMasterLoading } = useGetSystemMasterQuery();

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

    // Search function that searches across all task properties and user names
    const searchTasks = (tasks, query) => {
        if (!query.trim()) return tasks;

        const lowerQuery = query.toLowerCase();

        return tasks.filter(task => {
            // Search in main task properties
            const mainTaskMatch =
                task.taskno?.toString().toLowerCase().includes(lowerQuery) ||
                task.purpose?.toLowerCase().includes(lowerQuery) ||
                task.taskdesc?.toLowerCase().includes(lowerQuery) ||
                task.doc_date?.toLowerCase().includes(lowerQuery) ||
                task.deadlinedate?.toLowerCase().includes(lowerQuery) ||
                task.startdate?.toLowerCase().includes(lowerQuery) ||
                task.enddate?.toLowerCase().includes(lowerQuery) ||
                task.time?.toString().toLowerCase().includes(lowerQuery) ||
                task.Created_By?.toLowerCase().includes(lowerQuery) ||
                priorityConfig[task.priority]?.label.toLowerCase().includes(lowerQuery) ||
                taskTypeConfig[task.tasktype]?.toLowerCase().includes(lowerQuery);

            // Search in user details
            const userMatch = task.details?.some(detail =>
                detail.User_Name?.toLowerCase().includes(lowerQuery) ||
                detail.User_Id?.toString().toLowerCase().includes(lowerQuery)
            );

            return mainTaskMatch || userMatch;
        });
    };

    // Filter tasks based on selected user, priority, and search query
    const filteredTasks = useMemo(() => {
        let filtered = tableData;

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = searchTasks(filtered, searchQuery);
        }

        // Filter by selected user
        if (selectedUserFilter) {
            filtered = filtered.filter(task =>
                task.details?.some(detail => detail.User_Id === selectedUserFilter.value)
            );
        }

        // Filter by priority
        if (selectedPriorityFilter) {
            filtered = filtered.filter(task => task.priority === parseInt(selectedPriorityFilter.value));
        }

        return filtered;
    }, [tableData, searchQuery, selectedUserFilter, selectedPriorityFilter]);

    // Group tasks by user
    const tasksByUser = useMemo(() => {
        const grouped = {};

        filteredTasks.forEach(task => {
            if (task.details && Array.isArray(task.details)) {
                task.details.forEach(detail => {
                    const userId = detail.User_Id;
                    if (!grouped[userId]) {
                        grouped[userId] = {
                            user: detail,
                            tasks: []
                        };
                    }
                    grouped[userId].tasks.push(task);
                });
            }
        });

        // Sort tasks by priority within each user group
        Object.keys(grouped).forEach(userId => {
            grouped[userId].tasks.sort((a, b) => a.priority - b.priority);
        });

        return grouped;
    }, [filteredTasks]);



    const handleAddNew = async () => {
        setEditId(null);
        resetForm();
        await refetchMaxId();
        setIsModalOpen(true);
    };

    const handleEdit = (task) => {
        const existingDetails = task.details?.map(d => ({
            id: d.id,
            taskno: d.taskno,
            action: "update",
            userId: d.User_Id
        })) || [];

        const isWeekly = task.tasktype === 3;
        const isYearly = task.tasktype === 5;

        setFormData({
            taskno: task.taskno.toString(),
            doc_date: task.doc_date || '',
            purpose: task.purpose,
            taskdesc: task.taskdesc,
            tasktype: task.tasktype,
            category: task.category,
            deadlinedate: task.deadlinedate || '',
            startdate: task.startdate || '',
            enddate: task.enddate || '',
            remindtask: task.remindtask,
            reminddate: task.reminddate || '',
            day: task.day,
            weekday: isWeekly ? task.weekday : 1,
            month: isYearly ? task.month : 1,
            time: task.time,
            priority: task.priority,
            Created_By: task.Created_By,
            Authorised_User: task.Authorised_User || null,
            details: existingDetails
        });

        setOriginalDetails(task.details?.map(d => d.User_Id) || []);

        const selectedUsersFromTask = Array.isArray(task.details)
            ? task.details.map(d => {
                const user = tbluser.find(u => u.User_Id === d.User_Id);
                return user ? {
                    ...user,
                    value: d.User_Id,
                    label: `${d.User_Id} - ${d.User_Name}`,
                    id: d.id,
                    userId: d.User_Id,
                    action: "update"
                } : null;
            }).filter(Boolean)
            : [];

        setSelectedUsers(selectedUsersFromTask);

        const selectedCategoryOption = systemMasterOptions.find(option => option.value === task.category) || null;

        setSelectedOptions({
            tbl: selectedUsersFromTask,
            category: selectedCategoryOption
        });

        setEditId(task.taskno);
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
            if (editId) {
                await updateTaskDescription({ id: editId, ...payload }).unwrap();
            } else {
                await addTaskDescription(payload).unwrap();
            }
            resetForm();
            setIsModalOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to save task:', error);
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
                console.error('Failed to delete task:', error);
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
            remindtask: 1,
            reminddate: getCurrentDate(),
            day: '',
            weekday: '',
            month: '',
            time: '',
            priority: 1,
            details: []
        });
        setSelectedUsers([]);
        setSelectedOptions({
            tbl: null,
            category: null,
        });
        setEditId(null);
    };

    const clearAllFilters = () => {
        setSearchQuery('');
        setSelectedUserFilter(null);
        setSelectedPriorityFilter(null);
    };

    const TaskCard = ({ task }) => {
        const priority = priorityConfig[task.priority];
        const PriorityIcon = priority?.icon || ExclamationTriangleIcon;

        const isOverdue = new Date(task.deadlinedate) < new Date();

        return (
            <div className="relative border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white overflow-hidden">
                <div className={`absolute top-0 left-0 bottom-0 w-1 ${priority?.color}`}></div>

                <div className="pl-2">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center space-x-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${priority?.color}`}>
                                {priority?.label.toUpperCase()} PRIORITY
                            </span>
                            {isOverdue && (
                                <span className="ml-2 text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-800 flex items-center">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Overdue
                                </span>
                            )}
                        </div>
                        <div className="flex space-x-2 text-gray-600">
                            <button
                                onClick={() => handleEdit(task)}
                                className="p-1 hover:text-blue-800 transition-colors"
                                title="Edit"
                            >
                                <PencilSquareIcon className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => openDeleteConfirm(task.taskno)}
                                className="p-1 hover:text-red-800 transition-colors"
                                title="Delete"
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <h3 className="font-medium text-gray-900 mb-1">{task.purpose}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.taskdesc}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 mt-2">
                        <div className="flex items-center space-x-1">
                            <UserGroupIcon className="h-3 w-3 text-gray-500" />
                            <span>Creator: {task.Created_By}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-3 w-3 text-gray-500" />
                            <span>Remind Date: {task.reminddate}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <ClockIcon className="h-3 w-3 text-gray-500" />
                            <span>Deadline: {task.deadlinedate}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const UserSection = ({ userId, userData }) => {
        const user = tbluser.find(u => u.User_Id === userId) || userData.user;

        return (
            <div className="mb-8">
                <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg">
                    <UserGroupIcon className="h-5 w-5 text-gray-600" />
                    <h2 className="text-xl font-bold text-gray-800">
                        {user?.User_Name || `User ${userId}`}
                    </h2>
                    <span className="text-sm text-gray-500">({userData.tasks.length} tasks)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {userData.tasks.map(task => (
                        <TaskCard key={task.taskno} task={task} />
                    ))}
                </div>

                {userData.tasks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No tasks assigned to this user
                    </div>
                )}
            </div>
        );
    };

    const isLoading = isTableLoading || isTblUserLoading || issystemMasterLoading || isMaxIdLoading;
    const isErrorOccurred = isError;

    if (isLoading) {
        return (
            <div className="text-center space-y-4 py-12">
                <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto" />
                <p className="text-gray-700 text-lg font-medium">
                    Loading
                    <span className="inline-block animate-pulse ml-1 text-blue-600">...</span>
                </p>
            </div>
        );
    }

    if (isErrorOccurred) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 text-lg font-medium">An error occurred while loading data.</div>
                <button
                    onClick={refetch}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-2">
            <div className="mb-1">
                <div className="flex justify-between items-center mb-1">
                    <h1 className="text-2xl font-bold text-gray-800">Task Overview</h1>
                    <div className="w-full md:w-1/3">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search tasks by task number, purpose, description, date, user name, priority..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <span className="text-gray-400 hover:text-gray-600">×</span>
                                </button>
                            )}
                        </div>
                    </div>
                    {/* <CreateNewButton onClick={handleAddNew} /> */}
                    <button
                        onClick={handleAddNew}
                        className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-all duration-200 shadow-sm hover:shadow-md active:shadow-sm border border-blue-700 active:scale-95"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>Create New Task</span>
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-4">


                    {/* Filters Section */}
                    {/* <div className="w-full md:w-1/2 bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                            >
                                <FunnelIcon className="h-5 w-5" />
                                <span className="font-medium">Filters</span>
                                <span className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                            </button>
                            {(searchQuery || selectedUserFilter || selectedPriorityFilter) && (
                                <button
                                    onClick={clearAllFilters}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>

                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by User</label>
                                    <Select
                                        options={tblOptions}
                                        value={selectedUserFilter}
                                        onChange={setSelectedUserFilter}
                                        placeholder="All Users"
                                        isClearable
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Priority</label>
                                    <Select
                                        options={[
                                            { value: '1', label: 'High Priority' },
                                            { value: '2', label: 'Medium Priority' },
                                            { value: '3', label: 'Low Priority' }
                                        ]}
                                        value={selectedPriorityFilter}
                                        onChange={setSelectedPriorityFilter}
                                        placeholder="All Priorities"
                                        isClearable
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={clearAllFilters}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors w-full"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div> */}
                </div>

            </div>

            {/* Task Cards by User */}
            <div>
                {Object.keys(tasksByUser).length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500 text-lg">
                            {searchQuery || selectedUserFilter || selectedPriorityFilter
                                ? "No tasks match your search criteria"
                                : "No tasks found"
                            }
                        </div>
                    </div>
                ) : (
                    Object.entries(tasksByUser).map(([userId, userData]) => (
                        <UserSection key={userId} userId={userId} userData={userData} />
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                title={editId ? 'Update Task' : 'Create New Task'}
                size="2xl"
                width="1200px"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
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
                                className="w-full h-25 px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 resize-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
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

                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-gray-800">Assignment & Priority</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
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
                                    placeholder="Authorised User..."
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

                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
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
                    <p className="text-lg text-gray-700 mb-6">Are you sure you want to delete this task?</p>
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
        </div>
    );
}

export default TaskDescriptionCardView;
