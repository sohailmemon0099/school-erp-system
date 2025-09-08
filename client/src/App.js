import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PermissionProvider, usePermissions } from './contexts/PermissionContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './styles/dark-mode.css';
import Layout from './components/Layout';
import StudentLayout from './components/StudentLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import Subjects from './pages/Subjects';
import Grades from './pages/Grades';
import Exams from './pages/Exams';
import ExamSchedules from './pages/ExamSchedules';
import HallTickets from './pages/HallTickets';
import Library from './pages/Library';
import MarkDistributions from './pages/MarkDistributions';
import AttendanceReports from './pages/AttendanceReports';
import Cheques from './pages/Cheques';
import StudentSubjects from './pages/StudentSubjects';
import StudentAttendance from './pages/StudentAttendance';
import StudentGrades from './pages/StudentGrades';
import Fees from './pages/Fees';
import Calendar from './pages/Calendar';
import Reports from './pages/Reports';
import Inquiries from './pages/Inquiries';
import Affidavits from './pages/Affidavits';
import Transport from './pages/Transport';
import Certificates from './pages/Certificates';
import LMS from './pages/LMS';
import SocialNetwork from './pages/SocialNetwork';
import TransactionReports from './pages/TransactionReports';
import UserManagement from './pages/UserManagement';
import RolePermissions from './pages/RolePermissions';
import ClassTeacherAssignments from './pages/ClassTeacherAssignments';
import BonafideCertificates from './pages/BonafideCertificates';
import LeavingCertificates from './pages/LeavingCertificates';
import BulkSMS from './pages/BulkSMS';
import Timetable from './pages/Timetable';
import Classworks from './pages/Classworks';
import Profile from './pages/Profile';
import Homework from './pages/Homework';
import Schedule from './pages/Schedule';
import Unauthorized from './pages/Unauthorized';
import AttendanceRegister from './pages/AttendanceRegister';
import LoadingSpinner from './components/LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

const LayoutWithKey = () => {
  const { userRole } = usePermissions();
  return <Layout key={userRole || 'default'} />;
};

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />
      <Route 
        path="/unauthorized" 
        element={<Unauthorized />} 
      />
      
      {/* Admin Routes */}
      <Route 
        path="/admin/*" 
        element={
          <RoleBasedRoute allowedRoles={['admin', 'teacher', 'clark', 'staff']}>
            <LayoutWithKey />
          </RoleBasedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="classes" element={<Classes />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="timetable" element={<Timetable />} />
        <Route path="classworks" element={<Classworks />} />
        <Route path="attendance" element={<AttendanceRegister />} />
        <Route path="grades" element={<Grades />} />
        <Route path="exams" element={<Exams />} />
        <Route path="exam-schedules" element={<ExamSchedules />} />
        <Route path="hall-tickets" element={<HallTickets />} />
        <Route path="library" element={<Library />} />
        <Route path="mark-distributions" element={<MarkDistributions />} />
        <Route path="attendance-reports" element={<AttendanceReports />} />
        <Route path="cheques" element={<Cheques />} />
        <Route path="fees" element={<Fees />} />
        
        {/* New Feature Routes */}
        <Route path="transport" element={<Transport />} />
        <Route path="certificates" element={<Certificates />} />
        <Route path="lms" element={<LMS />} />
        <Route path="social" element={<SocialNetwork />} />
        <Route path="transaction-reports" element={<TransactionReports />} />
        <Route path="user-management" element={<UserManagement />} />
        <Route path="role-permissions" element={<RolePermissions />} />
        <Route path="class-teacher-assignments" element={<ClassTeacherAssignments />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="reports" element={<Reports />} />
                 <Route path="inquiries" element={<Inquiries />} />
                 <Route path="affidavits" element={<Affidavits />} />
                 <Route path="bonafide-certificates" element={<BonafideCertificates />} />
                 <Route path="leaving-certificates" element={<LeavingCertificates />} />
                 <Route path="bulk-sms" element={<BulkSMS />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Student Routes */}
      <Route 
        path="/student/*" 
        element={
          <RoleBasedRoute allowedRoles={['student']}>
            <StudentLayout />
          </RoleBasedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="subjects" element={<StudentSubjects />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="grades" element={<StudentGrades />} />
        <Route path="homework" element={<Homework />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Default redirect based on role */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            {user?.role === 'student' ? (
              <Navigate to="/student/dashboard" replace />
            ) : (
              <Navigate to="/admin/dashboard" replace />
            )}
          </ProtectedRoute>
        }
      />

      {/* Legacy routes - redirect to role-based routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            {user?.role === 'student' ? (
              <Navigate to="/student/dashboard" replace />
            ) : (
              <Navigate to="/admin/dashboard" replace />
            )}
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PermissionProvider>
          <Router>
            <div className="App">
              <AppRoutes />
            </div>
          </Router>
        </PermissionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
