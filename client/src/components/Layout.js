import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionContext';
import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Award,
  DollarSign,
  FileText,
  User,
  LogOut,
  Menu,
  BarChart3,
  CreditCard,
  X,
  Settings,
  MessageSquare,
  Shield,
  UserCog,
  Clock,
  Bus,
  Heart,
  MessageCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const { user, logout } = useAuth();
  const { canView, userRole } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('Layout - user:', user);
  console.log('Layout - userRole:', userRole);
  console.log('Layout - canView:', canView);

  const toggleExpanded = (itemName) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  // Filter navigation items based on permissions
  const filterNavigationItems = (items) => {
    return items.filter(item => {
      if (item.children) {
        const filteredChildren = item.children.filter(child => {
          const module = getModuleFromHref(child.href);
          return canView(module);
        });
        return filteredChildren.length > 0;
      } else {
        const module = getModuleFromHref(item.href);
        return canView(module);
      }
    }).map(item => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter(child => {
            const module = getModuleFromHref(child.href);
            return canView(module);
          })
        };
      }
      return item;
    });
  };

  const getModuleFromHref = (href) => {
    const path = href.split('/').pop();
    const moduleMap = {
      'dashboard': 'dashboard',
      'students': 'students',
      'classes': 'classes',
      'subjects': 'subjects',
      'attendance': 'attendance',
      'grades': 'grades',
      'teachers': 'teachers',
      'timetable': 'timetable',
      'classworks': 'classworks',
      'exams': 'exams',
      'exam-schedules': 'examSchedules',
      'hall-tickets': 'hallTickets',
      'mark-distributions': 'markDistributions',
      'library': 'library',
      'lms': 'lms',
      'transport': 'transport',
      'certificates': 'certificates',
      'affidavits': 'certificates',
      'communication': 'communication',
      'social': 'social',
      'health': 'health',
      'inquiries': 'admission',
      'admission': 'admission',
      'fees': 'fees',
      'cheques': 'fees',
      'transaction-reports': 'transactionReports',
      'attendance-reports': 'attendanceReports',
      'user-management': 'userManagement',
      'role-permissions': 'rolePermissions',
      'class-teacher-assignments': 'classTeacherAssignments'
    };
    return moduleMap[path] || 'dashboard';
  };

  const allNavigationItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { 
      name: 'Student Management', 
      icon: Users, 
      children: [
        { name: 'Students', href: '/admin/students', icon: Users },
        { name: 'Classes', href: '/admin/classes', icon: BookOpen },
        { name: 'Subjects', href: '/admin/subjects', icon: BookOpen },
        { name: 'Attendance', href: '/admin/attendance', icon: Calendar },
        { name: 'Grades', href: '/admin/grades', icon: Award },
      ]
    },
    { 
      name: 'Academic Management', 
      icon: GraduationCap, 
      children: [
        { name: 'Teachers', href: '/admin/teachers', icon: GraduationCap },
        { name: 'Timetable', href: '/admin/timetable', icon: Clock },
        { name: 'Classworks', href: '/admin/classworks', icon: BookOpen },
        { name: 'Exams', href: '/admin/exams', icon: BookOpen },
        { name: 'Exam Schedules', href: '/admin/exam-schedules', icon: Calendar },
        { name: 'Hall Tickets', href: '/admin/hall-tickets', icon: FileText },
        { name: 'Mark Distributions', href: '/admin/mark-distributions', icon: Settings },
        { name: 'Library', href: '/admin/library', icon: BookOpen },
        { name: 'LMS', href: '/admin/lms', icon: GraduationCap },
      ]
    },
    { 
      name: 'Transport Management', 
      icon: Bus, 
      children: [
        { name: 'Vehicles', href: '/admin/transport', icon: Bus },
        { name: 'Transport Fees', href: '/admin/transport', icon: DollarSign },
        { name: 'Transport Payments', href: '/admin/transport', icon: CreditCard },
      ]
    },
    { 
      name: 'Certificate & Documents', 
      icon: FileText, 
      children: [
        { name: 'Bonafide Certificates', href: '/admin/certificates', icon: FileText },
        { name: 'Leaving Certificates', href: '/admin/certificates', icon: FileText },
        { name: 'Affidavits', href: '/admin/affidavits', icon: FileText },
      ]
    },
    { 
      name: 'Communication', 
      icon: MessageCircle, 
      children: [
        { name: 'Bulk SMS', href: '/admin/communication', icon: MessageSquare },
        { name: 'Messages', href: '/admin/communication', icon: MessageCircle },
        { name: 'Notifications', href: '/admin/notifications', icon: MessageSquare },
        { name: 'Social Network', href: '/admin/social', icon: MessageCircle },
      ]
    },
    { 
      name: 'Health & Wellness', 
      icon: Heart, 
      children: [
        { name: 'Health Records', href: '/admin/health', icon: Heart },
        { name: 'Vaccinations', href: '/admin/health', icon: Heart },
        { name: 'Emergency Contacts', href: '/admin/health', icon: Users },
      ]
    },
    { 
      name: 'Admission & CRM', 
      icon: Users, 
      children: [
        { name: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
        { name: 'Follow-ups', href: '/admin/admission', icon: MessageCircle },
        { name: 'Funnel Reports', href: '/admin/admission', icon: BarChart3 },
      ]
    },
    { 
      name: 'Finance Management', 
      icon: DollarSign, 
      children: [
        { name: 'Fees', href: '/admin/fees', icon: DollarSign },
        { name: 'Cheques', href: '/admin/cheques', icon: CreditCard },
        { name: 'Transaction Logs', href: '/admin/transaction-logs', icon: BarChart3 },
        { name: 'Transaction Reports', href: '/admin/transaction-reports', icon: FileText },
      ]
    },
    { 
      name: 'Reports & Analytics', 
      icon: BarChart3, 
      children: [
        { name: 'Attendance Reports', href: '/admin/attendance-reports', icon: BarChart3 },
        { name: 'Dashboard Stats', href: '/admin/dashboard', icon: BarChart3 },
      ]
    },
    { 
      name: 'System Administration', 
      icon: Settings, 
      children: [
        { name: 'User Management', href: '/admin/user-management', icon: UserCog },
        { name: 'Role Permissions', href: '/admin/role-permissions', icon: Shield },
        { name: 'Class-Teacher Assignments', href: '/admin/class-teacher-assignments', icon: Users },
      ]
    },
  ];

  // Filter navigation based on user permissions
  const navigation = filterNavigationItems(allNavigationItems);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-800">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">School ERP</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isExpanded = expandedItems[item.name];
              
              if (item.children) {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className="group flex items-center justify-between w-full px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <div className="flex items-center">
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="ml-4 space-y-1">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <button
                              key={child.name}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(child.href);
                              }}
                              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left ${
                                isActive(child.href)
                                  ? 'bg-blue-100 text-blue-900'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              <ChildIcon className="mr-3 h-4 w-4" />
                              {child.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <button
                  key={item.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(item.href);
                  }}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">School ERP</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isExpanded = expandedItems[item.name];
              
              if (item.children) {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className="group flex items-center justify-between w-full px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <div className="flex items-center">
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="ml-4 space-y-1">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <button
                              key={child.name}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(child.href);
                              }}
                              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left ${
                                isActive(child.href)
                                  ? 'bg-blue-100 text-blue-900'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              <ChildIcon className="mr-3 h-4 w-4" />
                              {child.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <button
                  key={item.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(item.href);
                  }}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <NotificationBell />
              
              <ThemeToggle />
              
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
                onClick={() => navigate('/profile')}
              >
                <Settings className="h-6 w-6" />
              </button>

              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

              <div className="flex items-center gap-x-4">
                <div className="flex items-center gap-x-2">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
