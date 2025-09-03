// import React, { useMemo, useState } from 'react';
// import {
//   Users,
//   Building2,
//   Award,
//   ChevronDown,
//   ChevronUp,
//   Search,
//   Mic,
//   Mic2,
//   Presentation,
//   Store
// } from 'lucide-react';
// import { useGetDashboardStatsQuery } from '../../services/sponsorMasterApi';
// import { formatReadableAmount } from '../../common/Functions/FormatAmount';
// import {useNavigate,Link } from "react-router-dom"

// function Dashboard() {
//   const { data: dashboardData, error, isLoading } = useGetDashboardStatsQuery({ event_code: sessionStorage.getItem("Event_Code") });

//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('All');
//   const [categoryFilter, setCategoryFilter] = useState('All');
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
//   const navigate = useNavigate()

//   const stats = dashboardData?.data?.stats || {};
//   const sponsorDetails = dashboardData?.data?.sponsor_details || [];

//   const metricsData = useMemo(() => {
//     const totalRevenue = sponsorDetails.reduce((sum, sponsor) => sum + (sponsor.Sponsorship_Amount || 0), 0);
//     const confirmedSponsors = sponsorDetails.filter(sponsor => sponsor.Approval_Received === 'Y').length;
//     const pendingSponsors = sponsorDetails.filter(sponsor => sponsor.Approval_Received === 'N').length;
//     const totalAdvance = sponsorDetails.reduce((sum, sponsor) => sum + (sponsor.Sponsorship_Amount_Advance || 0), 0);

//     return {
//       totalRevenue,
//       confirmedSponsors,
//       pendingSponsors,
//       totalAdvance,
//       averageSponsorship: sponsorDetails.length > 0 ? totalRevenue / sponsorDetails.length : 0
//     };
//   }, [sponsorDetails]);


//   const sponsors = useMemo(() => {
//     return sponsorDetails.map(sponsor => ({
//       SponsorMasterId: sponsor.SponsorMasterId || Math.random(),
//       Sponsor_Name: sponsor.Sponsor_Name,
//       Address: sponsor.Address || '',
//       Category: sponsor.CategorySub_Name,
//       Sponsorship_Amount: sponsor.Sponsorship_Amount || 0,
//       Sponsorship_Amount_Advance: sponsor.Sponsorship_Amount_Advance || 0,
//       Pending_Amount: sponsor.Pending_Amount || 0,
//       Status: sponsor.Approval_Received === 'Y' ? 'Confirmed' : 'Pending',
//       Contact_Person: sponsor.Contact_Person,
//       Contact_Email: sponsor.Contact_Email,
//       Contact_Phone: sponsor.Contact_Phone,
//       Proposal_Sent: sponsor.Proposal_Sent,
//       User_Name: sponsor.User_Name
//     }));
//   }, [sponsorDetails]);

//   const filteredSponsors = useMemo(() => {
//     let filtered = sponsors.filter(sponsor => {
//       const matchesSearch = sponsor.Sponsor_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (sponsor.Address && sponsor.Address.toLowerCase().includes(searchTerm.toLowerCase())) ||
//         sponsor.Contact_Person.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchesStatus = statusFilter === 'All' || sponsor.Status === statusFilter;
//       const matchesCategory = categoryFilter === 'All' || sponsor.Category === categoryFilter;

//       return matchesSearch && matchesStatus && matchesCategory;
//     });

//     if (sortConfig.key) {
//       filtered.sort((a, b) => {
//         if (a[sortConfig.key] < b[sortConfig.key]) {
//           return sortConfig.direction === 'asc' ? -1 : 1;
//         }
//         if (a[sortConfig.key] > b[sortConfig.key]) {
//           return sortConfig.direction === 'asc' ? 1 : -1;
//         }
//         return 0;
//       });
//     }

//     return filtered;
//   }, [sponsors, searchTerm, statusFilter, categoryFilter, sortConfig]);

//   const handleSort = (key) => {
//     let direction = 'asc';
//     if (sortConfig.key === key && sortConfig.direction === 'asc') {
//       direction = 'desc';
//     }
//     setSortConfig({ key, direction });
//   };

//   const statusOptions = ['All', 'Confirmed', 'Pending'];
//   const categoryOptions = ['All', ...new Set(sponsors.map(s => s.Category).filter(Boolean))];

//   if (isLoading) {
//     return (
//       <div className="p-6 bg-gray-50 min-h-screen mt-10 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6 bg-gray-50 min-h-screen mt-10 flex items-center justify-center">
//         <div className="text-center text-red-600">
//           <p>Error loading dashboard data</p>
//           <p className="text-sm">{error.message}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//  <div className="p-6 bg-gray-50 min-h-screen mt-10 cursor-pointer">
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
//         <Link className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col" to="/sponsor-master"> 
//           <div className="flex items-center justify-between mb-4" >
//             <h2 className="text-lg font-semibold text-gray-700">All Sponsors</h2>
//             <div className="p-2 bg-blue-100 rounded-lg">
//               <Building2 className="h-5 w-5 text-blue-600" />
//             </div>
//           </div>
//           <p className="text-3xl font-bold text-gray-800">{stats.total_sponsors || 0}</p>
//         </Link>


//         <Link className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col" to="/award-registry">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-semibold text-gray-700">Award Records</h2>
//             <div className="p-2 bg-amber-100 rounded-lg">
//               <Award className="h-5 w-5 text-amber-600" />
//             </div>
//           </div>
//           <p className="text-3xl font-bold text-gray-800">{stats.award_records || 0}</p>
//         </Link>


//         <Link className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col"  to="/ministrial-sessions">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-semibold text-gray-700">Ministerial Speakers</h2>
//             <div className="p-2 bg-purple-100 rounded-lg">
//               <Mic className="h-5 w-5 text-purple-600" />
//             </div>
//           </div>
//           <p className="text-3xl font-bold text-gray-800">{stats.ministerial_speakers || 0}</p>
//         </Link>


//         <Link className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col" to="/curated-sessions">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-semibold text-gray-700">Curated Speakers</h2>
//             <div className="p-2 bg-green-100 rounded-lg">
//               <Mic2 className="h-5 w-5 text-green-600" />
//             </div>
//           </div>
//           <p className="text-3xl font-bold text-gray-800">{stats.curated_speakers || 0}</p>
//         </Link>


//         <Link className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col" to="/speaker-tracker">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-semibold text-gray-700">Speaker Tracker</h2>
//             <div className="p-2 bg-red-100 rounded-lg">
//               <Presentation className="h-5 w-5 text-red-600" />
//             </div>
//           </div>
//           <p className="text-3xl font-bold text-gray-800">{stats.speaker_tracker || 0}</p>
//         </Link>


//         <Link className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col" to="/exporegistry-tracker">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-semibold text-gray-700">Booths Assigned</h2>
//             <div className="p-2 bg-indigo-100 rounded-lg">
//               <Store className="h-5 w-5 text-indigo-600" />
//             </div>
//           </div>
//           <p className="text-3xl font-bold text-gray-800">{stats.booths_assigned || 0}</p>
//         </Link>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//         <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-xl text-white">
//           <h2 className="text-xl font-semibold mb-2">Total Sponsorship Revenue</h2>
//           <p className="text-4xl font-bold mb-4">₹{metricsData.totalRevenue.toLocaleString()}</p>
//         </div>


//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//           <h2 className="text-lg font-semibold text-gray-700 mb-4">Sponsorship Status</h2>
//           <div className="space-y-4">
//             <div>
//               <p className="text-sm text-gray-500">Confirmed Sponsors</p>
//               <p className="text-2xl font-bold text-green-600">{metricsData.confirmedSponsors}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Pending Sponsors</p>
//               <p className="text-2xl font-bold text-yellow-600">{metricsData.pendingSponsors}</p>
//             </div>
//           </div>
//         </div>


//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//           <h2 className="text-lg font-semibold text-gray-700 mb-4">Advance Payments</h2>
//           <div className="space-y-4">
//             <div>
//               <p className="text-sm text-gray-500">Total Advance Received</p>
//               <p className="text-2xl font-bold text-blue-600">₹{metricsData.totalAdvance.toLocaleString()}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Avg. Sponsorship</p>
//               <p className="text-2xl font-bold text-gray-800">
//                 ₹{metricsData.averageSponsorship.toLocaleString(undefined, { maximumFractionDigits: 0 })}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
//         <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">Sponsors ({sponsors.length})</h2>
//           <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//               <input
//                 type="text"
//                 placeholder="Search sponsors..."
//                 className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//             <select
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//             >
//               {statusOptions.map(option => (
//                 <option key={option} value={option}>{option}</option>
//               ))}
//             </select>
//             <select
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               value={categoryFilter}
//               onChange={(e) => setCategoryFilter(e.target.value)}
//             >
//               {categoryOptions.map(option => (
//                 <option key={option} value={option}>{option}</option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
//                 <th
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                   onClick={() => handleSort('Sponsor_Name')}
//                 >
//                   <div className="flex items-center">
//                     Sponsor Name
//                     {sortConfig.key === 'Sponsor_Name' && (
//                       sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
//                     )}
//                   </div>
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
//                 <th
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                   onClick={() => handleSort('Sponsorship_Amount')}
//                 >
//                   <div className="flex items-center">
//                     Sponsorship Amount
//                     {sortConfig.key === 'Sponsorship_Amount' && (
//                       sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
//                     )}
//                   </div>
//                 </th>
//                 <th
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                   onClick={() => handleSort('Sponsorship_Amount')}
//                 >
//                   <div className="flex items-center">
//                     Received Amount
//                     {sortConfig.key === 'Sponsorship_Amount' && (
//                       sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
//                     )}
//                   </div>
//                 </th>
//                 <th
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                   onClick={() => handleSort('Sponsorship_Amount')}
//                 >
//                   <div className="flex items-center">
//                     Pending Amount
//                     {sortConfig.key === 'Sponsorship_Amount' && (
//                       sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
//                     )}
//                   </div>
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proposal Confirmed/Pending</th>

//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredSponsors.map((sponsor) => (
//                 <tr key={sponsor.SponsorMasterId} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="font-medium text-blue-600">{sponsor.User_Name}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="font-medium text-gray-900">{sponsor.Sponsor_Name}</div>
//                     <div className="text-sm text-gray-500">{sponsor.Contact_Email}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900">{sponsor.Contact_Person}</div>
//                     <div className="text-sm text-gray-500">{sponsor.Contact_Phone}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
//                       {sponsor.Category}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm font-semibold text-gray-900">₹ {formatReadableAmount(sponsor.Sponsorship_Amount)}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm font-semibold text-gray-900">₹ {formatReadableAmount(sponsor.Sponsorship_Amount_Advance)}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm font-semibold text-gray-900">₹ {formatReadableAmount(sponsor.Pending_Amount)}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sponsor.Status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
//                       {sponsor.Status}
//                     </span>
//                   </td>

//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         {filteredSponsors.length === 0 && (
//           <div className="text-center py-8 text-gray-500">
//             No sponsors match your search criteria
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Dashboard;




























import React, { useMemo, useState } from 'react';
import {
  Users,
  Building2,
  Award,
  ChevronDown,
  ChevronUp,
  Search,
  Mic,
  Mic2,
  Presentation,
  Store,
  Eye,
  X
} from 'lucide-react';
import { useGetDashboardStatsQuery, useGetDataByUserIdQuery } from '../../services/sponsorMasterApi';
import { formatReadableAmount } from '../../common/Functions/FormatAmount';
import { useNavigate, Link } from "react-router-dom";
import { EyeIcon } from '@heroicons/react/24/outline';

function AssignedSponsorPopup({ userId, onClose }) {
  const { data, isLoading, error } = useGetDataByUserIdQuery(userId);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
          <div className="flex justify-end mb-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-center text-red-600">Error fetching data for this user.</p>
        </div>
      </div>
    );
  }

  const sponsors = data || [];
  const userName = sponsors.length > 0 ? sponsors[0].User_Name : 'User';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-7xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Sponsors Assigned to {userName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        {sponsors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sponsor Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mobile No.</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact Person</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Proposal Confirmed / Pending</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sponsors.map((sponsor, index) => (
                  <tr key={`${sponsor.Sponsor_Name}-${index}`}>
                    <td className="px-4 py-2 whitespace-nowrap">{sponsor.Sponsor_Name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{sponsor.Contact_Email}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{sponsor.Contact_Phone}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{sponsor.Contact_Person}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sponsor.Approval_Received ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {sponsor.Approval_Received ? 'Confirmed' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500">No sponsors found for this user.</p>
        )}
      </div>
    </div>
  );
}

function Dashboard() {
  const { data: dashboardData, error, isLoading } = useGetDashboardStatsQuery({ event_code: sessionStorage.getItem("Event_Code") });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showPopup, setShowPopup] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const navigate = useNavigate();

  const stats = dashboardData?.data?.stats || {};
  const sponsorDetails = dashboardData?.data?.sponsor_details || [];

  const metricsData = useMemo(() => {
    const totalRevenue = sponsorDetails.reduce((sum, sponsor) => sum + (sponsor.Sponsorship_Amount || 0), 0);
    const confirmedSponsors = sponsorDetails.filter(sponsor => sponsor.Approval_Received === 'Y').length;
    const pendingSponsors = sponsorDetails.filter(sponsor => sponsor.Approval_Received === 'N').length;
    const totalAdvance = sponsorDetails.reduce((sum, sponsor) => sum + (sponsor.Sponsorship_Amount_Advance || 0), 0);

    return {
      totalRevenue,
      confirmedSponsors,
      pendingSponsors,
      totalAdvance,
      averageSponsorship: sponsorDetails.length > 0 ? totalRevenue / sponsorDetails.length : 0
    };
  }, [sponsorDetails]);

  const sponsors = useMemo(() => {
    return sponsorDetails.map(sponsor => ({
      SponsorMasterId: sponsor.SponsorMasterId || Math.random(),
      Sponsor_Name: sponsor.Sponsor_Name,
      Address: sponsor.Address || '',
      Category: sponsor.CategorySub_Name,
      Sponsorship_Amount: sponsor.Sponsorship_Amount || 0,
      Sponsorship_Amount_Advance: sponsor.Sponsorship_Amount_Advance || 0,
      Pending_Amount: sponsor.Pending_Amount || 0,
      Status: sponsor.Approval_Received === 'Y' ? 'Confirmed' : 'Pending',
      Contact_Person: sponsor.Contact_Person,
      Contact_Email: sponsor.Contact_Email,
      Contact_Phone: sponsor.Contact_Phone,
      Proposal_Sent: sponsor.Proposal_Sent,
      User_Name: sponsor.User_Name,
      User_Id: sponsor.User_Id 
    }));
  }, [sponsorDetails]);

  const filteredSponsors = useMemo(() => {
    let filtered = sponsors.filter(sponsor => {
      const matchesSearch = sponsor.Sponsor_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sponsor.Address && sponsor.Address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        sponsor.Contact_Person.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || sponsor.Status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || sponsor.Category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [sponsors, searchTerm, statusFilter, categoryFilter, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const statusOptions = ['All', 'Confirmed', 'Pending'];
  const categoryOptions = ['All', ...new Set(sponsors.map(s => s.Category).filter(Boolean))];

  const handleShowPopup = (userId) => {
    setSelectedUserId(userId);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedUserId(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen mt-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen mt-10 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading dashboard data</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen mt-10 cursor-pointer">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6 mb-8">
        <Link className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col" to="/sponsor-master">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">All Sponsors</h2>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.total_sponsors || 0}</p>
        </Link>
        <Link className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col" to="/award-registry">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Award Records</h2>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.award_records || 0}</p>
        </Link>
        <Link className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col" to="/ministrial-sessions">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Ministerial Speakers</h2>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Mic className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.ministerial_speakers || 0}</p>
        </Link>
        <Link className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col" to="/curated-sessions">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Curated Speakers</h2>
            <div className="p-2 bg-green-100 rounded-lg">
              <Mic2 className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.curated_speakers || 0}</p>
        </Link>
        <Link className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col" to="/speaker-tracker">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Speaker Tracker</h2>
            <div className="p-2 bg-red-100 rounded-lg">
              <Presentation className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.speaker_tracker || 0}</p>
        </Link>
        <Link className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col" to="/exporegistry-tracker">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Booths Assigned</h2>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Store className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.booths_assigned || 0}</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-xl text-white">
          <h2 className="text-xl font-semibold mb-2">Total Sponsorship Revenue</h2>
          <p className="text-4xl font-bold mb-4">₹{metricsData.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Sponsorship Status</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Confirmed Sponsors</p>
              <p className="text-2xl font-bold text-green-600">{metricsData.confirmedSponsors}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Sponsors</p>
              <p className="text-2xl font-bold text-yellow-600">{metricsData.pendingSponsors}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Advance Payments</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Total Advance Received</p>
              <p className="text-2xl font-bold text-blue-600">₹{metricsData.totalAdvance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Sponsorship</p>
              <p className="text-2xl font-bold text-gray-800">
                ₹{metricsData.averageSponsorship.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">Sponsors ({sponsors.length})</h2>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search sponsors..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categoryOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('Sponsor_Name')}
                >
                  <div className="flex items-center">
                    Sponsor Name
                    {sortConfig.key === 'Sponsor_Name' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('Sponsorship_Amount')}
                >
                  <div className="flex items-center">
                    Sponsorship Amount
                    {sortConfig.key === 'Sponsorship_Amount' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('Sponsorship_Amount')}
                >
                  <div className="flex items-center">
                    Received Amount
                    {sortConfig.key === 'Sponsorship_Amount' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('Sponsorship_Amount')}
                >
                  <div className="flex items-center">
                    Pending Amount
                    {sortConfig.key === 'Sponsorship_Amount' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proposal Confirmed/Pending</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSponsors.map((sponsor) => (
                <tr key={sponsor.SponsorMasterId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">

                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors duration-200"
                        onClick={() => handleShowPopup(sponsor.User_Id)}
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>

                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-blue-600">{sponsor.User_Name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{sponsor.Sponsor_Name}</div>
                    <div className="text-sm text-gray-500">{sponsor.Contact_Email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{sponsor.Contact_Person}</div>
                    <div className="text-sm text-gray-500">{sponsor.Contact_Phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {sponsor.Category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">₹ {formatReadableAmount(sponsor.Sponsorship_Amount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">₹ {formatReadableAmount(sponsor.Sponsorship_Amount_Advance)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">₹ {formatReadableAmount(sponsor.Pending_Amount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sponsor.Status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {sponsor.Status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSponsors.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No sponsors match your search criteria
          </div>
        )}
      </div>

      {showPopup && selectedUserId && (
        <AssignedSponsorPopup userId={selectedUserId} onClose={handleClosePopup} />
      )}
    </div>
  );
}

export default Dashboard;
