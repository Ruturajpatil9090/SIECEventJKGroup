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
  CheckBadgeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import ExportButton from '../../common/FileExport/exportUtils';

function NetworkingSlotDetailView({ isOpen, onClose, details, mainData, sponsors = [] }) {
  const [activeTab, setActiveTab] = useState('details');

  const slotDetails = details && details.length > 0 ? details[0] : mainData;

  if (!slotDetails) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Networking Slot Details" size="lg">
        <div className="p-6 text-center text-gray-500">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
            <DocumentTextIcon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No details available</h3>
          <p className="mt-1 text-sm text-gray-500">There are no details for this networking slot.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Networking Slot Details" size="2xl">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-lg text-gray-800 flex items-center">
              <BuildingOfficeIcon className="h-5 w-5 mr-2 text-blue-600" />
              Networking Slot Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Slot ID</p>
              <p className="text-md font-semibold text-gray-800">{slotDetails.NetworkingSlotId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Event</p>
              <p className="text-md font-semibold text-gray-800">{slotDetails.EventMaster_Name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Sponsor</p>
              <p className="text-md font-semibold text-gray-800">{slotDetails.Sponsor_Name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Invitation Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${slotDetails.Invitation_Sent === 'Y'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
                }`}>
                {slotDetails.Invitation_Sent === 'Y' ? 'Sent' : 'Not Sent'}
                {slotDetails.Invitation_Sent === 'Y' ? (
                  <CheckBadgeIcon className="h-4 w-4 ml-1" />
                ) : (
                  <XMarkIcon className="h-4 w-4 ml-1" />
                )}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Approval Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${slotDetails.Approval_Received === 'Y'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
                }`}>
                {slotDetails.Approval_Received === 'Y' ? 'Approved' : 'Pending'}
                {slotDetails.Approval_Received === 'Y' ? (
                  <CheckBadgeIcon className="h-4 w-4 ml-1" />
                ) : (
                  <XMarkIcon className="h-4 w-4 ml-1" />
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Speaker Details
            </button>
            <button
              onClick={() => setActiveTab('bio')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'bio'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Biography
            </button>
          </nav>
        </div>

        {activeTab === 'details' ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-lg text-gray-800 mb-6 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-indigo-600" />
              Speaker Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <UserIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Speaker Name</p>
                  <p className="text-sm text-gray-900">{slotDetails.Speaker_Name || 'Not specified'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <BriefcaseIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Designation</p>
                  <p className="text-sm text-gray-900">{slotDetails.designation || 'Not specified'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Mobile Number</p>
                  <p className="text-sm text-gray-900">{slotDetails.Mobile_No || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Email Address</p>
                  <p className="text-sm text-gray-900 break-all">{slotDetails.Email_Address || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Track</p>
                  <p className="text-sm text-gray-900">{slotDetails.Track || 'Not specified'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Speaking Date</p>
                  <p className="text-sm text-gray-900">
                    {slotDetails.Speaking_Date
                      ? new Date(slotDetails.Speaking_Date).toLocaleDateString()
                      : 'Not scheduled'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg text-gray-800 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-orange-600" />
                Biography
              </h3>
              <ExportButton
                data={slotDetails}
                sponsors={sponsors}
                onSuccess={(message) => console.log(message)}
                onError={(message) => console.error(message)}
                fileNamePrefix="Networking Slot Bio"
                requiredFields={['SponsorMasterId', 'designation', 'NetworkingSlotSession_Bio']}
                buttonText="Export Bio"
              />
            </div>

            <div className="prose prose-sm max-w-none">
              {slotDetails.NetworkingSlotSession_Bio ? (
                <div className="whitespace-pre-wrap text-gray-900">
                  {slotDetails.NetworkingSlotSession_Bio}
                </div>
              ) : (
                <p className="text-gray-500 italic">No biography available for this speaker.</p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default NetworkingSlotDetailView;