import React, { useState, useEffect, useMemo } from 'react';
import { BellIcon, CheckIcon, XMarkIcon, ClockIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useGetTaskDescriptionQuery } from '../../services/taskdescriptionApi';
import { useGetUserMastersQuery } from '../../services/userMasterApi';
import { decryptData } from '../../common/Functions/DecryptData';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [readNotifications, setReadNotifications] = useState(new Set());
    const [lastUpdate, setLastUpdate] = useState(Date.now());

    const user_id = sessionStorage.getItem("user_id");
    
    const { data: tableData = [], isLoading, refetch } = useGetTaskDescriptionQuery({ user_id });
    const { data: tbluser = [] } = useGetUserMastersQuery();

    // Listen for WebSocket updates
    useEffect(() => {
        const handleNewTask = () => {
            setLastUpdate(Date.now());
            refetch();
        };

        window.addEventListener('newTaskAssigned', handleNewTask);
        window.addEventListener('notificationsOpened', handleNotificationsOpened);

        return () => {
            window.removeEventListener('newTaskAssigned', handleNewTask);
            window.removeEventListener('notificationsOpened', handleNotificationsOpened);
        };
    }, [refetch]);

    const handleNotificationsOpened = () => {
        // Mark all as read when notifications are opened
        const allIds = notifications.map(notif => notif.id);
        setReadNotifications(prev => new Set([...prev, ...allIds]));
    };

    // Get current user info
    const currentUser = useMemo(() => {
        const encryptedUserData = sessionStorage.getItem('user_data');
        if (encryptedUserData) {
            return decryptData(encryptedUserData);
        }
        return null;
    }, []);

    // Generate notifications for tasks assigned to current user
    useEffect(() => {
        if (tableData.length > 0 && currentUser) {
            const userNotifications = [];
            
            tableData.forEach(task => {
                // Check if this task is assigned to current user
                const isAssignedToUser = task.details?.some(detail => 
                    detail.User_Id === parseInt(user_id)
                );

                if (isAssignedToUser) {
                    // Find the creator user info
                    const createdByUser = tbluser.find(user => 
                        user.User_Name === task.Created_By
                    );

                    // Check if task is new (created recently)
                    const taskCreatedTime = new Date(task.doc_date).getTime();
                    const isNewTask = (Date.now() - taskCreatedTime) < (24 * 60 * 60 * 1000); // Within 24 hours

                    if (isNewTask) {
                        userNotifications.push({
                            id: task.taskno,
                            type: 'TASK_ASSIGNED',
                            title: 'New Task Assigned',
                            message: `You have been assigned a new task: "${task.purpose}"`,
                            taskData: {
                                taskno: task.taskno,
                                purpose: task.purpose,
                                taskdesc: task.taskdesc,
                                deadlinedate: task.deadlinedate,
                                priority: task.priority,
                                createdBy: task.Created_By,
                                createdById: createdByUser?.User_Id,
                                assignDate: task.doc_date
                            },
                            timestamp: taskCreatedTime,
                            isRead: readNotifications.has(task.taskno),
                            isNew: isNewTask
                        });
                    }
                }
            });

            // Sort by timestamp (newest first)
            userNotifications.sort((a, b) => b.timestamp - a.timestamp);
            setNotifications(userNotifications);
        }
    }, [tableData, currentUser, tbluser, user_id, readNotifications, lastUpdate]);

    const unreadCount = notifications.filter(notification => !notification.isRead).length;

    const markAsRead = (notificationId) => {
        setReadNotifications(prev => new Set([...prev, notificationId]));
        
        setNotifications(prev => prev.map(notif => 
            notif.id === notificationId ? { ...notif, isRead: true } : notif
        ));
    };

    const markAllAsRead = () => {
        const allIds = notifications.map(notif => notif.id);
        setReadNotifications(prev => new Set([...prev, ...allIds]));
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    };

    const clearAllNotifications = () => {
        setNotifications([]);
        setReadNotifications(new Set());
        localStorage.setItem('unreadNotifications', '0');
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 1: return 'text-red-600 bg-red-50 border-red-200';
            case 2: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 3: return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getPriorityText = (priority) => {
        switch (priority) {
            case 1: return 'High Priority';
            case 2: return 'Medium Priority';
            case 3: return 'Low Priority';
            default: return 'Normal Priority';
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
                    <p className="text-gray-600">
                        {unreadCount > 0 
                            ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                            : 'All caught up!'
                        }
                    </p>
                </div>
                
                {notifications.length > 0 && (
                    <div className="flex space-x-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                        <button
                            onClick={clearAllNotifications}
                            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-12">
                        <BellIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-500">No notifications</h3>
                        <p className="text-gray-400">You're all caught up! New task assignments will appear here.</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`border rounded-lg p-4 transition-all duration-200 ${
                                notification.isRead 
                                    ? 'bg-white border-gray-200' 
                                    : 'bg-blue-50 border-blue-200 shadow-sm'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-full ${
                                        notification.isRead ? 'bg-gray-100' : 'bg-blue-100'
                                    }`}>
                                        <BellIcon className={`h-5 w-5 ${
                                            notification.isRead ? 'text-gray-600' : 'text-blue-600'
                                        }`} />
                                    </div>
                                    <div>
                                        <h3 className={`font-semibold ${
                                            notification.isRead ? 'text-gray-800' : 'text-blue-800'
                                        }`}>
                                            {notification.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {formatDate(notification.timestamp)} at {formatTime(notification.timestamp)}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex space-x-2">
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="p-1 text-green-600 hover:text-green-800 transition-colors"
                                            title="Mark as read"
                                        >
                                            <CheckIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <p className="text-gray-700 mb-3 ml-11">
                                {notification.message}
                            </p>

                            {/* Task Details */}
                            {notification.taskData && (
                                <div className="ml-11 p-3 bg-white border border-gray-200 rounded-md">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="flex items-center space-x-2 mb-2">
                                                <UserGroupIcon className="h-4 w-4 text-gray-500" />
                                                <span className="font-medium">Assigned by:</span>
                                                <span>{notification.taskData.createdBy}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <CalendarIcon className="h-4 w-4 text-gray-500" />
                                                <span className="font-medium">Deadline:</span>
                                                <span>{notification.taskData.deadlinedate}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getPriorityColor(notification.taskData.priority)}`}>
                                                {getPriorityText(notification.taskData.priority)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {notification.taskData.taskdesc && (
                                        <div className="mt-2 text-sm text-gray-600">
                                            <p className="font-medium">Description:</p>
                                            <p className="line-clamp-2">{notification.taskData.taskdesc}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;