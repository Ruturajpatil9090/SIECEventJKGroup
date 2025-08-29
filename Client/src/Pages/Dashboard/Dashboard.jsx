import React, { useMemo, useState } from 'react';
import TableUtility from "../../common/TableUtility/TableUtility";
import { 
  Users, 
  Building2, 
  Award, 
  Calendar,
  TrendingUp,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  Filter
} from 'lucide-react';

function Dashboard() {
  // Dummy sponsor data
  const sponsors = [
    {
      SponsorMasterId: 1,
      Sponsor_Name: 'TechCorp',
      Address: '123 Tech Park, San Francisco',
      Expo_Registry: 'Y',
      User_Id: 101,
      Category: 'Technology',
      Sponsorship_Amount: 50000,
      Status: 'Confirmed'
    },
    {
      SponsorMasterId: 2,
      Sponsor_Name: 'HealthPlus',
      Address: '456 Wellness St, Boston',
      Expo_Registry: 'N',
      User_Id: 101,
      Category: 'Healthcare',
      Sponsorship_Amount: 35000,
      Status: 'Pending'
    },
    {
      SponsorMasterId: 3,
      Sponsor_Name: 'EduWorld',
      Address: '789 Learning Ave, Austin',
      Expo_Registry: 'Y',
      User_Id: 102,
      Category: 'Education',
      Sponsorship_Amount: 25000,
      Status: 'Confirmed'
    },
    {
      SponsorMasterId: 4,
      Sponsor_Name: 'GreenEnergy',
      Address: '101 Solar Blvd, Denver',
      Expo_Registry: 'Y',
      User_Id: 103,
      Category: 'Energy',
      Sponsorship_Amount: 75000,
      Status: 'Confirmed'
    },
    {
      SponsorMasterId: 5,
      Sponsor_Name: 'FinSecure',
      Address: '202 Finance Rd, New York',
      Expo_Registry: 'N',
      User_Id: 102,
      Category: 'Finance',
      Sponsorship_Amount: 60000,
      Status: 'Pending'
    },
        {
      SponsorMasterId: 5,
      Sponsor_Name: 'FinSecure',
      Address: '202 Finance Rd, New York',
      Expo_Registry: 'N',
      User_Id: 102,
      Category: 'Finance',
      Sponsorship_Amount: 60000,
      Status: 'Pending'
    },
        {
      SponsorMasterId: 5,
      Sponsor_Name: 'FinSecure',
      Address: '202 Finance Rd, New York',
      Expo_Registry: 'N',
      User_Id: 102,
      Category: 'Finance',
      Sponsorship_Amount: 60000,
      Status: 'Pending'
    },
        {
      SponsorMasterId: 5,
      Sponsor_Name: 'FinSecure',
      Address: '202 Finance Rd, New York',
      Expo_Registry: 'N',
      User_Id: 102,
      Category: 'Finance',
      Sponsorship_Amount: 60000,
      Status: 'Pending'
    },
        {
      SponsorMasterId: 5,
      Sponsor_Name: 'FinSecure',
      Address: '202 Finance Rd, New York',
      Expo_Registry: 'N',
      User_Id: 102,
      Category: 'Finance',
      Sponsorship_Amount: 60000,
      Status: 'Pending'
    },
        {
      SponsorMasterId: 5,
      Sponsor_Name: 'FinSecure',
      Address: '202 Finance Rd, New York',
      Expo_Registry: 'N',
      User_Id: 102,
      Category: 'Finance',
      Sponsorship_Amount: 60000,
      Status: 'Pending'
    },
        {
      SponsorMasterId: 5,
      Sponsor_Name: 'FinSecure',
      Address: '202 Finance Rd, New York',
      Expo_Registry: 'N',
      User_Id: 102,
      Category: 'Finance',
      Sponsorship_Amount: 60000,
      Status: 'Pending'
    },
        {
      SponsorMasterId: 5,
      Sponsor_Name: 'FinSecure',
      Address: '202 Finance Rd, New York',
      Expo_Registry: 'N',
      User_Id: 102,
      Category: 'Finance',
      Sponsorship_Amount: 60000,
      Status: 'Pending'
    }
  ];

  // Dummy user data
  const users = [
    {
      User_Id: 101,
      userfullname: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'Account Manager'
    },
    {
      User_Id: 102,
      userfullname: 'Bob Smith',
      email: 'bob@example.com',
      role: 'Sponsorship Director'
    },
    {
      User_Id: 103,
      userfullname: 'Carol Williams',
      email: 'carol@example.com',
      role: 'Partnership Manager'
    }
  ];

  // Additional metrics data
  const metricsData = {
    curatedSessions: 12,
    ministerialSessions: 5,
    awards: 8,
    totalRevenue: sponsors.reduce((sum, sponsor) => sum + sponsor.Sponsorship_Amount, 0)
  };

  // Calculate counts
  const allSponsorsCount = sponsors.length;
  const expoRegistryCount = useMemo(() => sponsors.filter(s => s.Expo_Registry === 'Y').length, [sponsors]);
  const confirmedSponsors = useMemo(() => sponsors.filter(s => s.Status === 'Confirmed').length, [sponsors]);

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Prepare data for the user/sponsor table
  const userSponsorTableData = useMemo(() => {
    return users.map(user => {
      const assignedSponsors = sponsors.filter(sponsor => sponsor.User_Id === user.User_Id);
      const sponsorNames = assignedSponsors.map(s => s.Sponsor_Name).join(', ');
      const companyNames = assignedSponsors.map(s => s.Address || 'N/A').join(', ');
      const totalValue = assignedSponsors.reduce((sum, sponsor) => sum + sponsor.Sponsorship_Amount, 0);

      return {
        User_Id: user.User_Id,
        UserName: user.userfullname,
        UserRole: user.role,
        AssignedSponsors: assignedSponsors.length,
        SponsorNames: sponsorNames,
        CompanyNames: companyNames,
        TotalValue: totalValue
      };
    });
  }, [users, sponsors]);

  // Filter and sort sponsors
  const filteredSponsors = useMemo(() => {
    let filtered = sponsors.filter(sponsor => {
      const matchesSearch = sponsor.Sponsor_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sponsor.Address.toLowerCase().includes(searchTerm.toLowerCase());
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

  const userSponsorTableColumns = [
    { 
      header: 'User Name', 
      accessor: 'UserName',
      cellRenderer: (value, row) => (
        <div>
          <div className="font-semibold">{value}</div>
          <div className="text-sm text-gray-500">{row.UserRole}</div>
        </div>
      )
    },
    { 
      header: 'Assigned Sponsors', 
      accessor: 'AssignedSponsors',
      cellRenderer: (value) => (
        <div className="text-center font-bold text-blue-600">{value}</div>
      )
    },
    { 
      header: 'Total Value', 
      accessor: 'TotalValue',
      cellRenderer: (value) => (
        <div className="font-semibold">${value.toLocaleString()}</div>
      )
    },
    { 
      header: 'Sponsor Names', 
      accessor: 'SponsorNames',
      cellRenderer: (value) => (
        <div className="text-sm">{value}</div>
      )
    },
  ];

  const statusOptions = ['All', 'Confirmed', 'Pending'];
  const categoryOptions = ['All', 'Technology', 'Healthcare', 'Education', 'Energy', 'Finance'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* <h1 className="text-3xl font-bold text-gray-800 mb-2">Sponsor Dashboard</h1>
      <p className="text-gray-600 mb-6">Overview of all sponsorship activities and metrics</p> */}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">All Sponsors</h2>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{allSponsorsCount}</p>
          <div className="flex items-center mt-2">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-500">+12% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Expo Registry</h2>
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{expoRegistryCount}</p>
          <div className="text-sm text-gray-500 mt-2">
            {((expoRegistryCount / allSponsorsCount) * 100).toFixed(0)}% of all sponsors
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Curated Sessions</h2>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{metricsData.curatedSessions}</p>
          <div className="text-sm text-gray-500 mt-2">Scheduled for next month</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Awards</h2>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{metricsData.awards}</p>
          <div className="text-sm text-gray-500 mt-2">To be presented</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Summary Card */}
        {/* <div className="lg:col-span-2 bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-xl text-white">
          <h2 className="text-xl font-semibold mb-2">Total Sponsorship Revenue</h2>
          <p className="text-4xl font-bold mb-4">${metricsData.totalRevenue.toLocaleString()}</p>
          <div className="flex justify-between">
            <div>
              <p className="text-sm opacity-80">Confirmed</p>
              <p className="text-xl font-semibold">
                ${sponsors.filter(s => s.Status === 'Confirmed')
                  .reduce((sum, sponsor) => sum + sponsor.Sponsorship_Amount, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm opacity-80">Pending</p>
              <p className="text-xl font-semibold">
                ${sponsors.filter(s => s.Status === 'Pending')
                  .reduce((sum, sponsor) => sum + sponsor.Sponsorship_Amount, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div> */}

        {/* Mini Stats Card */}
        {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Event Metrics</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Ministerial Sessions</p>
              <p className="text-2xl font-bold text-gray-800">{metricsData.ministerialSessions}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Confirmed Sponsors</p>
              <p className="text-2xl font-bold text-gray-800">{confirmedSponsors}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Sponsorship</p>
              <p className="text-2xl font-bold text-gray-800">
                ${(metricsData.totalRevenue / allSponsorsCount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div> */}
      </div>

      {/* Sponsors Table with Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">Sponsors</h2>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('Sponsorship_Amount')}
                >
                  <div className="flex items-center">
                    Amount
                    {sortConfig.key === 'Sponsorship_Amount' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expo Registry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSponsors.map((sponsor) => (
                <tr key={sponsor.SponsorMasterId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{sponsor.Sponsor_Name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{sponsor.Address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {sponsor.Category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">${sponsor.Sponsorship_Amount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sponsor.Expo_Registry === 'Y' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {sponsor.Expo_Registry === 'Y' ? 'Yes' : 'No'}
                    </span>
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

      {/* User and Assigned Sponsors Table */}
      {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Team Performance</h2>
        <TableUtility
          columns={userSponsorTableColumns}
          data={userSponsorTableData}
        />
      </div> */}
    </div>
  );
}

export default Dashboard;