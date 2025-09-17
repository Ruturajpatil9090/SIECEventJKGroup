import { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLazyGetTaskUserReportQuery } from "../services/taskreportApi";
import PendingCategoryWise from './PendingCategorywiseReport';
import AllPendingreport from './AllPendingReports';
import LoginUserPendingTask from './UsersPendingTask';
import LoginUserCategoryWisePending from './UserCategoryWisePendingReport';
import Select from 'react-select';
import { useGetSystemMasterQuery } from '../services/taskdescriptionApi';
import { useGetUserMastersQuery } from '../services/userMasterApi';
import { getCurrentDate } from '../common/Functions/GetCurrentdate';
import { decryptData } from '../common/Functions/DecryptData';


jsPDF.API.autoTable = autoTable;

function UserwiseTaskReport() {
    const [fromDate, setFromDate] = useState(getCurrentDate());
    const [toDate, setToDate] = useState(getCurrentDate());
    const [reportData, setReportData] = useState([]);
    const [shouldGenerate, setShouldGenerate] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [userType, setUserType] = useState(null);


    const [formData, setFormData] = useState({ category: [] });
    const { data: systemMaster = [], isLoading: issystemMasterLoading } = useGetSystemMasterQuery();
    const { data: tbluser = [], isLoading: isTblUserLoading } = useGetUserMastersQuery();
    const [fetchReport, { data, isLoading, error }] = useLazyGetTaskUserReportQuery();
    // inside your component

    const allOption = { value: 'ALL', label: 'All Categories' };
    const allUserOption = { value: 'ALL', label: 'All Users' };


    // then pass in appropriate params on change





    const mapOptionsWithAll = (items, allOption, valueKey, labelFn) => [
        allOption,
        ...items.map(item => ({
            value: item[valueKey],
            label: labelFn(item)
        }))
    ];


    const systemMasterOptionsWithAll = mapOptionsWithAll(
        systemMaster,
        allOption,
        'System_Code',
        item => `${item.System_Code} - ${item.System_Name_E}`
    );

    const tblUserOptionsWithAll = mapOptionsWithAll(
        tbluser,
        allUserOption,
        'User_Id',
        item => `${item.User_Id} - ${item.User_Name}`
    );

    
    const onCategoryChange = (selected) =>
        handleSelectChange(selected, 'ALL', systemMasterOptionsWithAll, setSelectedOptions, setFormData, 'category');

    const onUserChange = (selected) =>
        handleSelectChange(selected, 'ALL', tblUserOptionsWithAll, setSelectedUsers, setFormData, 'userIds');

    useEffect(() => {
        const encryptedUserData = sessionStorage.getItem('user_data');
        if (encryptedUserData) {
            const decryptedUserData = decryptData(encryptedUserData);
            setUserType(decryptedUserData?.user_type || null);
        }
    }, []);



    console.log('userType:', userType);

    // const handleCategoryChange = (selected) => {
    //     if (!selected) {
    //         setSelectedOptions([]);
    //         setFormData(prev => ({ ...prev, category: [] }));
    //         return;
    //     }

    //     const isAllSelected = selected.some(opt => opt.value === 'ALL');

    //     if (isAllSelected) {
    //         // User clicked "All", so select all individual categories
    //         setSelectedOptions(systemMasterOptionsWithAll);
    //         setFormData(prev => ({
    //             ...prev,
    //             category: systemMasterOptionsWithAll.map(opt => opt.value),
    //         }));
    //     } else {
    //         // Normal selection
    //         setSelectedOptions(selected);
    //         setFormData(prev => ({
    //             ...prev,
    //             category: selected.map(opt => opt.value),
    //         }));
    //     }
    // };

    const handleSelectChange = (selected, allOptionValue, allOptions, setSelected, setFormField, fieldKey) => {
        if (!selected) {
            setSelected([]);
            setFormField(prev => ({ ...prev, [fieldKey]: [] }));
            return;
        }

        const isAllSelected = selected.some(opt => opt.value === allOptionValue);

        if (isAllSelected) {
            // Exclude the 'ALL' option itself and select all real options
            const allWithoutAllOption = allOptions.filter(opt => opt.value !== allOptionValue);
            setSelected(allWithoutAllOption);
            setFormField(prev => ({ ...prev, [fieldKey]: allWithoutAllOption.map(opt => opt.value) }));
        } else {
            setSelected(selected);
            setFormField(prev => ({ ...prev, [fieldKey]: selected.map(opt => opt.value) }));
        }
    };


    // This function computes the display value for Select
    // If all categories are selected, show all category options, NOT the "All" option
    const getDisplayValue = () => {
        if (selectedOptions.length === systemMasterOptionsWithAll.length) {
            return systemMasterOptionsWithAll; // Show all categories as selected
        }
        return selectedOptions;
    };



    const generateAfterFetch = useRef(false);

    // useEffect(() => {
    //     if (data && shouldGenerate) {
    //         setReportData(data);
    //         generatePDF(data);
    //         setShouldGenerate(false);
    //     }
    // }, [data, shouldGenerate]);

    const getTaskTypeString = (type) => {
    switch (String(type)) {
      case '1': return 'Daily';
      case '2': return 'One Time';
      case '3': return 'Weekly';
      case '4': return 'Monthly';
      case '5': return 'Yearly';
      default: return '-';
    }
  };

    const generatePDF = (data) => {
        const doc = new jsPDF('P');
        const pageWidth = doc.internal.pageSize.width;
        let currentY = 10;

        const title = `All Tasks Report - (From ${getCurrentDate(fromDate)} To ${getCurrentDate(toDate)})`;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(title, pageWidth / 2, currentY, { align: 'center' });
        currentY += 8;

        // Group tasks by user
        const groupedByUser = data.reduce((acc, task) => {
            const userName = task.User_Name || 'Unknown User';
            if (!acc[userName]) acc[userName] = [];
            acc[userName].push(task);
            return acc;
        }, {});

        Object.entries(groupedByUser).forEach(([userName, tasks], index) => {
            if (index !== 0) currentY += 6;

            // User Header
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text(`User: ${userName}`, 6, currentY);
            currentY += 4;

            // Prepare task rows
            const tableBody = tasks.map(item => [
                item.Id,
                item.taskno,
                getCurrentDate(item.taskdate),
                item.purpose || '-',
                item.taskdesc || '-',
                getCurrentDate(item.reminddate),
                getCurrentDate(item.deadline),
                getTaskTypeString(item.tasktype),
                item.userId,
                item.completed,
            ]);

            // Create table
            autoTable(doc, {
                head: [[
                    'ID', 'Task No', 'Task Date', 'Purpose', 'Description',
                    'Remind Date', 'Deadline', 'Task Type', 'User ID', 'Completed'
                ]],
                body: tableBody,
                startY: currentY,
                styles: {
                    fontSize: 7,
                    cellPadding: { horizontal: 2, vertical: 1.5 },
                    overflow: 'linebreak',
                },
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontStyle: 'bold',
                    halign: 'center',
                    overflow: 'visible',
                    cellWidth: 'auto',
                },
                columnStyles: {
                    0: { cellWidth: 8 },  // ID
                    1: { cellWidth: 10 },  // Task No
                    2: { cellWidth: 18 },  // Task Date
                    3: { cellWidth: 35 },  // Purpose
                    4: { cellWidth: 55 },  // Description
                    5: { cellWidth: 18 },  // Remind Date
                    6: { cellWidth: 18 },  // Deadline
                    7: { cellWidth: 15 },  // Task Type
                    8: { cellWidth: 10 },  // User ID
                    9: { cellWidth: 15 },  // Completed
                },
                theme: 'grid',
                margin: { left: 5, right: 5 },
                didDrawPage: function (data) {
                    currentY = data.cursor.y;
                },
            });
        });

        const pdfUrl = doc.output('bloburl');
        window.open(pdfUrl);
    };



    const onGenerateClick = async () => {
        if (!fromDate || !toDate) {
            alert("Please select From and To dates");
            return;
        }

        try {
            const response = await fetchReport({
                fromDate,
                toDate,
                user_id: formData?.userIds ?? [],
            }).unwrap();

            if (response) {
                setReportData(response);
                generatePDF(response);
            }
        } catch (err) {
            console.error("Error fetching report:", err);
            alert("Failed to fetch report. Please try again.");
        }
    };



    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
                    📄 Task Report Generator
                </h2>

                {/* Form Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={e => setFromDate(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={e => setToDate(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <Select
                            id="category"
                            options={systemMasterOptionsWithAll}
                            value={getDisplayValue()}
                            onChange={onCategoryChange}
                            placeholder="Select Category..."
                            isSearchable
                            isMulti
                            closeMenuOnSelect={true}
                        />
                    </div>
                    {userType === 'A' && (
                        <div className="flex-1 min-w-[200px]">
                            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">User</label>
                            <Select
                                id="userId"
                                options={tblUserOptionsWithAll}
                                value={selectedUsers}
                                onChange={onUserChange}
                                placeholder="Select User..."
                                isSearchable
                                isMulti
                                closeMenuOnSelect={true}

                            />

                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userType === 'A' && (
                        <>
                            <button
                                onClick={onGenerateClick}
                                disabled={isLoading}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                {isLoading ? 'Loading...' : '📄 UserWise All Tasks'}
                            </button>

                            <PendingCategoryWise
                                fromDate={fromDate}
                                toDate={toDate}
                                category={formData.category}
                            />

                            <AllPendingreport
                                fromDate={fromDate}
                                toDate={toDate}
                            />
                        </>
                    )}

                    {(userType === 'A' || userType === 'U') && (
                        <>
                            <LoginUserPendingTask
                                fromDate={fromDate}
                                toDate={toDate}
                                selectedUserId={selectedUsers?.map(user => user.value) || []}
                            />

                            <LoginUserCategoryWisePending
                                fromDate={fromDate}
                                toDate={toDate}
                                category={formData.category}
                                selectedUserId={selectedUsers?.map(user => user.value) || []}
                            />
                        </>
                    )}
                </div>


                {error && (
                    <p className="text-red-600 mt-4">
                        ⚠️ Error loading data. Please try again.
                    </p>
                )}
            </div>
        </div>
    );
}

export default UserwiseTaskReport;