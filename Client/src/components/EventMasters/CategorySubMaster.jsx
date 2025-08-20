import { useState, useEffect } from 'react';
import TableUtility from "../../common/TableUtility/TableUtility";
import { PencilSquareIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Trash2 } from 'lucide-react';
import Modal from '../../common/Modal/Modal';
import {
    useGetCategorySubMasterQuery,
    useGetMaxSubCategoryIdQuery,
    useAddCategorySubMasterMutation,
    useUpdateCategorySubMasterMutation,
    useDeleteCategorySubMasterMutation
} from '../../services/categorySubMasterApi';
import { useGetCategoryMasterQuery } from '../../services/categoryMasterApi';
import CreateNewButton from "../../common/Buttons/AddButton";
import Select from 'react-select';

function CategorySubMaster() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [subCategoryIdToDelete, setSubCategoryIdToDelete] = useState(null);
    const [formData, setFormData] = useState({
        CategorySubMasterId: '',
        CategorySub_Name: '',
        CategoryId: ''
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
    } = useGetCategorySubMasterQuery();

    const {
        data: maxCategoryId = 0,
        isLoading: isMaxIdLoading,
        refetch: refetchMaxId
    } = useGetMaxSubCategoryIdQuery();

    const {
        data: categories = [],
        isLoading: isCategoriesLoading
    } = useGetCategoryMasterQuery();

    const [addCategorySub] = useAddCategorySubMasterMutation();
    const [updateCategorySub] = useUpdateCategorySubMasterMutation();
    const [deleteCategorySub] = useDeleteCategorySubMasterMutation();

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ ...notification, show: false });
        }, 3000);
    };

    useEffect(() => {
        if (!editId && !isMaxIdLoading && isModalOpen) {
            const nextId = maxCategoryId + 1;
            setFormData(prev => ({
                ...prev,
                CategorySubMasterId: nextId.toString()
            }));
        }
    }, [maxCategoryId, isMaxIdLoading, editId, isModalOpen]);

    const handleAddNew = async () => {
        setEditId(null);
        resetForm();
        await refetchMaxId();
        setIsModalOpen(true);
    };

    const columns = [
        {
            header: 'Sub Category ID',
            accessor: 'CategorySubMasterId',
        },
        {
            header: 'Sub Category Name',
            accessor: 'CategorySub_Name',
        },
        {
            header: 'Category Name',
            accessor: 'category_name',
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
                        onClick={() => openDeleteConfirmModal(row.CategorySubMasterId)}
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

    const handleCategoryChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            CategoryId: selectedOption ? selectedOption.value : ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                CategorySub_Name: formData.CategorySub_Name,
                CategoryId: Number(formData.CategoryId)
            };

            if (editId) {
                await updateCategorySub({
                    id: Number(editId),
                    ...payload
                }).unwrap();
                showNotification('Sub Category updated successfully!');
            } else {
                await addCategorySub({
                    CategorySubMasterId: Number(formData.CategorySubMasterId),
                    ...payload
                }).unwrap();
                showNotification('Sub Category added successfully!');
            }

            resetForm();
            setIsModalOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to save sub category:', error);
            showNotification('Failed to save sub category!', 'error');
        }
    };

    const handleEdit = (row) => {
        setFormData({
            CategorySubMasterId: row.CategorySubMasterId.toString(),
            CategorySub_Name: row.CategorySub_Name,
            CategoryId: row.CategoryId.toString()
        });
        setEditId(row.CategorySubMasterId);
        setIsModalOpen(true);
    };

    const openDeleteConfirmModal = (id) => {
        setSubCategoryIdToDelete(id);
        setIsConfirmDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (subCategoryIdToDelete) {
            try {
                await deleteCategorySub(Number(subCategoryIdToDelete)).unwrap();
                showNotification('Sub Category deleted successfully!');
                refetch();
            } catch (error) {
                console.error('Failed to delete sub category:', error);
                showNotification('Failed to delete sub category!', 'error');
            } finally {
                setIsConfirmDeleteModalOpen(false);
                setSubCategoryIdToDelete(null);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            CategorySubMasterId: '',
            CategorySub_Name: '',
            CategoryId: ''
        });
        setEditId(null);
    };

    const categoryOptions = categories.map(category => ({
        value: category.CategoryId.toString(),
        label: `${category.CategoryId} - ${category.category_name}`
    }));


    const selectedCategory = categoryOptions.find(option =>
        option.value === formData.CategoryId?.toString()
    );

    if (isTableLoading || isCategoriesLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading sub categories</div>;

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
                title="Category Sub Master"
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
                title={editId ? 'Edit Sub Category' : 'Add New Sub Category'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sub Category ID
                            </label>
                            <input
                                type="text"
                                name="CategorySubMasterId"
                                value={formData.CategorySubMasterId}
                                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category Name</label>
                            <input
                                type="text"
                                name="CategorySub_Name"
                                value={formData.CategorySub_Name}
                                onChange={handleInputChange}
                                autoComplete='off'
                                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <Select
                                options={categoryOptions}
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                                placeholder="Select a category..."
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
                isOpen={isConfirmDeleteModalOpen}
                onClose={() => setIsConfirmDeleteModalOpen(false)}
                title="Confirm Deletion"
            >
                <div className="p-4">
                    <p className="text-gray-700 text-lg mb-4">
                        Are you sure you want to delete this sub category?
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

export default CategorySubMaster;