import React, { useState } from 'react';
import {
    useGetNotifyTaskQuery,
    useUpdateTaskNotificationMutation
} from '../../services/taskdescriptionApi';
import { ChevronDown, ChevronUp, FileText, CheckCircle, BellRing, CircleOff, LucideFileText } from 'lucide-react';

const UserNotifications = () => {
    const {
        data: notifications = [],
        isLoading,
        error,
        isFetching
    } = useGetNotifyTaskQuery();

    const [updateTaskNotification] = useUpdateTaskNotificationMutation();
    const [expandedNotifications, setExpandedNotifications] = useState(new Set());
    const [markedNotifications, setMarkedNotifications] = useState(new Set());
    const [activeFilter, setActiveFilter] = useState('all');

    const toggleExpand = (taskno) => {
        setExpandedNotifications(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskno)) {
                newSet.delete(taskno);
            } else {
                newSet.add(taskno);
            }
            return newSet;
        });
    };

    const markAsRead = async (taskno) => {
        try {
            if (!taskno) {
                console.error('Invalid taskno:', taskno);
                return;
            }

            setMarkedNotifications(prev => new Set(prev).add(taskno));

            await updateTaskNotification(taskno).unwrap();

            setTimeout(() => {
                setMarkedNotifications(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(taskno);
                    return newSet;
                });
            }, 1000);

        } catch (error) {
            console.error('Error marking notification as read:', error);
            setMarkedNotifications(prev => {
                const newSet = new Set(prev);
                newSet.delete(taskno);
                return newSet;
            });
        }
    };

    const markAllAsRead = async () => {
        const unreadNotifications = getFilteredNotifications().filter(
            notification => !markedNotifications.has(notification.taskno)
        );

        for (const notification of unreadNotifications) {
            await markAsRead(notification.taskno);
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            info: 'ℹ️',
            warning: '⚠️',
            error: '❌',
            success: '✅',
            default: <BellRing size={24} className="text-blue-500" />
        };
        return icons[type] || icons.default;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const getPriorityInfo = (priority) => {
        const priorityMap = {
            1: { label: 'High', color: 'bg-red-100 text-red-800 border-red-200', icon: '🔴', badgeColor: 'bg-red-500' },
            2: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '🟡', badgeColor: 'bg-yellow-500' },
            3: { label: 'Low', color: 'bg-green-100 text-green-800 border-green-200', icon: '🟢', badgeColor: 'bg-green-500' }
        };
        return priorityMap[priority] || { label: 'Unknown', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '⚫', badgeColor: 'bg-gray-500' };
    };

    const isOverdue = (deadline) => {
        if (!deadline) return false;
        try {
            return new Date(deadline) < new Date();
        } catch (error) {
            return false;
        }
    };

    const getFilteredNotifications = () => {
        switch (activeFilter) {
            case 'unread':
                return notifications.filter(notification => !markedNotifications.has(notification.taskno));
            case 'read':
                return notifications.filter(notification => markedNotifications.has(notification.taskno));
            default:
                return notifications;
        }
    };

    const filteredNotifications = getFilteredNotifications();
    const unreadCount = notifications.filter(
        notification => !markedNotifications.has(notification.taskno)
    ).length;

    const readCount = notifications.length - unreadCount;

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center justify-center space-x-3 py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="text-gray-600 text-lg">Loading notifications...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-red-200">
                <div className="text-red-500 text-center flex flex-col items-center justify-center space-y-3 py-6">
                    <span className="text-4xl">❌</span>
                    <span className="text-lg font-medium">Error loading notifications</span>
                    <div className="text-sm text-gray-500 mt-2 text-center">{error.message}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                        Retry Loading
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <span className="text-3xl">
                                <BellRing size={32} className="text-blue-500" />
                            </span>
                            {unreadCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm rounded-full h-6 w-6 flex items-center justify-center animate-pulse font-medium">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Your Notifications</h2>
                    </div>

                    <div className="flex space-x-3">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                disabled={isFetching}
                                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                            >
                                <CheckCircle size={20} />
                                <span>{isFetching ? 'Marking All...' : 'Mark All as Read'}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <div className="text-6xl mb-4">📭</div>
                        <p className="text-lg font-medium mb-2">No notifications found</p>
                        <p className="text-sm">You're all caught up! {activeFilter !== 'all' && `Try changing the filter.`}</p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => {
                        const isExpanded = expandedNotifications.has(notification.taskno);
                        const isMarked = markedNotifications.has(notification.taskno);
                        const isNew = !isMarked;
                        const priorityInfo = getPriorityInfo(notification.priority);
                        const isDeadlineOverdue = isOverdue(notification.deadlinedate);

                        return (
                            <div
                                key={notification.taskno || notification.id}
                                className={`p-6 border-b border-gray-100 transition-all duration-300 hover:bg-gray-50 ${isNew
                                        ? 'bg-blue-50 border-l-4 border-l-blue-400 hover:bg-blue-100'
                                        : 'bg-white opacity-90 hover:opacity-100'
                                    } ${isMarked ? 'animate-pulse' : ''}`}
                            >
                                <div className="flex justify-between items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="relative">
                                            <span className="text-2xl">
                                                {getNotificationIcon(notification.type)}
                                            </span>
                                            {isNew && (
                                                <span className="absolute -top-1 -right-1 bg-blue-500 rounded-full w-3 h-3 animate-ping"></span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <h3 className={`font-bold text-gray-900 text-lg mb-1 ${!isNew ? 'text-gray-500' : ''}`}>
                                                    {`${notification.purpose}`}
                                                    {!isNew && <CircleOff size={16} className="inline ml-2 text-gray-400" />}
                                                </h3>
                                                <div className="flex items-center space-x-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${priorityInfo.color}`}>
                                                        {priorityInfo.icon} {priorityInfo.label} Priority
                                                    </span>
                                                    {isDeadlineOverdue && (
                                                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold border border-red-200">
                                                            ⏰ Overdue
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => toggleExpand(notification.taskno)}
                                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                                    title={isExpanded ? 'Collapse Details' : 'View Details'}
                                                >
                                                    {isExpanded ? <ChevronUp size={24} className="text-gray-600" /> : <ChevronDown size={24} className="text-gray-600" />}
                                                </button>
                                                {isNew && (
                                                    <button
                                                        onClick={() => markAsRead(notification.taskno)}
                                                        disabled={isMarked}
                                                        className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                                                    >
                                                        <CheckCircle size={20} />
                                                        <span>{isMarked ? 'Marking...' : 'Mark Read'}</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expandable Content */}
                                        <div className={`space-y-3 transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                            {/* Task Purpose */}
                                            {notification.purpose && (
                                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                    <p className="text-sm font-semibold text-gray-700 mb-1">Purpose:</p>
                                                    <p className="text-sm text-gray-600">{notification.purpose}</p>
                                                </div>
                                            )}

                                            {/* Task Description */}
                                            {notification.taskdesc && (
                                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                    <p className="text-sm font-semibold text-gray-700 mb-1">Description:</p>
                                                    <p className="text-sm text-gray-600 leading-relaxed">
                                                        {notification.taskdesc}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Detailed Information */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Dates and Creator */}
                                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                    <p className="text-sm font-semibold text-gray-700 mb-2">Details:</p>
                                                    <div className="space-y-2">
                                                        {notification.Created_By && (
                                                            <div className="flex justify-between">
                                                                <span className="text-xs text-gray-500">Created By:</span>
                                                                <span className="text-xs font-medium">{notification.Created_By}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between">
                                                            <span className="text-xs text-gray-500">Created:</span>
                                                            <span className="text-xs font-medium">{formatDate(notification.doc_date)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-xs text-gray-500">Deadline:</span>
                                                            <span className={`text-xs font-medium ${isDeadlineOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                                                                {formatDate(notification.deadlinedate)}
                                                                {isDeadlineOverdue && ' ⚠️'}
                                                            </span>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Collapsed Summary */}
                                        {!isExpanded && (
                                            <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                                                <div className="flex space-x-4">
                                                    <span>Created: {formatDate(notification.doc_date)}</span>
                                                    <span className={`${isDeadlineOverdue ? 'text-red-600 font-semibold' : ''}`}>
                                                        Deadline: {formatDate(notification.deadlinedate)}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => toggleExpand(notification.taskno)}
                                                    className="text-blue-500 hover:text-blue-700 font-medium flex items-center space-x-1"
                                                >
                                                    <LucideFileText size={16} />
                                                    <span>Show Details</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default UserNotifications;