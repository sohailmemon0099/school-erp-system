# User Management & Role-Based Access Control

## Overview

The User Management system provides comprehensive functionality for creating, managing, and controlling access for different types of users in the School ERP system. The admin can create users with different roles and decide which tabs/features each role can access.

## Features

### 1. User Management
- **Create Users**: Add new users with different roles (Admin, Teacher, Student, Clark, Parent, Staff)
- **Edit Users**: Update user information and role-specific details
- **View Users**: Display user details and role information
- **Delete Users**: Remove users from the system
- **Bulk Create**: Create multiple users at once
- **User Status**: Activate/deactivate user accounts
- **Password Management**: Change user passwords
- **User Statistics**: View user counts and role breakdowns

### 2. Role-Based Access Control
- **Role Permissions**: Define what each role can access
- **Feature-Level Control**: Control access to individual features/modules
- **Permission Types**: View, Create, Update, Delete, Export permissions
- **Default Permissions**: Pre-configured permissions for each role
- **Permission Matrix**: Visual interface to manage permissions

## User Roles

### Admin
- **Full System Access**: Complete control over all features
- **User Management**: Can create, edit, and delete all users
- **Role Permissions**: Can modify role-based access controls
- **System Configuration**: Access to all system settings

### Teacher
- **Student Management**: View student information
- **Academic Features**: Access to classes, subjects, attendance, grades
- **Exam Management**: Create and manage exam schedules
- **LMS Access**: Learning management system features
- **Social Network**: Internal communication features

### Student
- **Personal Information**: View own attendance, grades, fees
- **Academic Access**: Exam schedules, hall tickets, library
- **Learning Platform**: LMS access for courses and lessons
- **Social Features**: Access to social network

### Clark
- **Administrative Support**: Most management features except user management
- **Data Management**: Create, update records for students, teachers, classes
- **Reports**: Generate and export various reports
- **Transaction Management**: Handle financial transactions

### Parent
- **Child Information**: View child's attendance, grades, fees
- **Academic Updates**: Exam schedules, hall tickets
- **Communication**: Access to social network for updates

### Staff
- **View Access**: Can view most system information
- **Limited Editing**: Read-only access to most features
- **Support Functions**: Basic system access for support staff

## Technical Implementation

### Backend Components

#### Models
- **User**: Core user information
- **RolePermission**: Role-based access control
- **Student**: Student-specific information
- **Teacher**: Teacher-specific information

#### Controllers
- **userManagementController.js**: User CRUD operations
- **rolePermissionController.js**: Permission management

#### Routes
- **/api/user-management**: User management endpoints
- **/api/role-permissions**: Permission management endpoints

#### Middleware
- **permission.js**: Permission checking middleware
- **validation.js**: Input validation for user management

### Frontend Components

#### Pages
- **UserManagement.js**: Main user management interface
- **RolePermissions.js**: Permission management interface

#### Features
- **User Table**: Paginated list with filtering and search
- **User Forms**: Create/edit user forms with role-specific fields
- **Bulk Creation**: Multi-user creation interface
- **Permission Matrix**: Visual permission management
- **Statistics Dashboard**: User and role statistics

## API Endpoints

### User Management
```
GET    /api/user-management              # Get all users
GET    /api/user-management/:id          # Get user by ID
POST   /api/user-management              # Create new user
PUT    /api/user-management/:id          # Update user
DELETE /api/user-management/:id          # Delete user
PUT    /api/user-management/:id/password # Change password
PUT    /api/user-management/:id/toggle-status # Toggle user status
POST   /api/user-management/bulk-create  # Bulk create users
GET    /api/user-management/stats/overview # Get user statistics
```

### Role Permissions
```
GET    /api/role-permissions                    # Get all role permissions
GET    /api/role-permissions/:role              # Get permissions for role
POST   /api/role-permissions                    # Create/update role permissions
PUT    /api/role-permissions/:role              # Update role permissions
DELETE /api/role-permissions/:role              # Delete role permissions
POST   /api/role-permissions/initialize-defaults # Initialize default permissions
GET    /api/role-permissions/features/available  # Get available features
```

## Permission System

### Permission Types
- **view**: Can view the feature
- **create**: Can create new records
- **update**: Can modify existing records
- **delete**: Can delete records
- **export**: Can export data

### Available Features
- Dashboard
- Student Management
- Teacher Management
- Class Management
- Subject Management
- Attendance Management
- Grade Management
- Fee Management
- Reports & Analytics
- Exam Schedules
- Hall Tickets
- Library Management
- Transport Management
- Certificates & Documents
- Communication
- Health & Wellness
- Admission & CRM
- Digital Learning (LMS)
- Social Network
- Transaction Reports
- User Management
- Role Permissions

## Usage Instructions

### For Administrators

#### Creating Users
1. Navigate to **System Administration > User Management**
2. Click **Add User**
3. Fill in basic information (name, email, password, role)
4. Add role-specific information (employee ID for teachers, student ID for students)
5. Set user status (active/inactive)
6. Click **Create User**

#### Managing Permissions
1. Navigate to **System Administration > Role Permissions**
2. Select a role from the left panel
3. Use the permission matrix to set access levels
4. Click **Save Permissions**

#### Bulk User Creation
1. Click **Bulk Create** in User Management
2. Add multiple users using the form
3. Set role and basic information for each user
4. Click **Create Users**

### For Other Users
- Users can only access features based on their role permissions
- The system automatically restricts access based on configured permissions
- Users will see only the features they have permission to access

## Security Features

### Authentication
- JWT-based authentication for all API endpoints
- Password hashing using bcrypt
- Session management

### Authorization
- Role-based access control
- Feature-level permissions
- API endpoint protection
- Frontend route protection

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

## Database Schema

### User Table
```sql
CREATE TABLE "User" (
  "id" UUID PRIMARY KEY,
  "firstName" VARCHAR(50) NOT NULL,
  "lastName" VARCHAR(50) NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "role" ENUM('admin', 'teacher', 'student', 'clark', 'parent', 'staff'),
  "phone" VARCHAR(20),
  "address" TEXT,
  "dateOfBirth" DATE,
  "gender" ENUM('male', 'female', 'other'),
  "profileImage" VARCHAR(255),
  "isActive" BOOLEAN DEFAULT true,
  "lastLogin" TIMESTAMP,
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP
);
```

### RolePermission Table
```sql
CREATE TABLE "role_permissions" (
  "id" UUID PRIMARY KEY,
  "role" ENUM('admin', 'teacher', 'student', 'clark', 'parent', 'staff') UNIQUE,
  "permissions" JSONB NOT NULL DEFAULT '{}',
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP
);
```

## Installation & Setup

### 1. Database Setup
```bash
# Initialize role permissions
npm run init-role-permissions
```

### 2. Environment Variables
Ensure the following environment variables are set:
- `JWT_SECRET`: Secret key for JWT tokens
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Database connection

### 3. Default Admin User
Create an admin user through the registration process or directly in the database.

## Troubleshooting

### Common Issues

#### Permission Denied Errors
- Check if user has the required role
- Verify role permissions are configured
- Ensure user account is active

#### User Creation Failures
- Validate all required fields are provided
- Check for duplicate email addresses
- Verify role-specific information is complete

#### Permission Matrix Not Loading
- Ensure role permissions are initialized
- Check database connection
- Verify API endpoints are accessible

### Support
For technical support or feature requests, please contact the system administrator.

## Future Enhancements

### Planned Features
- **User Groups**: Create custom user groups with specific permissions
- **Temporary Permissions**: Time-based permission grants
- **Audit Logs**: Track user actions and permission changes
- **Advanced Filtering**: More sophisticated user search and filtering
- **Import/Export**: Bulk user import from CSV/Excel files
- **Two-Factor Authentication**: Enhanced security for admin accounts
- **API Keys**: Generate API keys for system integration
- **Custom Roles**: Create custom roles beyond the predefined ones

### Integration Possibilities
- **LDAP/Active Directory**: Integration with existing user directories
- **SSO**: Single sign-on integration
- **Email Notifications**: Automated user creation notifications
- **Mobile App**: Mobile interface for user management
