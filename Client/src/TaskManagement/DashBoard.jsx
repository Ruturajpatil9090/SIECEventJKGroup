import { useState, useEffect, useRef, useCallback } from 'react';
import { PencilSquareIcon, CheckCircleIcon, XCircleIcon, ClockIcon, CalendarDaysIcon, UserIcon } from '@heroicons/react/24/outline';
import {
    Trash2, MoreVertical, AlertTriangle, CheckCircle2, XCircle, ListChecks,
    Flame,
    AlertCircle,
    Gauge,
    Zap
} from 'lucide-react';
import Modal from '../common/Modal/Modal';
import { useUpdateTaskMasterMutation, useGetTaskMasterQuery } from '../services/taskreportApi';
import { useAddTaskGenerateReminderMutation } from '../services/taskdescriptionApi';
import { decryptData } from "../common/Functions/DecryptData";


const priorityIcons = {
    '1': <Flame className="text-white w-6 h-6" />,          
    '2': <AlertCircle className="text-white w-6 h-6" />,    
    '3': <Gauge className="text-white w-6 h-6" />,          
    '4': <Zap className="text-white w-6 h-6" />  
};


const priorityMap = {
    '1': {
        text: 'HIGH PRIORITY',
        bg: 'bg-red-500',
        textLight: 'text-red-500',
        border: 'border-l-red-500',
        dot: 'bg-red-500',
    },
    '2': {
        text: 'MEDIUM PRIORITY',
        bg: 'bg-yellow-500',
        textLight: 'text-yellow-500',
        border: 'border-l-yellow-500',
        dot: 'bg-yellow-500',
    },
    '3': {
        text: 'LOW PRIORITY',
        bg: 'bg-blue-500',
        textLight: 'text-blue-500',
        border: 'border-l-blue-500',
        dot: 'bg-blue-500',
    }
};


const useClickOutside = (callback) => {
    const ref = useRef(null);

    const handleClick = useCallback((e) => {
        if (ref.current && !ref.current.contains(e.target)) {
            callback();
        }
    }, [callback]);

    useEffect(() => {
        document.addEventListener("mousedown", handleClick);
        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, [handleClick]);

    return ref;
};


const TaskDropdown = ({ task, onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleClose = useCallback(() => setIsOpen(false), []);
    const dropdownRef = useClickOutside(handleClose);

    const handleEdit = () => {
        onEdit(task);
        setIsOpen(false);
    };

    const handleDelete = () => {
        onDelete(task.Id);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:bg-gray-200 transition-colors"
                aria-label="Task options"
            >
                <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 origin-top-right animate-fadeIn">
                    <button
                        onClick={handleEdit}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                    >
                        <PencilSquareIcon className="h-4 w-4 mr-2" />
                        Edit
                    </button>
                    <button
                        // onClick={handleDelete}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors duration-150"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

function TaskReport() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [taskIdToDelete, setTaskIdToDelete] = useState(null);
    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [formData, setFormData] = useState({
        Id: '',
        taskno: '',
        purpose: '',
        completed: '',
        comp_hrs: '',
        comp_days: '',
        remark: '',
        comp_date: getCurrentDate(),
        reminddate: getCurrentDate(),
        deadline: getCurrentDate(),
        prioritys: '',
    });
    const [editId, setEditId] = useState(null);
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    const {
        data: tableData = [],
        isLoading: isTableLoading,
        isError,
        refetch
    } = useGetTaskMasterQuery();
    const [updateTaskMaster] = useUpdateTaskMasterMutation();
    const [addTaskGenerateReminder, { isLoading: isReminderGenerating }] = useAddTaskGenerateReminderMutation();

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ ...notification, show: false });
        }, 3000);
    };

    const handleGenerateRemindersClick = async () => {
        try {
            await addTaskGenerateReminder().unwrap();
            showNotification('Reminders generated successfully!');
            refetch();
        } catch (error) {
            console.error('Failed to generate reminders:', error);
            showNotification('Failed to generate reminders!', 'error');
        }
    };

    const encryptedUserData = sessionStorage.getItem('user_data');
    const decryptedUserData = decryptData(encryptedUserData);
    const loggedInUserId = decryptedUserData?.user_id;

    const filteredTasks = tableData.filter(task => String(task.userId) === String(loggedInUserId));

    const taskCounts = filteredTasks.reduce((counts, task) => {
        const priorityKey = task.prioritys || '4'; 
        counts[priorityKey] = (counts[priorityKey] || 0) + 1;
        return counts;
    }, {});

    const totalTasks = filteredTasks.length;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        try {
            const payload = {
                Id: Number(formData.Id),
                completed: formData.completed,
                comp_hrs: Number(formData.comp_hrs),
                comp_days: Number(formData.comp_days),
                remark: formData.remark,
                comp_date: formData.comp_date || null,
            };
            if (editId) {
                await updateTaskMaster({
                    Id: Number(editId),
                    ...payload,
                }).unwrap();
                showNotification('Task updated successfully!');
            }
            resetForm();
            setIsModalOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to save task:', error);
            showNotification('Failed to save task!', 'error');
        }
    };

    const handleEdit = (row) => {
        setFormData({
            Id: row.Id.toString(),
            completed: row.completed,
            comp_hrs: row.comp_hrs,
            comp_days: row.comp_days,
            remark: row.remark,
            comp_date: row.comp_date || '',
        });
        setEditId(row.Id);
        setIsModalOpen(true);
    };

    const openDeleteConfirmModal = (id) => {
        setTaskIdToDelete(id);
        setIsConfirmDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (taskIdToDelete) {
            try {
                await deleteTaskMaster(Number(taskIdToDelete)).unwrap();
                showNotification('Task deleted successfully!');
                refetch();
            } catch (error) {
                console.error('Failed to delete task:', error);
                showNotification('Failed to delete task!', 'error');
            } finally {
                setIsConfirmDeleteModalOpen(false);
                setTaskIdToDelete(null);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            completed: '',
            comp_hrs: '',
            comp_days: '',
            remark: '',
            comp_date: getCurrentDate(),
        });
        setEditId(null);
    };

    if (isTableLoading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto" />
                <p className="text-gray-700 text-lg font-medium">Loading<span className="inline-block animate-pulse ml-1 text-blue-600">...</span></p>
            </div>
        </div>
    );

    if (isError) return (
        <div className="text-center py-8 text-red-600">
            Error loading tasks. Please try again.
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen font-inter p-6">
            {notification.show && (
                <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-md shadow-lg transform transition-all duration-300 ${notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {notification.type === 'success' ?
                        <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" /> :
                        <XCircleIcon className="h-6 w-6 text-red-500 mr-2" />
                    }
                    <span>{notification.message}</span>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Task Master</h1>
                <button
                    onClick={handleGenerateRemindersClick}
                    disabled={isReminderGenerating}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                    {isReminderGenerating ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Generating...
                        </>
                    ) : 'Generate Reminders'}
                </button>
            </div>



            <div className="mb-8 flex flex-wrap gap-6 justify-center md:justify-start">
                <div className="flex items-center p-4 bg-white rounded-lg shadow-md min-w-[180px] cursor-pointer transition transform hover:scale-105 hover:shadow-lg">
                    <div className="mr-3 text-blue-600">
                        <ListChecks className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-xl font-bold text-gray-800">{totalTasks}</div>
                        <div className="text-sm text-gray-500">Total Tasks</div>
                    </div>
                </div>

                {Object.keys(priorityMap).map((key) => (
                    <div
                        key={key}
                        className={`flex items-center p-4 rounded-lg shadow-md min-w-[180px] cursor-pointer transition transform hover:scale-105 hover:shadow-lg ${priorityMap[key].bg}`}
                    >
                        <div className="mr-3">
                            {priorityIcons[key]}
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">{taskCounts[key] || 0}</div>
                            <div className="text-sm text-white">{priorityMap[key].text}</div>
                        </div>
                    </div>
                ))}
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTasks.map(task => {
                    const priorityInfo = priorityMap[task.prioritys] || priorityMap['4']; 
                    const isOverdue = task.deadline && new Date(task.deadline) < new Date();

                    return (
                        <div
                            key={task.Id}
                            className={`bg-white rounded-lg shadow-md flex flex-col overflow-hidden border-l-4 ${priorityInfo.border} transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]`}
                        >
                            <div className="p-4 flex-grow">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center">
                                        <span className={`h-2 w-2 rounded-full mr-2 ${priorityInfo.dot}`}></span>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${priorityInfo.bg}`}>
                                            {priorityInfo.text}
                                        </span>
                                        {isOverdue && (
                                            <span className="ml-2 text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-800 flex items-center">
                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                Overdue
                                            </span>
                                        )}
                                    </div>
                                    <TaskDropdown
                                        task={task}
                                        onEdit={handleEdit}
                                        onDelete={openDeleteConfirmModal}
                                    />
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 truncate flex items-center">
                                    {task.taskno}
                                </h3>

                                <div className="mt-3">
                                    <p className="text-sm font-medium text-gray-800 mb-1">Purpose:</p>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">{task.purpose}</p>
                                </div>

                                <div className="mt-3">
                                    <p className="text-sm font-medium text-gray-800 mb-1">Description:</p>
                                    <div className="max-h-[4rem] overflow-y-auto hover:overflow-y-scroll bg-gray-50 p-2 rounded-md text-sm text-gray-600">
                                        {task.taskdesc || "No description available"}
                                    </div>

                                </div>
                            </div>

                            <div className="border-t border-gray-200 p-4 space-y-3 text-gray-600 text-sm">
                                <div className="flex items-center">
                                    <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                                    <span className="font-medium text-gray-800">Creator:</span>
                                    <span className="ml-1">{task.Created_By}</span>
                                </div>

                                <div className="flex items-center">
                                    <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                                    <span className="font-medium text-gray-800">Remind Date:</span>
                                    <span className="ml-1">{task.reminddate ? new Date(task.reminddate).toLocaleDateString() : '-'}</span>
                                </div>

                                <div className="flex items-center">
                                    <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
                                    <span className="font-medium text-gray-800">Deadline:</span>
                                    <span className={`ml-1 ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
                                        {task.deadline ? new Date(task.deadline).toLocaleDateString() : '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); resetForm(); }}
                title={editId ? 'Edit Task' : 'Add New Task'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                            <input
                                type="text"
                                name="Id"
                                value={formData.Id}
                                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Completed Hours</label>
                            <input
                                type="number"
                                name="comp_hrs"
                                value={formData.comp_hrs}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                required
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Completed Days</label>
                            <input
                                type="number"
                                name="comp_days"
                                value={formData.comp_days}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                required
                                min="0"
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Completed Date</label>
                            <input
                                type="date"
                                name="comp_date"
                                value={formData.comp_date}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                required
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                            <textarea
                                name="remark"
                                value={formData.remark}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                placeholder="Add any remarks about this task..."
                            ></textarea>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end space-y-1 sm:space-y-0 sm:space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => { setIsModalOpen(false); resetForm(); }}
                            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            onClick={() => setFormData(prev => ({ ...prev, completed: 'S' }))}
                            className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 flex items-center"
                        >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Not Completed
                        </button>

                        <button
                            type="submit"
                            onClick={() => setFormData(prev => ({ ...prev, completed: 'Y' }))}
                            className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 flex items-center"
                        >
                            <CheckCircle2 className="h-3.5 w-3.8 mr-1" />
                            Send Feedback
                        </button>
                    </div>

                </form>
            </Modal>

            <Modal
                isOpen={isConfirmDeleteModalOpen}
                onClose={() => setIsConfirmDeleteModalOpen(false)}
                title="Confirm Deletion"
            >
                <div className="p-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                        <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="text-gray-700 text-lg text-center mb-4">Are you sure you want to delete this task?</p>
                    <p className="text-gray-500 text-sm text-center mb-6">This action cannot be undone.</p>
                    <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
                        <button
                            type="button"
                            onClick={() => setIsConfirmDeleteModalOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelete}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default TaskReport;








// import { useState, useEffect } from 'react';
// import TableUtility from "../common/TableUtility/TableUtility";
// import { PencilSquareIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
// import { Trash2 } from 'lucide-react';
// import Modal from '../common/Modal/Modal';
// import { useUpdateTaskMasterMutation, useGetTaskMasterQuery } from '../services/taskreportApi';
// import CreateNewButton from "../common/Buttons/AddButton";
// import Select from 'react-select';
// import { useAddTaskGenerateReminderMutation } from '../services/taskdescriptionApi';
// import { decryptData } from "../common/Functions/DecryptData"


// function TaskReport() {
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
//     const [taskIdToDelete, setTaskIdToDelete] = useState(null);
//     const getCurrentDate = () => {
//         const today = new Date();
//         const year = today.getFullYear();
//         const month = String(today.getMonth() + 1).padStart(2, '0');
//         const day = String(today.getDate()).padStart(2, '0');
//         return `${year}-${month}-${day}`;
//     };
//     const [formData, setFormData] = useState({
//         Id: '',
//         taskno: '',
//         purpose: '',
//         completed: '',
//         comp_hrs: '',
//         comp_days: '',
//         remark: '',
//         comp_date: getCurrentDate(),
//         reminddate: getCurrentDate(),
//         deadline: getCurrentDate(),
//         prioritys: '',
//     });
//     const [editId, setEditId] = useState(null);
//     const [notification, setNotification] = useState({
//         show: false,
//         message: '',
//         type: 'success'
//     });

//     const {
//         data: tableData = [],
//         isLoading: isTableLoading,
//         isError,
//         refetch
//     } = useGetTaskMasterQuery();
//     console.log("tableDataMasters", tableData)
//     const [updateTaskMaster] = useUpdateTaskMasterMutation();
//     const [addTaskGenerateReminder, { isLoading: isReminderGenerating }] = useAddTaskGenerateReminderMutation();

//     const showNotification = (message, type = 'success') => {
//         setNotification({ show: true, message, type });
//         setTimeout(() => {
//             setNotification({ ...notification, show: false });
//         }, 3000);
//     };



//     const handleGenerateRemindersClick = async () => {
//         try {
//             await addTaskGenerateReminder().unwrap();
//             showNotification('Reminders generated successfully!');
//             refetch(); 
//         } catch (error) {
//             console.error('Failed to generate reminders:', error);
//             showNotification('Failed to generate reminders!', 'error');
//         }
//     };



//     const handleAddNew = async () => {
//         setEditId(null);
//         resetForm();
//         await refetchMaxId();
//         setIsModalOpen(true);
//     };

//     const encryptedUserData = sessionStorage.getItem('user_data');
//     const decryptedUserData = decryptData(encryptedUserData);
//     const loggedInUserId = decryptedUserData?.user_id;

//     // Filter table data by user_id (only tasks for the logged in user)
//     const filteredTasks = tableData.filter(task => String(task.userId) === String(loggedInUserId));


//     const columns = [
//         {
//             header: 'ID',
//             accessor: 'Id',
//         },
//         {
//             header: 'Task No',
//             accessor: 'taskno',
//         },
//         {
//             header: 'Task Purpose',
//             accessor: 'purpose',

//         },
//         {
//             header: 'Remind Date',
//             accessor: 'reminddate',
//             cellRenderer: (row) => row.reminddate ? new Date(row.reminddate).toLocaleDateString() : '-'
//         },
//         {
//             header: 'Deadline Date',
//             accessor: 'deadline',
//             cellRenderer: (row) => row.deadline ? new Date(row.deadline).toLocaleDateString() : '-'
//         },
//         {
//             header: 'Task Creator',
//             accessor: 'Created_By',

//         },
//         {
//             header: 'Priority',
//             accessor: 'prioritys',
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
//                         onClick={() => openDeleteConfirmModal(row.Id)}
//                         title="Delete"
//                     >
//                         <Trash2 className="h-5 w-5" />
//                     </button>
//                 </div>
//             )
//         }
//     ];

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };



//     const handleSubmit = async (e) => {
//         if (e && e.preventDefault) e.preventDefault();
//         try {

//             const payload = {
//                 Id: Number(formData.Id),
//                 completed: formData.completed,
//                 comp_hrs: Number(formData.comp_hrs), // force to number
//                 comp_days: Number(formData.comp_days),
//                 remark: formData.remark,
//                 comp_date: formData.comp_date || null,
//             };
//             console.log("PUT Payload", { Id: Number(editId), ...payload });

//             if (editId) {
//                 await updateTaskMaster({
//                     Id: Number(editId),
//                     ...payload,
//                 }).unwrap();
//                 showNotification('Task updated successfully!');
//             } else {
//                 await addEvent({
//                     Id: Number(formData.Id),
//                     ...payload
//                 }).unwrap();
//                 showNotification('Task added successfully!');
//             }

//             resetForm();
//             setIsModalOpen(false);
//             refetch();
//         } catch (error) {
//             console.error('Failed to save task:', error);
//             showNotification('Failed to save task!', 'error');
//         }
//     };



//     const handleEdit = (row) => {
//         setFormData({
//             Id: row.Id.toString(),
//             completed: row.completed,
//             comp_hrs: row.comp_hrs,
//             comp_days: row.comp_days,
//             remark: row.remark,
//             comp_date: row.comp_date || '',
//         });
//         setEditId(row.Id);
//         setIsModalOpen(true);
//     };

//     const openDeleteConfirmModal = (id) => {
//         setTaskIdToDelete(id);
//         setIsConfirmDeleteModalOpen(true);
//     };

//     const confirmDelete = async () => {
//         if (IdToDelete) {
//             try {
//                 await deleteEvent(Number(IdToDelete)).unwrap();
//                 showNotification('Task deleted successfully!');
//                 refetch();
//             } catch (error) {
//                 console.error('Failed to delete task:', error);
//                 showNotification('Failed to delete task!', 'error');
//             } finally {
//                 setIsConfirmDeleteModalOpen(false);
//                 setTaskIdToDelete(null);
//             }
//         }
//     };

//     const resetForm = () => {
//         setFormData({
//             completed: '',
//             comp_hrs: '',
//             comp_days: '',
//             remark: '',
//             comp_date: getCurrentDate(),
//         });
//         setEditId(null);
//     };


//     if (isTableLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//         <div className="text-center space-y-4">
//             <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto" />

//             <p className="text-gray-700 text-lg font-medium">
//                 Loading
//                 <span className="inline-block animate-pulse ml-1 text-blue-600">...</span>
//             </p>
//         </div>
//     </div>;
//     if (isError) return <div className="text-center py-8 text-red-600">Error loading tasks. Please try again.</div>;

//     return (
//         <div className="bg-gray-50 min-h-screen font-inter">
//             {notification.show && (
//                 <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-md shadow-lg ${notification.type === 'success'
//                     ? 'bg-green-50 text-green-800 border border-green-200'
//                     : 'bg-red-50 text-red-800 border border-red-200'
//                     }`}>
//                     {notification.type === 'success' ? (
//                         <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
//                     ) : (
//                         <XCircleIcon className="h-6 w-6 text-red-500 mr-2" />
//                     )}
//                     <span>{notification.message}</span>
//                 </div>
//             )}

//             <TableUtility
//                 headerContent={
//                     <div className="flex space-x-3">
//                         <button
//                             onClick={handleGenerateRemindersClick}
//                             disabled={isReminderGenerating}
//                             className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                         >
//                             {isReminderGenerating ? 'Generating...' : 'Generate Reminders'}
//                         </button>
//                     </div>
//                 }
//                 title="Task Master"
//                 columns={columns}
//                 data={filteredTasks}
//                 pageSize={10}
//             />

//             <Modal
//                 isOpen={isModalOpen}
//                 onClose={() => {
//                     setIsModalOpen(false);
//                     resetForm();
//                 }}
//                 title={editId ? 'Edit Task' : 'Add New Task'}
//             >
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <div className="grid grid-cols-1 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 ID
//                             </label>
//                             <input
//                                 type="text"
//                                 name="Id"
//                                 value={formData.Id}
//                                 className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
//                                 readOnly
//                             />
//                         </div>

//                         {/* <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Completed</label>
//                             <input
//                                 type="text"
//                                 name="completed"
//                                 value={formData.completed}
//                                 onChange={handleInputChange}
//                                 autoComplete='off'
//                                 className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
//                                 required
//                             />
//                         </div> */}

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Completed Hours</label>
//                             <input
//                                 type="number"
//                                 name="comp_hrs"
//                                 value={formData.comp_hrs}
//                                 onChange={handleInputChange}
//                                 className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
//                                 required
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Completed Days</label>
//                             <input
//                                 type="number"
//                                 name="comp_days"
//                                 value={formData.comp_days}
//                                 onChange={handleInputChange}
//                                 className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
//                                 required
//                             />
//                         </div>


//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Completed Date</label>
//                             <input
//                                 type="date"
//                                 name="comp_date"
//                                 value={formData.comp_date}
//                                 onChange={handleInputChange}
//                                 className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
//                                 required
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
//                             <input
//                                 type="text"
//                                 name="remark"
//                                 value={formData.remark}
//                                 onChange={handleInputChange}
//                                 className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
//                             />
//                         </div>
//                     </div>

//                     <div className="flex justify-end space-x-3 pt-4">
//                         <button
//                             type="button"
//                             onClick={() => {
//                                 setIsModalOpen(false);
//                                 resetForm();
//                             }}
//                             className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             onClick={() => setFormData(prev => ({ ...prev, completed: 'Y' }))}
//                             className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
//                         >
//                             {editId ? 'Update Task Feedback' : 'Save'}
//                         </button>
//                         <button
//                             type="button"
//                             onClick={() => {
//                                 setFormData(prev => ({ ...prev, completed: 'S' })); // mark completed 'S'
//                                 setTimeout(() => handleSubmit(), 0); // call submit after state update
//                             }}
//                             className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"

//                         >
//                             Task has not completed - Close
//                         </button>

//                     </div>
//                 </form>
//             </Modal>

//             <Modal
//                 isOpen={isConfirmDeleteModalOpen}
//                 onClose={() => setIsConfirmDeleteModalOpen(false)}
//                 title="Confirm Deletion"
//             >
//                 <div className="p-4">
//                     <p className="text-gray-700 text-lg mb-4">
//                         Are you sure you want to delete this task?
//                     </p>
//                     <div className="flex justify-end space-x-3">
//                         <button
//                             type="button"
//                             onClick={() => setIsConfirmDeleteModalOpen(false)}
//                             className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="button"
//                             onClick={confirmDelete}
//                             className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
//                         >
//                             Delete
//                         </button>
//                     </div>
//                 </div>
//             </Modal>
//         </div>
//     );
// }

// export default TaskReport;
















// import { useState, useEffect, useRef, useCallback } from 'react';
// import { PencilSquareIcon, CheckCircleIcon, XCircleIcon, ClockIcon, CalendarDaysIcon, UserIcon } from '@heroicons/react/24/outline';
// import { Trash2, MoreVertical, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
// import Modal from '../common/Modal/Modal';
// import { useUpdateTaskMasterMutation, useGetTaskMasterQuery } from '../services/taskreportApi';
// import { useAddTaskGenerateReminderMutation } from '../services/taskdescriptionApi';
// import { decryptData } from "../common/Functions/DecryptData";

// // Priority mapping for styling
// const priorityMap = {
//     '1': { 
//         text: 'HIGH PRIORITY', 
//         bg: 'bg-red-500', 
//         textLight: 'text-red-500', 
//         border: 'border-l-red-500',
//         dot: 'bg-red-500'
//     },
//     '2': { 
//         text: 'MEDIUM PRIORITY', 
//         bg: 'bg-yellow-500', 
//         textLight: 'text-yellow-500', 
//         border: 'border-l-yellow-500',
//         dot: 'bg-yellow-500'
//     },
//     '3': { 
//         text: 'LOW PRIORITY', 
//         bg: 'bg-blue-500', 
//         textLight: 'text-blue-500', 
//         border: 'border-l-blue-500',
//         dot: 'bg-blue-500'
//     },
//     '4': { 
//         text: 'LOW PRIORITY', 
//         bg: 'bg-blue-500', 
//         textLight: 'text-blue-500', 
//         border: 'border-l-blue-500',
//         dot: 'bg-blue-500'
//     },
// };

// // Custom hook for click outside detection
// const useClickOutside = (callback) => {
//     const ref = useRef(null);

//     const handleClick = useCallback((e) => {
//         if (ref.current && !ref.current.contains(e.target)) {
//             callback();
//         }
//     }, [callback]);

//     useEffect(() => {
//         document.addEventListener("mousedown", handleClick);
//         return () => {
//             document.removeEventListener("mousedown", handleClick);
//         };
//     }, [handleClick]);

//     return ref;
// };

// // Dropdown component for each task
// const TaskDropdown = ({ task, onEdit, onDelete }) => {
//     const [isOpen, setIsOpen] = useState(false);

//     const handleClose = useCallback(() => setIsOpen(false), []);
//     const dropdownRef = useClickOutside(handleClose);

//     const handleEdit = () => {
//         onEdit(task);
//         setIsOpen(false);
//     };

//     const handleDelete = () => {
//         onDelete(task.Id);
//         setIsOpen(false);
//     };

//     return (
//         <div className="relative" ref={dropdownRef}>
//             <button 
//                 onClick={() => setIsOpen(prev => !prev)} 
//                 className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:bg-gray-200 transition-colors"
//                 aria-label="Task options"
//             >
//                 <MoreVertical className="h-5 w-5 text-gray-500" />
//             </button>
//             {isOpen && (
//                 <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 origin-top-right animate-fadeIn">
//                     <button 
//                         onClick={handleEdit} 
//                         className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
//                     >
//                         <PencilSquareIcon className="h-4 w-4 mr-2" />
//                         Edit
//                     </button>
//                     <button 
//                         onClick={handleDelete} 
//                         className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors duration-150"
//                     >
//                         <Trash2 className="h-4 w-4 mr-2" />
//                         Delete
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// };

// function TaskReport() {
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
//     const [taskIdToDelete, setTaskIdToDelete] = useState(null);
//         const getCurrentDate = () => {
//         const today = new Date();
//         const year = today.getFullYear();
//         const month = String(today.getMonth() + 1).padStart(2, '0');
//         const day = String(today.getDate()).padStart(2, '0');
//         return `${year}-${month}-${day}`;
//     };

//     const [formData, setFormData] = useState({
//         Id: '',
//         taskno: '',
//         purpose: '',
//         completed: '',
//         comp_hrs: '',
//         comp_days: '',
//         remark: '',
//         comp_date: getCurrentDate(),
//         reminddate: getCurrentDate(),
//         deadline: getCurrentDate(),
//         prioritys: '',
//     });
//     const [editId, setEditId] = useState(null);
//     const [notification, setNotification] = useState({
//         show: false,
//         message: '',
//         type: 'success'
//     });

//     const {
//         data: tableData = [],
//         isLoading: isTableLoading,
//         isError,
//         refetch
//     } = useGetTaskMasterQuery();
//     const [updateTaskMaster] = useUpdateTaskMasterMutation();
//     const [addTaskGenerateReminder, { isLoading: isReminderGenerating }] = useAddTaskGenerateReminderMutation();

//     const showNotification = (message, type = 'success') => {
//         setNotification({ show: true, message, type });
//         setTimeout(() => {
//             setNotification({ ...notification, show: false });
//         }, 3000);
//     };

//     const handleGenerateRemindersClick = async () => {
//         try {
//             await addTaskGenerateReminder().unwrap();
//             showNotification('Reminders generated successfully!');
//             refetch();
//         } catch (error) {
//             console.error('Failed to generate reminders:', error);
//             showNotification('Failed to generate reminders!', 'error');
//         }
//     };

//     const encryptedUserData = sessionStorage.getItem('user_data');
//     const decryptedUserData = decryptData(encryptedUserData);
//     const loggedInUserId = decryptedUserData?.user_id;

//     const filteredTasks = tableData.filter(task => String(task.userId) === String(loggedInUserId));

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     const handleSubmit = async (e) => {
//         if (e && e.preventDefault) e.preventDefault();
//         try {
//             const payload = {
//                 Id: Number(formData.Id),
//                 completed: formData.completed,
//                 comp_hrs: Number(formData.comp_hrs),
//                 comp_days: Number(formData.comp_days),
//                 remark: formData.remark,
//                 comp_date: formData.comp_date || null,
//             };
//             if (editId) {
//                 await updateTaskMaster({
//                     Id: Number(editId),
//                     ...payload,
//                 }).unwrap();
//                 showNotification('Task updated successfully!');
//             }
//             resetForm();
//             setIsModalOpen(false);
//             refetch();
//         } catch (error) {
//             console.error('Failed to save task:', error);
//             showNotification('Failed to save task!', 'error');
//         }
//     };

//     const handleEdit = (row) => {
//         setFormData({
//             Id: row.Id.toString(),
//             completed: row.completed,
//             comp_hrs: row.comp_hrs,
//             comp_days: row.comp_days,
//             remark: row.remark,
//             comp_date: row.comp_date || '',
//         });
//         setEditId(row.Id);
//         setIsModalOpen(true);
//     };

//     const openDeleteConfirmModal = (id) => {
//         setTaskIdToDelete(id);
//         setIsConfirmDeleteModalOpen(true);
//     };

//     const confirmDelete = async () => {
//         if (taskIdToDelete) {
//             try {
//                 await deleteTaskMaster(Number(taskIdToDelete)).unwrap();
//                 showNotification('Task deleted successfully!');
//                 refetch();
//             } catch (error) {
//                 console.error('Failed to delete task:', error);
//                 showNotification('Failed to delete task!', 'error');
//             } finally {
//                 setIsConfirmDeleteModalOpen(false);
//                 setTaskIdToDelete(null);
//             }
//         }
//     };

//     const resetForm = () => {
//         setFormData({
//             completed: '',
//             comp_hrs: '',
//             comp_days: '',
//             remark: '',
//             comp_date: getCurrentDate(),
//         });
//         setEditId(null);
//     };

//     if (isTableLoading) return (
//         <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//             <div className="text-center space-y-4">
//                 <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto" />
//                 <p className="text-gray-700 text-lg font-medium">Loading<span className="inline-block animate-pulse ml-1 text-blue-600">...</span></p>
//             </div>
//         </div>
//     );

//     if (isError) return (
//         <div className="text-center py-8 text-red-600">
//             Error loading tasks. Please try again.
//         </div>
//     );

//     return (
//         <div className="bg-gray-50 min-h-screen font-inter p-6">
//             {notification.show && (
//                 <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-md shadow-lg transform transition-all duration-300 ${notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
//                     {notification.type === 'success' ? 
//                         <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" /> : 
//                         <XCircleIcon className="h-6 w-6 text-red-500 mr-2" />
//                     }
//                     <span>{notification.message}</span>
//                 </div>
//             )}

//             <div className="flex justify-between items-center mb-6">
//                 <h1 className="text-2xl font-bold text-gray-800">Task Master</h1>
//                 <button
//                     onClick={handleGenerateRemindersClick}
//                     disabled={isReminderGenerating}
//                     className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
//                 >
//                     {isReminderGenerating ? (
//                         <>
//                             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
//                             Generating...
//                         </>
//                     ) : 'Generate Reminders'}
//                 </button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                 {filteredTasks.map(task => {
//                     const priorityInfo = priorityMap[task.prioritys] || priorityMap['4']; // Default to low priority if not found
//                     const isOverdue = task.deadline && new Date(task.deadline) < new Date();

//                     return (
//                         <div 
//                             key={task.Id} 
//                             className={`bg-white rounded-lg shadow-md flex flex-col overflow-hidden border-l-4 ${priorityInfo.border} transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]`}
//                         >
//                             <div className="p-4 flex-grow">
//                                 <div className="flex justify-between items-center mb-2">
//                                     <div className="flex items-center">
//                                         <span className={`h-2 w-2 rounded-full mr-2 ${priorityInfo.dot}`}></span>
//                                         <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${priorityInfo.bg}`}>
//                                             {priorityInfo.text}
//                                         </span>
//                                         {isOverdue && (
//                                             <span className="ml-2 text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-800 flex items-center">
//                                                 <AlertTriangle className="h-3 w-3 mr-1" />
//                                                 Overdue
//                                             </span>
//                                         )}
//                                     </div>
//                                     <TaskDropdown 
//                                         task={task} 
//                                         onEdit={handleEdit} 
//                                         onDelete={openDeleteConfirmModal} 
//                                     />
//                                 </div>

//                                 <h3 className="text-lg font-semibold text-gray-900 truncate flex items-center">
//                                     {task.taskno}
//                                 </h3>

//                                 <div className="mt-3">
//                                     <p className="text-sm font-medium text-gray-800 mb-1">Purpose:</p>
//                                     <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">{task.purpose}</p>
//                                 </div>

//                                 <div className="mt-3">
//                                     <p className="text-sm font-medium text-gray-800 mb-1">Description:</p>
//                                     <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md line-clamp-3">
//                                         {task.taskdesc || "No description available"}
//                                     </p>
//                                 </div>
//                             </div>

//                             <div className="border-t border-gray-200 p-4 space-y-3 text-gray-600 text-sm">
//                                 <div className="flex items-center">
//                                     <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
//                                     <span className="font-medium text-gray-800">Creator:</span>
//                                     <span className="ml-1">{task.Created_By}</span>
//                                 </div>

//                                 <div className="flex items-center">
//                                     <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
//                                     <span className="font-medium text-gray-800">Remind Date:</span>
//                                     <span className="ml-1">{task.reminddate ? new Date(task.reminddate).toLocaleDateString() : '-'}</span>
//                                 </div>

//                                 <div className="flex items-center">
//                                     <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
//                                     <span className="font-medium text-gray-800">Deadline:</span>
//                                     <span className={`ml-1 ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
//                                         {task.deadline ? new Date(task.deadline).toLocaleDateString() : '-'}
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>

//             <Modal
//                 isOpen={isModalOpen}
//                 onClose={() => { setIsModalOpen(false); resetForm(); }}
//                 title={editId ? 'Edit Task' : 'Add New Task'}
//             >
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="col-span-1 md:col-span-2">
//                             <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
//                             <input 
//                                 type="text" 
//                                 name="Id" 
//                                 value={formData.Id} 
//                                 className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed" 
//                                 readOnly 
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Completed Hours</label>
//                             <input 
//                                 type="number" 
//                                 name="comp_hrs" 
//                                 value={formData.comp_hrs} 
//                                 onChange={handleInputChange} 
//                                 className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
//                                 required 
//                                 min="0"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Completed Days</label>
//                             <input 
//                                 type="number" 
//                                 name="comp_days" 
//                                 value={formData.comp_days} 
//                                 onChange={handleInputChange} 
//                                 className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
//                                 required 
//                                 min="0"
//                             />
//                         </div>
//                         <div className="col-span-1 md:col-span-2">
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Completed Date</label>
//                             <input 
//                                 type="date" 
//                                 name="comp_date" 
//                                 value={formData.comp_date} 
//                                 onChange={handleInputChange} 
//                                 className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
//                                 required 
//                             />
//                         </div>
//                         <div className="col-span-1 md:col-span-2">
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
//                             <textarea 
//                                 name="remark" 
//                                 value={formData.remark} 
//                                 onChange={handleInputChange} 
//                                 rows="3" 
//                                 className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
//                                 placeholder="Add any remarks about this task..."
//                             ></textarea>
//                         </div>
//                     </div>
//                     <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
//                         <button 
//                             type="button" 
//                             onClick={() => { setIsModalOpen(false); resetForm(); }} 
//                             className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
//                         >
//                             Cancel
//                         </button>
//                         <button 
//                             type="submit" 
//                             onClick={() => setFormData(prev => ({ ...prev, completed: 'S' }))} 
//                             className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 flex items-center justify-center"
//                         >
//                             <XCircle className="h-4 w-4 mr-1" />
//                             Not Completed - Close
//                         </button>
//                         <button 
//                             type="submit" 
//                             onClick={() => setFormData(prev => ({ ...prev, completed: 'Y' }))} 
//                             className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 flex items-center justify-center"
//                         >
//                             <CheckCircle2 className="h-4 w-4 mr-1" />
//                             Update Task Feedback
//                         </button>
//                     </div>
//                 </form>
//             </Modal>

//             <Modal 
//                 isOpen={isConfirmDeleteModalOpen} 
//                 onClose={() => setIsConfirmDeleteModalOpen(false)} 
//                 title="Confirm Deletion"
//             >
//                 <div className="p-4">
//                     <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
//                         <Trash2 className="h-6 w-6 text-red-600" />
//                     </div>
//                     <p className="text-gray-700 text-lg text-center mb-4">Are you sure you want to delete this task?</p>
//                     <p className="text-gray-500 text-sm text-center mb-6">This action cannot be undone.</p>
//                     <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
//                         <button 
//                             type="button" 
//                             onClick={() => setIsConfirmDeleteModalOpen(false)} 
//                             className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
//                         >
//                             Cancel
//                         </button>
//                         <button 
//                             type="button" 
//                             onClick={confirmDelete} 
//                             className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
//                         >
//                             Delete
//                         </button>
//                     </div>
//                 </div>
//             </Modal>
//         </div>
//     );
// }

// export default TaskReport;