import { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Import the autotable plugin
import { useLazyGetTaskCategoryWiseReportQuery } from "../services/taskreportApi"
import { getCurrentDate } from '../common/Functions/GetCurrentdate';


jsPDF.API.autoTable = autoTable;


function PendingCategoryWise({ fromDate, toDate, category }) {
    // const [reportData, setReportData] = useState([]);
    // const [shouldGenerate, setShouldGenerate] = useState(false);

    const [fetchReport, { data, isLoading, error }] = useLazyGetTaskCategoryWiseReportQuery();

    // useEffect(() => {
    //     if (data && shouldGenerate) {
    //         setReportData(data);
    //         generateCategoryPDF(data);
    //         setShouldGenerate(false);
    //     }
    // }, [data, shouldGenerate]);

    const onGenerateClick = async () => {
        if (!fromDate || !toDate || !category) {
            alert("Please select From Date, To Date, and Category");
            return;
        }

        try {
            const response = await fetchReport({ fromDate, toDate, category }).unwrap();
            if (response) {
                generateCategoryPDF(response);
            }
        } catch (err) {
            console.error("Error fetching report:", err);
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
        const doc = new jsPDF('p'); // Landscape mode
        const pageWidth = doc.internal.pageSize.width;
        let currentY = 10;

        // Title
        const title = `Pending Tasks - Category Wise (From ${getCurrentDate(fromDate)} To ${getCurrentDate(toDate)})`;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(title, pageWidth / 2, currentY, { align: 'center' });
        currentY += 6;

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

            // Prepare the table body for current user
            const tableBody = tasks.map(item => [
                item.Id || '',
                item.taskno || '',
                getCurrentDate(item.taskdate),
                item.purpose || '',
                item.taskdesc || '',
                getCurrentDate(item.reminddate),
                getCurrentDate(item.deadline),
                getTaskTypeString(item.tasktype || ''),
                item.userId || '',
                item.User_Name || '',
                item.System_Name_E || '',
                item.completed || 'N',
            ]);

            // Generate the table
            autoTable(doc, {
                head: [[
                    'ID', 'Task No', 'Task Date', 'Purpose', 'Description',
                    'Remind Date', 'Deadline', 'Task Type', 'User ID', 'User Name', 'Category', 'Completed'
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
                theme: 'grid',
                margin: { left: 4, right: 5 },
                columnStyles: {
                    0: { cellWidth: 8 },   // ID
                    1: { cellWidth: 14 },  // Task No
                    2: { cellWidth: 17 },  // Task Date
                    3: { cellWidth: 20 },  // Purpose
                    4: { cellWidth: 30 },  // Description
                    5: { cellWidth: 17 },  // Remind Date
                    6: { cellWidth: 17 },  // Deadline
                    7: { cellWidth: 16 },  // Task Type
                    8: { cellWidth: 13 },  // User ID
                    9: { cellWidth: 20 },  // User Name
                    10: { cellWidth: 16 }, // Category
                    11: { cellWidth: 15 }, // Completed
                },
                didDrawPage: (data) => {

                    currentY = data.cursor.y;
                }
            });
        });

        // Output the PDF
        const pdfUrl = doc.output('bloburl');
        window.open(pdfUrl);
    };



    return (
        <button
            onClick={onGenerateClick}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
            {isLoading ? 'Loading...' : 'Pending CategoryWise Report'}
        </button>
    );
}


export default PendingCategoryWise;