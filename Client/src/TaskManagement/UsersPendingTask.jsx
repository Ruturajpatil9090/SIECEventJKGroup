import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLazyGetTaskUserWiseReportQuery } from "../services/taskreportApi";
import { decryptData } from '../common/Functions/DecryptData';
import { getCurrentDate } from '../common/Functions/GetCurrentdate';

jsPDF.API.autoTable = autoTable;

function LoginUserPendingTask({ fromDate, toDate, selectedUserId = null, selectedUserName = null }) {
    const [shouldGenerate, setShouldGenerate] = useState(false);
    const [fetchReport, { data, isLoading, error }] = useLazyGetTaskUserWiseReportQuery();
    const encryptedUserData = sessionStorage.getItem('user_data');
    const decryptedUserData = decryptData(encryptedUserData);
    const loggedInUserId = decryptedUserData?.user_id;
    const loggedInUserName = decryptedUserData?.user_name;
    const loggedInUserRole = decryptedUserData?.user_type;

    const isAdmin = loggedInUserRole === 'A';


    const effectiveUserId = isAdmin && selectedUserId ? selectedUserId : loggedInUserId;
    const effectiveUserName = isAdmin && selectedUserName ? selectedUserName : loggedInUserName;

    const onGenerateClick = async () => {
        if (!fromDate || !toDate || !effectiveUserId) {
            alert("Please select From Date, To Date, and ensure user is logged in.");
            return;
        }

        try {
            const response = await fetchReport({
                fromDate,
                toDate,
                user_id: effectiveUserId
            }).unwrap();

            const taskArray = Array.isArray(response?.data) ? response.data : [];

            const effectiveUserIds = String(effectiveUserId).split(',').map(id => id.trim());

            const filteredTasks = taskArray.filter(task => effectiveUserIds.includes(String(task.userId)));

            console.log('Filtered tasks to generate PDF:', filteredTasks);

            generateCategoryPDF(filteredTasks);

        } catch (err) {
            console.error("Error fetching user report:", err);
            alert("Failed to fetch report. Please try again.");
        }
    };

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


    const generateCategoryPDF = (data) => {
        const doc = new jsPDF('p');
        const pageWidth = doc.internal.pageSize.width;
        let currentY = 10;

        const title = `Pending Tasks - Category Wise (From ${getCurrentDate(fromDate)} To ${getCurrentDate(toDate)})`;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(title, pageWidth / 2, currentY, { align: 'center' });
        currentY += 6;

        const groupedByUser = data.reduce((acc, task) => {
            const userName = task.User_Name || 'Unknown User';
            if (!acc[userName]) acc[userName] = [];
            acc[userName].push(task);
            return acc;
        }, {});

        Object.entries(groupedByUser).forEach(([userName, tasks], index) => {
            if (index !== 0) currentY += 6;

            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            doc.text(`User: ${userName}`, 6, currentY);
            currentY += 4;

            const tableBody = tasks.map(item => [
                item.Id || '',
                item.taskno || '',
                getCurrentDate(item.taskdate),
                item.purpose || '-',
                item.taskdesc || '-',
                getCurrentDate(item.reminddate),
                getCurrentDate(item.deadline),
                getTaskTypeString(item.tasktype || '-'),
                item.userId || '-',
                item.User_Name || '-',
                item.completed || 'N',
                // item.System_Name_E || '-',
            ]);

            autoTable(doc, {
                head: [[
                    'ID', 'Task No', 'Task Date', 'Purpose', 'Description',
                    'Remind Date', 'Deadline', 'Task Type', 'User ID', 'User Name', 'Completed',
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
                    cellWidth: 'auto',
                },
                columnStyles: {
                    0: { cellWidth: 8 },
                    1: { cellWidth: 14 },
                    2: { cellWidth: 17 },
                    3: { cellWidth: 25 },
                    4: { cellWidth: 35 },
                    5: { cellWidth: 19 },
                    6: { cellWidth: 17 },
                    7: { cellWidth: 17 },
                    8: { cellWidth: 14 },
                    9: { cellWidth: 20 },
                    10: { cellWidth: 17 },
                },
                theme: 'grid',
                margin: { left: 4, right: 4 },
                didDrawPage: (data) => {
                    currentY = data.cursor.y + 6;
                },
            });
        });

        const pdfUrl = doc.output('bloburl');
        window.open(pdfUrl);
    };


    return (
        <button
            onClick={onGenerateClick}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
            {isLoading ? 'Loading...' : `Only Users Pending Report`}
        </button>
    );
}

export default LoginUserPendingTask;
