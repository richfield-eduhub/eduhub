# 📬 Postman API Testing

This folder contains all Postman collections and environments for testing the EduHub API.

## 📦 Contents

### Collections
- **`EduHub_API.postman_collection.json`** - Complete API collection with all 15 endpoints

## 🚀 Quick Start

### 1. Import Collection to Postman
1. Open Postman desktop app or web version
2. Click **Import** button (top left)
3. Drag and drop `EduHub_API.postman_collection.json`
4. Collection appears in your sidebar!

### 2. Start Testing
1. Make sure backend server is running:
   ```bash
   cd ../
   npm start
   ```

2. In Postman, open **EduHub API** collection
3. Start with **Authentication** → **Register User**
4. Token is auto-saved to collection variable `{{access_token}}`
5. Try other endpoints!

## 🎯 Collection Features

✅ **Auto Token Management**
- Login/Register automatically saves your access token
- Token is used in all protected endpoints
- No manual copying needed!

✅ **Pre-configured Examples**
- All requests have example data
- Just click Send!

✅ **Organized by Category**
- Authentication (5 endpoints)
- Students (5 endpoints)
- Qualifications (2 endpoints)
- Modules (3 endpoints)
- Health Check (1 endpoint)

✅ **Query Parameters Documented**
- Hover over params to see descriptions
- Enable/disable filters easily

## 📝 Variables

The collection uses these variables:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `{{base_url}}` | API base URL | `http://localhost:3000/api` |
| `{{access_token}}` | JWT token (auto-saved) | _(empty)_ |

## 🔐 Authentication Flow

1. **Register** or **Login** → Token saved automatically ✨
2. All protected endpoints use: `Authorization: Bearer {{access_token}}`
3. Token expires after 7 days → Use **Refresh Token** or re-login

## 📚 Available Endpoints

### Authentication
- POST `/auth/register` - Create account
- POST `/auth/login` - Get token
- GET `/auth/profile` - View profile
- POST `/auth/refresh` - Renew token
- POST `/auth/logout` - Sign out

### Students
- GET `/students` - List all (staff)
- GET `/students/me` - My profile
- GET `/students/:id` - View student
- PATCH `/students/:id` - Update (staff)
- GET `/students/:id/registrations` - View modules

### Qualifications
- GET `/qualifications` - List programs
- GET `/qualifications/:id` - Program details

### Modules
- GET `/modules` - List courses
- GET `/modules/:id` - Course details
- GET `/modules/:id/students` - Enrolled students (staff)

### Health
- GET `/health` - Check API status

## 🎓 Testing Scenarios

### Scenario 1: Student Registration
1. **Register User** with role: "student"
2. **Login** with same credentials
3. **Get My Profile** to verify
4. **Get My Student Profile** for student details

### Scenario 2: Browse Academics
1. **Login** first
2. **Get All Qualifications** to see programs
3. **Get Qualification by ID** to see modules
4. **Get All Modules** with filters

### Scenario 3: Staff Access (Admin/Lecturer)
1. Register with role: "lecturer" or "admin"
2. **Login**
3. **Get All Students** to see enrolled students
4. **Get Module Students** to see class list

## 🐛 Troubleshooting

### "Unauthorized" error
→ Token expired or missing. Login again.

### "Forbidden" error
→ Your role doesn't have permission for this endpoint.

### Server not responding
→ Check if backend is running: `npm start`

### Token not auto-saving
→ Check the "Tests" tab in Login/Register requests

## 📖 More Documentation

See parent folder for:
- `API_TESTING_GUIDE.md` - Comprehensive guide
- `ENDPOINTS_SUMMARY.md` - Full endpoint reference

## 🤝 For the Team

**Sharing this collection:**
1. Share this entire `postman/` folder via GitHub
2. Or send `EduHub_API.postman_collection.json` via WhatsApp/Slack
3. Team members import and start testing!

**Adding more collections:**
- Add new `.postman_collection.json` files here
- Keep environments in separate files
- Document in this README

---

Happy Testing! 🎉
