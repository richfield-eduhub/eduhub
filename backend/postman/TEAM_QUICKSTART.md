# 🚀 EduHub API - Quick Start for Team

**Get testing in 5 minutes!**

---

## 📥 Option 1: Pull from Cloud Workspace (Recommended)

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd eduhub
```

### Step 2: Open Postman Desktop
- Download if needed: https://www.postman.com/downloads/
- Sign in with your Postman account

### Step 3: Open Workspace
1. Click **Workspaces** dropdown (top left)
2. Select **"eduhub"** workspace
   - If not visible, ask team leader for invite

### Step 4: Pull Collection
1. Click **"Pull from Cloud"** button (top center)
2. Select **"EduHub API"** collection
3. Click **Pull**

**✅ Done! Collection appears in sidebar with all 15 endpoints**

---

## 📁 Option 2: Manual Import (No Cloud Account Needed)

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd eduhub
```

### Step 2: Import Collection
1. Open Postman Desktop
2. Click **Import** button (top left)
3. Drag and drop: `backend/postman/EduHub_API.postman_collection.json`
4. Click **Import**

**✅ Done! Collection ready to use**

---

## 🎯 Start Testing

### 1. Start Backend Server
```bash
cd backend
npm install    # First time only
npm start      # Server runs on http://localhost:3000
```

### 2. Test Your First Endpoint

**a) Register a User**
1. In Postman, expand **"EduHub API"** collection
2. Open **Authentication** → **Register User**
3. Click **Send**

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGc..."
  }
}
```

✨ **Token auto-saved!** All protected endpoints now work.

**b) Get Your Profile**
1. Open **Authentication** → **Get My Profile**
2. Click **Send** (token used automatically)

**c) Browse Qualifications**
1. Open **Qualifications** → **Get All Qualifications**
2. Click **Send**
3. See all programs (BSc IT, DIT, etc.)

---

## 📋 Available Endpoints

### 🔐 Authentication (5)
- ✅ Register User
- ✅ Login
- ✅ Get My Profile
- ✅ Refresh Token
- ✅ Logout

### 👨‍🎓 Students (5)
- ✅ Get All Students (staff only)
- ✅ Get My Student Profile
- ✅ Get Student by ID
- ✅ Update Student (staff only)
- ✅ Get Student Registrations

### 🎓 Qualifications (2)
- ✅ Get All Qualifications
- ✅ Get Qualification by ID

### 📚 Modules (3)
- ✅ Get All Modules
- ✅ Get Module by ID
- ✅ Get Module Students (staff only)

**Total: 15 endpoints + 1 health check**

---

## 🔑 User Roles

Test with different roles:

**Student:**
```json
{
  "email": "student@example.com",
  "password": "Student@123",
  "role": "student"
}
```

**Lecturer:**
```json
{
  "email": "lecturer@example.com",
  "password": "Lecturer@123",
  "role": "lecturer"
}
```

**Admin:**
```json
{
  "email": "admin@example.com",
  "password": "Admin@123",
  "role": "admin"
}
```

---

## 🎓 Testing Scenarios

### Scenario 1: Student Registration Flow
1. **Register User** (role: "student")
2. **Login** with credentials
3. **Get My Profile** to see user data
4. **Get My Student Profile** for student details

### Scenario 2: Browse Academic Programs
1. **Login** first
2. **Get All Qualifications** → See BSc IT, DIT, etc.
3. Copy a qualification ID from response
4. **Get Qualification by ID** → See all modules in program

### Scenario 3: Staff Operations
1. **Register** with role: "lecturer" or "admin"
2. **Login**
3. **Get All Students** → See list with pagination
4. **Get Module Students** → See class enrollment

---

## 💡 Collection Features

✅ **Auto Token Management**
- Login/Register saves token automatically
- No manual copying needed!

✅ **Environment Variables**
- `{{base_url}}` = `http://localhost:3000/api`
- `{{access_token}}` = Auto-saved from login

✅ **Pre-filled Examples**
- All requests have sample data
- Just click **Send**!

✅ **Organized by Category**
- Easy to find what you need

---

## 🐛 Troubleshooting

### "Could not get any response"
→ Server not running. Run: `npm start`

### "Unauthorized" error
→ Token expired. Login again.

### "Forbidden" error
→ Your role doesn't have permission for this endpoint.

### Collection not showing?
→ Make sure you're in **"eduhub"** workspace (top left)

### Need to update collection?
→ Click **"Pull from Cloud"** to get latest version

---

## 🔄 Keeping Collection Updated

When team leader updates the collection:

**If using Cloud Workspace:**
```
Click "Pull from Cloud" in Postman
```

**If using Manual Import:**
```bash
git pull
# Re-import collection in Postman
```

---

## 📖 More Documentation

- **Full API Guide:** `../API_TESTING_GUIDE.md`
- **Endpoints Reference:** `../ENDPOINTS_SUMMARY.md`
- **Postman Setup:** `./SETUP_GUIDE.md`

---

## 🆘 Need Help?

1. Check if server is running: `npm start`
2. Check Postman console (View → Show Postman Console)
3. Ask team leader for workspace invite
4. Review error message in response

---

## ✅ Quick Checklist

- [ ] Repository cloned
- [ ] Backend dependencies installed (`npm install`)
- [ ] Server running (`npm start`)
- [ ] Postman Desktop installed
- [ ] Collection imported (Cloud or Manual)
- [ ] First request successful (Register User)

---

**🎉 Happy Testing!**

**Questions?** Ask in team chat or check the detailed guides in this folder.
