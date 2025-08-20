import { useState, useEffect } from 'react';
import TableUtility from "../../common/TableUtility/TableUtility";
import { PencilSquareIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Trash2 } from 'lucide-react';
import Modal from '../../common/Modal/Modal';
import {
    useGetEventMastersQuery,
    useGetMaxEventMasterIdQuery,
    useAddEventMasterMutation,
    useUpdateEventMasterMutation,
    useDeleteEventMasterMutation
} from '../../services/eventMasterApi';
import { useGetEventSuperMastersQuery } from '../../services/eventSuperMasterApi';
import CreateNewButton from "../../common/Buttons/AddButton";
import Select from 'react-select';

function EventMaster() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [eventIdToDelete, setEventIdToDelete] = useState(null);
    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const [formData, setFormData] = useState({
        EventMasterId: '',
        EventMaster_Name: '',
        EventSuperId: '',
        Start_Date: getCurrentDate(),
        End_Date: getCurrentDate()
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
    } = useGetEventMastersQuery();

    const {
        data: maxEventId = 0,
        isLoading: isMaxIdLoading,
        refetch: refetchMaxId
    } = useGetMaxEventMasterIdQuery();

    const {
        data: eventSupers = [],
        isLoading: isEventSupersLoading
    } = useGetEventSuperMastersQuery();

    const [addEvent] = useAddEventMasterMutation();
    const [updateEvent] = useUpdateEventMasterMutation();
    const [deleteEvent] = useDeleteEventMasterMutation();

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ ...notification, show: false });
        }, 3000);
    };

    useEffect(() => {
        if (!editId && !isMaxIdLoading && isModalOpen) {
            const nextId = maxEventId + 1;
            setFormData(prev => ({
                ...prev,
                EventMasterId: nextId.toString()
            }));
        }
    }, [maxEventId, isMaxIdLoading, editId, isModalOpen]);

    const handleAddNew = async () => {
        setEditId(null);
        resetForm();
        await refetchMaxId();
        setIsModalOpen(true);
    };

    const columns = [
        {
            header: 'Event ID',
            accessor: 'EventMasterId',
        },
        {
            header: 'Event Name',
            accessor: 'EventMaster_Name',
        },
        {
            header: 'Event Super Name',
            accessor: 'EventSuper_Name',
        },
        {
            header: 'Start Date',
            accessor: 'Start_Date',
            cellRenderer: (row) => row.Start_Date ? new Date(row.Start_Date).toLocaleDateString() : '-'
        },
        {
            header: 'End Date',
            accessor: 'End_Date',
            cellRenderer: (row) => row.End_Date ? new Date(row.End_Date).toLocaleDateString() : '-'
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
                        onClick={() => openDeleteConfirmModal(row.EventMasterId)}
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
            const payload = {
                EventMaster_Name: formData.EventMaster_Name,
                EventSuperId: Number(formData.EventSuperId),
                Start_Date: formData.Start_Date || null,
                End_Date: formData.End_Date || null
            };

            if (editId) {
                await updateEvent({
                    id: Number(editId),
                    ...payload
                }).unwrap();
                showNotification('Event updated successfully!');
            } else {
                await addEvent({
                    EventMasterId: Number(formData.EventMasterId),
                    ...payload
                }).unwrap();
                showNotification('Event added successfully!');
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
            EventMasterId: row.EventMasterId.toString(),
            EventMaster_Name: row.EventMaster_Name,
            EventSuperId: row.EventSuperId.toString(),
            Start_Date: row.Start_Date || '',
            End_Date: row.End_Date || ''
        });
        setEditId(row.EventMasterId);
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
            EventMasterId: '',
            EventMaster_Name: '',
            EventSuperId: '',
            Start_Date: getCurrentDate(),
            End_Date: getCurrentDate()
        });
        setEditId(null);
    };

    const eventSuperOptions = eventSupers.map(superEvent => ({
        value: superEvent.EventSuperId.toString(),
        label: `${superEvent.EventSuperId} - ${superEvent.EventSuper_Name}`
    }));

    const selectedEventSuper = eventSuperOptions.find(option =>
        option.value === formData.EventSuperId?.toString()
    );

    if (isTableLoading || isEventSupersLoading) return <div className="text-center py-8">Loading events...</div>;
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
                headerContent={<CreateNewButton onClick={handleAddNew} />}
                title="Event Master"
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
                                Event ID
                            </label>
                            <input
                                type="text"
                                name="EventMasterId"
                                value={formData.EventMasterId}
                                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                            <input
                                type="text"
                                name="EventMaster_Name"
                                value={formData.EventMaster_Name}
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                name="Start_Date"
                                value={formData.Start_Date}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                name="End_Date"
                                value={formData.End_Date}
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
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            {editId ? 'Update' : 'Save'}
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

export default EventMaster;