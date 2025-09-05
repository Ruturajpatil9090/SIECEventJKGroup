import React, { useState } from 'react';
import Modal from '../../common/Modal/Modal';
import {
    BuildingStorefrontIcon,
    CheckCircleIcon,
    XCircleIcon,
    DocumentTextIcon,
    CalendarIcon,
    BuildingOfficeIcon,
    TagIcon,
    ClipboardDocumentListIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

function ExpoRegistryDetailView({ isOpen, onClose, details, mainData }) {
    const expoDetails = details && details.length > 0 ? details[0] : mainData;

    if (!expoDetails) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Expo Registry Details" width="800px">
                <div className="p-6 text-center text-gray-500">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                        <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No details available</h3>
                    <p className="mt-1 text-sm text-gray-500">There are no details for this expo registry.</p>
                </div>
            </Modal>
        );
    }

    // Parse booth numbers if available
    const boothNumbers = expoDetails.Booth_Number_Assigned
        ? expoDetails.Booth_Number_Assigned.split(',').map(num => num.trim())
        : [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Expo Registry Details" width="800px">
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-2 rounded-lg border border-teal-100">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-lg text-gray-800 flex items-center">
                            <BuildingStorefrontIcon className="h-5 w-5 mr-2 text-teal-600" />
                            Expo Registry Information
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Expo ID</p>
                            <p className="text-md font-semibold text-gray-800">{expoDetails.ExpoRegistryTrackerId}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Event</p>
                            <p className="text-md font-semibold text-gray-800">{expoDetails.EventMaster_Name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Sponsor Name</p>
                            <p className="text-md font-semibold text-gray-800">{expoDetails.Sponsor_Name}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="font-semibold text-lg text-gray-800 mb-6 flex items-center">
                        <BuildingStorefrontIcon className="h-5 w-5 mr-2 text-teal-600" />
                        Booth Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start">
                            <TagIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Booth to be Provided</p>
                                <div className="flex items-center">
                                    {expoDetails.Booth_to_be_provided === 'Y' ? (
                                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1" />
                                    ) : (
                                        <XCircleIcon className="h-5 w-5 text-red-500 mr-1" />
                                    )}
                                    <span className="text-sm text-gray-900">
                                        {expoDetails.Booth_to_be_provided === 'Y' ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <TagIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Booth Assigned</p>
                                <div className="flex items-center">
                                    {expoDetails.Booth_Assigned === 'Y' ? (
                                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1" />
                                    ) : (
                                        <XCircleIcon className="h-5 w-5 text-red-500 mr-1" />
                                    )}
                                    <span className="text-sm text-gray-900">
                                        {expoDetails.Booth_Assigned === 'Y' ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {boothNumbers.length > 0 && (
                            <div className="md:col-span-2">
                                <div className="flex items-start">
                                    <TagIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 mb-2">Booth Numbers Assigned</p>
                                        <div className="flex flex-wrap gap-2">
                                            {boothNumbers.map((boothNumber, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800"
                                                >
                                                    Booth {boothNumber}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-start">
                            <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Logo Details Received</p>
                                <div className="flex items-center">
                                    {expoDetails.Logo_Details_Received === 'Y' ? (
                                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1" />
                                    ) : (
                                        <XCircleIcon className="h-5 w-5 text-red-500 mr-1" />
                                    )}
                                    <span className="text-sm text-gray-900">
                                        {expoDetails.Logo_Details_Received === 'Y' ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {expoDetails.Notes_Comments && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center">
                            <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-teal-600" />
                            Notes & Comments
                        </h3>

                        <div className="prose prose-sm max-w-none">
                            <div className="whitespace-pre-wrap text-gray-900 p-4 bg-gray-50 rounded-lg">
                                {expoDetails.Notes_Comments}
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center">
                        <BuildingOfficeIcon className="h-5 w-5 mr-2 text-teal-600" />
                        Expo Status Summary
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`p-4 rounded-lg text-center ${expoDetails.Booth_Assigned === 'Y'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                            }`}>
                            <p className="text-sm font-medium">Booth Status</p>
                            <p className="text-lg font-bold mt-1">
                                {expoDetails.Booth_Assigned === 'Y' ? 'Assigned' : 'Pending'}
                            </p>
                        </div>

                        <div className={`p-4 rounded-lg text-center ${expoDetails.Logo_Details_Received === 'Y'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                            }`}>
                            <p className="text-sm font-medium">Logo Status</p>
                            <p className="text-lg font-bold mt-1">
                                {expoDetails.Logo_Details_Received === 'Y' ? 'Received' : 'Pending'}
                            </p>
                        </div>

                        <div className={`p-4 rounded-lg text-center ${boothNumbers.length > 0
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-gray-50 text-gray-800 border border-gray-200'
                            }`}>
                            <p className="text-sm font-medium">Booths</p>
                            <p className="text-lg font-bold mt-1">
                                {boothNumbers.length > 0 ? boothNumbers.length : 'None'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={onClose}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default ExpoRegistryDetailView;