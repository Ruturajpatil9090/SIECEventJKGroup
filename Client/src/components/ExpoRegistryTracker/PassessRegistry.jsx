import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import TableUtility from "../../common/TableUtility/TableUtility";
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Trash2, Plus } from 'lucide-react';
import Modal from '../../common/Modal/Modal';
import {
  useGetPassesRegistriesQuery,
  useAddPassesRegistryMutation,
  useUpdatePassesRegistryMutation,
  useDeletePassesRegistryMutation,
  useGetMaxPassesRegistryIdQuery,
} from '../../services/passesRegistryApi';
import {
  useGetEventMastersQuery,
} from '../../services/eventMasterApi';
import {
  useGetDeliverablesQuery,
} from '../../services/deliverablesApi';
import CreateNewButton from "../../common/Buttons/AddButton";

function PassesRegistry() {
  // Main form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [formData, setFormData] = useState({
    Deliverabled_Code: '',
    Event_Code: '',
    Elite_Passess: 0,
    Carporate_Passess: 0,
    Visitor_Passess: 0,
    Deligate_Name_Recieverd: 'N',
    details: []
  });
  const [editId, setEditId] = useState(null);
  
  // Detail modal and form states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailFormData, setDetailFormData] = useState({
    Pass_type: '',
    Assigen_Name: '',
    Mobile_No: '',
    Email_Address: '',
    Designation: '',
    Remark: '',
  });
  const [detailEditIndex, setDetailEditIndex] = useState(null);
  
  // RTK Query hooks
  const { data: tableData = [], isLoading: isTableLoading, isError, refetch } = useGetPassesRegistriesQuery();
  const { data: events = [], isLoading: isEventsLoading } = useGetEventMastersQuery();
  const { data: deliverables = [], isLoading: isDeliverablesLoading } = useGetDeliverablesQuery();
  const { data: maxPassesRegistryId = 0, isLoading: isMaxIdLoading, refetch: refetchMaxId } = useGetMaxPassesRegistryIdQuery();

  const [addPassesRegistry] = useAddPassesRegistryMutation();
  const [updatePassesRegistry] = useUpdatePassesRegistryMutation();
  const [deletePassesRegistry] = useDeletePassesRegistryMutation();

  // Memos for select options
  const eventOptions = useMemo(() => events.map(event => ({
    value: event.EventMasterId,
    label: `${event.EventMasterId} - ${event.EventMaster_Name}`
  })), [events]);

  const deliverableOptions = useMemo(() => deliverables.map(deliverable => ({
    value: deliverable.id,
    label: `${deliverable.Deliverable_No} - ${deliverable.Deliverables}`
  })), [deliverables]);

  const passTypeOptions = [
    { value: 'E', label: 'Elite Pass' },
    { value: 'C', label: 'Corporate Pass' },
    { value: 'V', label: 'Visitor Pass' }
  ];

  // Effect for new entry ID
  useEffect(() => {
    if (!editId && isModalOpen && !isMaxIdLoading) {
      const nextId = (typeof maxPassesRegistryId === 'number' ? maxPassesRegistryId : 0) + 1;
      setFormData(prev => ({
        ...prev,
        PassessRegistryId: nextId
      }));
    }
  }, [maxPassesRegistryId, isMaxIdLoading, editId, isModalOpen]);

  // Main table columns
  const columns = [
    { header: 'ID', accessor: 'PassessRegistryId' },
    {
      header: 'Event Name',
      accessor: 'EventMaster_Name',
      cellRenderer: (value, row) => `${row.Event_Code} - ${value}`
    },
    {
      header: 'Deliverable',
      accessor: 'Deliverables',
      cellRenderer: (value, row) => `${row.Deliverabled_Code} - ${value}`
    },
    { header: 'Elite Passes', accessor: 'Elite_Passess' },
    { header: 'Corporate Passes', accessor: 'Carporate_Passess' },
    { header: 'Visitor Passes', accessor: 'Visitor_Passess' },
    { header: 'Delegate Name Received', accessor: 'Deligate_Name_Recieverd' },
    {
      header: 'Details Count',
      accessor: 'detailsCount',
      cellRenderer: (value, row) => Array.isArray(row.details) ? row.details.length : 0
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
            onClick={() => openDeleteConfirm(row.PassessRegistryId)}
            title="Delete"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )
    }
  ];
  
  // Detail table columns for the main modal
  const detailColumns = [
    { header: 'Pass Type', accessor: 'Pass_type', cellRenderer: (value) => passTypeOptions.find(opt => opt.value === value)?.label || value },
    { header: 'Assigned Name', accessor: 'Assigen_Name' },
    { header: 'Mobile No', accessor: 'Mobile_No' },
    { header: 'Email Address', accessor: 'Email_Address' },
    { header: 'Designation', accessor: 'Designation' },
    { header: 'Remark', accessor: 'Remark' },
    {
      header: 'Action',
      accessor: 'action',
      isAction: true,
      className: 'text-center',
      actionRenderer: (row) => (
        <div className="flex justify-center space-x-3">
          <button
            type="button"
            className="p-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
            onClick={() => handleDetailEdit(row)}
            title="Edit Detail"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="p-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-200"
            onClick={() => handleDetailDelete(row)}
            title="Delete Detail"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )
    }
  ];

  // Helper functions
  const resetMainForm = () => {
    setFormData({
      Deliverabled_Code: '',
      Event_Code: '',
      Elite_Passess: 0,
      Carporate_Passess: 0,
      Visitor_Passess: 0,
      Deligate_Name_Recieverd: 'N',
      details: []
    });
    setEditId(null);
  };
  
  const resetDetailForm = () => {
    setDetailFormData({
      Pass_type: '',
      Assigen_Name: '',
      Mobile_No: '',
      Email_Address: '',
      Designation: '',
      Remark: '',
    });
    setDetailEditIndex(null);
  };

  /**
   * Prevents the main modal from closing if the detail modal is currently open.
   * This is a critical fix to ensure the user can manage details without losing their progress.
   */
  const handleMainModalClose = () => {
    if (isDetailModalOpen) {
      return; // Do not close the main modal if the detail modal is open
    }
    setIsModalOpen(false);
    resetMainForm();
  };

  // Main CRUD operations
  const handleAddNew = async () => {
    setEditId(null);
    resetMainForm();
    await refetchMaxId();
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setFormData({
      PassessRegistryId: row.PassessRegistryId || '',
      Deliverabled_Code: row.Deliverabled_Code || '',
      Event_Code: row.Event_Code || '',
      Elite_Passess: row.Elite_Passess || 0,
      Carporate_Passess: row.Carporate_Passess || 0,
      Visitor_Passess: row.Visitor_Passess || 0,
      Deligate_Name_Recieverd: row.Deligate_Name_Recieverd || 'N',
      details: Array.isArray(row.details) ? [...row.details] : []
    });
    setEditId(row.PassessRegistryId);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalDetails = formData.details.map(detail => {
        if (!detail.rowaction) {
          return {
            ...detail,
            rowaction: detail.PassessRegistryDetailId ? 'update' : 'add'
          };
        }
        return detail;
      });

      const payload = {
        ...formData,
        details: finalDetails,
      };

      if (editId) {
        await updatePassesRegistry({ id: editId, ...payload }).unwrap();
      } else {
        await addPassesRegistry(payload).unwrap();
      }
      resetMainForm();
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to save passes registry:', error);
    }
  };

  const openDeleteConfirm = (id) => {
    setItemToDelete(id);
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deletePassesRegistry(itemToDelete).unwrap();
        refetch();
      } catch (error) {
        console.error('Failed to delete passes registry:', error);
      } finally {
        setShowDeleteConfirmModal(false);
        setItemToDelete(null);
      }
    }
  };

  // Detail modal operations
  const openDetailModal = () => {
    setDetailEditIndex(null);
    resetDetailForm();
    setIsDetailModalOpen(true);
  };

  const handleDetailEdit = (detailToEdit) => {
    const originalIndex = formData.details.findIndex(d => d.PassessRegistryDetailId === detailToEdit.PassessRegistryDetailId);
    
    setDetailFormData({ ...detailToEdit });
    setDetailEditIndex(originalIndex);
    setIsDetailModalOpen(true);
  };
  
  const handleDetailDelete = (detailToDelete) => {
    setFormData(prev => {
      const updatedDetails = [...prev.details];
      const indexToDelete = updatedDetails.findIndex(d => d.PassessRegistryDetailId === detailToDelete.PassessRegistryDetailId);
      
      if (indexToDelete === -1) {
        console.error("Detail to delete not found in the array.");
        return prev;
      }
      
      if (updatedDetails[indexToDelete].PassessRegistryDetailId) {
        updatedDetails[indexToDelete] = { ...updatedDetails[indexToDelete], rowaction: 'delete' };
      } else {
        updatedDetails.splice(indexToDelete, 1);
      }
      return { ...prev, details: updatedDetails };
    });
  };

  const handleDetailSubmit = (e) => {
    e.preventDefault();
    setFormData(prev => {
      const updatedDetails = [...prev.details];
      if (detailEditIndex !== null) {
        updatedDetails[detailEditIndex] = { ...detailFormData };
      } else {
        updatedDetails.push({ ...detailFormData });
      }
      return { ...prev, details: updatedDetails };
    });
    setIsDetailModalOpen(false);
    resetDetailForm();
  };
  
  // Data transformation for TableUtility
  const transformedTableData = tableData.map(item => ({
    ...item,
    details: Array.isArray(item.details) ? item.details : [],
    detailsCount: Array.isArray(item.details) ? item.details.length : 0
  }));

  const isLoading = isTableLoading || isEventsLoading || isDeliverablesLoading || isMaxIdLoading;
  const isErrorOccurred = isError;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isErrorOccurred) {
    return <div>An error occurred while loading Data.</div>;
  }

  const detailsToDisplay = formData.details.filter(d => d.rowaction !== 'delete');

  return (
    <>
      <TableUtility
        headerContent={<CreateNewButton onClick={handleAddNew} />}
        title="Passes Registry"
        columns={columns}
        data={transformedTableData}
        pageSize={10}
      />

      {/* Main Form Modal */}
      <Modal
        isOpen={isModalOpen}
        // CORRECTED: Use the new handler to prevent accidental closure
        onClose={handleMainModalClose}
        title={editId ? 'Edit Passes Registry' : 'Add New Passes Registry'}
        size="2xl"
        width="1200px"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {editId && (
              <div>
                <label htmlFor="PassessRegistryId" className="block text-sm font-medium text-gray-700 mb-1">
                  Passes Registry ID
                </label>
                <input
                  id="PassessRegistryId"
                  type="number"
                  value={formData.PassessRegistryId}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
                  readOnly
                />
              </div>
            )}
            
            <div>
              <label htmlFor="event_code" className="block text-sm font-medium text-gray-700 mb-1">Event</label>
              <Select
                id="event_code"
                options={eventOptions}
                value={eventOptions.find(option => option.value === parseInt(formData.Event_Code)) || null}
                onChange={(option) => {
                  setFormData(prev => ({ ...prev, Event_Code: option ? option.value : '' }));
                }}
                placeholder="Select an event..."
                isSearchable
                required
              />
            </div>
            
            <div>
              <label htmlFor="deliverable_code" className="block text-sm font-medium text-gray-700 mb-1">Deliverable</label>
              <Select
                id="deliverable_code"
                options={deliverableOptions}
                value={deliverableOptions.find(option => option.value === parseInt(formData.Deliverabled_Code)) || null}
                onChange={(option) => {
                  setFormData(prev => ({ ...prev, Deliverabled_Code: option ? option.value : '' }));
                }}
                placeholder="Select a deliverable..."
                isSearchable
                required
              />
            </div>
            
            <div>
              <label htmlFor="elite_passess" className="block text-sm font-medium text-gray-700 mb-1">Elite Passes</label>
              <input
                id="elite_passess"
                type="number"
                value={formData.Elite_Passess}
                onChange={(e) => setFormData(prev => ({ ...prev, Elite_Passess: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
              />
            </div>
            
            <div>
              <label htmlFor="corporate_passess" className="block text-sm font-medium text-gray-700 mb-1">Corporate Passes</label>
              <input
                id="corporate_passess"
                type="number"
                value={formData.Carporate_Passess}
                onChange={(e) => setFormData(prev => ({ ...prev, Carporate_Passess: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
              />
            </div>
            
            <div>
              <label htmlFor="visitor_passess" className="block text-sm font-medium text-gray-700 mb-1">Visitor Passes</label>
              <input
                id="visitor_passess"
                type="number"
                value={formData.Visitor_Passess}
                onChange={(e) => setFormData(prev => ({ ...prev, Visitor_Passess: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
              />
            </div>
            
            <div>
              <label htmlFor="delegate_received" className="block text-sm font-medium text-gray-700 mb-1">Delegate Name Received</label>
              <select
                id="delegate_received"
                value={formData.Deligate_Name_Recieverd}
                onChange={(e) => setFormData(prev => ({ ...prev, Deligate_Name_Recieverd: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <TableUtility
              headerContent={<button type="button" onClick={openDetailModal} className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md text-sm"><Plus className="h-4 w-4 mr-1" /> Add Detail</button>}
              title="Pass Details"
              columns={detailColumns}
              data={detailsToDisplay}
              pageSize={5}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => { setIsModalOpen(false); resetMainForm(); }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {editId ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
      
      {/* Detail Form Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          resetDetailForm();
        }}
        title={detailEditIndex !== null ? 'Edit Pass Detail' : 'Add New Pass Detail'}
      >
        <form onSubmit={handleDetailSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pass Type</label>
            <Select
              options={passTypeOptions}
              value={passTypeOptions.find(option => option.value === detailFormData.Pass_type) || null}
              onChange={(option) => setDetailFormData(prev => ({ ...prev, Pass_type: option ? option.value : '' }))}
              placeholder="Select pass type..."
              isSearchable
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Name</label>
            <input
              type="text"
              value={detailFormData.Assigen_Name}
              onChange={(e) => setDetailFormData(prev => ({ ...prev, Assigen_Name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              maxLength={50}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No</label>
            <input
              type="text"
              value={detailFormData.Mobile_No}
              onChange={(e) => setDetailFormData(prev => ({ ...prev, Mobile_No: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={detailFormData.Email_Address}
              onChange={(e) => setDetailFormData(prev => ({ ...prev, Email_Address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
            <input
              type="text"
              value={detailFormData.Designation}
              onChange={(e) => setDetailFormData(prev => ({ ...prev, Designation: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
            <textarea
              value={detailFormData.Remark}
              onChange={(e) => setDetailFormData(prev => ({ ...prev, Remark: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={2}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => { setIsDetailModalOpen(false); resetDetailForm(); }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {detailEditIndex !== null ? 'Update Detail' : 'Add Detail'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        title="Confirm Deletion"
      >
        <div className="p-4 text-center">
          <p className="text-lg text-gray-700 mb-6">Are you sure you want to delete this passes registry?</p>
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => setShowDeleteConfirmModal(false)}
              className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default PassesRegistry;