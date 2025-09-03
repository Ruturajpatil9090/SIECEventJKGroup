// import { useState, useEffect } from 'react';
// import TableUtility from "../../common/TableUtility/TableUtility";
// import { PencilSquareIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
// import { Trash2 } from 'lucide-react';
// import Modal from '../../common/Modal/Modal';
// import {
//     useGetExpoRegistryQuery,
//     useGetMaxExpoRegistryIdQuery,
//     useAddExpoRegistryMutation,
//     useUpdateExpoRegistryMutation,
//     useDeleteExpoRegistryMutation
// } from '../../services/expoRegistryApi';
// import {
//     useGetEventMastersQuery,
// } from '../../services/eventMasterApi';
// import {
//     useGetSponsorsQuery,
// } from '../../services/sponsorMasterApi';
// import {
//     useGetSlotMastersQuery,
//     useUpdateSlotMasterMutation,
// } from '../../services/slotMasterApi'; 
// import CreateNewButton from "../../common/Buttons/AddButton";
// import Select from 'react-select';

// function ExpoRegistryTracker() {
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
//     const [expoRegistryIdToDelete, setExpoRegistryIdToDelete] = useState(null);
//     const [formData, setFormData] = useState({
//         ExpoRegistryTrackerId: '',
//         Deliverabled_Code: '',
//         Deliverable_No: '',
//         SponsorMasterId: '',
//         Event_Code: '',
//         Booth_to_be_provided: '',
//         Booth_Assigned: '',
//         Booth_Number_Assigned: [], 
//         Logo_Details_Received: '',
//         Notes_Comments: ''
//     });

//     const [originalBooths, setOriginalBooths] = useState([]);
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
//     } = useGetExpoRegistryQuery({ event_code: sessionStorage.getItem("Event_Code") });

//     const {
//         data: maxExpoRegistryId = 0,
//         isLoading: isMaxIdLoading,
//         refetch: refetchMaxId
//     } = useGetMaxExpoRegistryIdQuery();

//     const {
//         data: events = [],
//         isLoading: isEventsLoading
//     } = useGetEventMastersQuery();

//     const {
//         data: sponsors = [],
//         isLoading: isSponsorsLoading
//     } = useGetSponsorsQuery({ event_code: sessionStorage.getItem("Event_Code")});

//     const {
//         data: slots = [],
//         isLoading: isSlotsLoading,
//         refetch: refetchSlots 
//     } = useGetSlotMastersQuery();

//     const [addExpoRegistry] = useAddExpoRegistryMutation();
//     const [updateExpoRegistry] = useUpdateExpoRegistryMutation();
//     const [deleteExpoRegistry] = useDeleteExpoRegistryMutation();
//     const [updateSlotMaster] = useUpdateSlotMasterMutation();

//     const showNotification = (message, type = 'success') => {
//         setNotification({ show: true, message, type });
//         setTimeout(() => {
//             setNotification({ ...notification, show: false });
//         }, 3000);
//     };

//     useEffect(() => {
//         if (!editId && !isMaxIdLoading && isModalOpen) {
//             const nextId = maxExpoRegistryId + 1;
//             setFormData(prev => ({
//                 ...prev,
//                 ExpoRegistryTrackerId: nextId.toString()
//             }));
//         }
//     }, [maxExpoRegistryId, isMaxIdLoading, editId, isModalOpen]);

//     const handleAddNew = async () => {
//         setEditId(null);
//         resetForm();
//         await refetchMaxId();
//         setIsModalOpen(true);
//     };

//     const columns = [
//         {
//             header: 'Expo Registry ID',
//             accessor: 'ExpoRegistryTrackerId',
//         },
//         {
//             header: 'Event Name',
//             accessor: 'EventMaster_Name',
//         },
//         {
//             header: 'Sponsor Name',
//             accessor: 'Sponsor_Name',
//         },
//         {
//             header: 'Deliverables',
//             accessor: 'Deliverables',
//         },

//         {
//             header: 'Booth to be Provided',
//             accessor: 'Booth_to_be_provided',
//             cellRenderer: (row) => row.Booth_to_be_provided === 'Y' ? 'Yes' : 'No'
//         },
//         {
//             header: 'Booth Assigned',
//             accessor: 'Booth_Assigned',
//             cellRenderer: (row) => row.Booth_Assigned === 'Y' ? 'Yes' : 'No'
//         },
//         {
//             header: 'Booth Number',
//             accessor: 'Booth_Number_Assigned',
//         },
//         {
//             header: 'Logo Details Received',
//             accessor: 'Logo_Details_Received',
//             cellRenderer: (row) => row.Logo_Details_Received === 'Y' ? 'Yes' : 'No'
//         },
//         {
//             header: 'Notes/Comments',
//             accessor: 'Notes_Comments',
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
//                     {/* <button
//                         className="p-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-200"
//                         onClick={() => openDeleteConfirmModal(row.ExpoRegistryTrackerId)}
//                         title="Delete"
//                     >
//                         <Trash2 className="h-5 w-5" />
//                     </button> */}
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

//     const handleSelectChange = (name, value) => {
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     const handleEventChange = (selectedOption) => {
//         setFormData(prev => ({
//             ...prev,
//             Event_Code: selectedOption ? selectedOption.value : ''
//         }));
//     };

//     const handleSponsorChange = (selectedOption) => {
//         setFormData(prev => ({
//             ...prev,
//             SponsorMasterId: selectedOption ? selectedOption.value : ''
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
        
//         try {
//             const deliverabledCode = formData.Deliverabled_Code ? Number(formData.Deliverabled_Code) : 31;
        
//             const expoPayload = {
//                 Deliverabled_Code: deliverabledCode,
//                 Deliverable_No: formData.Deliverable_No ? Number(formData.Deliverable_No) : null,
//                 SponsorMasterId: formData.SponsorMasterId ? Number(formData.SponsorMasterId) : null,
//                 Event_Code: formData.Event_Code,
//                 Booth_to_be_provided: formData.Booth_to_be_provided,
//                 Booth_Assigned: formData.Booth_Assigned,
//                 Booth_Number_Assigned: formData.Booth_Number_Assigned.join(','), 
//                 Logo_Details_Received: formData.Logo_Details_Received,
//                 Notes_Comments: formData.Notes_Comments
//             };

//             if (editId) {
//                 await updateExpoRegistry({
//                     id: Number(editId),
//                     ...expoPayload
//                 }).unwrap();
//                 showNotification('Expo Registry updated successfully!');
//             } else {
//                 await addExpoRegistry({
//                     ExpoRegistryTrackerId: Number(formData.ExpoRegistryTrackerId),
//                     ...expoPayload
//                 }).unwrap();
//                 showNotification('Expo Registry added successfully!');
//             }

//             const newBoothSet = new Set(formData.Booth_Number_Assigned.map(Number));
//             const oldBoothSet = new Set(originalBooths.map(Number));

//             const slotsToClear = Array.from(oldBoothSet).filter(id => !newBoothSet.has(id));
//             const slotsToAssign = Array.from(newBoothSet).filter(id => !oldBoothSet.has(id));

//             const sponsorIdForSlot = formData.SponsorMasterId ? Number(formData.SponsorMasterId) : null;

//             for (const slotId of slotsToClear) {
//                 try {
//                     await updateSlotMaster({ id: slotId, SponsorMasterId: null }).unwrap();
//                 } catch (e) { console.error(`Failed to clear slot ${slotId}:`, e); }
//             }

//             if (sponsorIdForSlot) {
//                 for (const slotId of slotsToAssign) {
//                     try {
//                         await updateSlotMaster({ id: slotId, SponsorMasterId: sponsorIdForSlot }).unwrap();
//                     } catch (e) { 
//                         console.error(`Failed to assign slot ${slotId}:`, e); 
//                         showNotification(`Warning: Could not assign slot ${slotId}!`, 'error');
//                     }
//                 }
//             }
            
//             await refetchSlots(); 

//             resetForm();
//             setIsModalOpen(false);
//             refetch(); 

//         } catch (error) {
//             console.error('Failed to save expo registry:', error);
//             showNotification('Failed to save expo registry!', 'error');
//         }
//     };

//     const handleEdit = (row) => {
//         const assignedBooths = row.Booth_Number_Assigned 
//             ? row.Booth_Number_Assigned.toString().split(',').map(s => s.trim()) 
//             : [];
            
//         setFormData({
//             ExpoRegistryTrackerId: row.ExpoRegistryTrackerId.toString(),
//             Deliverabled_Code: row.Deliverabled_Code?.toString() || '',
//             Deliverable_No: row.Deliverable_No?.toString() || '',
//             SponsorMasterId: row.SponsorMasterId?.toString() || '',
//             Event_Code: row.Event_Code || '',
//             Booth_to_be_provided: row.Booth_to_be_provided || '',
//             Booth_Assigned: row.Booth_Assigned || '',
//             Booth_Number_Assigned: assignedBooths,
//             Logo_Details_Received: row.Logo_Details_Received || '',
//             Notes_Comments: row.Notes_Comments || ''
//         });
//         setEditId(row.ExpoRegistryTrackerId);
//         setOriginalBooths(assignedBooths); 
//         setIsModalOpen(true);
//     };

//     const openDeleteConfirmModal = (id) => {
//         setExpoRegistryIdToDelete(id);
//         setIsConfirmDeleteModalOpen(true);
//     };

//     const confirmDelete = async () => {
//         if (expoRegistryIdToDelete) {
//             try {
//                 const recordToDelete = tableData.find(d => d.ExpoRegistryTrackerId === expoRegistryIdToDelete);
                
//                 const slotsToDelete = recordToDelete?.Booth_Number_Assigned
//                     ? recordToDelete.Booth_Number_Assigned.split(',').map(s => Number(s.trim()))
//                     : [];
                
//                 if (slotsToDelete.length > 0) {
//                     for (const slotId of slotsToDelete) {
//                         try {
//                             await updateSlotMaster({ id: slotId, SponsorMasterId: null }).unwrap();
//                         } catch (slotError) {
//                             console.error(`Failed to clear slot ${slotId} during delete:`, slotError);
//                         }
//                     }
//                     await refetchSlots(); 
//                 }

//                 await deleteExpoRegistry(Number(expoRegistryIdToDelete)).unwrap();
//                 showNotification('Expo Registry deleted successfully!');
//                 refetch();
//             } catch (error) {
//                 console.error('Failed to delete expo registry:', error);
//                 showNotification('Failed to delete expo registry!', 'error');
//             } finally {
//                 setIsConfirmDeleteModalOpen(false);
//                 setExpoRegistryIdToDelete(null);
//             }
//         }
//     };

//     const resetForm = () => {
//         setFormData({
//             ExpoRegistryTrackerId: '',
//             Deliverabled_Code: '',
//             Deliverable_No: '',
//             SponsorMasterId: '',
//             Event_Code: '',
//             Booth_to_be_provided: '',
//             Booth_Assigned: '',
//             Booth_Number_Assigned: [], 
//             Logo_Details_Received: '',
//             Notes_Comments: ''
//         });
//         setEditId(null);
//         setOriginalBooths([]); 
//     };


//     const renderSlotGrid = () => {
//         if (isSlotsLoading) return <div className="text-gray-500 text-center py-4">Loading Booths...</div>;

//         const currentAssignedBooth = formData.Booth_Number_Assigned; 
//         const currentSponsorId = formData.SponsorMasterId; 

//         const handleSlotClick = (slotNumber, slotSponsorId) => {
//             const slotNumberStr = slotNumber.toString();
//             const slotSponsorIdStr = slotSponsorId?.toString();
//             const currentBooths = formData.Booth_Number_Assigned;
            
//             const isOccupiedByOther = slotSponsorIdStr && (slotSponsorIdStr !== currentSponsorId);
            
//             if (isOccupiedByOther) {
//                 showNotification(`Booth ${slotNumber} is already assigned to another sponsor.`, 'error');
//                 return;
//             }

//             if (currentBooths.includes(slotNumberStr)) {
//                 setFormData(prev => ({
//                     ...prev,
//                     Booth_Number_Assigned: currentBooths.filter(id => id !== slotNumberStr)
//                 }));
//             } else {
//                 setFormData(prev => ({
//                     ...prev,
//                     Booth_Number_Assigned: [...currentBooths, slotNumberStr]
//                 }));
//             }
//         };
        
//         const sortedSlots = [...slots].sort((a, b) => 
//             (a.SlotMasterId || 0) - (b.SlotMasterId || 0)
//         );

//         return (
//             <div className="grid grid-cols-12 gap-2 p-4 border rounded-lg bg-gray-50 max-h-80 overflow-y-auto">
//                 {sortedSlots.map((slot) => {
//                     const slotIdStr = slot.SlotMasterId?.toString();
//                     const isOccupied = slot.SponsorMasterId !== null && slot.SponsorMasterId !== '';
//                     const isCurrentSelection = currentAssignedBooth.includes(slotIdStr);
                    
//                     const isCurrentSponsorSlot = isOccupied && slot.SponsorMasterId?.toString() === currentSponsorId;
                    
//                     let buttonClass = 'bg-green-500 hover:bg-green-600'; 
//                     let cursorClass = 'cursor-pointer';

//                     if (isCurrentSelection) {
//                         buttonClass = 'bg-blue-600 hover:bg-blue-700 ring-4 ring-blue-300';
//                     } else if (isOccupied && !isCurrentSponsorSlot) {
//                         buttonClass = 'bg-red-500 cursor-not-allowed'; 
//                         cursorClass = 'cursor-not-allowed';
//                     }

//                     return (
//                         <button
//                             key={slot.SlotMasterId}
//                             type="button"
//                             className={`text-white font-semibold py-3 rounded-md shadow-md transition duration-150 transform hover:scale-105 ${buttonClass} ${cursorClass}`}
//                             onClick={() => handleSlotClick(slot.SlotMasterId, slot.SponsorMasterId)}
//                             disabled={isOccupied && !isCurrentSponsorSlot}
//                             title={isOccupied && !isCurrentSponsorSlot ? `Occupied by Sponsor ID: ${slot.SponsorMasterId}` : (isCurrentSelection ? 'Click to deselect' : 'Click to select')}
//                         >
//                             {slot.SlotMasterId}
//                         </button>
//                     );
//                 })}
//             </div>
//         );
//     };


//     const yesNoOptions = [
//         { value: 'Y', label: 'Yes' },
//         { value: 'N', label: 'No' }
//     ];

//     const eventOptions = events.map(event => ({
//         value: event.EventMasterId.toString(),
//         label: `${event.EventMasterId} - ${event.EventMaster_Name}`
//     }));

//     const sponsorOptions = sponsors.map(sponsor => ({
//         value: sponsor.SponsorMasterId.toString(),
//         label: `${sponsor.SponsorMasterId} - ${sponsor.Sponsor_Name}`
//     }));

//     const selectedEvent = eventOptions.find(option =>
//         option.value === formData.Event_Code?.toString()
//     );

//     const selectedSponsor = sponsorOptions.find(option =>
//         option.value === formData.SponsorMasterId?.toString()
//     );

//     const selectedBoothToBeProvided = yesNoOptions.find(option =>
//         option.value === formData.Booth_to_be_provided
//     );

//     const selectedBoothAssigned = yesNoOptions.find(option =>
//         option.value === formData.Booth_Assigned
//     );

//     const selectedLogoDetailsReceived = yesNoOptions.find(option =>
//         option.value === formData.Logo_Details_Received
//     );

//     if (isTableLoading || isEventsLoading || isSponsorsLoading || isSlotsLoading) return <div>Loading...</div>;
//     if (isError) return <div>Error loading expo registry</div>;

//     return (
//         <>
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
//                 title="Expo Registry & Tracker - Sponsors"
//                 columns={columns}
//                 data={tableData}
//                 pageSize={10}
//             />

//             <Modal
//                 isOpen={isModalOpen}
//                 onClose={() => {
//                     setIsModalOpen(false);
//                     resetForm();
//                 }}
//                 title={editId ? 'Edit Expo Registry' : 'Add New Expo Registry'}
//                 size="lg"
//                 width="1200px"
//             >
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Expo Registry ID
//                             </label>
//                             <input
//                                 type="text"
//                                 name="ExpoRegistryTrackerId"
//                                 value={formData.ExpoRegistryTrackerId}
//                                 className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
//                                 readOnly
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Event Code</label>
//                             <Select
//                                 options={eventOptions}
//                                 value={selectedEvent}
//                                 onChange={handleEventChange}
//                                 placeholder="Select an event..."
//                                 isSearchable
//                                 required
//                                 className="basic-single cursor-not-allowed" 
//                                 classNamePrefix="select"
                             
//                                  styles={{ control: (provided) => ({ ...provided, minHeight: '42px', borderColor: '#d1d5db', cursor: 'not-allowed', '&:hover': { borderColor: '#d1d5db' } }), option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? '#2563eb' : 'white', color: state.isSelected ? 'white' : 'black', '&:hover': { backgroundColor: '#2563eb', color: 'white' } }) }}
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Sponsor</label>
//                             <Select
//                                 options={sponsorOptions}
//                                 value={selectedSponsor}
//                                 onChange={handleSponsorChange}
//                                 placeholder="Select a sponsor..."
//                                 isSearchable
//                               className="basic-single cursor-not-allowed" 
//                                 classNamePrefix="select"
//                                   isDisabled 
//                                   styles={{ control: (provided) => ({ ...provided, minHeight: '42px', borderColor: '#d1d5db', '&:hover': { borderColor: '#d1d5db' } }), option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? '#2563eb' : 'white', color: state.isSelected ? 'white' : 'black', '&:hover': { backgroundColor: '#2563eb', color: 'white' } }) }}
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Booth to be Provided</label>
//                             <Select
//                                 options={yesNoOptions}
//                                 value={selectedBoothToBeProvided}
//                                 onChange={(option) => handleSelectChange('Booth_to_be_provided', option?.value || '')}
//                                 placeholder="Select..."
//                                 isSearchable
//                                 className="basic-single"
//                                 classNamePrefix="select"
//                                 styles={{ control: (provided) => ({ ...provided, minHeight: '42px', borderColor: '#d1d5db', '&:hover': { borderColor: '#d1d5db' } }), option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? '#2563eb' : 'white', color: state.isSelected ? 'white' : 'black', '&:hover': { backgroundColor: '#2563eb', color: 'white' } }) }}
//                             />
//                         </div>

//                                   <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Logo Details Received</label>
//                             <Select
//                                 options={yesNoOptions}
//                                 value={selectedLogoDetailsReceived}
//                                 onChange={(option) => handleSelectChange('Logo_Details_Received', option?.value || '')}
//                                 placeholder="Select..."
//                                 isSearchable
//                                 className="basic-single"
//                                 classNamePrefix="select"
//                                 styles={{ control: (provided) => ({ ...provided, minHeight: '42px', borderColor: '#d1d5db', '&:hover': { borderColor: '#d1d5db' } }), option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? '#2563eb' : 'white', color: state.isSelected ? 'white' : 'black', '&:hover': { backgroundColor: '#2563eb', color: 'white' } }) }}
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Booth Assigned</label>
//                             <Select
//                                 options={yesNoOptions}
//                                 value={selectedBoothAssigned}
//                                 onChange={(option) => handleSelectChange('Booth_Assigned', option?.value || '')}
//                                 placeholder="Select..."
//                                 isSearchable
//                                 className="basic-single"
//                                 classNamePrefix="select"
//                                 styles={{ control: (provided) => ({ ...provided, minHeight: '42px', borderColor: '#d1d5db', '&:hover': { borderColor: '#d1d5db' } }), option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? '#2563eb' : 'white', color: state.isSelected ? 'white' : 'black', '&:hover': { backgroundColor: '#2563eb', color: 'white' } }) }}
//                             />
//                         </div>

//                         <div className="md:col-span-2">
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Booth Number Assigned (Multi-Select)</label>
//                             {renderSlotGrid()}
//                             <div className="mt-3 text-sm text-gray-700">
//                                 <p className="mb-1 font-medium">Current Selected Booths: 
//                                     <span className="font-bold text-blue-600 ml-1">
//                                         {formData.Booth_Number_Assigned.join(', ') || 'None'}
//                                     </span>
//                                 </p>
//                                 <p className="text-gray-500">
//                                     <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>Available Slots |
//                                     <span className="inline-block w-3 h-3 bg-red-500 rounded-full mx-2"></span>Occupied by Other Sponsor |
//                                     <span className="inline-block w-3 h-3 bg-blue-600 rounded-full mx-2"></span>Assigns to this Sponsor
//                                 </p>
//                             </div>
//                         </div>

              

//                         <div className="md:col-span-2">
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Notes/Comments</label>
//                             <textarea
//                                 name="Notes_Comments"
//                                 value={formData.Notes_Comments}
//                                 onChange={handleInputChange}
//                                 autoComplete='off'
//                                 rows={3}
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
//                             className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
//                         >
//                             {editId ? 'Update' : 'Save'}
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
//                         Are you sure you want to delete this expo registry record?
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
//         </>
//     );
// }

// export default ExpoRegistryTracker;











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
import {
    useGetSlotMastersQuery,
    useUpdateSlotMasterMutation,
} from '../../services/slotMasterApi';
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
        Booth_Number_Assigned: [],
        Logo_Details_Received: '',
        Notes_Comments: ''
    });

    const [originalBooths, setOriginalBooths] = useState([]);
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
    } = useGetExpoRegistryQuery({ event_code: sessionStorage.getItem("Event_Code") });

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
    } = useGetSponsorsQuery({ event_code: sessionStorage.getItem("Event_Code")});

    const {
        data: slots = [],
        isLoading: isSlotsLoading,
        refetch: refetchSlots
    } = useGetSlotMastersQuery();

    const [addExpoRegistry] = useAddExpoRegistryMutation();
    const [updateExpoRegistry] = useUpdateExpoRegistryMutation();
    const [deleteExpoRegistry] = useDeleteExpoRegistryMutation();
    const [updateSlotMaster] = useUpdateSlotMasterMutation();

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
                    {/* <button
                        className="p-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-200"
                        onClick={() => openDeleteConfirmModal(row.ExpoRegistryTrackerId)}
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
        let newFormData = { ...formData, [name]: value };

        // If 'Booth_Assigned' is set to 'No', clear the assigned booths
        if (name === 'Booth_Assigned' && value === 'N') {
            newFormData = { ...newFormData, Booth_Number_Assigned: [] };
        }

        setFormData(newFormData);
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
            const deliverabledCode = formData.Deliverabled_Code ? Number(formData.Deliverabled_Code) : 31;

            const expoPayload = {
                Deliverabled_Code: deliverabledCode,
                Deliverable_No: formData.Deliverable_No ? Number(formData.Deliverable_No) : null,
                SponsorMasterId: formData.SponsorMasterId ? Number(formData.SponsorMasterId) : null,
                Event_Code: formData.Event_Code,
                Booth_to_be_provided: formData.Booth_to_be_provided,
                Booth_Assigned: formData.Booth_Assigned,
                Booth_Number_Assigned: formData.Booth_Number_Assigned.join(','),
                Logo_Details_Received: formData.Logo_Details_Received,
                Notes_Comments: formData.Notes_Comments
            };

            if (editId) {
                await updateExpoRegistry({
                    id: Number(editId),
                    ...expoPayload
                }).unwrap();
                showNotification('Expo Registry updated successfully!');
            } else {
                await addExpoRegistry({
                    ExpoRegistryTrackerId: Number(formData.ExpoRegistryTrackerId),
                    ...expoPayload
                }).unwrap();
                showNotification('Expo Registry added successfully!');
            }

            const newBoothSet = new Set(formData.Booth_Number_Assigned.map(Number));
            const oldBoothSet = new Set(originalBooths.map(Number));

            const slotsToClear = Array.from(oldBoothSet).filter(id => !newBoothSet.has(id));
            const slotsToAssign = Array.from(newBoothSet).filter(id => !oldBoothSet.has(id));

            const sponsorIdForSlot = formData.SponsorMasterId ? Number(formData.SponsorMasterId) : null;

            for (const slotId of slotsToClear) {
                try {
                    await updateSlotMaster({ id: slotId, SponsorMasterId: null }).unwrap();
                } catch (e) { console.error(`Failed to clear slot ${slotId}:`, e); }
            }

            if (sponsorIdForSlot && formData.Booth_Assigned === 'Y') {
                for (const slotId of slotsToAssign) {
                    try {
                        await updateSlotMaster({ id: slotId, SponsorMasterId: sponsorIdForSlot }).unwrap();
                    } catch (e) {
                        console.error(`Failed to assign slot ${slotId}:`, e);
                        showNotification(`Warning: Could not assign slot ${slotId}!`, 'error');
                    }
                }
            }

            await refetchSlots();

            resetForm();
            setIsModalOpen(false);
            refetch();

        } catch (error) {
            console.error('Failed to save expo registry:', error);
            showNotification('Failed to save expo registry!', 'error');
        }
    };

    const handleEdit = (row) => {
        const assignedBooths = row.Booth_Number_Assigned
            ? row.Booth_Number_Assigned.toString().split(',').map(s => s.trim())
            : [];

        setFormData({
            ExpoRegistryTrackerId: row.ExpoRegistryTrackerId.toString(),
            Deliverabled_Code: row.Deliverabled_Code?.toString() || '',
            Deliverable_No: row.Deliverable_No?.toString() || '',
            SponsorMasterId: row.SponsorMasterId?.toString() || '',
            Event_Code: row.Event_Code || '',
            Booth_to_be_provided: row.Booth_to_be_provided || '',
            Booth_Assigned: row.Booth_Assigned || '',
            Booth_Number_Assigned: assignedBooths,
            Logo_Details_Received: row.Logo_Details_Received || '',
            Notes_Comments: row.Notes_Comments || ''
        });
        setEditId(row.ExpoRegistryTrackerId);
        setOriginalBooths(assignedBooths);
        setIsModalOpen(true);
    };

    const openDeleteConfirmModal = (id) => {
        setExpoRegistryIdToDelete(id);
        setIsConfirmDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (expoRegistryIdToDelete) {
            try {
                const recordToDelete = tableData.find(d => d.ExpoRegistryTrackerId === expoRegistryIdToDelete);

                const slotsToDelete = recordToDelete?.Booth_Number_Assigned
                    ? recordToDelete.Booth_Number_Assigned.split(',').map(s => Number(s.trim()))
                    : [];

                if (slotsToDelete.length > 0) {
                    for (const slotId of slotsToDelete) {
                        try {
                            await updateSlotMaster({ id: slotId, SponsorMasterId: null }).unwrap();
                        } catch (slotError) {
                            console.error(`Failed to clear slot ${slotId} during delete:`, slotError);
                        }
                    }
                    await refetchSlots();
                }

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
            Booth_Number_Assigned: [],
            Logo_Details_Received: '',
            Notes_Comments: ''
        });
        setEditId(null);
        setOriginalBooths([]);
    };


    const renderSlotGrid = () => {
        if (isSlotsLoading) return <div className="text-gray-500 text-center py-4">Loading Booths...</div>;

        const currentAssignedBooth = formData.Booth_Number_Assigned;
        const currentSponsorId = formData.SponsorMasterId;

        const handleSlotClick = (slotNumber, slotSponsorId) => {
            const slotNumberStr = slotNumber.toString();
            const slotSponsorIdStr = slotSponsorId?.toString();
            const currentBooths = formData.Booth_Number_Assigned;

            const isOccupiedByOther = slotSponsorIdStr && (slotSponsorIdStr !== currentSponsorId);

            if (isOccupiedByOther) {
                showNotification(`Booth ${slotNumber} is already assigned to another sponsor.`, 'error');
                return;
            }

            if (currentBooths.includes(slotNumberStr)) {
                setFormData(prev => ({
                    ...prev,
                    Booth_Number_Assigned: currentBooths.filter(id => id !== slotNumberStr)
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    Booth_Number_Assigned: [...currentBooths, slotNumberStr]
                }));
            }
        };

        const sortedSlots = [...slots].sort((a, b) =>
            (a.SlotMasterId || 0) - (b.SlotMasterId || 0)
        );

        return (
            <div className="grid grid-cols-12 gap-2 p-4 border rounded-lg bg-gray-50 max-h-80 overflow-y-auto">
                {sortedSlots.map((slot) => {
                    const slotIdStr = slot.SlotMasterId?.toString();
                    const isOccupied = slot.SponsorMasterId !== null && slot.SponsorMasterId !== '';
                    const isCurrentSelection = currentAssignedBooth.includes(slotIdStr);

                    const isCurrentSponsorSlot = isOccupied && slot.SponsorMasterId?.toString() === currentSponsorId;

                    let buttonClass = 'bg-green-500 hover:bg-green-600';
                    let cursorClass = 'cursor-pointer';

                    if (isCurrentSelection) {
                        buttonClass = 'bg-blue-600 hover:bg-blue-700 ring-4 ring-blue-300';
                    } else if (isOccupied && !isCurrentSponsorSlot) {
                        buttonClass = 'bg-red-500 cursor-not-allowed';
                        cursorClass = 'cursor-not-allowed';
                    }

                    return (
                        <button
                            key={slot.SlotMasterId}
                            type="button"
                            className={`text-white font-semibold py-3 rounded-md shadow-md transition duration-150 transform hover:scale-105 ${buttonClass} ${cursorClass}`}
                            onClick={() => handleSlotClick(slot.SlotMasterId, slot.SponsorMasterId)}
                            disabled={isOccupied && !isCurrentSponsorSlot}
                            title={isOccupied && !isCurrentSponsorSlot ? `Occupied by Sponsor ID: ${slot.SponsorMasterId}` : (isCurrentSelection ? 'Click to deselect' : 'Click to select')}
                        >
                            {slot.SlotMasterId}
                        </button>
                    );
                })}
            </div>
        );
    };


    const yesNoOptions = [
        { value: 'Y', label: 'Yes' },
        { value: 'N', label: 'No' }
    ];

    const eventOptions = events.map(event => ({
        value: event.EventMasterId.toString(),
        label: `${event.EventMasterId} - ${event.EventMaster_Name}`
    }));

    const sponsorOptions = sponsors.map(sponsor => ({
        value: sponsor.SponsorMasterId.toString(),
        label: `${sponsor.SponsorMasterId} - ${sponsor.Sponsor_Name}`
    }));

    const selectedEvent = eventOptions.find(option =>
        option.value === formData.Event_Code?.toString()
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

    if (isTableLoading || isEventsLoading || isSponsorsLoading || isSlotsLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto" />

                <p className="text-gray-700 text-lg font-medium">
                    Loading
                    <span className="inline-block animate-pulse ml-1 text-blue-600">...</span>
                </p>
            </div>
        </div>;
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
                title="Expo Registry & Tracker - Sponsors"
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
                width="1200px"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Event Code</label>
                            <Select
                                options={eventOptions}
                                value={selectedEvent}
                                onChange={handleEventChange}
                                placeholder="Select an event..."
                                isSearchable
                                required
                                className="basic-single cursor-not-allowed"
                                classNamePrefix="select"
                                isDisabled
                                styles={{ control: (provided) => ({ ...provided, minHeight: '42px', borderColor: '#d1d5db', cursor: 'not-allowed', '&:hover': { borderColor: '#d1d5db' } }), option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? '#2563eb' : 'white', color: state.isSelected ? 'white' : 'black', '&:hover': { backgroundColor: '#2563eb', color: 'white' } }) }}
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
                                className="basic-single cursor-not-allowed"
                                classNamePrefix="select"
                                isDisabled
                                styles={{ control: (provided) => ({ ...provided, minHeight: '42px', borderColor: '#d1d5db', '&:hover': { borderColor: '#d1d5db' } }), option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? '#2563eb' : 'white', color: state.isSelected ? 'white' : 'black', '&:hover': { backgroundColor: '#2563eb', color: 'white' } }) }}
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
                                styles={{ control: (provided) => ({ ...provided, minHeight: '42px', borderColor: '#d1d5db', '&:hover': { borderColor: '#d1d5db' } }), option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? '#2563eb' : 'white', color: state.isSelected ? 'white' : 'black', '&:hover': { backgroundColor: '#2563eb', color: 'white' } }) }}
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
                                styles={{ control: (provided) => ({ ...provided, minHeight: '42px', borderColor: '#d1d5db', '&:hover': { borderColor: '#d1d5db' } }), option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? '#2563eb' : 'white', color: state.isSelected ? 'white' : 'black', '&:hover': { backgroundColor: '#2563eb', color: 'white' } }) }}
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
                                styles={{ control: (provided) => ({ ...provided, minHeight: '42px', borderColor: '#d1d5db', '&:hover': { borderColor: '#d1d5db' } }), option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? '#2563eb' : 'white', color: state.isSelected ? 'white' : 'black', '&:hover': { backgroundColor: '#2563eb', color: 'white' } }) }}
                            />
                        </div>
                    </div>

                    {/* Conditional rendering based on formData.Booth_Assigned */}
                    {formData.Booth_Assigned === 'Y' && (
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Booth Number Assigned (Multi-Select)</label>
                            {renderSlotGrid()}
                            <div className="mt-3 text-sm text-gray-700">
                                <p className="mb-1 font-medium">Current Selected Booths:
                                    <span className="font-bold text-blue-600 ml-1">
                                        {formData.Booth_Number_Assigned.join(', ') || 'None'}
                                    </span>
                                </p>
                                <p className="text-gray-500">
                                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>Available Slots |
                                    <span className="inline-block w-3 h-3 bg-red-500 rounded-full mx-2"></span>Occupied by Other Sponsor |
                                    <span className="inline-block w-3 h-3 bg-blue-600 rounded-full mx-2"></span>Assigned to this Sponsor
                                </p>
                            </div>
                        </div>
                    )}


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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