import { useState, useEffect } from 'react';
import TableUtility from "../../common/TableUtility/TableUtility";
import { PencilSquareIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Trash2 } from 'lucide-react';
import Modal from '../../common/Modal/Modal';
import {
    useGetAwardSubCategoriesQuery,
    useGetMaxAwardSubCategoryIdQuery,
    useAddAwardSubCategoryMutation,
    useUpdateAwardSubCategoryMutation,
    useDeleteAwardSubCategoryMutation
} from '../../services/awardSubCategoryApi';
import { useGetAwardMasterAllQuery } from '../../services/awardMasterApi';
import CreateNewButton from "../../common/Buttons/AddButton";
import Select from 'react-select';

function AwardSubMaster() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [subCategoryIdToDelete, setSubCategoryIdToDelete] = useState(null);
    const [formData, setFormData] = useState({
        AwardSubCategoryId: '',
        AwardSubCategoryName: '',
        AwardId: ''
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
    } = useGetAwardSubCategoriesQuery();

    const {
        data: maxSubCategoryId = 0,
        isLoading: isMaxIdLoading,
        refetch: refetchMaxId
    } = useGetMaxAwardSubCategoryIdQuery();

    const {
        data: awards = [],
        isLoading: isAwardsLoading
    } = useGetAwardMasterAllQuery();

    const [addAwardSubCategory] = useAddAwardSubCategoryMutation();
    const [updateAwardSubCategory] = useUpdateAwardSubCategoryMutation();
    const [deleteAwardSubCategory] = useDeleteAwardSubCategoryMutation();

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ ...notification, show: false });
        }, 3000);
    };

    useEffect(() => {
        if (!editId && !isMaxIdLoading && isModalOpen) {
            const nextId = maxSubCategoryId + 1;
            setFormData(prev => ({
                ...prev,
                AwardSubCategoryId: nextId.toString()
            }));
        }
    }, [maxSubCategoryId, isMaxIdLoading, editId, isModalOpen]);

    const handleAddNew = async () => {
        setEditId(null);
        resetForm();
        await refetchMaxId();
        setIsModalOpen(true);
    };

    const columns = [
        {
            header: 'Award Sub Category ID',
            accessor: 'AwardSubCategoryId',
        },
        {
            header: 'Award Sub Category Name',
            accessor: 'AwardSubCategoryName',
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
                        onClick={() => openDeleteConfirmModal(row.AwardSubCategoryId)}
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

    const handleAwardChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            AwardId: selectedOption ? selectedOption.value : ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                AwardSubCategoryName: formData.AwardSubCategoryName,
                AwardId: Number(formData.AwardId)
            };

            if (editId) {
                await updateAwardSubCategory({
                    id: Number(editId),
                    ...payload
                }).unwrap();
                showNotification('Award Sub Category updated successfully!');
            } else {
                await addAwardSubCategory({
                    AwardSubCategoryId: Number(formData.AwardSubCategoryId),
                    ...payload
                }).unwrap();
                showNotification('Award Sub Category added successfully!');
            }

            resetForm();
            setIsModalOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to save award sub category:', error);
            showNotification('Failed to save award sub category!', 'error');
        }
    };

    const handleEdit = (row) => {
        setFormData({
            AwardSubCategoryId: row.AwardSubCategoryId.toString(),
            AwardSubCategoryName: row.AwardSubCategoryName,
            AwardId: row.AwardId.toString()
        });
        setEditId(row.AwardSubCategoryId);
        setIsModalOpen(true);
    };

    const openDeleteConfirmModal = (id) => {
        setSubCategoryIdToDelete(id);
        setIsConfirmDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (subCategoryIdToDelete) {
            try {
                await deleteAwardSubCategory(Number(subCategoryIdToDelete)).unwrap();
                showNotification('Award Sub Category deleted successfully!');
                refetch();
            } catch (error) {
                console.error('Failed to delete award sub category:', error);
                showNotification('Failed to delete award sub category!', 'error');
            } finally {
                setIsConfirmDeleteModalOpen(false);
                setSubCategoryIdToDelete(null);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            AwardSubCategoryId: '',
            AwardSubCategoryName: '',
            AwardId: ''
        });
        setEditId(null);
    };

    const awardOptions = awards.map(award => ({
        value: award.AwardId.toString(),
        label: `${award.AwardId} - ${award.Award_Name}`
    }));

    const selectedAward = awardOptions.find(option =>
        option.value === formData.AwardId?.toString()
    );

    if (isTableLoading || isAwardsLoading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto" />
                <p className="text-gray-700 text-lg font-medium">
                    Loading
                    <span className="inline-block animate-pulse ml-1 text-blue-600">...</span>
                </p>
            </div>
        </div>
    );

    if (isError) return <div>Error loading award sub categories</div>;

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
                headerContent={<CreateNewButton onClick={handleAddNew} />}
                title="Award Sub Master"
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
                title={editId ? 'Edit Award Sub Category' : 'Add New Award Sub Category'}
            >
                <form onSubmit={handleSubmit} onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.type !== 'textarea') {
                        e.preventDefault();
                    }
                }} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Award Sub Category ID
                            </label>
                            <input
                                type="text"
                                name="AwardSubCategoryId"
                                value={formData.AwardSubCategoryId}
                                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Award Sub Category Name
                            </label>
                            <input
                                type="text"
                                name="AwardSubCategoryName"
                                value={formData.AwardSubCategoryName}
                                onChange={handleInputChange}
                                autoComplete='off'
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Award Master
                            </label>
                            <Select
                                options={awardOptions}
                                value={selectedAward}
                                onChange={handleAwardChange}
                                placeholder="Select an award..."
                                isSearchable
                                required
                                className="basic-single"
                                classNamePrefix="select"
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    control: (provided) => ({
                                        ...provided,
                                        minHeight: '42px',
                                        borderColor: '#d1d5db',
                                        '&:hover': {
                                            borderColor: '#d1d5db'
                                        }
                                    }),
                                    menuPortal: base => ({
                                        ...base,
                                        zIndex: 9999
                                    }),
                                    option: (provided, state) => ({
                                        ...provided,
                                        backgroundColor: state.isFocused
                                            ? '#a8bde9ff'
                                            : state.isSelected
                                                ? '#4778e2ff'
                                                : state.isDisabled
                                                    ? '#f3f4f6'
                                                    : 'white',
                                        color: state.isSelected
                                            ? 'white'
                                            : state.isDisabled
                                                ? '#9ca3af'
                                                : 'black',
                                        cursor: state.isDisabled ? 'not-allowed' : 'pointer',
                                        '&:hover': {
                                            backgroundColor: state.isDisabled ? '#f3f4f6' : '#bbc7e2ff',
                                            color: state.isDisabled ? '#9ca3af' : 'white'
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
                isOpen={isConfirmDeleteModalOpen}
                onClose={() => setIsConfirmDeleteModalOpen(false)}
                title="Confirm Deletion"
            >
                <div className="p-4">
                    <p className="text-gray-700 text-lg mb-4">
                        Are you sure you want to delete this award sub category?
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

export default AwardSubMaster;