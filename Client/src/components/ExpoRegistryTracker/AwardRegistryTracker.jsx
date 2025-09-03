import { useState, useEffect } from 'react';
import TableUtility from "../../common/TableUtility/TableUtility";
import { PencilSquareIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Trash2 } from 'lucide-react';
import Select from 'react-select';
import Modal from '../../common/Modal/Modal';
import {
    useGetAwardRegistryQuery,
    useGetMaxAwardRegistryIdQuery,
    useAddAwardRegistryMutation,
    useUpdateAwardRegistryMutation,
    useDeleteAwardRegistryMutation
} from '../../services/awardRegistryApi';
import {
    useGetEventMastersQuery,
} from '../../services/eventMasterApi';
import {
    useGetSponsorsQuery,
} from '../../services/sponsorMasterApi';
import {
    useGetAwardMasterAllQuery,
} from '../../services/awardMasterApi';
import CreateNewButton from "../../common/Buttons/AddButton";

function AwardRegistryTracker() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [awardRegistryIdToDelete, setAwardRegistryIdToDelete] = useState(null);
    const [formData, setFormData] = useState({
        AwardRegistryTrackerId: '',
        Event_Code: '',
        SponsorMasterId: '',
        Deliverabled_Code: '',
        Deliverable_No: '',
        Award_Code: ''
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
    } = useGetAwardRegistryQuery({ event_code: sessionStorage.getItem("Event_Code") });

    const {
        data: maxAwardRegistryId = 0,
        isLoading: isMaxIdLoading,
        refetch: refetchMaxId
    } = useGetMaxAwardRegistryIdQuery();

    const {
        data: events = [],
        isLoading: isEventsLoading
    } = useGetEventMastersQuery();

    const {
        data: sponsors = [],
        isLoading: isSponsorsLoading
    } = useGetSponsorsQuery({ event_code: sessionStorage.getItem("Event_Code") });

    const {
        data: awards = [],
        isLoading: isAwardsLoading
    } = useGetAwardMasterAllQuery();

    const [addAwardRegistry] = useAddAwardRegistryMutation();
    const [updateAwardRegistry] = useUpdateAwardRegistryMutation();
    const [deleteAwardRegistry] = useDeleteAwardRegistryMutation();

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ ...notification, show: false });
        }, 3000);
    };

    useEffect(() => {
        if (!editId && !isMaxIdLoading && isModalOpen) {
            const nextId = maxAwardRegistryId + 1;
            setFormData(prev => ({
                ...prev,
                AwardRegistryTrackerId: nextId.toString()
            }));
        }
    }, [maxAwardRegistryId, isMaxIdLoading, editId, isModalOpen]);

    const handleAddNew = async () => {
        setEditId(null);
        resetForm();
        await refetchMaxId();
        setIsModalOpen(true);
    };

    const columns = [
        {
            header: 'Award Registry ID',
            accessor: 'AwardRegistryTrackerId',
        },
        {
            header: 'Event Name',
            accessor: 'EventMaster_Name',
        },
        {
            header: 'Sponsor Name',
            accessor: 'Sponsor_Name',
        },
        {
            header: 'Deliverables',
            accessor: 'Deliverables',
        },
        {
            header: 'Award Type',
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
                    {/* <button
                        className="p-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-200"
                        onClick={() => openDeleteConfirmModal(row.AwardRegistryTrackerId)}
                        title="Delete"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button> */}
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

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEventChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            Event_Code: selectedOption ? selectedOption.value : ''
        }));
    };

    const handleSponsorChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            SponsorMasterId: selectedOption ? selectedOption.value : ''
        }));
    };

    const handleAwardChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            Award_Code: selectedOption ? selectedOption.value : ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                Event_Code: formData.Event_Code ? Number(formData.Event_Code) : null,
                SponsorMasterId: formData.SponsorMasterId ? Number(formData.SponsorMasterId) : null,
                Deliverabled_Code: formData.Deliverabled_Code ? Number(formData.Deliverabled_Code) : null,
                Deliverable_No: formData.Deliverable_No ? Number(formData.Deliverable_No) : null,
                Award_Code: formData.Award_Code
            };

            if (editId) {
                await updateAwardRegistry({
                    id: Number(editId),
                    ...payload
                }).unwrap();
                showNotification('Award Registry updated successfully!');
            } else {
                await addAwardRegistry({
                    AwardRegistryTrackerId: Number(formData.AwardRegistryTrackerId),
                    ...payload
                }).unwrap();
                showNotification('Award Registry added successfully!');
            }

            resetForm();
            setIsModalOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to save award registry:', error);
            showNotification('Failed to save award registry!', 'error');
        }
    };

    const handleEdit = (row) => {
        setFormData({
            AwardRegistryTrackerId: row.AwardRegistryTrackerId,
            Event_Code: row.Event_Code || '',
            SponsorMasterId: row.SponsorMasterId || '',
            Deliverabled_Code: row.Deliverabled_Code || '',
            Deliverable_No: row.Deliverable_No || '',
            Award_Code: row.Award_Code || ''
        });
        setEditId(row.AwardRegistryTrackerId);
        setIsModalOpen(true);
    };

    const openDeleteConfirmModal = (id) => {
        setAwardRegistryIdToDelete(id);
        setIsConfirmDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (awardRegistryIdToDelete) {
            try {
                await deleteAwardRegistry(Number(awardRegistryIdToDelete)).unwrap();
                showNotification('Award Registry deleted successfully!');
                refetch();
            } catch (error) {
                console.error('Failed to delete award registry:', error);
                showNotification('Failed to delete award registry!', 'error');
            } finally {
                setIsConfirmDeleteModalOpen(false);
                setAwardRegistryIdToDelete(null);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            AwardRegistryTrackerId: '',
            Event_Code: '',
            SponsorMasterId: '',
            Deliverabled_Code: '',
            Deliverable_No: '',
            Award_Code: ''
        });
        setEditId(null);
    };

    const eventOptions = events.map(event => ({
        value: event.EventMasterId,
        label: `${event.EventMasterId} - ${event.EventMaster_Name}`
    }));

    const sponsorOptions = sponsors.map(sponsor => ({
        value: sponsor.SponsorMasterId.toString(),
        label: `${sponsor.SponsorMasterId} - ${sponsor.Sponsor_Name}`
    }));

    const awardOptions = awards.map(award => ({
        value: award.AwardId,
        label: award.Award_Name
    }));

    const selectedEvent = eventOptions.find(option =>
        option.value === formData.Event_Code
    );

    const selectedSponsor = sponsorOptions.find(option =>
        option.value === formData.SponsorMasterId?.toString()
    );

    const selectedAward = awardOptions.find(option =>
        option.value === formData.Award_Code
    );

    if (isTableLoading || isEventsLoading || isSponsorsLoading || isAwardsLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto" />

            <p className="text-gray-700 text-lg font-medium">
                Loading
                <span className="inline-block animate-pulse ml-1 text-blue-600">...</span>
            </p>
        </div>
    </div>;

    if (isError) return <div>Error loading award registry</div>;

    return (
        <>
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
                // headerContent={<CreateNewButton onClick={handleAddNew} />}
                title="Awards Registry & Tracker - Sponsors"
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
                title={editId ? 'Edit Award Registry' : 'Add New Award Registry'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Award Registry ID
                            </label>
                            <input
                                type="text"
                                name="AwardRegistryTrackerId"
                                value={formData.AwardRegistryTrackerId}
                                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
                                readOnly
                            />
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Event Code</label>
                            <Select
                                options={eventOptions}
                                value={selectedEvent}
                                onChange={handleEventChange}
                                placeholder="Select an event..."
                                isSearchable
                                required
                                className="basic-single"
                                classNamePrefix="select"
                                isDisabled
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

                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Deliverable Code</label>
                            <input
                                type="number"
                                name="Deliverabled_Code"
                                value={formData.Deliverabled_Code}
                                onChange={handleInputChange}
                                autoComplete='off'
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Deliverable No</label>
                            <input
                                type="number"
                                name="Deliverable_No"
                                value={formData.Deliverable_No}
                                onChange={handleInputChange}
                                autoComplete='off'
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            />
                        </div> */}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sponsor</label>
                        <Select
                            options={sponsorOptions}
                            value={selectedSponsor}
                            onChange={handleSponsorChange}
                            placeholder="Select a sponsor..."
                            isSearchable
                            required
                            className="basic-single"
                            classNamePrefix="select"
                            isDisabled
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Award Type</label>
                        <Select
                            options={awardOptions}
                            value={selectedAward}
                            onChange={handleAwardChange}
                            placeholder="Select an award type..."
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
                        Are you sure you want to delete this award registry record?
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
        </>
    );
}

export default AwardRegistryTracker;