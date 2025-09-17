import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLazyGetTaskReportUserWisePendingQuery } from "../services/taskreportApi";
import { getCurrentDate } from '../common/Functions/GetCurrentdate';
import { decryptData } from '../common/Functions/DecryptData';

jsPDF.API.autoTable = autoTable;

function LoginUserCategoryWisePending({
  fromDate,
  toDate,
  category,
  selectedUserId = null,
  selectedUserName = null
}) {
  // Define isLoading and setter
  const [isLoading, setIsLoading] = useState(false);
  const [fetchReport] = useLazyGetTaskReportUserWisePendingQuery();

  // Get logged in user info
  const encryptedUserData = sessionStorage.getItem('user_data');
  const decryptedUserData = decryptData(encryptedUserData) || {};
  const loggedInUserId = decryptedUserData.user_id;
  const loggedInUserName = decryptedUserData.user_name;
  const loggedInUserRole = decryptedUserData.user_type;

  const isAdmin = loggedInUserRole === 'A';
  const effectiveUserId = isAdmin && selectedUserId ? selectedUserId : loggedInUserId;
  const effectiveUserName = isAdmin && selectedUserName ? selectedUserName : loggedInUserName;



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

  const onGenerateClick = async () => {
    if (!fromDate || !toDate || !category) {
      alert("Please select From Date, To Date, and Category.");
      return;
    }

    const finalUserIds = isAdmin
      ? selectedUserId?.length > 0
        ? selectedUserId
        : []
      : [loggedInUserId];

    if (finalUserIds.length === 0) {
      alert("Please select at least one user.");
      return;
    }

    setIsLoading(true);

    try {
      const categoryArray = Array.isArray(category)
        ? category.map(Number)
        : [Number(category)];

      const response = await fetchReport({
        fromDate,
        toDate,
        category: categoryArray,
        user_id: finalUserIds
      }).unwrap();

      const taskArray = Array.isArray(response)
        ? response
        : Array.isArray(response.data)
          ? response.data
          : [];

      if (taskArray.length === 0) {
        alert("No records found for the selected criteria.");
      } else {
        generateCategoryPDF(taskArray);
      }

    } catch (err) {
      console.error("Error fetching report:", err);
      alert("Failed to fetch report.");
    } finally {
      setIsLoading(false);
    }
  };


  const generateCategoryPDF = (tasks) => {
    const doc = new jsPDF('p');
    const pageWidth = doc.internal.pageSize.width;
    let currentY = 10;

    const title = `Pending Users Tasks - Category Wise (From ${getCurrentDate(fromDate)} To ${getCurrentDate(toDate)})`;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;

    const groupedByUser = tasks.reduce((acc, task) => {
      const userName = task.User_Name || 'Unknown User';
      if (!acc[userName]) acc[userName] = [];
      acc[userName].push(task);
      return acc;
    }, {});

    Object.entries(groupedByUser).forEach(([userName, userTasks], index) => {
      if (index !== 0) currentY += 10;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`User: ${userName}`, 10, currentY);
      currentY += 6;

      const tableBody = userTasks.map(item => [
        item.Id || '',
        item.taskno || '',
        getCurrentDate(item.taskdate),
        item.purpose || '-',
        item.taskdesc || '-',
        getCurrentDate(item.reminddate),
        getCurrentDate(item.deadline),
        getTaskTypeString(item.tasktype),
        item.userId || '-',
        item.User_Name || '-',
        item.System_Name_E || '-',
        item.completed || 'N',
      ]);

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
        },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 14 },
          2: { cellWidth: 17 },
          3: { cellWidth: 22 },
          4: { cellWidth: 25 },
          5: { cellWidth: 19 },
          6: { cellWidth: 17 },
          7: { cellWidth: 16 },
          8: { cellWidth: 14 },
          9: { cellWidth: 20 },
          10: { cellWidth: 16 },
          11: { cellWidth: 17 },
        },
        theme: 'grid',
        margin: { left: 4, right: 5 },
        didDrawPage: (autoTableData) => {
          currentY = autoTableData.cursor.y + 6;
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
      {isLoading
        ? 'Loading...'
        : `Only Users Category Wise Pending Report`}
    </button>
  );
}

export default LoginUserCategoryWisePending;
