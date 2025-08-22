import { useState, useEffect } from 'react';
import TableUtility from "../../common/TableUtility/TableUtility";
import { PencilSquareIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Trash2 } from 'lucide-react';
import Modal from '../../common/Modal/Modal';
import {
    useGetExpoRegistryQuery,
    useGetMaxExpoRegistryIdQuery,
    useAddExpoRegistryMutation,
    useUpdateExpoRegistryMutation,
    useDeleteExpoRegistryMutation
} from '../../services/expoRegistryApi';
import {
    useGetEventMastersQuery,
} from '../../services/eventMasterApi';
import {
    useGetSponsorsQuery,
} from '../../services/sponsorMasterApi';
import CreateNewButton from "../../common/Buttons/AddButton";
import Select from 'react-select';

function ExpoRegistryTracker() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [expoRegistryIdToDelete, setExpoRegistryIdToDelete] = useState(null);
    const [formData, setFormData] = useState({
        ExpoRegistryTrackerId: '',
        Deliverabled_Code: '',
        Deliverable_No: '',
        SponsorMasterId: '',
        Event_Code: '',
        Booth_to_be_provided: '',
        Booth_Assigned: '',
        Booth_Number_Assigned: '',
        Logo_Details_Received: '',
        Notes_Comments: ''
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
    } = useGetExpoRegistryQuery();

    const {
        data: maxExpoRegistryId = 0,
        isLoading: isMaxIdLoading,
        refetch: refetchMaxId
    } = useGetMaxExpoRegistryIdQuery();

    const {
        data: events = [],
        isLoading: isEventsLoading
    } = useGetEventMastersQuery();

    const {
        data: sponsors = [],
        isLoading: isSponsorsLoading
    } = useGetSponsorsQuery();

    const [addExpoRegistry] = useAddExpoRegistryMutation();
    const [updateExpoRegistry] = useUpdateExpoRegistryMutation();
    const [deleteExpoRegistry] = useDeleteExpoRegistryMutation();

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ ...notification, show: false });
        }, 3000);
    };

    useEffect(() => {
        if (!editId && !isMaxIdLoading && isModalOpen) {
            const nextId = maxExpoRegistryId + 1;
            setFormData(prev => ({
                ...prev,
                ExpoRegistryTrackerId: nextId.toString()
            }));
        }
    }, [maxExpoRegistryId, isMaxIdLoading, editId, isModalOpen]);

    const handleAddNew = async () => {
        setEditId(null);
        resetForm();
        await refetchMaxId();
        setIsModalOpen(true);
    };

    const columns = [
        {
            header: 'Expo Registry ID',
            accessor: 'ExpoRegistryTrackerId',
        },
        {
            header: 'Deliverable Code',
            accessor: 'Deliverabled_Code',
        },
        {
            header: 'Deliverable No',
            accessor: 'Deliverable_No',
        },
        {
            header: 'Sponsor',
            accessor: 'sponsor_name',
        },
        {
            header: 'Event Code',
            accessor: 'Event_Code',
        },
        {
            header: 'Booth to be Provided',
            accessor: 'Booth_to_be_provided',
            cellRenderer: (row) => row.Booth_to_be_provided === 'Y' ? 'Yes' : 'No'
        },
        {
            header: 'Booth Assigned',
            accessor: 'Booth_Assigned',
            cellRenderer: (row) => row.Booth_Assigned === 'Y' ? 'Yes' : 'No'
        },
        {
            header: 'Booth Number',
            accessor: 'Booth_Number_Assigned',
        },
        {
            header: 'Logo Details Received',
            accessor: 'Logo_Details_Received',
            cellRenderer: (row) => row.Logo_Details_Received === 'Y' ? 'Yes' : 'No'
        },
        {
            header: 'Notes/Comments',
            accessor: 'Notes_Comments',
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
                        onClick={() => openDeleteConfirmModal(row.ExpoRegistryTrackerId)}
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                Deliverabled_Code: formData.Deliverabled_Code ? Number(formData.Deliverabled_Code) : null,
                Deliverable_No: formData.Deliverable_No ? Number(formData.Deliverable_No) : null,
                SponsorMasterId: formData.SponsorMasterId ? Number(formData.SponsorMasterId) : null,
                Event_Code: formData.Event_Code,
                Booth_to_be_provided: formData.Booth_to_be_provided,
                Booth_Assigned: formData.Booth_Assigned,
                Booth_Number_Assigned: formData.Booth_Number_Assigned ? Number(formData.Booth_Number_Assigned) : null,
                Logo_Details_Received: formData.Logo_Details_Received,
                Notes_Comments: formData.Notes_Comments
            };

            if (editId) {
                await updateExpoRegistry({
                    id: Number(editId),
                    ...payload
                }).unwrap();
                showNotification('Expo Registry updated successfully!');
            } else {
                await addExpoRegistry({
                    ExpoRegistryTrackerId: Number(formData.ExpoRegistryTrackerId),
                    ...payload
                }).unwrap();
                showNotification('Expo Registry added successfully!');
            }

            resetForm();
            setIsModalOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to save expo registry:', error);
            showNotification('Failed to save expo registry!', 'error');
        }
    };

    const handleEdit = (row) => {
        setFormData({
            ExpoRegistryTrackerId: row.ExpoRegistryTrackerId.toString(),
            Deliverabled_Code: row.Deliverabled_Code?.toString() || '',
            Deliverable_No: row.Deliverable_No?.toString() || '',
            SponsorMasterId: row.SponsorMasterId?.toString() || '',
            Event_Code: row.Event_Code || '',
            Booth_to_be_provided: row.Booth_to_be_provided || '',
            Booth_Assigned: row.Booth_Assigned || '',
            Booth_Number_Assigned: row.Booth_Number_Assigned?.toString() || '',
            Logo_Details_Received: row.Logo_Details_Received || '',
            Notes_Comments: row.Notes_Comments || ''
        });
        setEditId(row.ExpoRegistryTrackerId);
        setIsModalOpen(true);
    };

    const openDeleteConfirmModal = (id) => {
        setExpoRegistryIdToDelete(id);
        setIsConfirmDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (expoRegistryIdToDelete) {
            try {
                await deleteExpoRegistry(Number(expoRegistryIdToDelete)).unwrap();
                showNotification('Expo Registry deleted successfully!');
                refetch();
            } catch (error) {
                console.error('Failed to delete expo registry:', error);
                showNotification('Failed to delete expo registry!', 'error');
            } finally {
                setIsConfirmDeleteModalOpen(false);
                setExpoRegistryIdToDelete(null);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            ExpoRegistryTrackerId: '',
            Deliverabled_Code: '',
            Deliverable_No: '',
            SponsorMasterId: '',
            Event_Code: '',
            Booth_to_be_provided: '',
            Booth_Assigned: '',
            Booth_Number_Assigned: '',
            Logo_Details_Received: '',
            Notes_Comments: ''
        });
        setEditId(null);
    };

    const yesNoOptions = [
        { value: 'Y', label: 'Yes' },
        { value: 'N', label: 'No' }
    ];

    const eventOptions = events.map(event => ({
        value: event.EventMasterId,
        label: `${event.EventMasterId} - ${event.EventMaster_Name}`
    }));

    const sponsorOptions = sponsors.map(sponsor => ({
        value: sponsor.SponsorMasterId.toString(),
        label: `${sponsor.SponsorMasterId} - ${sponsor.Sponsor_Name}`
    }));

    const selectedEvent = eventOptions.find(option =>
        option.value === formData.Event_Code
    );

    const selectedSponsor = sponsorOptions.find(option =>
        option.value === formData.SponsorMasterId?.toString()
    );

    const selectedBoothToBeProvided = yesNoOptions.find(option =>
        option.value === formData.Booth_to_be_provided
    );

    const selectedBoothAssigned = yesNoOptions.find(option =>
        option.value === formData.Booth_Assigned
    );

    const selectedLogoDetailsReceived = yesNoOptions.find(option =>
        option.value === formData.Logo_Details_Received
    );

    if (isTableLoading || isEventsLoading || isSponsorsLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading expo registry</div>;

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
                title="Expo Registry Tracker"
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
                title={editId ? 'Edit Expo Registry' : 'Add New Expo Registry'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Expo Registry ID
                            </label>
                            <input
                                type="text"
                                name="ExpoRegistryTrackerId"
                                value={formData.ExpoRegistryTrackerId}
                                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
                                readOnly
                            />
                        </div>

                        <div>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sponsor</label>
                            <Select
                                options={sponsorOptions}
                                value={selectedSponsor}
                                onChange={handleSponsorChange}
                                placeholder="Select a sponsor..."
                                isSearchable
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Booth to be Provided</label>
                            <Select
                                options={yesNoOptions}
                                value={selectedBoothToBeProvided}
                                onChange={(option) => handleSelectChange('Booth_to_be_provided', option?.value || '')}
                                placeholder="Select..."
                                isSearchable
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Booth Assigned</label>
                            <Select
                                options={yesNoOptions}
                                value={selectedBoothAssigned}
                                onChange={(option) => handleSelectChange('Booth_Assigned', option?.value || '')}
                                placeholder="Select..."
                                isSearchable
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Booth Number Assigned</label>
                            <input
                                type="number"
                                name="Booth_Number_Assigned"
                                value={formData.Booth_Number_Assigned}
                                onChange={handleInputChange}
                                autoComplete='off'
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Logo Details Received</label>
                            <Select
                                options={yesNoOptions}
                                value={selectedLogoDetailsReceived}
                                onChange={(option) => handleSelectChange('Logo_Details_Received', option?.value || '')}
                                placeholder="Select..."
                                isSearchable
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

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes/Comments</label>
                            <textarea
                                name="Notes_Comments"
                                value={formData.Notes_Comments}
                                onChange={handleInputChange}
                                autoComplete='off'
                                rows={3}
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
                        Are you sure you want to delete this expo registry record?
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

export default ExpoRegistryTracker;