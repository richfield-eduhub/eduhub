# EduHub API Endpoints - Team Summary

## 🚀 Base URL
`http://localhost:3000/api`

---

## 1. POST /api/auth/register
**Register New User**
- Creates new user account (student, lecturer, or admin)
- Returns user info + access token + refresh token
- Public endpoint (no auth required)

Example:
```json
{
  "email": "student@eduhub.co.za",
  "password": "Student@123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "student"
}
```

---

## 2. POST /api/auth/login
**User Login**
- Authenticates user with email & password
- Returns access token (7 days) + refresh token (30 days)
- Public endpoint

Example:
```json
{
  "email": "student@eduhub.co.za",
  "password": "Student@123"
}
```

---

## 3. GET /api/auth/profile
**Get Current User Profile**
- Returns authenticated user's full profile
- Requires: Bearer token
- Any authenticated user

---

## 4. POST /api/auth/refresh
**Refresh Access Token**
- Get new access token using refresh token
- Extends session without re-login
- Public endpoint (needs refresh token)

Example:
```json
{
  "refreshToken": "your_refresh_token_here"
}
```

---

## 5. POST /api/auth/logout
**Logout User**
- Invalidates session (client removes token)
- Requires: Bearer token
- Any authenticated user

---

## 6. GET /api/students
**Get All Students (Staff Only)**
- Lists all students with pagination
- Supports search & filters
- Requires: Admin or Lecturer role

Query Params:
- `page` - Page number (default: 1)
- `limit` - Items per page (max: 100)
- `status` - Filter by lifecycle_status
- `search` - Search name, email, student number

---

## 7. GET /api/students/me
**Get My Student Profile**
- Returns current student's profile & details
- Requires: Student role + Bearer token
- Students can only view their own profile

---

## 8. GET /api/students/:id
**Get Student by ID**
- Returns specific student with full details + emergency contacts
- Requires: Owner (student) or Staff
- UUID required in URL

---

## 9. PATCH /api/students/:id
**Update Student Info (Staff Only)**
- Updates student lifecycle/academic status
- Requires: Admin or Lecturer role
- UUID required in URL

Example:
```json
{
  "lifecycle_status": "enrolled",
  "academic_status": "active",
  "expected_graduation": "2026-12-31"
}
```

---

## 10. GET /api/students/:id/registrations
**Get Student's Module Registrations**
- Lists all modules student is registered for
- Shows grades, credits, semester info
- Requires: Owner (student) or Staff

---

## 11. GET /api/qualifications
**Get All Qualifications**
- Lists all degree programs with module counts
- Requires: Any authenticated user
- Supports active_only filter

Query Params:
- `active_only=true` - Show only active programs

---

## 12. GET /api/qualifications/:id
**Get Qualification Details**
- Returns program details + all its modules
- Shows BSc IT, DIT, BCom, etc.
- Requires: Any authenticated user

---

## 13. GET /api/modules
**Get All Modules**
- Lists all course modules with filters
- Shows lecturer count, student count
- Requires: Any authenticated user

Query Params:
- `qualification_id` - Filter by program
- `level` - Filter by year (1-10)
- `active_only=true` - Active modules only

---

## 14. GET /api/modules/:id
**Get Module Details**
- Returns module info + assigned lecturers
- Shows credits, description, prerequisites
- Requires: Any authenticated user

---

## 15. GET /api/modules/:id/students (Staff Only)
**Get Students in Module**
- Lists all students enrolled in module
- Filter by semester
- Requires: Admin or Lecturer role

Query Params:
- `semester_id` - Filter by specific semester

---

## 🔐 Authentication
All protected endpoints require:
```
Authorization: Bearer {access_token}
```

Get token from login/register response.

---

## 📊 Response Format
**Success:**
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

**Paginated:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## 🎯 User Roles & Permissions

**Student:**
- View own profile & registrations
- View qualifications & modules
- Cannot access other students' data

**Lecturer:**
- All student permissions +
- View all students
- View students in their modules
- Update student records

**Admin:**
- Full access to all endpoints
- Manage all resources

---

## 📝 Test Users Available

After running `npm run seed`:
- Students, Lecturers, and Admins created
- Test with the registered user from Postman

---

## 🚀 Quick Start
1. Import `postman/EduHub_API.postman_collection.json` to Postman
2. Run server: `npm start`
3. Test "Register User" → Token auto-saved
4. Try other endpoints!

📂 **All Postman files in:** `backend/postman/`

---

**Total Endpoints:** 15 + 1 health check = 16 endpoints
**Server:** Running on port 3000
**Database:** PostgreSQL (localhost:5433)
