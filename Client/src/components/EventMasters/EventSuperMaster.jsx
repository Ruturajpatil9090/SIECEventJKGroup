import { useState, useEffect } from 'react';
import TableUtility from "../../common/TableUtility/TableUtility";
import Modal from '../../common/Modal/Modal';
import CreateNewButton from "../../common/Buttons/AddButton";
import { PencilSquareIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Trash2 } from 'lucide-react';

import {
    useGetEventSuperMastersQuery,
    useGetMaxEventSuperIdQuery,
    useAddEventSuperMasterMutation,
    useUpdateEventSuperMasterMutation,
    useDeleteEventSuperMasterMutation
} from '../../services/eventSuperMasterApi';

function EventSuperMaster() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        EventSuperId: '',
        EventSuper_Name: ''
    });

    const [editId, setEditId] = useState(null);
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [deleteIdToConfirm, setDeleteIdToConfirm] = useState(null);

    const { data: tableData = [], isLoading: isTableLoading, isError, refetch } = useGetEventSuperMastersQuery();
    const { data: maxEventSuperId = 0, isLoading: isMaxIdLoading, refetch: refetchMaxId } = useGetMaxEventSuperIdQuery();
    const [addEventSuper] = useAddEventSuperMasterMutation();
    const [updateEventSuper] = useUpdateEventSuperMasterMutation();
    const [deleteEventSuper] = useDeleteEventSuperMasterMutation();

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    useEffect(() => {
        if (!editId && !isMaxIdLoading && isModalOpen) {
            const nextId = (typeof maxEventSuperId === 'number' ? maxEventSuperId : 0) + 1;
            setFormData(prev => ({
                ...prev,
                EventSuperId: nextId
            }));
        }
    }, [maxEventSuperId, isMaxIdLoading, editId, isModalOpen]);

    const handleAddNew = async () => {
        resetForm();
        setEditId(null);
        await refetchMaxId();
        setIsModalOpen(true);
    };

    const columns = [
        {
            header: 'Event Super ID',
            accessor: 'EventSuperId',
        },
        {
            header: 'Event Super Name',
            accessor: 'EventSuper_Name',
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
                        onClick={() => handleDelete(row.EventSuperId)}
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
            if (editId) {
                await updateEventSuper({ id: editId, ...formData }).unwrap();
                showNotification('Event Super updated successfully!');
            } else {
                await addEventSuper(formData).unwrap();
                showNotification('Event Super added successfully!');
            }
            resetForm();
            setIsModalOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to save event super:', error);
            showNotification('Failed to save event super!', 'error');
        }
    };

    const handleEdit = (row) => {
        setFormData({
            EventSuperId: row.EventSuperId,
            EventSuper_Name: row.EventSuper_Name,
        });
        setEditId(row.EventSuperId);
        setIsModalOpen(true);
    };

    const handleDelete = (EventSuperId) => {
        setDeleteIdToConfirm(EventSuperId);
        setShowDeleteConfirmModal(true);
    };

    // const confirmDelete = async () => {
    //     try {
    //         await deleteEventSuper(deleteIdToConfirm).unwrap();
    //         showNotification('Event Super deleted successfully!');
    //         refetch();
    //     } catch (error) {
    //         console.error('Failed to delete event super:', error);
    //         showNotification('Failed to delete event super!', 'error');
    //     } finally {
    //         setShowDeleteConfirmModal(false);
    //         setDeleteIdToConfirm(null);
    //     }
    // };


  const confirmDelete = async () => {
        try {
            const result = await deleteEventSuper(deleteIdToConfirm).unwrap();
            if (result && result.message) {
                showNotification('Category deleted successfully!');
                refetch();
            } else {
                showNotification('Category deleted successfully!');
                refetch();
            }
        } catch (error) {
            console.error('Failed to delete category:', error);
            if (error.data) {
                if (error.data.detail) {
                    showNotification(error.data.detail, 'error');
                }
                else if (error.data.error) {
                    showNotification(error.data.error, 'error');
                }
                else {
                    showNotification('Failed to delete category!', 'error');
                }
            } else {
                showNotification('Failed to delete category!', 'error');
            }
        } finally {
            setShowDeleteConfirmModal(false);
            setDeleteIdToConfirm(null);
        }
    };


    const resetForm = () => {
        setFormData({
            EventSuperId: '',
            EventSuper_Name: '',
        });
        setEditId(null);
    };

    if (isTableLoading) return <div className="text-center py-8">Loading event supers...</div>;
    if (isError) return <div className="text-center py-8 text-red-600">Error loading event supers. Please try again.</div>;

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
                    <CreateNewButton onClick={handleAddNew} />
                }
                title="Event Super Master"
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
                title={editId ? 'Edit Event Super' : 'Add New Event Super'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label htmlFor="EventSuperId" className="block text-sm font-medium text-gray-700 mb-1">
                                Event Super ID
                            </label>
                            <input
                                id="EventSuperId"
                                type="number"
                                name="EventSuperId"
                                value={formData.EventSuperId}
                                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
                                readOnly
                                aria-label="Event Super ID (auto-generated)"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                {isMaxIdLoading ? 'Loading...' : 'Auto-generated'}
                            </p>
                        </div>

                        <div>
                            <label htmlFor="EventSuper_Name" className="block text-sm font-medium text-gray-700 mb-1">Event Super Name</label>
                            <input
                                id="EventSuper_Name"
                                type="text"
                                name="EventSuper_Name"
                                value={formData.EventSuper_Name}
                                onChange={handleInputChange}
                                autoComplete='off'
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                required
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
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            {editId ? 'Update' : 'Save'}
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
                    <p className="text-lg text-gray-700 mb-6">Are you sure you want to delete this event super?</p>
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

export default EventSuperMaster;