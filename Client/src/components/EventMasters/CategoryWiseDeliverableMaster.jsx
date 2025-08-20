import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import TableUtility from "../../common/TableUtility/TableUtility";
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Trash2 } from 'lucide-react';
import Modal from '../../common/Modal/Modal';
import {
    useGetCategoryWiseDeliverablesQuery,
    useAddCategoryWiseDeliverableMutation,
    useUpdateCategoryWiseDeliverableMutation,
    useDeleteCategoryWiseDeliverableMutation,
    useGetMaxCatDeliverableIdQuery,
} from '../../services/categoryWiseDeliverableMasterApi';
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
import CreateNewButton from "../../common/Buttons/AddButton";

function CategoryWiseDeliverableMaster() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [formData, setFormData] = useState({
        CatDeliverableId: '',
        Event_Code: '',
        CategoryMaster_Code: '',
        CategorySubMaster_Code: '',
        details: []
    });
    const [editId, setEditId] = useState(null);
    const [selectedDeliverablesInModal, setSelectedDeliverablesInModal] = useState([]);

    const { data: tableData = [], isLoading: isTableLoading, isError, refetch } = useGetCategoryWiseDeliverablesQuery();
    const { data: events = [], isLoading: isEventsLoading } = useGetEventMastersQuery();
    const { data: categories = [], isLoading: isCategoriesLoading } = useGetCategoryMasterQuery();
    const { data: subCategories = [], refetch: refetchSubCategories, isLoading: isSubCategoriesLoading } = useGetCategorySubMasterQuery();
    const { data: allDeliverables = [], isLoading: isDeliverablesLoading } = useGetDeliverablesQuery();
    console.log("tableData", tableData)

    const { data: maxCatDeliverableId = 0, isLoading: isMaxIdLoading, refetch: refetchMaxId } = useGetMaxCatDeliverableIdQuery();

    const [addCategoryWiseDeliverable] = useAddCategoryWiseDeliverableMutation();
    const [updateCategoryWiseDeliverable] = useUpdateCategoryWiseDeliverableMutation();
    const [deleteCategoryWiseDeliverable] = useDeleteCategoryWiseDeliverableMutation();

    useEffect(() => {
        if (!editId && isModalOpen && !isMaxIdLoading) {
            const nextId = (typeof maxCatDeliverableId === 'number' ? maxCatDeliverableId : 0) + 1;
            setFormData(prev => ({
                ...prev,
                CatDeliverableId: nextId
            }));
        }
    }, [maxCatDeliverableId, isMaxIdLoading, editId, isModalOpen]);


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


    const columns = [
        { header: 'ID', accessor: 'CatDeliverableId' },
        {
            header: 'Event Name',
            accessor: 'EventMaster_Name',
            cellRenderer: (value, row) => `${row.Event_Code} - ${value}`
        },
        {
            header: 'Super Event Master',
            accessor: 'EventSuper_Name',
        },
        {
            header: 'Category',
            accessor: 'category_name',
            cellRenderer: (value, row) => `${row.CategoryMaster_Code} - ${value}`
        },
        {
            header: 'Sub Category',
            accessor: 'CategorySub_Name',
            cellRenderer: (value, row) => `${row.CategorySubMaster_Code} - ${value}`
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
                        onClick={() => openDeleteConfirm(row.CatDeliverableId)}
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
        setSelectedDeliverablesInModal(allDeliverables.map(d => d.id));
        setIsModalOpen(true);
    };

    const handleEdit = (row) => {
        setFormData({
            CatDeliverableId: row.CatDeliverableId || '',
            Event_Code: row.Event_Code || '',
            CategoryMaster_Code: row.CategoryMaster_Code || '',
            CategorySubMaster_Code: row.CategorySubMaster_Code || '',
            details: Array.isArray(row.details) ? [...row.details] : []
        });

        const eventOption = eventOptions.find(o => o.value === row.Event_Code) || null;
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
            category: categoryOption,
            subCategory: subCategoryOption,
        });

        setSelectedDeliverablesInModal(Array.isArray(row.details) ? row.details.map(d => d.Deliverabled_Code) : []);
        setEditId(row.CatDeliverableId);
        setIsModalOpen(true);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const payloadData = {
            ...formData,
            CategorySubMaster_Code: formData.CategorySubMaster_Code === '' ? 0 : parseInt(formData.CategorySubMaster_Code),
            CategoryMaster_Code: formData.CategoryMaster_Code === '' ? 0 : parseInt(formData.CategoryMaster_Code)
        };

        const finalDetails = selectedDeliverablesInModal.map(selectedId => {
            const deliverable = allDeliverables.find(d => d.id === selectedId);
            return deliverable ? {
                Deliverabled_Code: deliverable.id,
                Deliverable_No: deliverable.Deliverable_No,
            } : null;
        }).filter(Boolean);

        try {
            const payload = { ...payloadData, details: finalDetails };
            if (editId) {
                await updateCategoryWiseDeliverable({ id: editId, ...payload }).unwrap();
            } else {
                await addCategoryWiseDeliverable(payload).unwrap();
            }
            resetForm();
            setIsModalOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to save category wise deliverable:', error);
        }
    };

    const openDeleteConfirm = (id) => {
        setItemToDelete(id);
        setShowDeleteConfirmModal(true);
    };

    const confirmDelete = async () => {
        if (itemToDelete) {
            try {
                await deleteCategoryWiseDeliverable(itemToDelete).unwrap();
                refetch();
            } catch (error) {
                console.error('Failed to delete category wise deliverable:', error);
            } finally {
                setShowDeleteConfirmModal(false);
                setItemToDelete(null);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            CatDeliverableId: '',
            Event_Code: '',
            CategoryMaster_Code: '',
            CategorySubMaster_Code: '',
            details: []
        });
        setSelectedDeliverablesInModal([]);
        setSelectedOptions({
            event: null,
            category: null,
            subCategory: null,
        });
        setEditId(null);
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

    return (
        <>
            <TableUtility
                headerContent={<CreateNewButton onClick={handleAddNew} />}
                title="Category Wise Deliverables Master"
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
                title={editId ? 'Edit Category Wise Deliverable' : 'Add New Category Wise Deliverable'}
                size="2xl"
                width="1200px"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="CatDeliverableId" className="block text-sm font-medium text-gray-700 mb-1">
                                Category Deliverable ID
                            </label>
                            <input
                                id="CatDeliverableId"
                                type="number"
                                name="CatDeliverableId"
                                value={formData.CatDeliverableId}
                                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
                                readOnly
                                aria-label="Category Deliverable ID (auto-generated)"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                {isMaxIdLoading ? 'Loading Max ID...' : 'Auto-generated'}
                            </p>
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
                                placeholder="Select an event..."
                                isSearchable
                                required
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
                                placeholder="Select a category..."
                                isSearchable
                            // required
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
                                placeholder="Select a sub category..."
                                isSearchable
                            // required
                            />
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
                    <p className="text-lg text-gray-700 mb-6">Are you sure you want to delete this category wise deliverable?</p>
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

export default CategoryWiseDeliverableMaster;
