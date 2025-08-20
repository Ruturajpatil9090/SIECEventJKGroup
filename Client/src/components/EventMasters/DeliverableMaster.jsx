import React, { useState, useEffect } from 'react';
import TableUtility from "../../common/TableUtility/TableUtility";
import { PencilSquareIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Trash2 } from 'lucide-react';
import Modal from '../../common/Modal/Modal';
import {
    useGetDeliverablesQuery,
    useAddDeliverableMutation,
    useUpdateDeliverableMutation,
    useDeleteDeliverableMutation,
    useGetLastDeliverableNumbersQuery
} from '../../services/deliverablesApi';
import CreateNewButton from "../../common/Buttons/AddButton";

function DeliverableMaster() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [formData, setFormData] = useState({
        Deliverable_No: '',
        Category: 'B',
        description: '',
        Deliverables: ''
    });
    const [editId, setEditId] = useState(null);

    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    const { data: tableData = [], isLoading: isTableLoading, isError, refetch } = useGetDeliverablesQuery();
    const { data: lastNumbers = { B: 0, D: 0, A: 0, S: 0 }, isLoading: isNumbersLoading, refetch: refetchLastNumbers } = useGetLastDeliverableNumbersQuery();
    const [addDeliverable] = useAddDeliverableMutation();
    const [updateDeliverable] = useUpdateDeliverableMutation();
    const [deleteDeliverable] = useDeleteDeliverableMutation();

    useEffect(() => {
        if (!editId && formData.Category && !isNumbersLoading && isModalOpen) {
            const nextNumber = lastNumbers[formData.Category] + 1;
            setFormData(prev => ({
                ...prev,
                Deliverable_No: nextNumber
            }));
        }
    }, [formData.Category, lastNumbers, isNumbersLoading, editId, isModalOpen]);

    const handleAddNew = async () => {
        setEditId(null);
        await refetchLastNumbers();
        setIsModalOpen(true);
    };

    const columns = [
        {
            header: 'Deliverable No',
            accessor: 'Deliverable_No',
        },
        {
            header: 'Category',
            accessor: 'Category',
            cellRenderer: (value) => {
                const categoryMap = {
                    'B': 'Before Conference',
                    'D': 'During Conference',
                    'A': 'After Conference',
                    'S': 'Special Deliverables'
                };
                return categoryMap[value] || value;
            }
        },
        {
            header: 'Deliverables',
            accessor: 'Deliverables',
            className: 'text-left'
        },
        {
            header: 'Description',
            accessor: 'description',
        },
        {
            header: 'Action',
            accessor: 'action',
            isAction: true,
            className: 'text-center',
            actionRenderer: (row) => (
                <div className="flex justify-right space-x-3">
                    <button
                        className="p-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
                        onClick={() => handleEdit(row)}
                        title="Edit"
                    >
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                        className="p-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-200"
                        onClick={() => openDeleteConfirm(row.id)}
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
                await updateDeliverable({ id: editId, ...formData }).unwrap();
                showNotification('Deliverable updated successfully!', 'success');
            } else {
                await addDeliverable(formData).unwrap();
                showNotification('Deliverable added successfully!', 'success');
            }
            resetForm();
            setIsModalOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to save deliverable:', error);
            showNotification('Failed to save deliverable!', 'error');
        }
    };

    const handleEdit = (row) => {
        setFormData({
            Deliverable_No: row.Deliverable_No,
            Category: row.Category,
            description: row.description,
            Deliverables: row.Deliverables
        });
        setEditId(row.id);
        setIsModalOpen(true);
    };

    const openDeleteConfirm = (id) => {
        setItemToDelete(id);
        setShowDeleteConfirmModal(true);
    };

    const confirmDelete = async () => {
        if (itemToDelete) {
            try {
                const result = await deleteDeliverable(itemToDelete).unwrap();

                if (result && result.message) {
                    showNotification(result.message, 'success');
                } else {
                    showNotification('Deliverable deleted successfully!', 'success');
                }
                refetch();

            } catch (error) {
                console.error('Failed to delete deliverable:', error);

                if (error.data) {
                    if (error.data.detail) {
                        showNotification(error.data.detail, 'error');
                    } else if (error.data.error) {
                        showNotification(error.data.error, 'error');
                    } else if (error.data.message) {
                        showNotification(error.data.message, 'error');
                    } else {
                        showNotification('Failed to delete deliverable!', 'error');
                    }
                } else if (error.message) {
                    showNotification(error.message, 'error');
                } else {
                    showNotification('Failed to delete deliverable!', 'error');
                }
            } finally {
                setShowDeleteConfirmModal(false);
                setItemToDelete(null);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            Deliverable_No: '',
            Category: 'B',
            description: '',
            Deliverables: ''
        });
        setEditId(null);
    };

    if (isTableLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading deliverables</div>;

    return (
        <>
            <TableUtility
                headerContent={
                    <CreateNewButton
                        onClick={handleAddNew}
                    />
                }
                title="Deliverables Master"
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
                title={editId ? 'Edit Deliverable' : 'Add New Deliverable'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Deliverable No {formData.Category && `(Category ${formData.Category})`}
                            </label>
                            <input
                                type="number"
                                name="Deliverable_No"
                                value={formData.Deliverable_No}
                                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
                                readOnly
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                {isNumbersLoading ? 'Loading...' : 'Auto-generated based on category'}
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            name="Category"
                            value={formData.Category}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            required
                            disabled={!!editId}
                        >
                            <option value="B">Before Conference</option>
                            <option value="D">During Conference</option>
                            <option value="A">After Conference</option>
                            <option value="S">Special Deliverables</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deliverables</label>
                        <input
                            name="Deliverables"
                            value={formData.Deliverables}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        </div>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            rows="4"
                            maxLength="1000"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
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
                    <p className="text-lg text-gray-700 mb-6">Are you sure you want to delete this deliverable?</p>
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

        </>
    );
}

export default DeliverableMaster;




// import React, { useState, useEffect } from 'react';
// import TableUtility from "../../common/TableUtility/TableUtility";
// import { PencilSquareIcon } from '@heroicons/react/24/outline';
// import { Trash2 } from 'lucide-react';
// import Modal from '../../common/Modal/Modal';
// import {
//     useGetDeliverablesQuery,
//     useAddDeliverableMutation,
//     useUpdateDeliverableMutation,
//     useDeleteDeliverableMutation,
//     useGetLastDeliverableNumbersQuery
// } from '../../services/deliverablesApi';
// import CreateNewButton from "../../common/Buttons/AddButton";

// function DeliverableMaster() {
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
//     const [itemToDelete, setItemToDelete] = useState(null);
//     const [formData, setFormData] = useState({
//         Deliverable_No: '',
//         // event_code: '',
//         Category: 'B',
//         description: '',
//         Deliverables: ''
//     });
//     const [editId, setEditId] = useState(null);

//     const { data: tableData = [], isLoading: isTableLoading, isError, refetch } = useGetDeliverablesQuery();
//     const { data: lastNumbers = { B: 0, D: 0, A: 0, S: 0 }, isLoading: isNumbersLoading, refetch: refetchLastNumbers } = useGetLastDeliverableNumbersQuery();
//     const [addDeliverable] = useAddDeliverableMutation();
//     const [updateDeliverable] = useUpdateDeliverableMutation();
//     const [deleteDeliverable] = useDeleteDeliverableMutation();

//     useEffect(() => {
//         if (!editId && formData.Category && !isNumbersLoading && isModalOpen) {
//             const nextNumber = lastNumbers[formData.Category] + 1;
//             setFormData(prev => ({
//                 ...prev,
//                 Deliverable_No: nextNumber
//             }));
//         }
//     }, [formData.Category, lastNumbers, isNumbersLoading, editId, isModalOpen]);

//     const handleAddNew = async () => {
//         setEditId(null);
//         await refetchLastNumbers();
//         setIsModalOpen(true);
//     };

//     const columns = [
//         {
//             header: 'Deliverable No',
//             accessor: 'Deliverable_No',
//         },
//         {
//             header: 'Category',
//             accessor: 'Category',
//             cellRenderer: (value) => {
//                 const categoryMap = {
//                     'B': 'Before Conference',
//                     'D': 'During Conference',
//                     'A': 'After Conference',
//                     'S': 'Special Deliverables'
//                 };
//                 return categoryMap[value] || value;
//             }
//         },
//         {
//             header: 'Deliverables',
//             accessor: 'Deliverables',
//             className: 'text-left'
//         },
//         {
//             header: 'Description',
//             accessor: 'description',
//         },
//         {
//             header: 'Action',
//             accessor: 'action',
//             isAction: true,
//             className: 'text-center',
//             actionRenderer: (row) => (
//                 <div className="flex justify-right space-x-3">
//                     <button
//                         className="p-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
//                         onClick={() => handleEdit(row)}
//                         title="Edit"
//                     >
//                         <PencilSquareIcon className="h-5 w-5" />
//                     </button>
//                     <button
//                         className="p-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-200"
//                         onClick={() => openDeleteConfirm(row.id)}
//                         title="Delete"
//                     >
//                         <Trash2 className="h-5 w-5" />
//                     </button>
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

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             if (editId) {
//                 await updateDeliverable({ id: editId, ...formData }).unwrap();
//             } else {
//                 await addDeliverable(formData).unwrap();
//             }
//             resetForm();
//             setIsModalOpen(false);
//             refetch();
//         } catch (error) {
//             console.error('Failed to save deliverable:', error);
//         }
//     };

//     const handleEdit = (row) => {
//         setFormData({
//             Deliverable_No: row.Deliverable_No,
//             Category: row.Category,
//             description: row.description,
//             Deliverables: row.Deliverables
//         });
//         setEditId(row.id);
//         setIsModalOpen(true);
//     };

//     const openDeleteConfirm = (id) => {
//         setItemToDelete(id);
//         setShowDeleteConfirmModal(true);
//     };

//     const confirmDelete = async () => {
//         if (itemToDelete) {
//             try {
//                 await deleteDeliverable(itemToDelete).unwrap();
//                 refetch();
//             } catch (error) {
//                 console.error('Failed to delete deliverable:', error);
//             } finally {
//                 setShowDeleteConfirmModal(false);
//                 setItemToDelete(null);
//             }
//         }
//     };

//     const resetForm = () => {
//         setFormData({
//             Deliverable_No: '',
//             Category: 'B',
//             description: '',
//             Deliverables: ''
//         });
//         setEditId(null);
//     };


//     if (isTableLoading) return <div>Loading...</div>;
//     if (isError) return <div>Error loading deliverables</div>;

//     return (
//         <>
//             <TableUtility
//                 headerContent={
//                     <CreateNewButton
//                         onClick={handleAddNew}
//                     />
//                 }
//                 title="Deliverables Master"
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
//                 title={editId ? 'Edit Deliverable' : 'Add New Deliverable'}
//             >
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Deliverable No {formData.Category && `(Category ${formData.Category})`}
//                             </label>
//                             <input
//                                 type="number"
//                                 name="Deliverable_No"
//                                 value={formData.Deliverable_No}
//                                 className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
//                                 readOnly
//                             />
//                             <p className="mt-1 text-xs text-gray-500">
//                                 {isNumbersLoading ? 'Loading...' : 'Auto-generated based on category'}
//                             </p>
//                         </div>
//                     </div>

//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
//                         <select
//                             name="Category"
//                             value={formData.Category}
//                             onChange={handleInputChange}
//                             className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
//                             required
//                             disabled={!!editId}
//                         >
//                             <option value="B">Before Conference</option>
//                             <option value="D">During Conference</option>
//                             <option value="A">After Conference</option>
//                             <option value="S">Special Deliverables</option>
//                         </select>
//                     </div>

//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Deliverables</label>
//                         <input
//                             name="Deliverables"
//                             value={formData.Deliverables}
//                             onChange={handleInputChange}
//                             className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
//                         />
//                     </div>

//                     <div>
//                         <div className="flex justify-between items-center">
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//                         </div>
//                         <textarea
//                             name="description"
//                             value={formData.description}
//                             onChange={handleInputChange}
//                             className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
//                             rows="4"
//                             maxLength="1000"
//                         />
//                     </div>

//                     <div className="flex justify-end space-x-3 pt-4">
//                         <button
//                             type="button"
//                             onClick={() => setIsModalOpen(false)}
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
//                     <p className="text-lg text-gray-700 mb-6">Are you sure you want to delete this deliverable?</p>
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

// export default DeliverableMaster;
