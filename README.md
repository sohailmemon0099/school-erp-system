# 🏫 Advanced School ERP System

A comprehensive, modern school management system built with Node.js, Express, PostgreSQL, and React. This system provides complete management of students, teachers, classes, attendance, grades, fees, and analytics.

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Teacher, Student, Parent)
- Secure password hashing with bcrypt
- Profile management

### 👥 User Management
- Student enrollment and management
- Teacher registration and assignment
- Class and subject management
- Parent information tracking

### 📊 Academic Management
- **Attendance Tracking**: Daily attendance with status tracking (Present, Absent, Late, Excused)
- **Grade Management**: Exam grades with percentage calculations
- **Class Management**: Class creation, student assignment, capacity management
- **Subject Management**: Subject creation with teacher assignment
- **Exam Schedule Management**: Create and manage exam schedules with venues and timings
- **Hall Ticket System**: Generate and manage exam hall tickets for students
- **Library Management**: Complete library system with book tracking and loan management

### 💰 Fee Management
- Fee structure creation
- Payment tracking
- Fee collection reports
- Outstanding fee management

### 📈 Analytics & Reports
- **Dashboard**: Real-time statistics and charts
- **Student Reports**: Individual student performance and attendance
- **Class Reports**: Class-wise performance analysis
- **Attendance Reports**: Daily, monthly, and custom period reports
- **Fee Reports**: Collection status and outstanding fees

### 🛡️ Security Features
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization
- SQL injection protection

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd school-erp-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp config.env.example config.env
   ```
   
   Edit `config.env` with your database credentials:
   ```env
   NODE_ENV=development
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=school_erp
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   FRONTEND_URL=
   http://localhost:3000
   ```

4. **Initialize the database**
   ```bash
   npm run init-db
   ```

5. **Seed with sample data (optional)**
   ```bash
   npm run seed-db
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Student Management
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student details
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/:id/grades` - Get student grades
- `GET /api/students/:id/attendance` - Get student attendance
- `GET /api/students/:id/fees` - Get student fees
- `GET /api/students/:id/stats` - Get student statistics

### Teacher Management
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/:id` - Get teacher details
- `POST /api/teachers` - Create new teacher
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher
- `POST /api/teachers/:id/assign-classes` - Assign classes to teacher
- `POST /api/teachers/:id/assign-subjects` - Assign subjects to teacher

### Class Management
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get class details
- `POST /api/classes` - Create new class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class
- `GET /api/classes/:id/stats` - Get class statistics

### Subject Management
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get subject details
- `POST /api/subjects` - Create new subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

### Attendance Management
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/:id` - Get attendance record
- `POST /api/attendance` - Create attendance record
- `POST /api/attendance/bulk` - Bulk create attendance
- `PUT /api/attendance/:id` - Update attendance record
- `DELETE /api/attendance/:id` - Delete attendance record
- `GET /api/attendance/stats` - Get attendance statistics

### Grade Management
- `GET /api/grades` - Get all grades
- `GET /api/grades/:id` - Get grade record
- `POST /api/grades` - Create grade record
- `PUT /api/grades/:id` - Update grade record
- `DELETE /api/grades/:id` - Delete grade record
- `GET /api/grades/stats` - Get grade statistics

### Fee Management
- `GET /api/fees` - Get all fees
- `GET /api/fees/:id` - Get fee record
- `POST /api/fees` - Create fee record
- `PUT /api/fees/:id` - Update fee record
- `PUT /api/fees/:id/pay` - Mark fee as paid
- `DELETE /api/fees/:id` - Delete fee record
- `GET /api/fees/stats` - Get fee statistics

### Dashboard & Analytics
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/attendance-chart` - Get attendance chart data
- `GET /api/dashboard/grade-distribution` - Get grade distribution
- `GET /api/dashboard/fee-collection` - Get fee collection data
- `GET /api/dashboard/class-performance` - Get class performance

### Reports
- `GET /api/reports/student/:id` - Generate student report
- `GET /api/reports/class/:id` - Generate class report
- `GET /api/reports/attendance` - Generate attendance report
- `GET /api/reports/fees` - Generate fee report

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts and profiles
- **students** - Student-specific information
- **teachers** - Teacher-specific information
- **classes** - Class information
- **subjects** - Subject information
- **attendance** - Daily attendance records
- **grades** - Exam and assessment grades
- **fees** - Fee structure and payments

### Relationships
- Users can be Students or Teachers
- Students belong to Classes
- Teachers can be assigned to multiple Classes and Subjects
- Attendance links Students, Classes, and Subjects
- Grades link Students and Subjects
- Fees are associated with Students

## 🔧 Configuration

### Environment Variables
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRE` - JWT expiration time
- `FRONTEND_URL` - Frontend application URL

### Database Configuration
The system uses PostgreSQL with Sequelize ORM. Database configuration is in `config/database.js`.

## 🧪 Testing

### Sample Data
After running `npm run seed-db`, you can use these credentials:

**Admin User:**
- Email: `admin@school.com`
- Password: `admin123`

**Teacher Users:**
- Email: `teacher1@school.com` / Password: `teacher123`
- Email: `teacher2@school.com` / Password: `teacher123`

**Student Users:**
- Email: `student1@school.com` / Password: `student123`
- Email: `student2@school.com` / Password: `student123`

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production` in your environment
2. Configure production database
3. Set secure JWT secret
4. Configure CORS for your domain
5. Use a process manager like PM2

### Docker Deployment
```bash
# Build the image
docker build -t school-erp .

# Run the container
docker run -p 5000:5000 school-erp
```

## 📝 API Response Format

All API responses follow this format:

```json
{
  "status": "success|error",
  "message": "Response message",
  "data": {
    // Response data
  }
}
```

### Error Response Example
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

## 🔒 Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Rate limiting prevents abuse
- Input validation prevents injection attacks
- CORS is configured for security
- Helmet provides security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the sample data and test endpoints

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Mobile app integration
- [ ] Advanced reporting with PDF export
- [ ] Email notifications
- [ ] Parent portal
- [ ] Transport management
- [ ] Hostel management
- [ ] Cafeteria management
- [ ] Inventory management
- [ ] Multi-language support

---

**Built with ❤️ for modern education management**
