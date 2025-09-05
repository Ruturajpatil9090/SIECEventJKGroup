import { useState, useEffect } from 'react';
import TableUtility from "../../common/TableUtility/TableUtility";
import { PencilSquareIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Trash2 } from 'lucide-react';
import Select from 'react-select';
import Modal from '../../common/Modal/Modal';
import { getCurrentDate } from '../../common/Functions/GetCurrentdate';
import { EyeIcon } from '@heroicons/react/24/outline';
import {
    useGetMinisterialSessionsQuery,
    useGetMinisterialSessionByIdQuery,
    useGetMaxMinisterialSessionIdQuery,
    useGetMinisterialSessionsByEventCodeQuery,
    useGetMinisterialSessionsBySponsorQuery,
    useGetMinisterialSessionsByTrackQuery,
    useAddMinisterialSessionMutation,
    useUpdateMinisterialSessionMutation,
    useDeleteMinisterialSessionMutation,
    useGetMinisterialSessionDetailsByIdQuery
} from '../../services/ministerialSessionApi';
import {
    useGetEventMastersQuery,
} from '../../services/eventMasterApi';
import {
    useGetSponsorsQuery,
} from '../../services/sponsorMasterApi';
import MinisterialSessionDetailView from '../ViewDetails/MinisterialSessionDetailView';
import CreateNewButton from "../../common/Buttons/AddButton";

function MinisterialSessionTracker() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [ministerialSessionIdToDelete, setMinisterialSessionIdToDelete] = useState(null);
    const [formData, setFormData] = useState({
        MinisterialSessionId: '',
        Event_Code: '',
        SponsorMasterId: '',
        Speaker_Name: '',
        designation: '',
        Mobile_No: '',
        Email_Address: '',
        MinisterialSession_Bio: '',
        Speaking_Date: getCurrentDate(),
        Track: '',
        Invitation_Sent: 'N'
    });
    const [editId, setEditId] = useState(null);
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    const [selectedEventDates, setSelectedEventDates] = useState({
        startDate: '',
        endDate: ''
    });

    const {
        data: tableData = [],
        isLoading: isTableLoading,
        isError,
        refetch
    } = useGetMinisterialSessionsQuery({ event_code: sessionStorage.getItem("Event_Code") });

    const {
        data: maxMinisterialSessionId = 0,
        isLoading: isMaxIdLoading,
        refetch: refetchMaxId
    } = useGetMaxMinisterialSessionIdQuery();

    const {
        data: events = [],
        isLoading: isEventsLoading
    } = useGetEventMastersQuery();

    const {
        data: sponsors = [],
        isLoading: isSponsorsLoading
    } = useGetSponsorsQuery({ event_code: sessionStorage.getItem("Event_Code") });

    const [addMinisterialSession] = useAddMinisterialSessionMutation();
    const [updateMinisterialSession] = useUpdateMinisterialSessionMutation();
    const [deleteMinisterialSession] = useDeleteMinisterialSessionMutation();


    //Detail popup view open 
    const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
    const [selectedRecordId, setSelectedRecordId] = useState(null);
    const [selectedRecordDetails, setSelectedRecordDetails] = useState([]);
    const [selectedMainData, setSelectedMainData] = useState(null);

    const { data: detailData, isLoading: isDetailLoading, refetch: refetchDetails } =
        useGetMinisterialSessionDetailsByIdQuery(selectedRecordId, {
            skip: !selectedRecordId
        });


    const handleShowPopup = async (row) => {
        setSelectedRecordId(row.MinisterialSessionId);
        setSelectedMainData(row);
        setIsDetailViewOpen(true);
    };


    useEffect(() => {
        if (detailData && selectedRecordId) {
            setSelectedRecordDetails(detailData);
        }
    }, [detailData, selectedRecordId]);



    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ ...notification, show: false });
        }, 3000);
    };

    useEffect(() => {
        if (!editId && !isMaxIdLoading && isModalOpen) {
            const nextId = maxMinisterialSessionId + 1;
            setFormData(prev => ({
                ...prev,
                MinisterialSessionId: nextId.toString()
            }));
        }
    }, [maxMinisterialSessionId, isMaxIdLoading, editId, isModalOpen]);


    useEffect(() => {
        if (formData.Event_Code) {
            const selectedEvent = events.find(event =>
                event.EventMasterId === Number(formData.Event_Code)
            );

            if (selectedEvent) {
                setSelectedEventDates({
                    startDate: selectedEvent.Start_Date,
                    endDate: selectedEvent.End_Date
                });
                if (formData.Speaking_Date) {
                    const speakingDate = new Date(formData.Speaking_Date);
                    const startDate = new Date(selectedEvent.Start_Date);
                    const endDate = new Date(selectedEvent.End_Date);

                    if (speakingDate < startDate || speakingDate > endDate) {
                        setFormData(prev => ({
                            ...prev,
                            Speaking_Date: selectedEvent.Start_Date
                        }));
                    }
                }
            }
        }
    }, [formData.Event_Code, events, formData.Speaking_Date]);

    const handleAddNew = async () => {
        setEditId(null);
        resetForm();
        await refetchMaxId();
        setIsModalOpen(true);
    };


    const invitationSentOption = [
        { value: 'Y', label: 'Yes' },
        { value: 'N', label: 'No' }
    ];

    const columns = [
        {
            header: 'Ministerial Session ID',
            accessor: 'MinisterialSessionId',
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
            header: 'Speaker Name',
            accessor: 'Speaker_Name',
        },
        {
            header: 'Designation',
            accessor: 'designation',
        },
        // {
        //     header: 'Ministry',
        //     accessor: 'Track',
        // },
        // {
        //     header: 'Invitation Sent',
        //     accessor: 'Invitation_Sent',
        // },
        // {
        //     header: 'Speaking Date',
        //     accessor: 'Speaking_Date',
        //     cellRenderer: (row) => {
        //         if (!row.Speaking_Date) return '-';
        //         const date = new Date(row.Speaking_Date);
        //         return date.toLocaleDateString();
        //     }
        // },
        {
            header: 'Action',
            accessor: 'action',
            isAction: true,
            className: 'text-center',
            actionRenderer: (row) => (
                <div className="flex justify-center space-x-3">
                    <button
                        className="p-2 text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors duration-200"
                        onClick={() => handleShowPopup(row)}
                        title="View Details"
                    >
                        <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                        className="p-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
                        onClick={() => handleEdit(row)}
                        title="Edit"
                    >
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    {/* <button
                        className="p-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-200"
                        onClick={() => openDeleteConfirmModal(row.MinisterialSessionId)}
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


    const handleSelectInvitationChange = (selectInvitationsent) => {
        setFormData(prev => ({
            ...prev,
            Invitation_Sent: selectInvitationsent ? selectInvitationsent.value : ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                Event_Code: formData.Event_Code ? Number(formData.Event_Code) : null,
                SponsorMasterId: formData.SponsorMasterId ? Number(formData.SponsorMasterId) : null,
                Speaker_Name: formData.Speaker_Name,
                designation: formData.designation,
                Mobile_No: formData.Mobile_No,
                Email_Address: formData.Email_Address,
                MinisterialSession_Bio: formData.MinisterialSession_Bio,
                Speaking_Date: formData.Speaking_Date,
                Track: formData.Track,
                Invitation_Sent: formData.Invitation_Sent
            };

            if (editId) {
                await updateMinisterialSession({
                    id: Number(editId),
                    ...payload
                }).unwrap();
                showNotification('Ministerial Session updated successfully!');
            } else {
                await addMinisterialSession({
                    MinisterialSessionId: Number(formData.MinisterialSessionId),
                    ...payload
                }).unwrap();
                showNotification('Ministerial Session added successfully!');
            }

            resetForm();
            setIsModalOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to save ministerial session:', error);
            showNotification('Failed to save ministerial session!', 'error');
        }
    };

    const handleEdit = (row) => {
        setFormData({
            MinisterialSessionId: row.MinisterialSessionId,
            Event_Code: row.Event_Code || '',
            SponsorMasterId: row.SponsorMasterId || '',
            Speaker_Name: row.Speaker_Name || '',
            designation: row.designation || '',
            Mobile_No: row.Mobile_No || '',
            Email_Address: row.Email_Address || '',
            MinisterialSession_Bio: row.MinisterialSession_Bio || '',
            Speaking_Date: row.Speaking_Date ? getCurrentDate() : getCurrentDate(),
            Track: row.Track || '',
            Invitation_Sent: row.Invitation_Sent || ''
        });
        setEditId(row.MinisterialSessionId);
        setIsModalOpen(true);
    };

    const openDeleteConfirmModal = (id) => {
        setMinisterialSessionIdToDelete(id);
        setIsConfirmDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (ministerialSessionIdToDelete) {
            try {
                await deleteMinisterialSession(Number(ministerialSessionIdToDelete)).unwrap();
                showNotification('Ministerial Session deleted successfully!');
                refetch();
            } catch (error) {
                console.error('Failed to delete ministerial session:', error);
                showNotification('Failed to delete ministerial session!', 'error');
            } finally {
                setIsConfirmDeleteModalOpen(false);
                setMinisterialSessionIdToDelete(null);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            MinisterialSessionId: '',
            Event_Code: '',
            SponsorMasterId: '',
            Speaker_Name: '',
            designation: '',
            Mobile_No: '',
            Email_Address: '',
            MinisterialSession_Bio: '',
            Speaking_Date: getCurrentDate(),
            Track: '',
            Invitation_Sent: 'N'
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

    const selectedEvent = eventOptions.find(option =>
        option.value === formData.Event_Code
    );

    const selectedSponsor = sponsorOptions.find(option =>
        option.value === formData.SponsorMasterId?.toString()
    );

    const selectInvitationsent = invitationSentOption.find(option =>
        option.value === formData.Invitation_Sent
    );

    if (isTableLoading || isEventsLoading || isSponsorsLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto" />

            <p className="text-gray-700 text-lg font-medium">
                Loading
                <span className="inline-block animate-pulse ml-1 text-blue-600">...</span>
            </p>
        </div>
    </div>;
    if (isError) return <div>Error loading ministerial sessions</div>;

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
                title="Ministerial RoundTable Sessions"
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
                title={editId ? 'Edit Ministerial Session' : 'Add New Ministerial Session'}
                width="800px"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ministerial Session ID
                            </label>
                            <input
                                type="text"
                                name="MinisterialSessionId"
                                value={formData.MinisterialSessionId}
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

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Speaker Name</label>
                            <input
                                type="text"
                                name="Speaker_Name"
                                value={formData.Speaker_Name}
                                onChange={handleInputChange}
                                autoComplete='off'
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                            <input
                                type="text"
                                name="designation"
                                value={formData.designation}
                                onChange={handleInputChange}
                                autoComplete='off'
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                required
                            />
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Invitation Sent</label>
                            <Select
                                options={invitationSentOption}
                                value={selectInvitationsent}
                                onChange={handleSelectInvitationChange}
                                placeholder="Select a Invitation..."
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



                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No</label>
                            <input
                                type="text"
                                name="Mobile_No"
                                value={formData.Mobile_No}
                                onChange={handleInputChange}
                                autoComplete='off'
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                name="Email_Address"
                                value={formData.Email_Address}
                                onChange={handleInputChange}
                                autoComplete='off'
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea
                            name="MinisterialSession_Bio"
                            value={formData.MinisterialSession_Bio}
                            onChange={handleInputChange}
                            rows={3}
                            autoComplete='off'
                            data-gramm="false"
                            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Speaking Date</label>
                            <input
                                type="date"
                                name="Speaking_Date"
                                value={formData.Speaking_Date}
                                onChange={handleInputChange}
                                min={selectedEventDates.startDate}
                                max={selectedEventDates.endDate}
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                required
                            />
                            {selectedEventDates.startDate && selectedEventDates.endDate && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Must be between {new Date(selectedEventDates.startDate).toLocaleDateString()}
                                    and {new Date(selectedEventDates.endDate).toLocaleDateString()}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ministry</label>
                            <input
                                type="text"
                                name="Track"
                                value={formData.Track}
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
                isOpen={isConfirmDeleteModalOpen}
                onClose={() => setIsConfirmDeleteModalOpen(false)}
                title="Confirm Deletion"
            >
                <div className="p-4">
                    <p className="text-gray-700 text-lg mb-4">
                        Are you sure you want to delete this ministerial session record?
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

            <MinisterialSessionDetailView
                isOpen={isDetailViewOpen}
                onClose={() => {
                    setIsDetailViewOpen(false);
                    setSelectedRecordId(null);
                    setSelectedRecordDetails([]);
                    setSelectedMainData(null);
                }}
                details={selectedRecordDetails}
                mainData={selectedMainData}
            />
        </>
    );
}

export default MinisterialSessionTracker;