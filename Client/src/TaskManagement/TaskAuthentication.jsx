
import { useState, useEffect } from 'react';
import TableUtility from "../common/TableUtility/TableUtility";
import { PencilSquareIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Trash2 } from 'lucide-react';
import Modal from '../common/Modal/Modal';
import { useUpdateTaskMasterMutation, useGetToAuthoriseQuery } from '../services/taskreportApi';
import CreateNewButton from "../common/Buttons/AddButton";
import Select from 'react-select';
import { getCurrentDate } from '../common/Functions/GetCurrentdate';

function TaskAuthentication() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [eventIdToDelete, setEventIdToDelete] = useState(null);
    const [formAction, setFormAction] = useState("");
    const [formData, setFormData] = useState({
        Id: '',
        taskno: '',
        purpose: '',
        completed: '',
        comp_hrs: '',
        comp_days: '',
        remark: '',
        authoriser_remark: '',
        taskdesc: '',
        comp_date: getCurrentDate(),
        reminddate: getCurrentDate(),
        deadline: getCurrentDate(),
        prioritys: '',
        Authorised: '',
        User_Name: '',
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
    } = useGetToAuthoriseQuery();
    const [updateTaskMaster] = useUpdateTaskMasterMutation();


    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ ...notification, show: false });
        }, 3000);
    };
    const handleAddNew = async () => {
        setEditId(null);
        resetForm();
        await refetchMaxId();
        setIsModalOpen(true);
    };

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
            header: 'Task Date',
            accessor: 'taskdate',
            cellRenderer: (row) => row.reminddate ? new Date(row.reminddate).toLocaleDateString() : '-'
        },
        {
            header: 'Purpose',
            accessor: 'purpose',
        },
        {
            header: 'Task Description',
            accessor: 'taskdesc',
        },
        {
            header: 'Last Date',
            accessor: 'enddate',
            cellRenderer: (row) => row.reminddate ? new Date(row.reminddate).toLocaleDateString() : '-'
        },
        {
            header: 'User Name',
            accessor: 'User_Name',
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
        e.preventDefault();

        try {
            const payload = {
                Id: Number(formData.Id),
                completed: formData.completed,
                comp_hrs: Number(formData.comp_hrs),
                comp_days: Number(formData.comp_days),
                remark: formData.remark,
                authoriser_remark: formData.authoriser_remark,
                purpose: formData.purpose,
                comp_date: formData.comp_date || null,
                Authorised: formAction === "Authanticate" ? "Y" : formData.Authorised,
            };

            if (formAction === "Reopen") {
                payload.completed = "N";
            }

            if (editId) {
                await updateTaskMaster({
                    Id: Number(editId),
                    ...payload
                }).unwrap();

                const actionMsg = formAction === "Authanticate"
                    ? "Task authenticated successfully!"
                    : formAction === "Reopen"
                        ? "Task reopened successfully!"
                        : "Task updated successfully!";

                showNotification(actionMsg);
            }

            resetForm();
            setIsModalOpen(false);
            refetch();

        } catch (error) {
            console.error('Failed to save event:', error);
            showNotification('Failed to save event!', 'error');
        }
    };



    const handleEdit = (row) => {
        setFormData({
            Id: row.Id.toString(),
            completed: row.completed,
            comp_hrs: row.comp_hrs,
            comp_days: row.comp_days,
            remark: row.remark,
            authoriser_remark: row.authoriser_remark,
            purpose: row.purpose,
            comp_date: row.comp_date || '',
            taskdesc: row.taskdesc,
            Authorised: row.Authorised,
            User_Name: row.User_Name || '',
        });
        setEditId(row.Id);
        setIsModalOpen(true);
    };

    const openDeleteConfirmModal = (id) => {
        setEventIdToDelete(id);
        setIsConfirmDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (eventIdToDelete) {
            try {
                await deleteEvent(Number(eventIdToDelete)).unwrap();
                showNotification('Event deleted successfully!');
                refetch();
            } catch (error) {
                console.error('Failed to delete event:', error);
                showNotification('Failed to delete event!', 'error');
            } finally {
                setIsConfirmDeleteModalOpen(false);
                setEventIdToDelete(null);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            completed: '',
            comp_hrs: '',
            comp_days: '',
            remark: '',
            authoriser_remark: '',
            purpose: '',
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
    </div>
    if (isError) return <div className="text-center py-8 text-red-600">Error loading events. Please try again.</div>;

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

                title="Authorise Master"
                columns={columns}
                data={tableData}
                pageSize={10}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                title={editId ? 'Edit Event' : 'Add New Event'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ID
                            </label>
                            <input
                                type="text"
                                name="EventMasterId"
                                value={formData.Id}
                                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Task Opened For</label>
                            <input
                                type="text"
                                name="User_Name"
                                value={formData.User_Name}
                                readOnly
                                autoComplete='off'
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                disabled
                            />
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Task Description</label>
                            <input
                                type="text"
                                name="taskdesc"
                                value={formData.taskdesc}
                                readOnly
                                autoComplete='off'
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                disabled
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Task Purpose</label>
                            <input
                                type="text"
                                name="purpose"
                                value={formData.purpose}
                                readOnly
                                autoComplete='off'
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                disabled
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Authoriser Remark</label>
                            <input
                                type="text"
                                name="authoriser_remark"
                                value={formData.authoriser_remark}
                                onChange={handleInputChange}
                                autoComplete='off'
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                required
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
                            onClick={() => setFormAction("Authanticate")}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                        >
                            {editId ? 'Authenticate' : 'Save'}
                        </button>

                        <button
                            type="submit"
                            onClick={() => setFormAction("Reopen")}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                        >
                            {editId ? 'Reopen' : 'Save'}
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
                        Are you sure you want to delete this event?
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

export default TaskAuthentication;