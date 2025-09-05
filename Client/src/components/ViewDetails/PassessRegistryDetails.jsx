import React, { useState } from 'react';
import Modal from '../../common/Modal/Modal';
import {
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    BriefcaseIcon,
    DocumentTextIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    UserGroupIcon,
    BuildingOfficeIcon,
    TicketIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

function PassesRegistryDetailView({ isOpen, onClose, details, mainData }) {
    const [expandedSections, setExpandedSections] = useState({
        elite: false,
        corporate: false,
        visitor: false
    });

    const handleClose = () => {
        setExpandedSections({
            elite: false,
            corporate: false,
            visitor: false
        });
        onClose();
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const closeSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: false
        }));
    };

    if (!details || details.length === 0) {
        return (
            <Modal isOpen={isOpen} onClose={handleClose} title="Pass Details" size="lg">
                <div className="p-6 text-center text-gray-500">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                        <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No details available</h3>
                    <p className="mt-1 text-sm text-gray-500">There are no pass details for this record.</p>
                </div>
            </Modal>
        );
    }


    const groupedDetails = {
        elite: details.filter(d => d.Pass_type === 'E'),
        corporate: details.filter(d => d.Pass_type === 'C'),
        visitor: details.filter(d => d.Pass_type === 'V')
    };

    const passTypeConfig = {
        elite: {
            title: 'Elite Passes',
            icon: UserGroupIcon,
            color: 'bg-purple-100 text-purple-800 border-purple-200',
            iconColor: 'text-purple-600',
            count: groupedDetails.elite.length,
            total: mainData?.Elite_Passess || 0
        },
        corporate: {
            title: 'Corporate Passes',
            icon: BuildingOfficeIcon,
            color: 'bg-blue-100 text-blue-800 border-blue-200',
            iconColor: 'text-blue-600',
            count: groupedDetails.corporate.length,
            total: mainData?.Carporate_Passess || 0
        },
        visitor: {
            title: 'Visitor Passes',
            icon: TicketIcon,
            color: 'bg-green-100 text-green-800 border-green-200',
            iconColor: 'text-green-600',
            count: groupedDetails.visitor.length,
            total: mainData?.Visitor_Passess || 0
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'C': return 'bg-green-100 text-green-800';
            case 'P': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-red-100 text-red-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'C': return 'Complete';
            case 'P': return 'Partial';
            default: return 'No';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Pass Details" width="1000px">
            <div className="space-y-6">
                {mainData && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
                        <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center">
                                <BriefcaseIcon className="h-5 w-5 mr-2 text-blue-600" />
                                Sponsor Information
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Sponsor Name</p>
                                <p className="text-md font-semibold text-gray-800">{mainData.Sponsor_Name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Event</p>
                                <p className="text-md font-semibold text-gray-800">{mainData.EventMaster_Name}</p>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Details Received</p>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(mainData.Deligate_Name_Recieverd)}`}>
                                    {getStatusText(mainData.Deligate_Name_Recieverd)}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Registration Form Sent</p>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${mainData.Registration_Form_Sent === 'Y' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {mainData.Registration_Form_Sent === 'Y' ? 'Yes' : 'No'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-lg text-gray-800 mb-4">Pass Allocation Summary</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(passTypeConfig).map(([key, config]) => {
                            const IconComponent = config.icon;
                            const utilizationPercent = config.total > 0 ? Math.round((config.count / config.total) * 100) : 0;

                            return (
                                <div
                                    key={key}
                                    className={`p-4 rounded-lg border ${config.color} cursor-pointer transition-all hover:shadow-md`}
                                    onClick={() => toggleSection(key)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex flex-col">
                                                <h4 className="font-medium">{config.title}</h4>
                                                <p className="text-sm">
                                                    {config.count} of {config.total} assigned
                                                </p>
                                            </div>
                                            <div className={`ml-3 p-2 rounded-lg ${config.color}`}>
                                                <IconComponent className={`h-6 w-6 ${config.iconColor}`} />
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                                <div
                                                    className={`h-2.5 rounded-full ${config.color.split(' ')[0]}`}
                                                    style={{ width: `${utilizationPercent}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-medium">{utilizationPercent}%</span>
                                            {expandedSections[key] ? (
                                                <ChevronUpIcon className="h-5 w-5 ml-2" />
                                            ) : (
                                                <ChevronDownIcon className="h-5 w-5 ml-2" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-4">
                    {Object.entries(passTypeConfig).map(([key, config]) => (
                        expandedSections[key] && groupedDetails[key].length > 0 && (
                            <div key={key} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className={`p-4 ${config.color} border-b flex justify-between items-center`}>
                                    <h3 className="font-semibold flex items-center">
                                        <config.icon className={`h-5 w-5 mr-2 ${config.iconColor}`} />
                                        {config.title} ({groupedDetails[key].length} of {config.total})
                                    </h3>
                                    <button
                                        onClick={() => closeSection(key)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                                    {groupedDetails[key].map((detail, index) => (
                                        <div key={index} className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center mb-2">
                                                        <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                                                        <h4 className="font-medium text-gray-900">{detail.Assigen_Name}</h4>
                                                    </div>

                                                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm pl-7">
                                                        {detail.Mobile_No && (
                                                            <div className="flex items-center">
                                                                <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                                <span>{detail.Mobile_No}</span>
                                                            </div>
                                                        )}
                                                        {detail.Email_Address && (
                                                            <div className="flex items-center">
                                                                <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                                <span className="truncate">{detail.Email_Address}</span>
                                                            </div>
                                                        )}
                                                        {detail.Designation && (
                                                            <div className="flex items-center">
                                                                <BriefcaseIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                                <span>{detail.Designation}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {detail.Remark && (
                                                        <div className="mt-2 flex items-start pl-7">
                                                            <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                                            <p className="text-sm text-gray-600">{detail.Remark}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    ))}
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleClose}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default PassesRegistryDetailView;