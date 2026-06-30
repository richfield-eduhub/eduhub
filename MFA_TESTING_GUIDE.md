# 🧪 MFA Testing Guide - Step by Step

## ✅ What I Just Fixed

1. **Added "Security" navigation link** to all user role navbars:
   - Admin → Dashboard, Applications, Registrations, Allocations, Students, Lecturers, **Security**
   - Student → Dashboard, Register Modules, My Modules, **Security**
   - Lecturer → Dashboard, My Courses, Roster, Announcements, **Security**

2. **Backend is running** and healthy (confirmed)

---

## 🎯 Complete Testing Steps

### Step 1: Login to Any Account

**Option A - Admin Account:**
```
URL: http://localhost/login
Email: admin@eduhub.ac.za
Password: Password123!
```

**Option B - Lecturer Account:**
```
URL: http://localhost/login
Email: john.smith@eduhub.ac.za
Password: Password123!
```

**Option C - Student Account:**
```
URL: http://localhost/login
Email: thabo.molefe@student.eduhub.ac.za
Password: [Get from database or use demo password]
```

---

### Step 2: Navigate to Security Settings

After logging in, you should see **"Security"** in the navigation bar (far right before logout).

**Direct URL:** `http://localhost/shared/Security`

Or click the **"Security"** link in the navbar.

---

### Step 3: Enable MFA

You should see a page with:

**Top Card (Orange Warning):**
```
⚠️ Two-Factor Authentication Disabled
Your account is not protected by two-factor authentication.
We recommend enabling it to secure your account.
```

**Bottom Card (Setup Instructions):**
```
🔐 Enable Two-Factor Authentication
Two-factor authentication adds an extra layer of security...

[🔐 Start Setup] button
```

**Click "🔐 Start Setup"** to begin.

---

### Step 4: Scan QR Code

After clicking Start Setup, you should see:

1. **Step 1: Scan QR Code**
   - A QR code image appears (base64 data URL)
   - Manual entry secret code displayed below

2. **Step 2: Verify Code**
   - 6-digit input field

**What to do:**
- Open Google Authenticator (or any TOTP app) on your phone
- Scan the QR code
- Or manually enter the secret code

The app will start showing 6-digit codes that change every 30 seconds.

---

### Step 5: Verify and Activate

1. **Look at your authenticator app** - you'll see a 6-digit code
2. **Enter the code** in the input field on the webpage
3. **Click "✓ Verify"**

**Expected Result:**
```
✓ MFA Successfully Enabled!
Your account is now protected with two-factor authentication.

📋 Backup Codes
Save these backup codes in a safe place...

[10 backup codes displayed in a grid]

[📋 Copy All Codes] button
```

**IMPORTANT:** Save these backup codes! They're only shown once.

---

### Step 6: Test MFA Login

1. **Logout** (click logout in navbar)
2. **Go to login page** (`http://localhost/login`)
3. **Enter your email and password**
4. **Click "Sign In →"**

**What should happen:**
- Password form disappears
- **MFA verification form appears:**

```
🔐 Two-Factor Authentication
Enter the 6-digit code from your authenticator app to complete login.

[000000] (large input field)

Lost your phone? Use backup code

[Verify Code →] button
[← Back to Login] button
```

5. **Open your authenticator app**
6. **Enter the current 6-digit code**
7. **Click "Verify Code →"**

**Expected Result:**
- Successfully logged in!
- Redirected to your dashboard

---

### Step 7: Test Backup Code (Optional)

1. **Logout again**
2. **Login with email/password**
3. **MFA prompt appears**
4. **Click "Lost your phone? Use backup code"**
5. **Enter one of your 10 backup codes**
6. **Click "Verify Code →"**

**Expected Result:**
- Successfully logged in!
- That backup code is now consumed (can't reuse)
- You have 9 remaining backup codes

---

### Step 8: Disable MFA (Optional)

1. **While logged in, go to Security page** (`http://localhost/shared/Security`)
2. **You should see green card:**
```
✓ Two-Factor Authentication Enabled
Your account is protected with two-factor authentication...

[🔄 Regenerate Backup Codes] [🔓 Disable MFA]
```

3. **Click "🔓 Disable MFA"**
4. **A password prompt appears** (browser native prompt)
5. **Enter your password:** `Password123!`
6. **Click OK**

**Expected Result:**
- Toast message: "MFA disabled successfully"
- Card changes back to orange warning
- Next login won't require MFA code

---

## 🐛 Troubleshooting

### Issue 1: "Security" link not showing in navbar

**Check:**
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Hard refresh the page
3. Logout and login again

**If still not showing:**
```bash
# Check if shared.js was updated
grep -n "Security" frontend/shared.js
# Should show the Security links around lines 1595, 1601, 1616
```

---

### Issue 2: QR Code not displaying

**Check browser console (F12 → Console tab):**

Look for errors like:
- `qr_code_url is undefined` → Backend issue
- `Failed to fetch` → API connection issue

**Check backend logs:**
```bash
docker logs eduhub_backend --tail 50 | grep -i error
```

**Test the API directly:**
```bash
# First login to get a token
TOKEN="your_access_token_here"

# Then test MFA setup endpoint
curl -X POST http://localhost/api/auth/mfa/setup \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

Should return JSON with `qr_code_url` field.

---

### Issue 3: "Invalid verification code" even with correct code

**Possible causes:**

1. **Time drift** - Your server and phone clocks are out of sync
   ```bash
   # Check server time
   docker exec eduhub_backend date

   # Check phone time
   # Settings → General → Date & Time → Set Automatically
   ```

2. **Wrong secret** - Re-scan the QR code or manually re-enter the secret

3. **Code already used** - TOTP codes change every 30 seconds, wait for a new one

4. **Speakeasy not loaded** - Check backend logs:
   ```bash
   docker logs eduhub_backend 2>&1 | grep -i speakeasy
   ```

---

### Issue 4: Backend errors after restart

**Check if packages are installed:**
```bash
docker exec eduhub_backend npm list speakeasy qrcode
```

Should show:
```
├── speakeasy@2.0.0
└── qrcode@1.5.3
```

**If not installed:**
```bash
docker exec eduhub_backend npm install speakeasy qrcode --save
docker-compose restart backend
```

---

### Issue 5: MFA form not appearing during login

**Check browser console:**
```javascript
// After entering password, check console for:
[Apply] Checking submission path conditions: {...}
```

**Check network tab (F12 → Network):**
- Look for POST to `/api/auth/login`
- Check response - should contain `mfaRequired: true` if MFA is enabled

**Verify MFA is actually enabled in database:**
```sql
SELECT email, mfa_enabled FROM users WHERE email = 'admin@eduhub.ac.za';
```

---

## 📊 Expected API Responses

### 1. Login WITHOUT MFA:
```json
{
  "ok": true,
  "data": {
    "user": {...},
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### 2. Login WITH MFA enabled:
```json
{
  "ok": true,
  "data": {
    "mfaRequired": true,
    "userId": "uuid-here",
    "email": "user@example.com",
    "message": "MFA verification required..."
  }
}
```

### 3. MFA Setup (POST /api/auth/mfa/setup):
```json
{
  "ok": true,
  "data": {
    "secret": "BASE32SECRETHERE",
    "qr_code_url": "data:image/png;base64,iVBORw0KG...",
    "backupCodes": ["A1B2C3D4", "E5F6G7H8", ...]
  }
}
```

### 4. MFA Verification (POST /api/auth/mfa/verify):
```json
{
  "ok": true,
  "data": {
    "verified": true,
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {...}
  }
}
```

---

## ✅ Final Checklist

**Before Testing:**
- [ ] Backend is running (`docker ps` shows eduhub_backend)
- [ ] Backend packages installed (speakeasy, qrcode)
- [ ] Frontend updated (Security link in navbar)
- [ ] Browser cache cleared

**During Testing:**
- [ ] Can login with demo account
- [ ] "Security" link visible in navbar
- [ ] Can access Security settings page
- [ ] Can click "Start Setup" button
- [ ] QR code displays correctly
- [ ] Can scan QR code with authenticator app
- [ ] Can verify 6-digit code
- [ ] Backup codes displayed after verification
- [ ] MFA enabled (green card shown)
- [ ] Logout works
- [ ] Login prompts for MFA code
- [ ] Valid MFA code allows login
- [ ] Can use backup code for login
- [ ] Can disable MFA with password

**If ANY step fails, check the Troubleshooting section above!**

---

## 🆘 Quick Debug Commands

```bash
# Check backend status
docker ps | grep eduhub_backend

# Check backend logs (real-time)
docker logs -f eduhub_backend

# Check if MFA packages installed
docker exec eduhub_backend npm list speakeasy qrcode

# Restart backend
docker-compose restart backend

# Check database MFA status
docker exec eduhub_db psql -U postgres -d eduhub -c "SELECT email, mfa_enabled FROM users;"

# Test login API
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eduhub.ac.za","password":"Password123!"}'
```

---

## 🎉 Success Criteria

You'll know MFA is working when:

1. ✅ You can see and click "Security" in the navbar
2. ✅ Security page loads without errors
3. ✅ QR code displays when you click "Start Setup"
4. ✅ Your authenticator app can scan the QR code
5. ✅ Entering the 6-digit code enables MFA successfully
6. ✅ Logging out and back in prompts for MFA code
7. ✅ Entering the correct MFA code logs you in

**If all 7 steps work → MFA is fully functional! 🎊**

---

Need help with any specific error? Share the error message and I'll help debug!
