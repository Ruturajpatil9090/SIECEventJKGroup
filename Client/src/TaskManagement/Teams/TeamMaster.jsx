import React, { useState, useEffect, useMemo } from 'react';
import {
    useGetTeamMastersQuery,
    useAddTeamMasterMutation,
    useUpdateTeamMasterMutation,
    useDeleteTeamMasterMutation,
    useGetMaxTeamMasterIdQuery
} from '../../services/teamMasterApi';
import { useGetUserMastersQuery } from '../../services/userMasterApi';
import { Plus, Edit, Trash2, Users, User, Save, X, Eye, Calendar, Shield } from 'lucide-react';
import Select from 'react-select';

const TeamMaster = () => {

    const { data: teamsData = [], isLoading, isError, refetch } = useGetTeamMastersQuery();
    const { data: maxId } = useGetMaxTeamMasterIdQuery();
    const [addTeamMaster] = useAddTeamMasterMutation();
    const [updateTeamMaster] = useUpdateTeamMasterMutation();
    const [deleteTeamMaster] = useDeleteTeamMasterMutation();

    const { data: tbluser = [], isLoading: isTblUserLoading } = useGetUserMastersQuery();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [hoveredCard, setHoveredCard] = useState(null);

    const currentUser = sessionStorage.getItem("user_id");

    const [formData, setFormData] = useState({
        TeamMasterId: 0,
        Team_Name: '',
        Team_Purpose: '',
        Supervisor: currentUser || '',
        Created_By: 'admin',
        Modified_By: 'admin',
        details: []
    });

    const [validationErrors, setValidationErrors] = useState({});

    const tblOptions = useMemo(() => {
        return tbluser.map(user => ({
            value: user.User_Id,
            label: `${user.User_Name} - (${user.User_Id})`
        }));
    }, [tbluser]);


    const supervisorOptions = useMemo(() => {
        return tblOptions.filter(option =>
            !formData.details.some(detail =>
                detail.User_Id === option.value &&
                detail.rowaction !== 'delete' &&
                option.value !== formData.Supervisor
            )
        );
    }, [tblOptions, formData.details, formData.Supervisor]);


    const resetMainForm = () => {
        setFormData({
            TeamMasterId: (maxId || 0) + 1,
            Team_Name: '',
            Team_Purpose: '',
            Supervisor: currentUser || '',
            Created_By: 'admin',
            Modified_By: 'admin',
            details: []
        });
        setEditId(null);
        setValidationErrors({});
    };


    const handleAddNew = () => {
        resetMainForm();
        setIsModalOpen(true);
    };


    const handleEdit = (team) => {
        setFormData({
            ...team,
            Modified_By: 'admin'
        });
        setEditId(team.TeamMasterId);
        setIsModalOpen(true);
    };


    const openDeleteConfirm = (teamId, e) => {
        e.stopPropagation();
        setItemToDelete(teamId);
        setShowDeleteConfirmModal(true);
    };


    const confirmDelete = async () => {
        if (itemToDelete) {
            try {
                await deleteTeamMaster(itemToDelete).unwrap();
                refetch();
            } catch (error) {
                console.error('Failed to delete team:', error);
                alert('Failed to delete team. Please try again.');
            } finally {
                setShowDeleteConfirmModal(false);
                setItemToDelete(null);
            }
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {

            if (!formData.Team_Name || !formData.Team_Purpose || !formData.Supervisor) {
                setValidationErrors({ main: 'All main fields are required.' });
                return;
            }

            const supervisorInDetails = formData.details.some(detail =>
                detail.User_Id === formData.Supervisor && detail.rowaction !== 'delete'
            );

            let updatedDetails = [...formData.details];

            if (!supervisorInDetails && formData.Supervisor) {
                updatedDetails.push({
                    User_Id: formData.Supervisor,
                    rowaction: 'add'
                });
            }

            if (updatedDetails.filter(d => d.rowaction !== 'delete').length === 0) {
                setValidationErrors({ main: 'At least one team member is required.' });
                return;
            }
            setValidationErrors({});

            const payload = {
                ...formData,
                details: updatedDetails.map(detail => ({
                    ...detail,
                    rowaction: detail.TeamMasterDetailId && detail.rowaction !== 'delete' ? 'update' : detail.rowaction
                }))
            };

            if (editId) {
                await updateTeamMaster({ id: editId, ...payload }).unwrap();
            } else {
                await addTeamMaster(payload).unwrap();
            }

            resetMainForm();
            setIsModalOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to save team:', error);
            if (error.data?.detail) {
                alert(`Error: ${error.data.detail}`);
            } else {
                alert('Failed to save team. Please try again.');
            }
        }
    };


    const handleUserSelectChange = (selectedOptions) => {
        setFormData(prev => {
            const newDetails = selectedOptions.map(option => {
                const existingDetail = prev.details.find(d => d.User_Id === option.value);
                return existingDetail ? {
                    ...existingDetail,
                    rowaction: existingDetail.rowaction === 'delete' ? 'update' : 'add'
                } : {
                    User_Id: option.value,
                    rowaction: 'add'
                };
            });

            const detailsToRemove = prev.details
                .filter(d => d.TeamMasterDetailId && !selectedOptions.some(opt => opt.value === d.User_Id))
                .map(d => ({ ...d, rowaction: 'delete' }));

            return {
                ...prev,
                details: [...newDetails, ...detailsToRemove]
            };
        });
    };

    const handleSupervisorChange = (option) => {
        setFormData(prev => ({
            ...prev,
            Supervisor: option ? option.value : ''
        }));
    };


    const handleViewTeam = (team) => {
        setSelectedTeam(team);
    };

    const closeTeamView = () => {
        setSelectedTeam(null);
    };


    const getSupervisorName = (supervisorId) => {
        const user = tbluser.find(u => u.User_Id === supervisorId);
        return user ? user.User_Name : `User ID: ${supervisorId}`;
    };


    const getUserInfo = (userId) => {
        return tbluser.find(u => u.User_Id === userId);
    };


    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading || isTblUserLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto" />
                    <p className="text-gray-700 text-lg font-medium">Loading teams...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center text-red-600">
                    <p className="text-lg">An error occurred while loading teams.</p>
                    <button
                        onClick={refetch}
                        className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Team Management
                    </h1>
                    <p className="text-gray-600 mt-2">Create and manage teams with their members</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                    <Plus size={22} />
                    Create Team
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {teamsData.map((team) => {
                    const supervisor = getUserInfo(team.Supervisor);
                    const memberCount = team.details?.length || 0;

                    return (
                        <div
                            key={team.TeamMasterId}
                            className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden group cursor-pointer"
                            onMouseEnter={() => setHoveredCard(team.TeamMasterId)}
                            onMouseLeave={() => setHoveredCard(null)}
                            onClick={() => handleViewTeam(team)}
                        >
                            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{team.Team_Name}</h3>
                                        <p className="text-gray-600 text-sm line-clamp-2">{team.Team_Purpose}</p>
                                    </div>
                                    <div className="flex-shrink-0 ml-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                                            <Users className="text-blue-600" size={24} />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <Users size={20} className="text-blue-600 mx-auto mb-1" />
                                        <div className="text-2xl font-bold text-blue-600">{memberCount}</div>
                                        <div className="text-xs text-blue-500">Members</div>
                                    </div>
                                    <div className="text-center p-3 bg-indigo-50 rounded-lg">
                                        <Shield size={20} className="text-indigo-600 mx-auto mb-1" />
                                        <div className="text-sm font-semibold text-indigo-600 line-clamp-1">
                                            {supervisor?.User_Name || 'No Supervisor'}
                                        </div>
                                        <div className="text-xs text-indigo-500">Supervisor</div>
                                    </div>
                                </div>

                                {team.Created_Date && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                        <Calendar size={12} />
                                        Created {formatDate(team.Created_Date)}
                                    </div>
                                )}

                                <div className={`flex justify-end gap-2 transition-all duration-300 ${hoveredCard === team.TeamMasterId ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                                    }`}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(team); }}
                                        className="p-3 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
                                        title="Edit Team"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => openDeleteConfirm(team.TeamMasterId, e)}
                                        className="p-3 bg-red-100 text-red-600 hover:bg-red-200 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
                                        title="Delete Team"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleViewTeam(team); }}
                                        className="p-3 bg-green-100 text-green-600 hover:bg-green-200 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
                                        title="View Details"
                                    >
                                        <Eye size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {teamsData.length === 0 && (
                <div className="text-center py-20">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users size={48} className="text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No teams created yet</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">Get started by creating your first team to organize and manage your members effectively</p>
                    <button
                        onClick={handleAddNew}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        Create Your First Team
                    </button>
                </div>
            )}




            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                        {/* Close Icon */}
                        <button
                            type="button"
                            onClick={() => {
                                setIsModalOpen(false);
                                resetMainForm();
                            }}
                            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200 z-10"
                            aria-label="Close modal"
                        >
                            <X size={24} />
                        </button>

                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                            <h2 className="text-2xl font-bold text-gray-900 pr-10"> {/* Added padding-right for icon space */}
                                {editId ? 'Edit Team' : 'Create New Team'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {validationErrors.main && (
                                <div className="p-4 text-red-700 bg-red-50 rounded-lg border border-red-200">
                                    {validationErrors.main}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Team Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.Team_Name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, Team_Name: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter team name"
                                        required
                                        maxLength={50}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Team Purpose
                                    </label>
                                    <textarea
                                        value={formData.Team_Purpose}
                                        onChange={(e) => setFormData(prev => ({ ...prev, Team_Purpose: e.target.value }))}
                                        className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        rows={3}
                                        placeholder="Describe the purpose of this team"
                                        maxLength={255}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Supervisor
                                    </label>
                                    <Select
                                        options={supervisorOptions}
                                        value={supervisorOptions.find(opt => opt.value === formData.Supervisor)}
                                        onChange={handleSupervisorChange}
                                        placeholder="Select Supervisor..."
                                        isSearchable
                                        className="text-sm"
                                        styles={{
                                            control: (provided) => ({
                                                ...provided,
                                                borderColor: 'rgb(209 213 219)',
                                                borderRadius: '0.5rem',
                                                padding: '0.5rem',
                                                minHeight: '48px'
                                            }),
                                        }}
                                    />
                                    <p className="text-sm text-gray-500 mt-2">
                                        Supervisor will be automatically added to team members
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <Users size={20} />
                                    Team Members
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Select Team Members *
                                    </label>
                                    <Select
                                        options={tblOptions}
                                        value={formData.details
                                            .filter(d => d.rowaction !== 'delete')
                                            .map(d => tblOptions.find(opt => opt.value === d.User_Id))
                                            .filter(Boolean)}
                                        onChange={handleUserSelectChange}
                                        placeholder="Select team members..."
                                        isSearchable
                                        isMulti
                                        className="text-sm"
                                        styles={{
                                            control: (provided) => ({
                                                ...provided,
                                                borderColor: 'rgb(209 213 219)',
                                                borderRadius: '0.5rem',
                                                padding: '0.25rem',
                                                minHeight: '48px'
                                            }),
                                        }}
                                    />
                                </div>

                                {formData.details.filter(d => d.rowaction !== 'delete').length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Members:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.details
                                                .filter(d => d.rowaction !== 'delete')
                                                .map((detail, index) => {
                                                    const user = getUserInfo(detail.User_Id);
                                                    return user ? (
                                                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                                                            <User size={12} />
                                                            {user.User_Name}
                                                        </span>
                                                    ) : null;
                                                })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        resetMainForm();
                                    }}
                                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    <Save size={18} />
                                    {editId ? 'Update Team' : 'Create Team'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedTeam && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="textxl font-bold text-gray-900">{selectedTeam.Team_Name}</h2>
                                    <p className="text-green-600 mt-1">{selectedTeam.Team_Purpose}</p>
                                </div>
                                <button
                                    onClick={closeTeamView}
                                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-6 bg-blue-50 rounded-xl">
                                    <Users size={32} className="text-blue-600 mx-auto mb-3" />
                                    <div className="text-3xl font-bold text-blue-600">{selectedTeam.details?.length || 0}</div>
                                    <div className="text-sm text-blue-500 font-medium">Total Members</div>
                                </div>

                                <div className="text-center p-6 bg-indigo-50 rounded-xl">
                                    <Shield size={32} className="text-indigo-600 mx-auto mb-3" />
                                    <div className="text-lg font-bold text-indigo-600">
                                        {getSupervisorName(selectedTeam.Supervisor)}
                                    </div>
                                    <div className="text-sm text-indigo-500 font-medium">Supervisor</div>
                                </div>

                                <div className="text-center p-6 bg-green-50 rounded-xl">
                                    <Calendar size={32} className="text-green-600 mx-auto mb-3" />
                                    <div className="text-lg font-bold text-green-600">
                                        {selectedTeam.Created_Date ? formatDate(selectedTeam.Created_Date) : 'N/A'}
                                    </div>
                                    <div className="text-sm text-green-500 font-medium">Created Date</div>
                                </div>
                            </div>

                            {selectedTeam.details && selectedTeam.details.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <Users size={24} />
                                        Team Members ({selectedTeam.details.length})
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedTeam.details.map((member, index) => {
                                            const user = getUserInfo(member.User_Id);
                                            const isSupervisor = member.User_Id === selectedTeam.Supervisor;

                                            return user ? (
                                                <div key={index} className={`p-4 rounded-lg border transition-all duration-200 ${isSupervisor
                                                    ? 'border-indigo-200 bg-indigo-50 transform hover:-translate-y-1'
                                                    : 'border-gray-200 bg-white hover:shadow-md'
                                                    }`}>
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSupervisor
                                                            ? 'bg-indigo-100 text-indigo-600'
                                                            : 'bg-blue-100 text-blue-600'
                                                            }`}>
                                                            <User size={20} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-gray-900">{user.User_Name}</span>
                                                                {isSupervisor && (
                                                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                                                                        Supervisor
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600">{user.User_Email}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showDeleteConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={32} className="text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Deletion</h3>
                            <p className="text-gray-600 mb-6">Are you sure you want to delete this team? This action cannot be undone.</p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirmModal(false)}
                                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Delete Team
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamMaster;