import { useState, useEffect } from 'react';
import TableUtility from "../../common/TableUtility/TableUtility";
import Modal from '../../common/Modal/Modal';
import CreateNewButton from "../../common/Buttons/AddButton";
import { PencilSquareIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Trash2 } from 'lucide-react';
import Select from "react-select";

import {
    useGetAwardMasterAllQuery,
    useGetAwardMasterByIdQuery,
    useGetMaxAwardMasterIdQuery,
    useAddAwardMasterMutation,
    useUpdateAwardMasterMutation,
    useDeleteAwardMasterMutation
} from "../../services/awardMasterApi";

import {
    useGetEventSuperMastersQuery
} from "../../services/eventSuperMasterApi";

function AwardMaster() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        AwardId: '',
        Award_Name: '',
        EventSuperId: ''
    });

    const [editId, setEditId] = useState(null);
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    const {
        data: eventSupers = [],
        isLoading: isEventSupersLoading
    } = useGetEventSuperMastersQuery();

    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [deleteIdToConfirm, setDeleteIdToConfirm] = useState(null);

    const { data: tableData = [], isLoading: isTableLoading, isError, refetch } = useGetAwardMasterAllQuery();
    const { data: maxAwardID = 0, isLoading: isMaxIdLoading, refetch: refetchMaxId } = useGetMaxAwardMasterIdQuery();
    const [addAward] = useAddAwardMasterMutation();
    const [updateAward] = useUpdateAwardMasterMutation();
    const [deleteAward] = useDeleteAwardMasterMutation();

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    useEffect(() => {
        if (!editId && !isMaxIdLoading && isModalOpen) {
            const nextId = (typeof maxAwardID === 'number' ? maxAwardID : 0) + 1;
            setFormData(prev => ({
                ...prev,
                AwardId: nextId
            }));
        }
    }, [maxAwardID, isMaxIdLoading, editId, isModalOpen]);

    const handleAddNew = async () => {
        resetForm();
        setEditId(null);
        await refetchMaxId();
        setIsModalOpen(true);
    };

    // Build dropdown options for EventSuper
    const eventSuperOptions = eventSupers.map(item => ({
        value: item.EventSuperId.toString(),
        label: `${item.EventSuperId} - ${item.EventSuper_Name}`
    }));

    const selectedEventSuper = eventSuperOptions.find(
        option => option.value === formData.EventSuperId?.toString()
    );

    const columns = [
        {
            header: 'Award Id',
            accessor: 'AwardId',
        },
        {
            header: 'Award Name',
            accessor: 'Award_Name',
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
                        onClick={() => handleDelete(row.AwardId)}
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

    const handleEventSuperChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            EventSuperId: selectedOption ? selectedOption.value : ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Ensure EventSuperId is number
            const payload = {
                ...formData,
                EventSuperId: Number(formData.EventSuperId)
            };

            if (editId) {
                await updateAward({ id: editId, ...payload }).unwrap();
                showNotification('Award updated successfully!');
            } else {
                await addAward(payload).unwrap();
                showNotification('Award added successfully!');
            }
            resetForm();
            setIsModalOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to save award:', error);
            showNotification('Failed to save award!', 'error');
        }
    };

    const handleEdit = (row) => {
        setFormData({
            AwardId: row.AwardId,
            Award_Name: row.Award_Name,
            EventSuperId: row.EventSuperId
        });
        setEditId(row.AwardId);
        setIsModalOpen(true);
    };

    const handleDelete = (AwardId) => {
        setDeleteIdToConfirm(AwardId);
        setShowDeleteConfirmModal(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteAward(deleteIdToConfirm).unwrap();
            showNotification('Award deleted successfully!');
            refetch();
        } catch (error) {
            console.error('Failed to delete award:', error);
            showNotification('Failed to delete award!', 'error');
        } finally {
            setShowDeleteConfirmModal(false);
            setDeleteIdToConfirm(null);
        }
    };

    const resetForm = () => {
        setFormData({
            AwardId: '',
            Award_Name: '',
            EventSuperId: ''
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
    if (isError) return <div className="text-center py-8 text-red-600">Error loading awards. Please try again.</div>;

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
                title="Award Master"
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
                title={editId ? 'Edit Award' : 'Add New Award'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label htmlFor="AwardId" className="block text-sm font-medium text-gray-700 mb-1">
                                Award ID
                            </label>
                            <input
                                id="AwardId"
                                type="number"
                                name="AwardId"
                                value={formData.AwardId}
                                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
                                readOnly
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                {isMaxIdLoading ? 'Loading...' : 'Auto-generated'}
                            </p>
                        </div>

                        <div>
                            <label htmlFor="Award_Name" className="block text-sm font-medium text-gray-700 mb-1">Award Name</label>
                            <input
                                id="Award_Name"
                                type="text"
                                name="Award_Name"
                                value={formData.Award_Name}
                                onChange={handleInputChange}
                                autoComplete='off'
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Event Super</label>
                            <Select
                                options={eventSuperOptions}
                                value={selectedEventSuper}
                                onChange={handleEventSuperChange}
                                placeholder="Select an event super..."
                                isSearchable
                                required
                                className="basic-single"
                                classNamePrefix="select"
                                styles={{
                                    control: (provided) => ({
                                        ...provided,
                                        minHeight: '42px',
                                        borderColor: '#d1d5db',
                                        '&:hover': {
                                            borderColor: '#d1d5db'
                                        }
                                    }),
                                    option: (provided, state) => ({
                                        ...provided,
                                        backgroundColor: state.isSelected ? '#2563eb' : 'white',
                                        color: state.isSelected ? 'white' : 'black',
                                        '&:hover': {
                                            backgroundColor: '#2563eb',
                                            color: 'white'
                                        }
                                    })
                                }}
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
                    <p className="text-lg text-gray-700 mb-6">Are you sure you want to delete this award?</p>
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

export default AwardMaster;
