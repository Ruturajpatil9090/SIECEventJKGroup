
import { useState, useEffect } from 'react';
import TableUtility from "../common/TableUtility/TableUtility";
import { PencilSquareIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Trash2 } from 'lucide-react';
import Modal from '../common/Modal/Modal';
import { useUpdateTaskMasterMutation, useGetTaskMasterQuery } from '../services/taskreportApi';
import CreateNewButton from "../common/Buttons/AddButton";
import Select from 'react-select';
import { useAddTaskGenerateReminderMutation } from '../services/taskdescriptionApi';
import { decryptData } from "../common/Functions/DecryptData"


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
    console.log("tableDataMasters", tableData)
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



    const handleAddNew = async () => {
        setEditId(null);
        resetForm();
        await refetchMaxId();
        setIsModalOpen(true);
    };

    const encryptedUserData = sessionStorage.getItem('user_data');
    const decryptedUserData = decryptData(encryptedUserData);
    const loggedInUserId = decryptedUserData?.user_id;

    // Filter table data by user_id (only tasks for the logged in user)
    const filteredTasks = tableData.filter(task => String(task.userId) === String(loggedInUserId));



    const columns = [
        {
            header: 'ID',
            accessor: 'Id',
        },
        {
            header: 'Task No',
            accessor: 'taskno',
        },
        {
            header: 'Task Purpose',
            accessor: 'purpose',

        },
        {
            header: 'Remind Date',
            accessor: 'reminddate',
            cellRenderer: (row) => row.reminddate ? new Date(row.reminddate).toLocaleDateString() : '-'
        },
        {
            header: 'Deadline Date',
            accessor: 'deadline',
            cellRenderer: (row) => row.deadline ? new Date(row.deadline).toLocaleDateString() : '-'
        },
        {
            header: 'Task Creator',
            accessor: 'Created_By',

        },
        {
            header: 'Priority',
            accessor: 'prioritys',
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
                        onClick={() => openDeleteConfirmModal(row.Id)}
                        title="Delete"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            )
        }
    ];

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
                comp_hrs: Number(formData.comp_hrs), // force to number
                comp_days: Number(formData.comp_days),
                remark: formData.remark,
                comp_date: formData.comp_date || null,
            };
            console.log("PUT Payload", { Id: Number(editId), ...payload });

            if (editId) {
                await updateTaskMaster({
                    Id: Number(editId),
                    ...payload,
                }).unwrap();
                showNotification('Task updated successfully!');
            } else {
                await addEvent({
                    Id: Number(formData.Id),
                    ...payload
                }).unwrap();
                showNotification('Task added successfully!');
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
        if (IdToDelete) {
            try {
                await deleteEvent(Number(IdToDelete)).unwrap();
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


    if (isTableLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto" />

            <p className="text-gray-700 text-lg font-medium">
                Loading
                <span className="inline-block animate-pulse ml-1 text-blue-600">...</span>
            </p>
        </div>
    </div>;
    if (isError) return <div className="text-center py-8 text-red-600">Error loading tasks. Please try again.</div>;

    return (
        <div className="bg-gray-50 min-h-screen font-inter">
            {notification.show && (
                <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-md shadow-lg ${notification.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {notification.type === 'success' ? (
                        <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
                    ) : (
                        <XCircleIcon className="h-6 w-6 text-red-500 mr-2" />
                    )}
                    <span>{notification.message}</span>
                </div>
            )}

            <TableUtility
                headerContent={
                    <div className="flex space-x-3">
                        <button
                            onClick={handleGenerateRemindersClick}
                            disabled={isReminderGenerating}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {isReminderGenerating ? 'Generating...' : 'Generate Reminders'}
                        </button>
                    </div>
                }
                title="Task Master"
                columns={columns}
                data={filteredTasks}
                pageSize={10}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                title={editId ? 'Edit Task' : 'Add New Task'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ID
                            </label>
                            <input
                                type="text"
                                name="Id"
                                value={formData.Id}
                                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
                                readOnly
                            />
                        </div>

                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Completed</label>
                            <input
                                type="text"
                                name="completed"
                                value={formData.completed}
                                onChange={handleInputChange}
                                autoComplete='off'
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                required
                            />
                        </div> */}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Completed Hours</label>
                            <input
                                type="number"
                                name="comp_hrs"
                                value={formData.comp_hrs}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                required
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
                            />
                        </div>


                        <div>
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                            <input
                                type="text"
                                name="remark"
                                value={formData.remark}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setIsModalOpen(false);
                                resetForm();
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={() => setFormData(prev => ({ ...prev, completed: 'Y' }))}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            {editId ? 'Update Task Feedback' : 'Save'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setFormData(prev => ({ ...prev, completed: 'S' })); // mark completed 'S'
                                setTimeout(() => handleSubmit(), 0); // call submit after state update
                            }}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"

                        >
                            Task has not completed - Close
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
                    <p className="text-gray-700 text-lg mb-4">
                        Are you sure you want to delete this task?
                    </p>
                    <div className="flex justify-end space-x-3">
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