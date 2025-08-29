// import React, { useState, useEffect, useMemo } from 'react';
// import Select from 'react-select';
// import TableUtility from "../../common/TableUtility/TableUtility";
// import { PencilSquareIcon } from '@heroicons/react/24/outline';
// import { Trash2 } from 'lucide-react';
// import Modal from '../../common/Modal/Modal';
// import {
//     useGetSponsorsQuery,
//     useAddSponsorMutation,
//     useUpdateSponsorMutation,
//     useDeleteSponsorMutation,
//     useGetMaxSponsorIdQuery,
// } from '../../services/sponsorMasterApi';
// import {
//     useGetEventMastersQuery,
// } from '../../services/eventMasterApi';
// import {
//     useGetCategoryMasterQuery,
// } from '../../services/categoryMasterApi';
// import {
//     useGetCategorySubMasterQuery,
// } from '../../services/categorySubMasterApi';
// import {
//     useGetDeliverablesQuery,
// } from '../../services/deliverablesApi';
// import { useLazyGetFilteredCategoryWiseDeliverablesQuery } from "../../services/categoryWiseDeliverableMasterApi"
// import CreateNewButton from "../../common/Buttons/AddButton";

// function SponsorMaster() {
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
//     const [itemToDelete, setItemToDelete] = useState(null);
//     const initialFormdata = {
//         SponsorMasterId: '',
//         Sponsor_Name: '',
//         Event_Code: '',
//         CategoryMaster_Code: '',
//         CategorySubMaster_Code: '',
//         Proposal_Sent: '',
//         Approval_Received: '',
//         Sponsorship_Amount: '',
//         Payment_Status: '',
//         Proforma_Invoice_Sent: '',
//         Final_Invoice_Sent: '',
//         GST_Details_Received: '',
//         Contact_Person: '',
//         Contact_Email: '',
//         Contact_Phone: '',
//         Notes: '',
//         Address: '',
//         CIN: '',
//         Sponsor_Deliverables_Tracker: '',
//         Website: '',
//         Awards_Registry_Tracker: '',
//         Category_Sponsors: '',
//         Designation: '',
//         Expo_Registry: '',
//         GST: '',
//         Passes_Registry_Tracker: '',
//         Sponsor_Speakers: '',
//         Networking_Table_Slots_Tracker: '',
//         details: []
//     }
//     const [formData, setFormData] = useState(initialFormdata);
//     const [editId, setEditId] = useState(null);
//     const [selectedDeliverablesInModal, setSelectedDeliverablesInModal] = useState([]);

//     const { data: tableData = [], isLoading: isTableLoading, isError, refetch } = useGetSponsorsQuery();
//     const { data: events = [], isLoading: isEventsLoading } = useGetEventMastersQuery();
//     const { data: categories = [], isLoading: isCategoriesLoading } = useGetCategoryMasterQuery();
//     const { data: subCategories = [], refetch: refetchSubCategories, isLoading: isSubCategoriesLoading } = useGetCategorySubMasterQuery();
//     const { data: allDeliverables = [], isLoading: isDeliverablesLoading } = useGetDeliverablesQuery();

//     const [triggerGetFilteredDeliverables, { data: filteredDeliverables = [], isLoading: isFilteredDeliverablesLoading }] =
//         useLazyGetFilteredCategoryWiseDeliverablesQuery();

//     const { data: maxSponsorId, isLoading: isMaxIdLoading, refetch: refetchMaxId } = useGetMaxSponsorIdQuery();

//     const [addSponsor] = useAddSponsorMutation();
//     const [updateSponsor] = useUpdateSponsorMutation();
//     const [deleteSponsor] = useDeleteSponsorMutation();

//     useEffect(() => {
//         if (!editId && isModalOpen && !isMaxIdLoading) {
//             const nextId = (typeof maxSponsorId === 'number' ? maxSponsorId : 0) + 1;
//             setFormData(prev => ({
//                 ...prev,
//                 SponsorMasterId: nextId
//             }));
//         }
//     }, [maxSponsorId, isMaxIdLoading, editId, isModalOpen]);


//     useEffect(() => {
//         const fetchAndCheckDeliverables = async () => {
//             if (editId === null && formData.Event_Code && formData.CategoryMaster_Code && formData.CategorySubMaster_Code) {
//                 try {
//                     const result = await triggerGetFilteredDeliverables({
//                         event_code: formData.Event_Code,
//                         category_master_code: formData.CategoryMaster_Code,
//                         category_sub_master_code: formData.CategorySubMaster_Code
//                     }).unwrap();

//                     const allDeliverableCodes = result.flatMap(master =>
//                         master.details.map(detail => detail.Deliverabled_Code)
//                     );

//                     setSelectedDeliverablesInModal(allDeliverableCodes);
//                 } catch (error) {
//                     console.error('Error fetching filtered deliverables:', error);
//                     setSelectedDeliverablesInModal([]);
//                 }
//             } else if (editId === null) {
//                 setSelectedDeliverablesInModal([]);
//             }
//         };

//         const timeoutId = setTimeout(fetchAndCheckDeliverables, 300);
//         return () => clearTimeout(timeoutId);
//     }, [formData.Event_Code, formData.CategoryMaster_Code, formData.CategorySubMaster_Code, editId, triggerGetFilteredDeliverables]);

//     useEffect(() => {
//         if (editId && isModalOpen) {
//             const selectedRow = tableData.find(row => row.SponsorMasterId === editId);
//             if (selectedRow) {

//                 setFormData(selectedRow);
//                 const existingDeliverableCodes = Array.isArray(selectedRow.details)
//                     ? selectedRow.details.map(d => d.Deliverabled_Code)
//                     : [];
//                 setSelectedDeliverablesInModal(existingDeliverableCodes);
//             }
//         }
//     }, [editId, isModalOpen, tableData]);


//     const groupedDeliverables = useMemo(() => {
//         return allDeliverables.reduce((acc, current) => {
//             const { Category } = current;
//             if (!acc[Category]) {
//                 acc[Category] = [];
//             }
//             acc[Category].push(current);
//             return acc;
//         }, {});
//     }, [allDeliverables]);

//     useEffect(() => {
//         if (formData.CategoryMaster_Code) {
//             refetchSubCategories();
//         }
//     }, [formData.CategoryMaster_Code, refetchSubCategories]);

//     const [selectedOptions, setSelectedOptions] = useState({
//         event: null,
//         category: null,
//         subCategory: null,
//     });

//     const eventOptions = useMemo(() => events.map(event => ({
//         value: event.EventMasterId,
//         label: `${event.EventMasterId} - ${event.EventMaster_Name}`
//     })), [events]);

//     const categoryOptions = useMemo(() => categories.map(category => ({
//         value: category.CategoryId,
//         label: `${category.CategoryId} - ${category.category_name}`
//     })), [categories]);

//     const subCategoryOptions = useMemo(() => {
//         if (!subCategories || !formData.CategoryMaster_Code) {
//             return [];
//         }
//         const filteredSubs = subCategories.filter(sub => sub.CategoryId === formData.CategoryMaster_Code);
//         return filteredSubs.map(subCategory => ({
//             value: subCategory.CategorySubMasterId,
//             label: `${subCategory.CategorySubMasterId} - ${subCategory.CategorySub_Name}`
//         }));
//     }, [subCategories, formData.CategoryMaster_Code]);

//     const paymentStatusOptions = [
//         { value: 'P', label: 'Pending' },
//         { value: 'H', label: 'Partially Paid' },
//         { value: 'C', label: 'Paid' },
//         // { value: 'Overdue', label: 'Overdue' },
//         // { value: 'C', label: 'Cancelled' }
//     ];

//     const yesNoOptions = [
//         { value: 'Y', label: 'Yes' },
//         { value: 'N', label: 'No' }
//     ];

//     const columns = [
//         { header: 'ID', accessor: 'SponsorMasterId' },
//         { header: 'Sponsor Name', accessor: 'Sponsor_Name' },
//         {
//             header: 'Event Name',
//             accessor: 'EventMaster_Name',
//             cellRenderer: (value, row) => `${row.Event_Code} - ${value}`
//         },
//         {
//             header: 'Category',
//             accessor: 'category_name',
//             cellRenderer: (value, row) => row.CategoryMaster_Code ? `${row.CategoryMaster_Code} - ${value}` : 'N/A'
//         },
//         {
//             header: 'Sub Category',
//             accessor: 'CategorySub_Name',
//             cellRenderer: (value, row) => row.CategorySubMaster_Code ? `${row.CategorySubMaster_Code} - ${value}` : 'N/A'
//         },
//         { header: 'Contact Person', accessor: 'Contact_Person' },
//         { header: 'Contact Email', accessor: 'Contact_Email' },
//         { header: 'Sponsorship Amount', accessor: 'Sponsorship_Amount' },
//         { header: 'Payment Status', accessor: 'Payment_Status' },
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
//                         onClick={() => openDeleteConfirm(row.SponsorMasterId)}
//                         title="Delete"
//                     >
//                         <Trash2 className="h-5 w-5" />
//                     </button>
//                 </div>
//             )
//         }
//     ];

//     const handleAddNew = async () => {
//         setEditId(null);
//         resetForm();
//         await refetchMaxId();
//         // setSelectedDeliverablesInModal(allDeliverables.map(d => d.id));
//         setSelectedDeliverablesInModal([]);
//         setIsModalOpen(true);
//     };

//     const handleEdit = (row) => {
//         setFormData({
//             SponsorMasterId: row.SponsorMasterId || '',
//             Sponsor_Name: row.Sponsor_Name || '',
//             Event_Code: row.Event_Code || '',
//             CategoryMaster_Code: row.CategoryMaster_Code || '',
//             CategorySubMaster_Code: row.CategorySubMaster_Code || '',
//             Proposal_Sent: row.Proposal_Sent || '',
//             Approval_Received: row.Approval_Received || '',
//             Sponsorship_Amount: row.Sponsorship_Amount || '',
//             Payment_Status: row.Payment_Status || '',
//             Proforma_Invoice_Sent: row.Proforma_Invoice_Sent || '',
//             Final_Invoice_Sent: row.Final_Invoice_Sent || '',
//             GST_Details_Received: row.GST_Details_Received || '',
//             Contact_Person: row.Contact_Person || '',
//             Contact_Email: row.Contact_Email || '',
//             Contact_Phone: row.Contact_Phone || '',
//             Notes: row.Notes || '',
//             Address: row.Address || '',
//             CIN: row.CIN || '',
//             Sponsor_Deliverables_Tracker: row.Sponsor_Deliverables_Tracker || '',
//             Website: row.Website || '',
//             Awards_Registry_Tracker: row.Awards_Registry_Tracker || '',
//             Category_Sponsors: row.Category_Sponsors || '',
//             Designation: row.Designation || '',
//             Expo_Registry: row.Expo_Registry || '',
//             GST: row.GST || '',
//             Passes_Registry_Tracker: row.Passes_Registry_Tracker || '',
//             Sponsor_Speakers: row.Sponsor_Speakers || '',
//             Networking_Table_Slots_Tracker: row.Networking_Table_Slots_Tracker || '',
//             details: Array.isArray(row.details) ? [...row.details] : []
//         });

//         const eventOption = eventOptions.find(o => o.value === row.Event_Code) || null;
//         const categoryOption = categoryOptions.find(o => o.value === row.CategoryMaster_Code) || null;
//         const subCategoryOption = subCategories
//             .filter(sub => sub.CategoryId === row.CategoryMaster_Code)
//             .map(subCategory => ({
//                 value: subCategory.CategorySubMasterId,
//                 label: `${subCategory.CategorySubMasterId} - ${subCategory.CategorySub_Name}`
//             }))
//             .find(o => o.value === row.CategorySubMaster_Code) || null;

//         setSelectedOptions({
//             event: eventOption,
//             category: categoryOption,
//             subCategory: subCategoryOption,
//         });

//         setSelectedDeliverablesInModal(Array.isArray(row.details) ? row.details.map(d => d.Deliverabled_Code) : []);
//         setEditId(row.SponsorMasterId);
//         setIsModalOpen(true);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const payloadData = {
//             ...formData,
//             CategorySubMaster_Code: formData.CategorySubMaster_Code === '' ? 0 : parseInt(formData.CategorySubMaster_Code),
//             CategoryMaster_Code: formData.CategoryMaster_Code === '' ? 0 : parseInt(formData.CategoryMaster_Code),
//             Sponsorship_Amount: formData.Sponsorship_Amount ? parseFloat(formData.Sponsorship_Amount) : 0
//         };

//         const finalDetails = selectedDeliverablesInModal.map(selectedId => {
//             const deliverable = allDeliverables.find(d => d.id === selectedId);
//             return deliverable ? {
//                 Deliverabled_Code: deliverable.id,
//                 Deliverable_No: deliverable.Deliverable_No,
//             } : null;
//         }).filter(Boolean);

//         try {
//             const payload = { ...payloadData, details: finalDetails };
//             if (editId) {
//                 await updateSponsor({ id: editId, ...payload }).unwrap();
//             } else {
//                 await addSponsor(payload).unwrap();
//             }
//             resetForm();
//             setIsModalOpen(false);
//             refetch();
//         } catch (error) {
//             console.error('Failed to save sponsor:', error);
//         }
//     };

//     const openDeleteConfirm = (id) => {
//         setItemToDelete(id);
//         setShowDeleteConfirmModal(true);
//     };

//     const confirmDelete = async () => {
//         if (itemToDelete) {
//             try {
//                 await deleteSponsor(itemToDelete).unwrap();
//                 refetch();
//             } catch (error) {
//                 console.error('Failed to delete sponsor:', error);
//             } finally {
//                 setShowDeleteConfirmModal(false);
//                 setItemToDelete(null);
//             }
//         }
//     };

//     const resetForm = () => {
//         setFormData(initialFormdata);
//         setSelectedDeliverablesInModal([]);
//         setSelectedOptions({
//             event: null,
//             category: null,
//             subCategory: null,
//         });
//         setEditId(null);
//     };

//     const handleSelectAllDeliverables = (isChecked) => {
//         if (isChecked) {
//             const allIds = allDeliverables.map(d => d.id);
//             setSelectedDeliverablesInModal(allIds);
//         } else {
//             setSelectedDeliverablesInModal([]);
//         }
//     };

//     const transformedTableData = tableData.map(item => ({
//         ...item,
//         details: Array.isArray(item.details) ? item.details : []
//     }));

//     const isLoading = isTableLoading || isEventsLoading || isCategoriesLoading || isSubCategoriesLoading || isDeliverablesLoading || isMaxIdLoading;
//     const isErrorOccurred = isError;

//     if (isLoading) {
//         return <div>Loading...</div>;
//     }

//     if (isErrorOccurred) {
//         return <div>An error occurred while loading Data.</div>;
//     }

//     const categoryNameMap = {
//         'B': 'Before Conference',
//         'D': 'During Conference',
//         'A': 'After Conference',
//         'S': 'Special Conference',
//     };

//     const allDeliverablesSelected = allDeliverables.length > 0 && selectedDeliverablesInModal.length === allDeliverables.length;

//     return (
//         <>
//             <TableUtility
//                 headerContent={<CreateNewButton onClick={handleAddNew} />}
//                 title="Sponsor Master"
//                 columns={columns}
//                 data={transformedTableData}
//                 pageSize={10}
//             />

//             <Modal
//                 isOpen={isModalOpen}
//                 onClose={() => {
//                     setIsModalOpen(false);
//                     resetForm();
//                 }}
//                 title={editId ? 'Edit Sponsor' : 'Add New Sponsor'}
//                 size="2xl"
//                 width="1500px"
//             >
//                 <form onSubmit={handleSubmit} className="space-y-2">
//                     <div className="grid grid-cols-1 gap-1 sm:grid-cols-4">
//                         <div>
//                             <label htmlFor="SponsorMasterId" className="block text-sm font-medium text-gray-700 mb-1">
//                                 Sponsor ID
//                             </label>
//                             <input
//                                 id="SponsorMasterId"
//                                 type="number"
//                                 name="SponsorMasterId"
//                                 value={formData.SponsorMasterId}
//                                 className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
//                                 readOnly
//                                 aria-label="Sponsor ID (auto-generated)"
//                             />
//                             <p className="mt-1 text-xs text-gray-500">
//                                 {isMaxIdLoading ? 'Loading Max ID...' : 'Auto-generated'}
//                             </p>
//                         </div>

//                         <div>
//                             <label htmlFor="Sponsor_Name" className="block text-sm font-medium text-gray-700 mb-1">Sponsor Name *</label>
//                             <input
//                                 id="Sponsor_Name"
//                                 type="text"
//                                 name="Sponsor_Name"
//                                 value={formData.Sponsor_Name}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, Sponsor_Name: e.target.value }))}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                                 required
//                             />
//                         </div>

//                         <div>
//                             <label htmlFor="event_code" className="block text-sm font-medium text-gray-700 mb-1">Event Code</label>
//                             <Select
//                                 id="event_code"
//                                 options={eventOptions}
//                                 value={selectedOptions.event}
//                                 onChange={(option) => {
//                                     setSelectedOptions(prev => ({ ...prev, event: option }));
//                                     setFormData(prev => ({ ...prev, Event_Code: option ? option.value : '' }));
//                                 }}
//                                 placeholder="Select an event..."
//                                 isSearchable
//                             />
//                         </div>

//                         <div>
//                             <label htmlFor="category_code" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
//                             <Select
//                                 id="category_code"
//                                 options={categoryOptions}
//                                 value={selectedOptions.category}
//                                 onChange={(option) => {
//                                     setSelectedOptions(prev => ({ ...prev, category: option, subCategory: null }));
//                                     setFormData(prev => ({ ...prev, CategoryMaster_Code: option ? option.value : '', CategorySubMaster_Code: '' }));
//                                 }}
//                                 placeholder="Select a category..."
//                                 isSearchable
//                             />
//                         </div>

//                         <div>
//                             <label htmlFor="subcategory_code" className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label>
//                             <Select
//                                 id="subcategory_code"
//                                 options={subCategoryOptions}
//                                 value={selectedOptions.subCategory}
//                                 onChange={(option) => {
//                                     setSelectedOptions(prev => ({ ...prev, subCategory: option }));
//                                     setFormData(prev => ({ ...prev, CategorySubMaster_Code: option ? option.value : 0 }));
//                                 }}
//                                 placeholder="Select a sub category..."
//                                 isSearchable
//                             />
//                         </div>

//                         <div>
//                             <label htmlFor="Sponsorship_Amount" className="block text-sm font-medium text-gray-700 mb-1">Sponsorship Amount</label>
//                             <input
//                                 id="Sponsorship_Amount"
//                                 type="number"
//                                 step="0.01"
//                                 name="Sponsorship_Amount"
//                                 value={formData.Sponsorship_Amount}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, Sponsorship_Amount: e.target.value }))}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                             />
//                         </div>

//                         <div>
//                             <label htmlFor="Payment_Status" className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
//                             <Select
//                                 id="Payment_Status"
//                                 options={paymentStatusOptions}
//                                 value={paymentStatusOptions.find(option => option.value === formData.Payment_Status)}
//                                 onChange={(option) => setFormData(prev => ({ ...prev, Payment_Status: option ? option.value : '' }))}
//                                 placeholder="Select payment status..."
//                                 isSearchable
//                             />
//                         </div>

//                         <div>
//                             <label htmlFor="Contact_Person" className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
//                             <input
//                                 id="Contact_Person"
//                                 type="text"
//                                 name="Contact_Person"
//                                 value={formData.Contact_Person}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, Contact_Person: e.target.value }))}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                             />
//                         </div>

//                         <div>
//                             <label htmlFor="Contact_Email" className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
//                             <input
//                                 id="Contact_Email"
//                                 type="email"
//                                 name="Contact_Email"
//                                 value={formData.Contact_Email}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, Contact_Email: e.target.value }))}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                             />
//                         </div>

//                         <div>
//                             <label htmlFor="Contact_Phone" className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
//                             <input
//                                 id="Contact_Phone"
//                                 type="tel"
//                                 name="Contact_Phone"
//                                 value={formData.Contact_Phone}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, Contact_Phone: e.target.value }))}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                             />
//                         </div>

//                         <div>
//                             <label htmlFor="Designation" className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
//                             <input
//                                 id="Designation"
//                                 type="text"
//                                 name="Designation"
//                                 value={formData.Designation}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, Designation: e.target.value }))}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                             />
//                         </div>

//                         <div>
//                             <label htmlFor="Website" className="block text-sm font-medium text-gray-700 mb-1">Website</label>
//                             <input
//                                 id="Website"
//                                 type="url"
//                                 name="Website"
//                                 value={formData.Website}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, Website: e.target.value }))}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                             />
//                         </div>

//                         <div>
//                             <label htmlFor="CIN" className="block text-sm font-medium text-gray-700 mb-1">CIN</label>
//                             <input
//                                 id="CIN"
//                                 type="text"
//                                 name="CIN"
//                                 value={formData.CIN}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, CIN: e.target.value }))}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                             />
//                         </div>

//                         <div>
//                             <label htmlFor="GST" className="block text-sm font-medium text-gray-700 mb-1">GST</label>
//                             <input
//                                 id="GST"
//                                 type="text"
//                                 name="GST"
//                                 value={formData.GST}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, GST: e.target.value }))}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                             />
//                         </div>

//                         <div className="sm:col-span-2">
//                             <label htmlFor="Address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
//                             <textarea
//                                 id="Address"
//                                 name="Address"
//                                 value={formData.Address}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, Address: e.target.value }))}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                                 rows={2}
//                             />
//                         </div>

//                         <div>
//                             <label htmlFor="Proposal_Sent" className="block text-sm font-medium text-gray-700 mb-1">Proposal Sent</label>
//                             <Select
//                                 id="Proposal_Sent"
//                                 options={yesNoOptions}
//                                 value={yesNoOptions.find(option => option.value === formData.Proposal_Sent)}
//                                 onChange={(option) => setFormData(prev => ({ ...prev, Proposal_Sent: option ? option.value : '' }))}
//                                 placeholder="Select..."
//                                 isSearchable
//                             />
//                         </div>

//                         <div>
//                             <label htmlFor="Approval_Received" className="block text-sm font-medium text-gray-700 mb-1">Approval Received</label>
//                             <Select
//                                 id="Approval_Received"
//                                 options={yesNoOptions}
//                                 value={yesNoOptions.find(option => option.value === formData.Approval_Received)}
//                                 onChange={(option) => setFormData(prev => ({ ...prev, Approval_Received: option ? option.value : '' }))}
//                                 placeholder="Select..."
//                                 isSearchable
//                             />
//                         </div>

//                         <div>
//                             <label htmlFor="Proforma_Invoice_Sent" className="block text-sm font-medium text-gray-700 mb-1">Proforma Invoice Sent</label>
//                             <Select
//                                 id="Proforma_Invoice_Sent"
//                                 options={yesNoOptions}
//                                 value={yesNoOptions.find(option => option.value === formData.Proforma_Invoice_Sent)}
//                                 onChange={(option) => setFormData(prev => ({ ...prev, Proforma_Invoice_Sent: option ? option.value : '' }))}
//                                 placeholder="Select..."
//                                 isSearchable
//                             />
//                         </div>

//                         <div>
//                             <label htmlFor="Final_Invoice_Sent" className="block text-sm font-medium text-gray-700 mb-1">Final Invoice Sent</label>
//                             <Select
//                                 id="Final_Invoice_Sent"
//                                 options={yesNoOptions}
//                                 value={yesNoOptions.find(option => option.value === formData.Final_Invoice_Sent)}
//                                 onChange={(option) => setFormData(prev => ({ ...prev, Final_Invoice_Sent: option ? option.value : '' }))}
//                                 placeholder="Select..."
//                                 isSearchable
//                             />
//                         </div>

//                         <div>
//                             <label htmlFor="GST_Details_Received" className="block text-sm font-medium text-gray-700 mb-1">GST Details Received</label>
//                             <Select
//                                 id="GST_Details_Received"
//                                 options={yesNoOptions}
//                                 value={yesNoOptions.find(option => option.value === formData.GST_Details_Received)}
//                                 onChange={(option) => setFormData(prev => ({ ...prev, GST_Details_Received: option ? option.value : '' }))}
//                                 placeholder="Select..."
//                                 isSearchable
//                             />
//                         </div>

//                         <div className="sm:col-span-2">
//                             <label htmlFor="Notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
//                             <textarea
//                                 id="Notes"
//                                 name="Notes"
//                                 value={formData.Notes}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, Notes: e.target.value }))}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                                 rows={2}
//                             />
//                         </div>

//                         <div className="sm:col-span-1">
//                             <label htmlFor="Sponsor_Deliverables_Tracker" className="block text-sm font-medium text-gray-700 mb-1">Sponsor Deliverables Tracker</label>
//                             <textarea
//                                 id="Sponsor_Deliverables_Tracker"
//                                 name="Sponsor_Deliverables_Tracker"
//                                 value={formData.Sponsor_Deliverables_Tracker}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, Sponsor_Deliverables_Tracker: e.target.value }))}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                                 rows={1}
//                             />
//                         </div>

//                         <div className="sm:col-span-1">
//                             <label htmlFor="Awards_Registry_Tracker" className="block text-sm font-medium text-gray-700 mb-1">Awards Registry Tracker</label>
//                             <textarea
//                                 id="Awards_Registry_Tracker"
//                                 name="Awards_Registry_Tracker"
//                                 value={formData.Awards_Registry_Tracker}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, Awards_Registry_Tracker: e.target.value }))}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                                 rows={1}
//                             />
//                         </div>

//                         <div className="sm:col-span-1">
//                             <label htmlFor="Category_Sponsors" className="block text-sm font-medium text-gray-700 mb-1">Category Sponsors</label>
//                             <textarea
//                                 id="Category_Sponsors"
//                                 name="Category_Sponsors"
//                                 value={formData.Category_Sponsors}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, Category_Sponsors: e.target.value }))}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                                 rows={1}
//                             />
//                         </div>

//                         <div className="sm:col-span-1">
//                             <label htmlFor="Expo_Registry" className="block text-sm font-medium text-gray-700 mb-1">Expo Registry</label>
//                             <textarea
//                                 id="Expo_Registry"
//                                 name="Expo_Registry"
//                                 value={formData.Expo_Registry}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, Expo_Registry: e.target.value }))}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                                 rows={1}
//                             />
//                         </div>

//                         <div className="sm:col-span-1">
//                             <label htmlFor="Passes_Registry_Tracker" className="block text-sm font-medium text-gray-700 mb-1">Passes Registry Tracker</label>
//                             <textarea
//                                 id="Passes_Registry_Tracker"
//                                 name="Passes_Registry_Tracker"
//                                 value={formData.Passes_Registry_Tracker}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, Passes_Registry_Tracker: e.target.value }))}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                                 rows={1}
//                             />
//                         </div>

//                         <div className="sm:col-span-1">
//                             <label htmlFor="Sponsor_Speakers" className="block text-sm font-medium text-gray-700 mb-1">Sponsor Speakers</label>
//                             <textarea
//                                 id="Sponsor_Speakers"
//                                 name="Sponsor_Speakers"
//                                 value={formData.Sponsor_Speakers}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, Sponsor_Speakers: e.target.value }))}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                                 rows={1}
//                             />
//                         </div>

//                         <div className="sm:col-span-1">
//                             <label htmlFor="Networking_Table_Slots_Tracker" className="block text-sm font-medium text-gray-700 mb-1">Networking Table Slots Tracker</label>
//                             <textarea
//                                 id="Networking_Table_Slots_Tracker"
//                                 name="Networking_Table_Slots_Tracker"
//                                 value={formData.Networking_Table_Slots_Tracker}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, Networking_Table_Slots_Tracker: e.target.value }))}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                                 rows={1}
//                             />
//                         </div>
//                     </div>

//                     <div className="border-t pt-4 mt-4">
//                         <div className="flex justify-between items-center mb-3">
//                             <h3 className="text-lg font-medium text-gray-800">Select Deliverables</h3>
//                             <div className="flex items-center">
//                                 <input
//                                     type="checkbox"
//                                     id="selectAll"
//                                     checked={allDeliverablesSelected}
//                                     onChange={(e) => handleSelectAllDeliverables(e.target.checked)}
//                                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                                 />
//                                 <label htmlFor="selectAll" className="ml-2 text-sm font-medium text-gray-700 cursor-pointer">
//                                     Select All
//                                 </label>
//                             </div>
//                         </div>
//                         <div className="space-y-4 max-h-96 overflow-y-auto p-3 rounded-md border">
//                             {Object.keys(groupedDeliverables).length > 0 ? (
//                                 Object.keys(groupedDeliverables).map(categoryCode => (
//                                     <div key={categoryCode}>
//                                         <h4 className="text-md font-semibold text-blue-800 mb-2">
//                                             # {categoryNameMap[categoryCode] || categoryCode}
//                                         </h4>
//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
//                                             {groupedDeliverables[categoryCode].map(deliverable => (
//                                                 <div key={deliverable.id} className="flex items-center">
//                                                     <input
//                                                         type="checkbox"
//                                                         id={`deliverable-${deliverable.id}`}
//                                                         checked={selectedDeliverablesInModal.includes(deliverable.id)}
//                                                         onChange={() => setSelectedDeliverablesInModal(prev =>
//                                                             prev.includes(deliverable.id)
//                                                                 ? prev.filter(id => id !== deliverable.id)
//                                                                 : [...prev, deliverable.id]
//                                                         )}
//                                                         className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                                                     />
//                                                     <label htmlFor={`deliverable-${deliverable.id}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
//                                                         {deliverable.Deliverable_No} - {deliverable.Deliverables}
//                                                     </label>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 ))
//                             ) : (
//                                 <p className="text-sm text-gray-500">No deliverables available.</p>
//                             )}
//                         </div>
//                     </div>

//                     <div className="flex justify-end space-x-3 pt-4">
//                         <button
//                             type="button"
//                             onClick={() => { setIsModalOpen(false); resetForm(); }}
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
//                 isOpen={showDeleteConfirmModal}
//                 onClose={() => setShowDeleteConfirmModal(false)}
//                 title="Confirm Deletion"
//             >
//                 <div className="p-4 text-center">
//                     <p className="text-lg text-gray-700 mb-6">Are you sure you want to delete this sponsor?</p>
//                     <div className="flex justify-center space-x-4">
//                         <button
//                             type="button"
//                             onClick={() => setShowDeleteConfirmModal(false)}
//                             className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="button"
//                             onClick={confirmDelete}
//                             className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
//                         >
//                             Delete
//                         </button>
//                     </div>
//                 </div>
//             </Modal>
//         </>
//     );
// }

// export default SponsorMaster;































import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import TableUtility from "../../common/TableUtility/TableUtility";
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Trash2 } from 'lucide-react';
import Modal from '../../common/Modal/Modal';
import {
    useGetSponsorsQuery,
    useAddSponsorMutation,
    useUpdateSponsorMutation,
    useDeleteSponsorMutation,
    useGetMaxSponsorIdQuery,
} from '../../services/sponsorMasterApi';
import {
    useGetEventMastersQuery,
} from '../../services/eventMasterApi';
import {
    useGetCategoryMasterQuery,
} from '../../services/categoryMasterApi';
import {
    useGetCategorySubMasterQuery,
} from '../../services/categorySubMasterApi';
import {
    useGetDeliverablesQuery,
} from '../../services/deliverablesApi';
import { useLazyGetFilteredCategoryWiseDeliverablesQuery } from "../../services/categoryWiseDeliverableMasterApi"
import { useGetUserMastersQuery } from '../../services/userMasterApi';
import CreateNewButton from "../../common/Buttons/AddButton";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL

function SponsorMaster() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const initialFormdata = {
        SponsorMasterId: '',
        Sponsor_Name: '',
        Doc_Date: '',
        Event_Code: '',
        CategoryMaster_Code: '',
        CategorySubMaster_Code: '',
        Proposal_Sent: '',
        Approval_Received: '',
        Sponsorship_Amount: '',
        Sponsorship_Amount_Advance: '',
        Payment_Status: '',
        Proforma_Invoice_Sent: '',
        Final_Invoice_Sent: '',
        GST_Details_Received: '',
        Contact_Person: '',
        Contact_Email: '',
        Contact_Phone: '',
        Notes: '',
        Address: '',
        CIN: '',
        Sponsor_Deliverables_Tracker: '',
        Website: '',
        Awards_Registry_Tracker: '',
        Category_Sponsors: '',
        Designation: '',
        Expo_Registry: '',
        GST: '',
        Passes_Registry_Tracker: '',
        Sponsor_Speakers: '',
        Networking_Table_Slots_Tracker: '',
        Created_By: '',
        Modified_By: '',
        User_Id: '',
        details: []
    }
    const [formData, setFormData] = useState(initialFormdata);
    const [editId, setEditId] = useState(null);
    const [selectedDeliverablesInModal, setSelectedDeliverablesInModal] = useState([]);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);

    const { data: tableData = [], isLoading: isTableLoading, isError, refetch } = useGetSponsorsQuery({ event_code: sessionStorage.getItem("Event_Code")});
    const { data: events = [], isLoading: isEventsLoading } = useGetEventMastersQuery();
    const { data: categories = [], isLoading: isCategoriesLoading } = useGetCategoryMasterQuery();
    const { data: subCategories = [], refetch: refetchSubCategories, isLoading: isSubCategoriesLoading } = useGetCategorySubMasterQuery();
    const { data: allDeliverables = [], isLoading: isDeliverablesLoading } = useGetDeliverablesQuery();

    const [triggerGetFilteredDeliverables, { data: filteredDeliverables = [], isLoading: isFilteredDeliverablesLoading }] =
        useLazyGetFilteredCategoryWiseDeliverablesQuery();

    const { data: maxSponsorId, isLoading: isMaxIdLoading, refetch: refetchMaxId } = useGetMaxSponsorIdQuery();

    const { data: userdata = [], isLoading: isUserdataLoading } = useGetUserMastersQuery();
    const [addSponsor] = useAddSponsorMutation();
    const [updateSponsor] = useUpdateSponsorMutation();
    const [deleteSponsor] = useDeleteSponsorMutation();

    useEffect(() => {
        if (!editId && isModalOpen && !isMaxIdLoading) {
            const nextId = (typeof maxSponsorId === 'number' ? maxSponsorId : 0) + 1;
            setFormData(prev => ({
                ...prev,
                SponsorMasterId: nextId
            }));
        }
    }, [maxSponsorId, isMaxIdLoading, editId, isModalOpen]);


    useEffect(() => {
        const fetchAndCheckDeliverables = async () => {
            if (editId === null && formData.Event_Code && formData.CategoryMaster_Code && formData.CategorySubMaster_Code) {
                try {
                    const result = await triggerGetFilteredDeliverables({
                        event_code: formData.Event_Code,
                        category_master_code: formData.CategoryMaster_Code,
                        category_sub_master_code: formData.CategorySubMaster_Code
                    }).unwrap();

                    const allDeliverableCodes = result.flatMap(master =>
                        master.details.map(detail => detail.Deliverabled_Code)
                    );

                    setSelectedDeliverablesInModal(allDeliverableCodes);
                } catch (error) {
                    console.error('Error fetching filtered deliverables:', error);
                    setSelectedDeliverablesInModal([]);
                }
            } else if (editId === null) {
                setSelectedDeliverablesInModal([]);
            }
        };

        const timeoutId = setTimeout(fetchAndCheckDeliverables, 300);
        return () => clearTimeout(timeoutId);
    }, [formData.Event_Code, formData.CategoryMaster_Code, formData.CategorySubMaster_Code, editId, triggerGetFilteredDeliverables]);

    useEffect(() => {
        if (editId && isModalOpen) {
            const selectedRow = tableData.find(row => row.SponsorMasterId === editId);
            if (selectedRow) {
                setFormData(selectedRow);
                const existingDeliverableCodes = Array.isArray(selectedRow.details)
                    ? selectedRow.details.map(d => d.Deliverabled_Code)
                    : [];
                setSelectedDeliverablesInModal(existingDeliverableCodes);
                setLogoFile(null);
                if (selectedRow.Sponsor_logo) {
                    setLogoPreviewUrl(`${API_BASE_URL}/sponsors/logo/${getFileName(selectedRow.Sponsor_logo)}`);
                } else {
                    setLogoPreviewUrl(null);
                }
            }
        }
    }, [editId, isModalOpen, tableData]);


    useEffect(() => {
        if (logoFile) {
            const objectUrl = URL.createObjectURL(logoFile);
            setLogoPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else if (!formData.Sponsor_logo && !editId) {
            setLogoPreviewUrl(null);
        }
    }, [logoFile, formData.Sponsor_logo, editId]);


    const groupedDeliverables = useMemo(() => {
        return allDeliverables.reduce((acc, current) => {
            const { Category } = current;
            if (!acc[Category]) {
                acc[Category] = [];
            }
            acc[Category].push(current);
            return acc;
        }, {});
    }, [allDeliverables]);

    useEffect(() => {
        if (formData.CategoryMaster_Code) {
            refetchSubCategories();
        }
    }, [formData.CategoryMaster_Code, refetchSubCategories]);

    const [selectedOptions, setSelectedOptions] = useState({
        event: null,
        category: null,
        subCategory: null,
    });

    const eventOptions = useMemo(() => events.map(event => ({
        value: event.EventMasterId,
        label: `${event.EventMasterId} - ${event.EventMaster_Name}`
    })), [events]);

    const userdataOptions = useMemo(() => userdata.map(user => ({
        value: user.User_Id,
        label: `${user.User_Id} - ${user.userfullname}`
    })), [userdata]);

    const categoryOptions = useMemo(() => categories.map(category => ({
        value: category.CategoryId,
        label: `${category.CategoryId} - ${category.category_name}`
    })), [categories]);

    const subCategoryOptions = useMemo(() => {
        if (!subCategories || !formData.CategoryMaster_Code) {
            return [];
        }
        const filteredSubs = subCategories.filter(sub => sub.CategoryId === formData.CategoryMaster_Code);
        return filteredSubs.map(subCategory => ({
            value: subCategory.CategorySubMasterId,
            label: `${subCategory.CategorySubMasterId} - ${subCategory.CategorySub_Name}`
        }));
    }, [subCategories, formData.CategoryMaster_Code]);

    const paymentStatusOptions = [
        { value: 'Pending', label: 'Pending' },
        { value: 'Partially Paid', label: 'Partially Paid' },
        { value: 'Paid', label: 'Paid' },
        { value: 'Cancelled', label: 'Cancelled' },
    ];

    const yesNoOptions = [
        { value: 'Y', label: 'Yes' },
        { value: 'N', label: 'No' }
    ];

    const columns = [
        { header: 'ID', accessor: 'SponsorMasterId' },
        { header: 'Sponsor Name', accessor: 'Sponsor_Name' },
        {
            header: 'Event Name',
            accessor: 'EventMaster_Name',
            cellRenderer: (value, row) => `${row.Event_Code} - ${value}`
        },
        {
            header: 'Category',
            accessor: 'category_name',
            cellRenderer: (value, row) => row.CategoryMaster_Code ? `${row.CategoryMaster_Code} - ${value}` : 'N/A'
        },
        {
            header: 'Sub Category',
            accessor: 'CategorySub_Name',
            cellRenderer: (value, row) => row.CategorySubMaster_Code ? `${row.CategorySubMaster_Code} - ${value}` : 'N/A'
        },
        {
            header: 'User Name',
            accessor: 'User_Name',
            cellRenderer: (value, row) => `${row.User_Id} - ${value}`
        },
        { header: 'Contact Person', accessor: 'Contact_Person' },
        { header: 'Contact Email', accessor: 'Contact_Email' },
        { header: 'Sponsorship Amount', accessor: 'Sponsorship_Amount' },
        { header: 'Received Amount', accessor: 'Sponsorship_Amount_Advance' },
        { header: 'Pending Amount', accessor: 'Pending_Amount' },
        { header: 'Payment Status', accessor: 'Payment_Status' },
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
                        onClick={() => openDeleteConfirm(row.SponsorMasterId)}
                        title="Delete"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            )
        }
    ];

    const handleAddNew = async () => {
        setEditId(null);
        resetForm();
        await refetchMaxId();
        setSelectedDeliverablesInModal([]);
        setLogoFile(null);
        setLogoPreviewUrl(null);
        setIsModalOpen(true);
    };

    const handleEdit = (row) => {
        setFormData({
            SponsorMasterId: row.SponsorMasterId || '',
            Sponsor_Name: row.Sponsor_Name || '',
            Doc_Date: row.Doc_Date || '',
            Event_Code: row.Event_Code || '',
            CategoryMaster_Code: row.CategoryMaster_Code || '',
            CategorySubMaster_Code: row.CategorySubMaster_Code || '',
            Proposal_Sent: row.Proposal_Sent || '',
            Approval_Received: row.Approval_Received || '',
            Sponsorship_Amount: row.Sponsorship_Amount || '',
            Sponsorship_Amount_Advance: row.Sponsorship_Amount_Advance || '',
            Payment_Status: row.Payment_Status || '',
            Proforma_Invoice_Sent: row.Proforma_Invoice_Sent || '',
            Final_Invoice_Sent: row.Final_Invoice_Sent || '',
            GST_Details_Received: row.GST_Details_Received || '',
            Contact_Person: row.Contact_Person || '',
            Contact_Email: row.Contact_Email || '',
            Contact_Phone: row.Contact_Phone || '',
            Notes: row.Notes || '',
            Address: row.Address || '',
            CIN: row.CIN || '',
            Sponsor_Deliverables_Tracker: row.Sponsor_Deliverables_Tracker || '',
            Website: row.Website || '',
            Awards_Registry_Tracker: row.Awards_Registry_Tracker || '',
            Category_Sponsors: row.Category_Sponsors || '',
            Designation: row.Designation || '',
            Expo_Registry: row.Expo_Registry || '',
            GST: row.GST || '',
            Passes_Registry_Tracker: row.Passes_Registry_Tracker || '',
            Sponsor_Speakers: row.Sponsor_Speakers || '',
            Networking_Table_Slots_Tracker: row.Networking_Table_Slots_Tracker || '',
            Created_By: row.Created_By || '',
            Modified_By: row.Modified_By || '',
            User_Id: row.User_Id || '',
            details: Array.isArray(row.details) ? [...row.details] : []
        });

        const eventOption = eventOptions.find(o => o.value === row.Event_Code) || null;
        const userdataOption = userdataOptions.find(o => o.value === row.User_Id) || null;
        const categoryOption = categoryOptions.find(o => o.value === row.CategoryMaster_Code) || null;
        const subCategoryOption = subCategories
            .filter(sub => sub.CategoryId === row.CategoryMaster_Code)
            .map(subCategory => ({
                value: subCategory.CategorySubMasterId,
                label: `${subCategory.CategorySubMasterId} - ${subCategory.CategorySub_Name}`
            }))
            .find(o => o.value === row.CategorySubMaster_Code) || null;

        setSelectedOptions({
            event: eventOption,
            user: userdataOption,
            category: categoryOption,
            subCategory: subCategoryOption,
        });

        setSelectedDeliverablesInModal(Array.isArray(row.details) ? row.details.map(d => d.Deliverabled_Code) : []);
        setEditId(row.SponsorMasterId);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payloadData = {
            ...formData,
            CategorySubMaster_Code: formData.CategorySubMaster_Code === '' ? 0 : parseInt(formData.CategorySubMaster_Code),
            CategoryMaster_Code: formData.CategoryMaster_Code === '' ? 0 : parseInt(formData.CategoryMaster_Code),
            Sponsorship_Amount: formData.Sponsorship_Amount ? parseFloat(formData.Sponsorship_Amount) : 0,
            Sponsorship_Amount_Advance: formData.Sponsorship_Amount_Advance ? parseFloat(formData.Sponsorship_Amount_Advance) : 0
        };

        const finalDetails = selectedDeliverablesInModal.map(selectedId => {
            const deliverable = allDeliverables.find(d => d.id === selectedId);
            return deliverable ? {
                Deliverabled_Code: deliverable.id,
                Deliverable_No: deliverable.Deliverable_No,
            } : null;
        }).filter(Boolean);

        const sponsorDataToSend = { ...payloadData, details: finalDetails };

        if (logoFile) {
            delete sponsorDataToSend.Sponsor_logo;
        } else if (formData.Sponsor_logo === null && editId) {

            sponsorDataToSend.Sponsor_logo = null;
        }

        try {
            const payload = { sponsorData: sponsorDataToSend, logoFile };

            if (editId) {
                await updateSponsor({ id: editId, ...payload }).unwrap();
            } else {
                await addSponsor(payload).unwrap();
            }
            resetForm();
            setIsModalOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to save sponsor:', error);
        }
    };

    const openDeleteConfirm = (id) => {
        setItemToDelete(id);
        setShowDeleteConfirmModal(true);
    };

    const confirmDelete = async () => {
        if (itemToDelete) {
            try {
                await deleteSponsor(itemToDelete).unwrap();
                refetch();
            } catch (error) {
                console.error('Failed to delete sponsor:', error);
            } finally {
                setShowDeleteConfirmModal(false);
                setItemToDelete(null);
            }
        }
    };

    const resetForm = () => {
        setFormData(initialFormdata);
        setSelectedDeliverablesInModal([]);
        setSelectedOptions({
            event: null,
            category: null,
            user: null,
            subCategory: null,
        });
        setEditId(null);
        setLogoFile(null);
        setLogoPreviewUrl(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files ? e.target.files[0] : null;
        setLogoFile(file);
    };

    const handleSelectAllDeliverables = (isChecked) => {
        if (isChecked) {
            const allIds = allDeliverables.map(d => d.id);
            setSelectedDeliverablesInModal(allIds);
        } else {
            setSelectedDeliverablesInModal([]);
        }
    };

    const transformedTableData = tableData.map(item => ({
        ...item,
        details: Array.isArray(item.details) ? item.details : []
    }));

    const isLoading = isTableLoading || isEventsLoading || isCategoriesLoading || isSubCategoriesLoading || isDeliverablesLoading || isMaxIdLoading;
    const isErrorOccurred = isError;

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isErrorOccurred) {
        return <div>An error occurred while loading Data.</div>;
    }

    const categoryNameMap = {
        'B': 'Before Conference',
        'D': 'During Conference',
        'A': 'After Conference',
        'S': 'Special Conference',
    };

    const allDeliverablesSelected = allDeliverables.length > 0 && selectedDeliverablesInModal.length === allDeliverables.length;

    const getFileName = (path) => {
        if (!path) return '';
        const normalizedPath = path.replace(/\\/g, '/');
        return normalizedPath.split('/').pop();
    };

    return (
        <>
            <TableUtility
                headerContent={<CreateNewButton onClick={handleAddNew} />}
                title="Sponsor Master"
                columns={columns}
                data={transformedTableData}
                pageSize={10}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                title={editId ? 'Edit Sponsor' : 'Add New Sponsor'}
                size="2xl"
                width="1500px"
            >
                <form onSubmit={handleSubmit} className="space-y-2">
                    <div className="grid grid-cols-1 gap-1 sm:grid-cols-4">
                        <div>
                            <label htmlFor="SponsorMasterId" className="block text-sm font-medium text-gray-700 mb-1">
                                Sponsor ID
                            </label>
                            <input
                                id="SponsorMasterId"
                                type="number"
                                name="SponsorMasterId"
                                value={formData.SponsorMasterId}
                                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
                                readOnly
                                aria-label="Sponsor ID (auto-generated)"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                {isMaxIdLoading ? 'Loading Max ID...' : 'Auto-generated'}
                            </p>
                        </div>

                        <div>
                            <label htmlFor="Sponsor_Name" className="block text-sm font-medium text-gray-700 mb-1">Sponsor Name *</label>
                            <input
                                id="Sponsor_Name"
                                type="text"
                                name="Sponsor_Name"
                                value={formData.Sponsor_Name}
                                autoComplete='off'
                                onChange={(e) => setFormData(prev => ({ ...prev, Sponsor_Name: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="event_code" className="block text-sm font-medium text-gray-700 mb-1">Event Code</label>
                            <Select
                                id="event_code"
                                options={eventOptions}
                                value={selectedOptions.event}
                                onChange={(option) => {
                                    setSelectedOptions(prev => ({ ...prev, event: option }));
                                    setFormData(prev => ({ ...prev, Event_Code: option ? option.value : '' }));
                                }}
                                autoComplete='off'
                                placeholder="Select an event..."
                                isSearchable
                            />
                        </div>

                        <div>
                            <label htmlFor="category_code" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <Select
                                id="category_code"
                                options={categoryOptions}
                                value={selectedOptions.category}
                                onChange={(option) => {
                                    setSelectedOptions(prev => ({ ...prev, category: option, subCategory: null }));
                                    setFormData(prev => ({ ...prev, CategoryMaster_Code: option ? option.value : '', CategorySubMaster_Code: '' }));
                                }}
                                autoComplete='off'
                                placeholder="Select a category..."
                                isSearchable
                            />
                        </div>

                        <div>
                            <label htmlFor="subcategory_code" className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label>
                            <Select
                                id="subcategory_code"
                                options={subCategoryOptions}
                                value={selectedOptions.subCategory}
                                onChange={(option) => {
                                    setSelectedOptions(prev => ({ ...prev, subCategory: option }));
                                    setFormData(prev => ({ ...prev, CategorySubMaster_Code: option ? option.value : 0 }));
                                }}
                                autoComplete='off'
                                placeholder="Select a sub category..."
                                isSearchable
                            />
                        </div>

                        <div>
                            <label htmlFor="User_Id" className="block text-sm font-medium text-gray-700 mb-1">User Master</label>
                            <Select
                                id="User_Id"
                                options={userdataOptions}
                                value={selectedOptions.user}
                                onChange={(option) => {
                                    setSelectedOptions(prev => ({ ...prev, user: option }));
                                    setFormData(prev => ({ ...prev, User_Id: option ? option.value : '' }));
                                }}
                                autoComplete='off'
                                placeholder="Select an event..."
                                isSearchable
                            />
                        </div>

                        <div>
                            <label htmlFor="Proposal_Sent" className="block text-sm font-medium text-gray-700 mb-1">Proposal Sent</label>
                            <Select
                                id="Proposal_Sent"
                                options={yesNoOptions}
                                value={yesNoOptions.find(option => option.value === formData.Proposal_Sent)}
                                onChange={(option) => setFormData(prev => ({ ...prev, Proposal_Sent: option ? option.value : '' }))}
                                placeholder="Select..."
                                isSearchable
                            />
                        </div>

                        <div>
                            <label htmlFor="Approval_Received" className="block text-sm font-medium text-gray-700 mb-1">Approval Received</label>
                            <Select
                                id="Approval_Received"
                                options={yesNoOptions}
                                value={yesNoOptions.find(option => option.value === formData.Approval_Received)}
                                onChange={(option) => setFormData(prev => ({ ...prev, Approval_Received: option ? option.value : '' }))}
                                placeholder="Select..."
                                isSearchable
                            />
                        </div>

                        <div>
                            <label htmlFor="Payment_Status" className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                            <Select
                                id="Payment_Status"
                                options={paymentStatusOptions}
                                value={paymentStatusOptions.find(option => option.value === formData.Payment_Status)}
                                onChange={(option) => setFormData(prev => ({ ...prev, Payment_Status: option ? option.value : '' }))}
                                placeholder="Select payment status..."
                                isSearchable
                                autoComplete='off'
                            />
                        </div>

                        <div>
                            <label htmlFor="Sponsorship_Amount" className="block text-sm font-medium text-gray-700 mb-1">Sponsorship Amount</label>
                            <input
                                id="Sponsorship_Amount"
                                type="number"
                                step="0.01"
                                name="Sponsorship_Amount"
                                value={formData.Sponsorship_Amount}
                                autoComplete='off'
                                onChange={(e) => setFormData(prev => ({ ...prev, Sponsorship_Amount: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div>
                            <label htmlFor="Sponsorship_Amount_Advance" className="block text-sm font-medium text-gray-700 mb-1">Advance</label>
                            <input
                                id="Sponsorship_Amount_Advance"
                                type="number"
                                step="0.01"
                                name="Sponsorship_Amount_Advance"
                                value={formData.Sponsorship_Amount_Advance}
                                autoComplete='off'
                                onChange={(e) => setFormData(prev => ({ ...prev, Sponsorship_Amount_Advance: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div>
                            <label htmlFor="Contact_Person" className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                            <input
                                id="Contact_Person"
                                type="text"
                                name="Contact_Person"
                                autoComplete='off'
                                value={formData.Contact_Person}
                                onChange={(e) => setFormData(prev => ({ ...prev, Contact_Person: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"

                            />
                        </div>

                        <div>
                            <label htmlFor="Contact_Email" className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                            <input
                                id="Contact_Email"
                                type="email"
                                name="Contact_Email"
                                value={formData.Contact_Email}
                                onChange={(e) => setFormData(prev => ({ ...prev, Contact_Email: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                autoComplete='off'
                            />
                        </div>

                        <div>
                            <label htmlFor="Contact_Phone" className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                            <input
                                id="Contact_Phone"
                                type="tel"
                                name="Contact_Phone"
                                value={formData.Contact_Phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, Contact_Phone: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                autoComplete='off'
                            />
                        </div>

                        <div>
                            <label htmlFor="Designation" className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                            <input
                                id="Designation"
                                type="text"
                                name="Designation"
                                value={formData.Designation}
                                onChange={(e) => setFormData(prev => ({ ...prev, Designation: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                autoComplete='off'
                            />
                        </div>

                        <div>
                            <label htmlFor="Website" className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                            <input
                                id="Website"
                                type="url"
                                name="Website"
                                value={formData.Website}
                                onChange={(e) => setFormData(prev => ({ ...prev, Website: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                autoComplete='off'
                            />
                        </div>

                        <div>
                            <label htmlFor="CIN" className="block text-sm font-medium text-gray-700 mb-1">CIN</label>
                            <input
                                id="CIN"
                                type="text"
                                name="CIN"
                                value={formData.CIN}
                                onChange={(e) => setFormData(prev => ({ ...prev, CIN: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div>
                            <label htmlFor="GST" className="block text-sm font-medium text-gray-700 mb-1">GST</label>
                            <input
                                id="GST"
                                type="text"
                                name="GST"
                                value={formData.GST}
                                onChange={(e) => setFormData(prev => ({ ...prev, GST: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="Address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <textarea
                                id="Address"
                                name="Address"
                                value={formData.Address}
                                onChange={(e) => setFormData(prev => ({ ...prev, Address: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows={2}
                            />
                        </div>



                        <div>
                            <label htmlFor="Proforma_Invoice_Sent" className="block text-sm font-medium text-gray-700 mb-1">Proforma Invoice Sent</label>
                            <Select
                                id="Proforma_Invoice_Sent"
                                options={yesNoOptions}
                                value={yesNoOptions.find(option => option.value === formData.Proforma_Invoice_Sent)}
                                onChange={(option) => setFormData(prev => ({ ...prev, Proforma_Invoice_Sent: option ? option.value : '' }))}
                                placeholder="Select..."
                                isSearchable
                            />
                        </div>

                        <div>
                            <label htmlFor="Final_Invoice_Sent" className="block text-sm font-medium text-gray-700 mb-1">Final Invoice Sent</label>
                            <Select
                                id="Final_Invoice_Sent"
                                options={yesNoOptions}
                                value={yesNoOptions.find(option => option.value === formData.Final_Invoice_Sent)}
                                onChange={(option) => setFormData(prev => ({ ...prev, Final_Invoice_Sent: option ? option.value : '' }))}
                                placeholder="Select..."
                                isSearchable
                            />
                        </div>

                        <div>
                            <label htmlFor="GST_Details_Received" className="block text-sm font-medium text-gray-700 mb-1">GST Details Received</label>
                            <Select
                                id="GST_Details_Received"
                                options={yesNoOptions}
                                value={yesNoOptions.find(option => option.value === formData.GST_Details_Received)}
                                onChange={(option) => setFormData(prev => ({ ...prev, GST_Details_Received: option ? option.value : '' }))}
                                placeholder="Select..."
                                isSearchable
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="Notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                id="Notes"
                                name="Notes"
                                value={formData.Notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, Notes: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows={2}
                            />
                        </div>

                        {/* <div className="sm:col-span-1">
                            <label htmlFor="Sponsor_Deliverables_Tracker" className="block text-sm font-medium text-gray-700 mb-1">Sponsor Deliverables Tracker</label>
                            <textarea
                                id="Sponsor_Deliverables_Tracker"
                                name="Sponsor_Deliverables_Tracker"
                                value={formData.Sponsor_Deliverables_Tracker}
                                onChange={(e) => setFormData(prev => ({ ...prev, Sponsor_Deliverables_Tracker: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows={1}
                            />
                        </div>

                        <div className="sm:col-span-1">
                            <label htmlFor="Awards_Registry_Tracker" className="block text-sm font-medium text-gray-700 mb-1">Awards Registry Tracker</label>
                            <textarea
                                id="Awards_Registry_Tracker"
                                name="Awards_Registry_Tracker"
                                value={formData.Awards_Registry_Tracker}
                                onChange={(e) => setFormData(prev => ({ ...prev, Awards_Registry_Tracker: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows={1}
                            />
                        </div>

                        <div className="sm:col-span-1">
                            <label htmlFor="Category_Sponsors" className="block text-sm font-medium text-gray-700 mb-1">Category Sponsors</label>
                            <textarea
                                id="Category_Sponsors"
                                name="Category_Sponsors"
                                value={formData.Category_Sponsors}
                                onChange={(e) => setFormData(prev => ({ ...prev, Category_Sponsors: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows={1}
                            />
                        </div>

                        <div className="sm:col-span-1">
                            <label htmlFor="Expo_Registry" className="block text-sm font-medium text-gray-700 mb-1">Expo Registry</label>
                            <textarea
                                id="Expo_Registry"
                                name="Expo_Registry"
                                value={formData.Expo_Registry}
                                onChange={(e) => setFormData(prev => ({ ...prev, Expo_Registry: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows={1}
                            />
                        </div>


                        <div className="sm:col-span-1">
                            <label htmlFor="Passes_Registry_Tracker" className="block text-sm font-medium text-gray-700 mb-1">Passes Registry Tracker</label>
                            <textarea
                                id="Passes_Registry_Tracker"
                                name="Passes_Registry_Tracker"
                                value={formData.Passes_Registry_Tracker}
                                onChange={(e) => setFormData(prev => ({ ...prev, Passes_Registry_Tracker: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows={1}
                            />
                        </div>

                        <div className="sm:col-span-1">
                            <label htmlFor="Sponsor_Speakers" className="block text-sm font-medium text-gray-700 mb-1">Sponsor Speakers</label>
                            <textarea
                                id="Sponsor_Speakers"
                                name="Sponsor_Speakers"
                                value={formData.Sponsor_Speakers}
                                onChange={(e) => setFormData(prev => ({ ...prev, Sponsor_Speakers: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows={1}
                            />
                        </div>

                        <div className="sm:col-span-1">
                            <label htmlFor="Networking_Table_Slots_Tracker" className="block text-sm font-medium text-gray-700 mb-1">Networking Table Slots Tracker</label>
                            <textarea
                                id="Networking_Table_Slots_Tracker"
                                name="Networking_Table_Slots_Tracker"
                                value={formData.Networking_Table_Slots_Tracker}
                                onChange={(e) => setFormData(prev => ({ ...prev, Networking_Table_Slots_Tracker: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows={1}
                            />
                        </div> */}


                        <div>
                            <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">Sponsor Logo</label>
                            {(logoPreviewUrl || formData.Sponsor_logo) && (
                                <div className="flex items-center space-x-2 mb-2">
                                    <img
                                        src={logoPreviewUrl}
                                        alt="Current Logo"
                                        className="h-12 w-12 object-contain rounded-md border"
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/48x48/CCCCCC/000000?text=No+Logo"; }}
                                    />
                                    <span className="text-sm text-gray-600">
                                        {logoFile ? logoFile.name : getFileName(formData.Sponsor_logo)}
                                    </span>

                                </div>
                            )}
                            <input
                                id="logo"
                                type="file"
                                name="logo"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {!logoPreviewUrl && !formData.Sponsor_logo && <p className="mt-1 text-xs text-gray-500">No logo uploaded yet or cleared.</p>}
                        </div>


                    </div>

                    <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-medium text-gray-800">Select Deliverables</h3>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="selectAll"
                                    checked={allDeliverablesSelected}
                                    onChange={(e) => handleSelectAllDeliverables(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="selectAll" className="ml-2 text-sm font-medium text-gray-700 cursor-pointer">
                                    Select All
                                </label>
                            </div>
                        </div>
                        <div className="space-y-4 max-h-96 overflow-y-auto p-3 rounded-md border">
                            {Object.keys(groupedDeliverables).length > 0 ? (
                                Object.keys(groupedDeliverables).map(categoryCode => (
                                    <div key={categoryCode}>
                                        <h4 className="text-md font-semibold text-blue-800 mb-2">
                                            # {categoryNameMap[categoryCode] || categoryCode}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                                            {groupedDeliverables[categoryCode].map(deliverable => (
                                                <div key={deliverable.id} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`deliverable-${deliverable.id}`}
                                                        checked={selectedDeliverablesInModal.includes(deliverable.id)}
                                                        onChange={() => setSelectedDeliverablesInModal(prev =>
                                                            prev.includes(deliverable.id)
                                                                ? prev.filter(id => id !== deliverable.id)
                                                                : [...prev, deliverable.id]
                                                        )}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor={`deliverable-${deliverable.id}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                                                        {deliverable.Deliverable_No} - {deliverable.Deliverables}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No deliverables available.</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => { setIsModalOpen(false); resetForm(); }}
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
                    <p className="text-lg text-gray-700 mb-6">Are you sure you want to delete this sponsor?</p>
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
        </>
    );
}

export default SponsorMaster;