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
  X,
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useGetUserDashboardStatsQuery } from '../../services/sponsorMasterApi';
import { formatReadableAmount } from '../../common/Functions/FormatAmount';
import { useNavigate, Link } from "react-router-dom";
import { EyeIcon } from '@heroicons/react/24/outline';
import { decryptData } from '../../common/Functions/DecryptData';


function UserDashboard() {
  const { data: dashboardData, error, isLoading } = useGetUserDashboardStatsQuery({ event_code: sessionStorage.getItem("Event_Code"), user_id: sessionStorage.getItem("user_id") });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const navigate = useNavigate();

  const stats = dashboardData?.data || {};
  const sponsorDetails = stats?.sponsor_details || [];

  const metricsData = useMemo(() => {
    const totalRevenue = sponsorDetails.reduce((sum, sponsor) => sum + (sponsor.Sponsorship_Amount || 0), 0);
    const confirmedSponsors = sponsorDetails.filter(sponsor => sponsor.Approval_Received === 'Y').length;
    const pendingSponsors = sponsorDetails.filter(sponsor => sponsor.Approval_Received === 'N').length;
    const totalAdvance = sponsorDetails.reduce((sum, sponsor) => sum + (sponsor.Sponsorship_Amount_Advance || 0), 0);
    const totalPending = sponsorDetails.reduce((sum, sponsor) => sum + (sponsor.Pending_Amount || 0), 0);

    return {
      totalRevenue,
      confirmedSponsors,
      pendingSponsors,
      totalAdvance,
      totalPending,
      averageSponsorship: sponsorDetails.length > 0 ? totalRevenue / sponsorDetails.length : 0
    };
  }, [sponsorDetails]);

  const sponsors = useMemo(() => {
    return sponsorDetails.map(sponsor => ({
      SponsorMasterId: sponsor.SponsorMasterId,
      Sponsor_Name: sponsor.Sponsor_Name,
      Address: sponsor.Address || '',
      category_name: sponsor.category_name,
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
      const matchesCategory = categoryFilter === 'All' || sponsor.category_name === categoryFilter;

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
  const categoryOptions = ['All', ...new Set(sponsors.map(s => s.category_name).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen mt-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
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
    <div className="p-6 bg-gray-50 min-h-screen mt-20 cursor-pointer">

      {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome back!</h1>
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Assigned Sponsors</h2>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.sponsor_count || 0}</p>
        </div>

        {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Award Records</h2>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.award_record_count || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Ministerial Speakers</h2>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Mic className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.ministerial_speakers_count || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Curated Speakers</h2>
            <div className="p-2 bg-green-100 rounded-lg">
              <Mic2 className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.curated_speakers_count || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Speaker Tracker</h2>
            <div className="p-2 bg-red-100 rounded-lg">
              <Presentation className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.speaker_tracker_count || 0}</p>
        </div> */}

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Booths Assigned</h2>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Store className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.booth_assigned_count || 0}</p>
        </div>
      </div>

      {/* User-specific Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-xl text-white">
          <div className="flex items-center mb-4">
            {/* <DollarSign className="h-8 w-8 mr-2" /> */}
            <h2 className="text-xl font-semibold">Total Sponsorship Value</h2>
          </div>
          <p className="text-4xl font-bold mb-2">₹ {metricsData.totalRevenue.toLocaleString()}</p>
          <p className="text-sm opacity-90">{sponsors.length} sponsors</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-700">Confirmed Sponsors</h2>
          </div>
          <p className="text-3xl font-bold text-green-600">{metricsData.confirmedSponsors}</p>
          <p className="text-sm text-gray-500 mt-2">
            {sponsors.length > 0 ? Math.round((metricsData.confirmedSponsors / sponsors.length) * 100) : 0}% success rate
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <Clock className="h-6 w-6 text-yellow-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-700">Pending Sponsors</h2>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{metricsData.pendingSponsors}</p>
          <p className="text-sm text-gray-500 mt-2">Awaiting confirmation</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-700">Advance Received</h2>
          </div>
          <p className="text-3xl font-bold text-blue-600">₹{metricsData.totalAdvance.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-2">
            ₹{metricsData.totalPending.toLocaleString()} pending
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">Your Sponsors ({sponsors.length})</h2>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search your sponsors..."
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
                  onClick={() => handleSort('Sponsorship_Amount_Advance')}
                >
                  <div className="flex items-center">
                    Received Amount
                    {sortConfig.key === 'Sponsorship_Amount_Advance' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('Pending_Amount')}
                >
                  <div className="flex items-center">
                    Pending Amount
                    {sortConfig.key === 'Pending_Amount' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSponsors.map((sponsor) => (
                <tr key={sponsor.SponsorMasterId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{sponsor.Sponsor_Name}</div>
                    <div className="text-sm text-gray-500">{sponsor.Contact_Email}</div>
                    <div className="text-sm text-gray-500">{sponsor.Contact_Phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{sponsor.Contact_Person}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {sponsor.category_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">₹ {formatReadableAmount(sponsor.Sponsorship_Amount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">₹ {formatReadableAmount(sponsor.Sponsorship_Amount_Advance)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-red-600">₹ {formatReadableAmount(sponsor.Pending_Amount)}</div>
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
    </div>
  );
}

export default UserDashboard;