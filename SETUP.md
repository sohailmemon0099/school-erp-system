# 🚀 School ERP System - Setup Guide

## 📋 Prerequisites

Before setting up the School ERP System, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)

## 🛠️ Installation Steps

### 1. Install Node.js Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Database Setup

1. **Create PostgreSQL Database:**
   ```sql
   CREATE DATABASE school_erp;
   ```

2. **Update Environment Variables:**
   ```bash
   # Edit config.env file
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=school_erp
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_secure_jwt_secret_here
   ```

### 3. Initialize Database

```bash
# Initialize database tables and create admin user
npm run init-db

# Seed with sample data (optional)
npm run seed-db
```

### 4. Start the Application

```bash
# Start backend server (Terminal 1)
npm run dev

# Start frontend development server (Terminal 2)
cd client
npm start
```

## 🌐 Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health

## 🔑 Default Login Credentials

After running `npm run seed-db`, you can use these credentials:

### Admin User
- **Email:** admin@school.com
- **Password:** admin123

### Teacher Users
- **Email:** teacher1@school.com
- **Password:** teacher123
- **Email:** teacher2@school.com
- **Password:** teacher123

### Student Users
- **Email:** student1@school.com
- **Password:** student123
- **Email:** student2@school.com
- **Password:** student123

## 📊 Sample Data Included

The seed script creates:
- 2 Classes (Grade 1A, Grade 2A)
- 3 Subjects (Mathematics, English, Science)
- 2 Teachers with qualifications
- 2 Students with parent information
- Sample attendance records
- Sample grades
- Sample fee records

## 🔧 Available Scripts

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run init-db` - Initialize database and create admin user
- `npm run seed-db` - Seed database with sample data

### Frontend Scripts
- `cd client && npm start` - Start React development server
- `cd client && npm run build` - Build for production
- `cd client && npm test` - Run tests

## 🏗️ Project Structure

```
school-erp-system/
├── config/
│   └── database.js          # Database configuration
├── controllers/             # API route controllers
├── middleware/              # Authentication & validation
├── models/                  # Sequelize models
├── routes/                  # API routes
├── scripts/                 # Database scripts
├── utils/                   # Utility functions
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── contexts/        # React contexts
│   │   └── hooks/           # Custom hooks
│   └── public/              # Static assets
├── server.js                # Main server file
├── package.json             # Backend dependencies
└── README.md                # Project documentation
```

## 🚀 Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
DB_HOST=your_production_db_host
DB_PORT=5432
DB_NAME=school_erp_prod
DB_USER=your_production_db_user
DB_PASSWORD=your_secure_production_password
JWT_SECRET=your_very_secure_jwt_secret
JWT_EXPIRE=7d
FRONTEND_URL=https://your-domain.com
```

### Build for Production
```bash
# Build frontend
cd client
npm run build
cd ..

# Start production server
npm start
```

## 🔍 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Student Management
- `GET /api/students` - Get all students
- `POST /api/students` - Create student
- `GET /api/students/:id` - Get student details
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### And many more... (See README.md for complete API documentation)

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Input validation
- SQL injection protection
- XSS protection

## 📱 Features

### ✅ Completed Features
- ✅ User authentication and authorization
- ✅ Student management
- ✅ Teacher management
- ✅ Class management
- ✅ Subject management
- ✅ Attendance tracking
- ✅ Grade management
- ✅ Fee management
- ✅ Dashboard with analytics
- ✅ Reports generation
- ✅ Modern React frontend
- ✅ Responsive design
- ✅ Real-time notifications
- ✅ Exam schedule management
- ✅ Hall ticket generation and management
- ✅ Library management system
- ✅ Book loan tracking
- ✅ SMS integration (demo mode)

### 🔮 Future Enhancements
- [ ] Email notifications
- [ ] File uploads
- [ ] Mobile app
- [ ] Advanced reporting
- [ ] Multi-language support
- [ ] Parent portal
- [ ] Transport management
- [ ] Hostel management
- [ ] Cafeteria management
- [ ] Inventory management

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify database credentials in config.env
   - Ensure database exists

2. **Port Already in Use**
   - Change PORT in config.env
   - Kill existing processes on port 5000/3000

3. **Module Not Found**
   - Run `npm install` in both root and client directories
   - Clear node_modules and reinstall if needed

4. **CORS Issues**
   - Check FRONTEND_URL in config.env
   - Ensure frontend is running on correct port

### Getting Help

- Check the console for error messages
- Review the API documentation
- Check database connection
- Verify environment variables

## 📄 License

This project is licensed under the MIT License.

---

**🎉 Congratulations! Your School ERP System is now ready to use!**
