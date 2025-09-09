import React, { useEffect } from 'react';
import {
    XMarkIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    TicketIcon,
    MegaphoneIcon,
    TrophyIcon,
    CalendarDaysIcon,
    HashtagIcon,
    CurrencyDollarIcon,
    ClockIcon,
    BuildingStorefrontIcon,
    CheckBadgeIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';


const SponsorDetailsPopup = ({ isOpen, onClose, sponsorDetails }) => {

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.keyCode === 27) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    if (!isOpen || !sponsorDetails) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity duration-300 cursor-pointer"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto transform transition-transform duration-300 scale-100 opacity-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-t-xl flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Sponsor Details</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-blue-100 hover:text-white transition-colors rounded-full hover:bg-blue-500"
                        aria-label="Close"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {sponsorDetails.map((detail, index) => (
                        <div key={index} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <UserIcon className="h-5 w-5 text-blue-600" />
                                        Sponsor Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start">
                                            <HashtagIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Sponsor ID</label>
                                                <p className="text-gray-900 font-medium">{detail.SponsorMasterId}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <UserIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Sponsor Name</label>
                                                <p className="text-gray-900 font-medium">{detail.Sponsor_Name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <UserIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Contact Person</label>
                                                <p className="text-gray-900">{detail.Contact_Person || ''}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Contact Email</label>
                                                <p className="text-gray-900 break-all">{detail.Contact_Email || ''}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Contact Phone</label>
                                                <p className="text-gray-900">{detail.Contact_Phone || ''}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
                                        Event Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Event</label>
                                            <p className="text-gray-900 font-medium">{detail.EventMaster_Name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Super Event</label>
                                            <p className="text-gray-900">{detail.EventSuper_Name}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <label className="text-sm font-medium text-blue-600 flex items-center gap-1">
                                                    <CurrencyDollarIcon className="h-4 w-4" />
                                                    Sponsorship Amount
                                                </label>
                                                <p className="text-gray-900 font-bold">₹{detail.Sponsorship_Amount?.toLocaleString() || '0'}</p>
                                            </div>
                                            <div className="bg-amber-50 p-3 rounded-lg">
                                                <label className="text-sm font-medium text-amber-600 flex items-center gap-1">
                                                    <ClockIcon className="h-4 w-4" />
                                                    Pending Amount
                                                </label>
                                                <p className="text-gray-900 font-bold">₹{detail.Pending_Amount?.toLocaleString() || '0'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Booth Information Section - Added Here */}
                            {detail.Booth_Number_Assigned && (
                                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <BuildingStorefrontIcon className="h-5 w-5 text-blue-600" />
                                        Booth Information
                                    </h3>
                                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border border-indigo-200">
                                        <div className="flex items-center mb-2">
                                            <div className="bg-indigo-100 p-2 rounded-full mr-3">
                                                <BuildingStorefrontIcon className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <label className="text-sm font-medium text-indigo-700">Booth Numbers Assigned</label>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {detail.Booth_Number_Assigned.split(',').map((booth, boothIndex) => (
                                                <span
                                                    key={boothIndex}
                                                    className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                                                >
                                                    Booth {booth.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <TicketIcon className="h-5 w-5 text-blue-600" />
                                    Passes Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 text-center transition-transform hover:scale-105">
                                        <div className="bg-blue-100 p-2 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                                            <TicketIcon className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <label className="text-sm font-medium text-blue-700">Elite Passes</label>
                                        <p className="text-2xl font-bold text-blue-900 mt-1">{detail.Elite_Passess || 0}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200 text-center transition-transform hover:scale-105">
                                        <div className="bg-purple-100 p-2 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                                            <TicketIcon className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <label className="text-sm font-medium text-purple-700">Corporate Passes</label>
                                        <p className="text-2xl font-bold text-purple-900 mt-1">{detail.Carporate_Passess || 0}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200 text-center transition-transform hover:scale-105">
                                        <div className="bg-green-100 p-2 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                                            <TicketIcon className="h-6 w-6 text-green-600" />
                                        </div>
                                        <label className="text-sm font-medium text-green-700">Visitor Passes</label>
                                        <p className="text-2xl font-bold text-green-900 mt-1">{detail.Visitor_Passess || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <MegaphoneIcon className="h-5 w-5 text-blue-600" />
                                    Speakers Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
                                        <div className="flex items-center mb-3">
                                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                                                <MegaphoneIcon className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <label className="text-sm font-medium text-blue-700">Ministerial RoundTable Speaker</label>
                                        </div>


                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <UserIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.MinistrialSpeakername || ''}</p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <TicketIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.MinistrialTrackerDesignation || ''}</p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <PhoneIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.MinistrialMobileNo || ''}</p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.MinistrialEmailId || ''}</p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <HashtagIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.MinistrilaTrack || ''}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
                                        <div className="flex items-center mb-3">
                                            <div className="bg-green-100 p-2 rounded-full mr-3">
                                                <MegaphoneIcon className="h-5 w-5 text-green-600" />
                                            </div>
                                            <label className="text-sm font-medium text-green-700">Curated Session Speaker</label>
                                        </div>


                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <UserIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.CuratedSpeakername || ''}</p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <TicketIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.CuratedDesignation || ''}</p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <PhoneIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.CuratedMobileNo || ''}</p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.CuratedEmailId || ''}</p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <HashtagIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.CuratedTrack === 'E' ? "Ethanol" : "Bioenergy" || ''}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200">
                                        <div className="flex items-center mb-3">
                                            <div className="bg-purple-100 p-2 rounded-full mr-3">
                                                <MegaphoneIcon className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <label className="text-sm font-medium text-purple-700">Speaker Tracker Sponsors</label>
                                        </div>

                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <UserIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.SpeakerTrackerSpeakerName || ''}</p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <TicketIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.SpeakerTrackerDesignation || ''}</p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <PhoneIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.SpeakerTrackerMobile_No || ''}</p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.SpeakerTrackerEmailId || ''}</p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <HashtagIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.SpeakerTrackerTrack === 'E' ? "Ethanol" : "Bioenergy" || ''}</p>
                                            </div>
                                        </div>

                                    </div>

                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200">
                                        <div className="flex items-center mb-3">
                                            <div className="bg-purple-100 p-2 rounded-full mr-3">
                                                <MegaphoneIcon className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <label className="text-sm font-medium text-orange-700">Secretarial RoundTable Sessions</label>
                                        </div>

                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <UserIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.SecretarialRoundSpeakerName || ''}</p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <TicketIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.SecretarialRoundDesignation || ''}</p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <PhoneIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.SecretarialRoundMobileNo || ''}</p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.SecretarialRoundEmailAddress || ''}</p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <HashtagIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.SecretarialRoundTrack || ''}</p>
                                            </div>


                                            <div className="flex items-center space-x-2">
                                                <PaperAirplaneIcon className={`h-5 w-5 ${detail.SecretarialRoundInvitationsent === 'Y' ? 'text-green-500' : 'text-red-500'}`} />
                                                <span className="text-sm font-medium text-gray-600">Invitation Sent:</span>
                                                <p className="text-gray-900 font-medium">
                                                    {detail.SecretarialRoundInvitationsent === 'Y' ? 'Yes' : 'No'}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <CheckBadgeIcon className={`h-5 w-5 ${detail.SecretarialRoundApprovalReceived === 'Y' ? 'text-green-500' : 'text-red-500'}`} />
                                                <span className="text-sm font-medium text-gray-600">Approval Received:</span>
                                                <p className="text-gray-900 font-medium">
                                                    {detail.SecretarialRoundApprovalReceived === 'Y' ? 'Yes' : 'No'}
                                                </p>
                                            </div>






                                        </div>

                                    </div>




                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200">
                                        <div className="flex items-center mb-3">
                                            <div className="bg-purple-100 p-2 rounded-full mr-3">
                                                <MegaphoneIcon className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <label className="text-sm font-medium text-orange-700">Networking Slot Tracker</label>
                                        </div>

                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <UserIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.NetworkingSpeakername || ''}</p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <TicketIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.NetworkingDesignation || ''}</p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <PhoneIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.NetworkingMobileNo || ''}</p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.NetworkingEmailAddress || ''}</p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <HashtagIcon className="h-5 w-5 text-gray-500" />
                                                <p className="text-gray-900 font-medium">{detail.NetworkingTrack || ''}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <PaperAirplaneIcon className={`h-5 w-5 ${detail.NetworkingInvitationSent === 'Y' ? 'text-green-500' : 'text-red-500'}`} />
                                                <span className="text-sm font-medium text-gray-600">Invitation Sent:</span>
                                                <p className="text-gray-900 font-medium">
                                                    {detail.NetworkingInvitationSent === 'Y' ? 'Yes' : 'No'}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <CheckBadgeIcon className={`h-5 w-5 ${detail.NetworkingApproved === 'Y' ? 'text-green-500' : 'text-red-500'}`} />
                                                <span className="text-sm font-medium text-gray-600">Approval Received:</span>
                                                <p className="text-gray-900 font-medium">
                                                    {detail.NetworkingApproved === 'Y' ? 'Yes' : 'No'}
                                                </p>
                                            </div>
                                        </div>

                                    </div>



                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <TrophyIcon className="h-5 w-5 text-blue-600" />
                                    Award Information
                                </h3>
                                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-xl border border-amber-200">
                                    <div className="flex items-center mb-2">
                                        <div className="bg-amber-100 p-2 rounded-full mr-3">
                                            <TrophyIcon className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <label className="text-sm font-medium text-amber-700">Award Name</label>
                                    </div>
                                    <p className="text-gray-900 font-medium text-lg">{detail.Award_Name || 'No awards specified'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SponsorDetailsPopup;