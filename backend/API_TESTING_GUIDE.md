# EduHub API Testing Guide

## 🚀 Quick Start

### 1. Import Postman Collection
- Open Postman
- Click "Import" button
- Select `EduHub_API.postman_collection.json`
- The collection will be imported with all endpoints ready to test

### 2. Start the Server
```bash
cd /Users/tammynkuna/rnt/school/database/eduhub/backend
npm start
```

Server will run on: `http://localhost:3000`

### 3. Test the API

## 📋 Available Endpoints

### Authentication
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login (auto-saves token)
- **GET** `/api/auth/profile` - Get your profile
- **POST** `/api/auth/refresh` - Refresh access token
- **POST** `/api/auth/logout` - Logout

### Students
- **GET** `/api/students` - Get all students (staff only)
- **GET** `/api/students/me` - Get my student profile
- **GET** `/api/students/:id` - Get student by ID
- **PATCH** `/api/students/:id` - Update student (staff only)
- **GET** `/api/students/:id/registrations` - Get student's module registrations

### Qualifications
- **GET** `/api/qualifications` - Get all qualifications
- **GET** `/api/qualifications/:id` - Get qualification with modules

### Modules
- **GET** `/api/modules` - Get all modules (with filters)
- **GET** `/api/modules/:id` - Get module with lecturers
- **GET** `/api/modules/:id/students` - Get students in module (staff only)

### Health Check
- **GET** `/api/health` - Check API status

## 🔐 Authentication Flow

1. **Register** or **Login** to get access token
2. Token is automatically saved to collection variable `{{access_token}}`
3. All protected endpoints use: `Authorization: Bearer {{access_token}}`

## 🧪 Testing Scenarios

### Scenario 1: Register and Login
1. Use "Register User" with your details
2. Use "Login" with same credentials
3. Check "Get My Profile" to verify

### Scenario 2: Browse Qualifications and Modules
1. Login first
2. Call "Get All Qualifications" to see available programs
3. Copy a qualification ID
4. Call "Get Qualification by ID" to see its modules

### Scenario 3: Student Operations (Staff)
1. Login as admin/lecturer
2. Call "Get All Students" to see enrolled students
3. Use search/filter parameters to find specific students

## 🎯 User Roles

- **student** - Can view own profile and registrations
- **lecturer** - Can view students and modules they teach
- **admin** - Full access to all endpoints

## 📝 Example Test Data

### Register Student
```json
{
  "email": "student@eduhub.co.za",
  "password": "Student@123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "student"
}
```

### Login
```json
{
  "email": "testuser@eduhub.co.za",
  "password": "Test@123456"
}
```

## ✅ What We Built

### Backend Architecture
- ✅ Express.js 5.2.1 API server
- ✅ PostgreSQL database with 14 tables
- ✅ JWT authentication & authorization
- ✅ Role-based access control (RBAC)
- ✅ Request validation (express-validator)
- ✅ CORS configuration
- ✅ Global error handling
- ✅ Standardized API responses

### Database Schema (lowercase snake_case)
- ✅ users & user_details
- ✅ students, lecturers
- ✅ qualifications, modules, semesters
- ✅ registrations, applications
- ✅ emergency_contacts, module_lecturers
- ✅ application_documents, audit_logs, notifications

### Middleware
- ✅ JWT authentication
- ✅ Role checking (admin, lecturer, student)
- ✅ Resource ownership verification
- ✅ Input sanitization
- ✅ CORS handling
- ✅ Error handling with detailed messages

### API Features
- ✅ User registration with validation
- ✅ Login with JWT tokens (7-day expiry)
- ✅ Refresh token support (30-day expiry)
- ✅ Profile management
- ✅ Pagination support
- ✅ Search and filtering
- ✅ Relationship queries (joins)

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if database is running
make up

# Check if migrations are applied
npm run migrate
```

### Token expired
Use the "Refresh Token" endpoint or login again

### 403 Forbidden
Check if your user role has permission for that endpoint

## 📊 Database Info

**Connection**: localhost:5433
**Database**: eduhub
**User**: postgres
**Password**: yourpassword

Access via pgAdmin: http://localhost:5050
- Email: admin@eduhub.co.za
- Password: admin

## 🎉 Success!

Your EduHub API is now fully functional with:
- Complete authentication system
- Student management
- Academic structure (qualifications, modules)
- Professional error handling
- Ready for frontend integration
