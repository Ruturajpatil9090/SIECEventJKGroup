import React, { useState } from 'react';
import Modal from '../../common/Modal/Modal';
import {
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    BriefcaseIcon,
    DocumentTextIcon,
    CalendarIcon,
    BuildingOfficeIcon,
    PresentationChartBarIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

function SpeakerTrackerDetailView({ isOpen, onClose, details, mainData }) {
    const [activeTab, setActiveTab] = useState('details');

    const sessionDetails = details && details.length > 0 ? details[0] : mainData;

    if (!sessionDetails) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Speaker Tracker Details" size="lg">
                <div className="p-6 text-center text-gray-500">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                        <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No details available</h3>
                    <p className="mt-1 text-sm text-gray-500">There are no details for this speaker tracker.</p>
                </div>
            </Modal>
        );
    }

    // Map track codes to readable labels
    const trackLabels = {
        'E': 'Ethanol & Bioenergy',
        'S': 'Sugar'
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Speaker Tracker Details" size="2xl">
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg border border-orange-100">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-lg text-gray-800 flex items-center">
                            <PresentationChartBarIcon className="h-5 w-5 mr-2 text-orange-600" />
                            Speaker Tracker Information
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Speaker ID</p>
                            <p className="text-md font-semibold text-gray-800">{sessionDetails.SpeakerTrackerId}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Event</p>
                            <p className="text-md font-semibold text-gray-800">{sessionDetails.EventMaster_Name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Sponsor</p>
                            <p className="text-md font-semibold text-gray-800">{sessionDetails.Sponsor_Name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Track</p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                {trackLabels[sessionDetails.Track] || sessionDetails.Track}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'details'
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Speaker Details
                        </button>
                        <button
                            onClick={() => setActiveTab('bio')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'bio'
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Biography
                        </button>
                        <button
                            onClick={() => setActiveTab('session')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'session'
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Session Info
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'details' ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="font-semibold text-lg text-gray-800 mb-6 flex items-center">
                            <UserIcon className="h-5 w-5 mr-2 text-orange-600" />
                            Speaker Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start">
                                <UserIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Speaker Name</p>
                                    <p className="text-sm text-gray-900">{sessionDetails.Speaker_Name || 'Not specified'}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <BriefcaseIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Designation</p>
                                    <p className="text-sm text-gray-900">{sessionDetails.Designation || 'Not specified'}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Mobile Number</p>
                                    <p className="text-sm text-gray-900">{sessionDetails.Mobile_No || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Email Address</p>
                                    <p className="text-sm text-gray-900 break-all">{sessionDetails.Email_Address || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'bio' ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="font-semibold text-lg text-gray-800 mb-6 flex items-center">
                            <DocumentTextIcon className="h-5 w-5 mr-2 text-orange-600" />
                            Speaker Biography
                        </h3>

                        <div className="prose prose-sm max-w-none">
                            {sessionDetails.Speaker_Bio ? (
                                <div className="whitespace-pre-wrap text-gray-900">
                                    {sessionDetails.Speaker_Bio}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No biography available for this speaker.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="font-semibold text-lg text-gray-800 mb-6 flex items-center">
                            <PresentationChartBarIcon className="h-5 w-5 mr-2 text-orange-600" />
                            Session Information
                        </h3>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="flex items-start">
                                <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pitch Session Topic</p>
                                    <p className="text-sm text-gray-900">{sessionDetails.Pitch_session_Topic || 'Not specified'}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Speaking Date</p>
                                    <p className="text-sm text-gray-900">
                                        {sessionDetails.Speaking_Date
                                            ? new Date(sessionDetails.Speaking_Date).toLocaleDateString()
                                            : 'Not scheduled'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button
                        onClick={onClose}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default SpeakerTrackerDetailView;