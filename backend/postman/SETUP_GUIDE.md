# 🔧 Postman Workspace Setup Guide

## 🎯 Goal
Automatically sync your local Postman collections with your team's cloud workspace.

---

## 📋 Prerequisites

1. **Postman Account** (free or paid)
   - Sign up at: https://www.postman.com/

2. **Postman Desktop App** (recommended)
   - Download: https://www.postman.com/downloads/

3. **Git Repository** (this project)
   - Already set up ✅

---

## 🚀 Setup Methods

### Method 1: Postman Desktop App (Easiest)

#### Step 1: Create/Join Workspace
1. Open Postman Desktop
2. Click **Workspaces** dropdown (top left)
3. Click **Create Workspace** or join existing team workspace
4. Name it: `EduHub API Workspace`
5. Choose **Team** (if you want to share with team)

#### Step 2: Link Repository
1. In your workspace, click **Import**
2. Select **Link this workspace to a Git repository**
3. Connect your GitHub/GitLab account
4. Select this repository: `eduhub`
5. Specify collection path: `backend/postman/EduHub_API.postman_collection.json`

#### Step 3: Enable Auto-Sync
1. Click **Settings** (⚙️) in workspace
2. Go to **Git Integration** tab
3. Enable **Auto-sync**
4. Set sync frequency (e.g., every 5 minutes)

**Done!** 🎉 Changes to your collection will automatically sync.

---

### Method 2: Postman CLI (Advanced)

#### Step 1: Install Postman CLI
```bash
# macOS
brew install postman-cli

# Or download from
# https://www.postman.com/downloads/postman-cli/
```

#### Step 2: Login
```bash
postman login
```

#### Step 3: Pull Collections from Workspace
```bash
# Navigate to project root
cd /Users/tammynkuna/rnt/school/database/eduhub

# Pull collections (uses .postman/resources.yaml)
postman api pull
```

#### Step 4: Push Changes
```bash
# After editing collection locally
postman api push
```

---

### Method 3: Manual Import (Quick Start)

**For Team Members Who Just Want to Test:**

1. Open Postman Desktop
2. Click **Import** button
3. Drag and drop: `backend/postman/EduHub_API.postman_collection.json`
4. Start testing!

**Note:** Changes won't auto-sync, but it's the quickest way to get started.

---

## 🔄 How Auto-Sync Works

### The `.postman/resources.yaml` File

This file links your local collections to a cloud workspace:

```yaml
workspace:
  id: b7a9be20-989c-4fe4-bce3-978b5ea36252  # Your workspace ID
localResources:
  collections:
    - ../backend/postman/EduHub_API.postman_collection.json  # Local path
```

### Sync Flow

```
Your Computer                 Postman Cloud               Team Members
    ↓                              ↓                           ↓
Edit collection    →→→    Syncs to workspace    →→→    Auto-pulls changes
in Postman                 (workspace ID)              to their Postman
```

---

## 👥 Team Workflow

### For Team Leader (You):

1. **Initial Setup:**
   ```bash
   # Already done! ✅
   # .postman/resources.yaml exists
   ```

2. **Share Workspace:**
   - In Postman, invite team members via email
   - Or share workspace link

3. **Commit to Git:**
   ```bash
   git add .postman/ backend/postman/
   git commit -m "Add Postman workspace and collection"
   git push
   ```

### For Team Members:

**Option A: Auto-Sync (Recommended)**
1. Clone repository
   ```bash
   git clone <repo-url>
   cd eduhub
   ```

2. Install Postman CLI
   ```bash
   brew install postman-cli
   ```

3. Login and pull
   ```bash
   postman login
   postman api pull
   ```

4. Open Postman Desktop → Collections appear automatically! ✨

**Option B: Manual Import (Quick)**
1. Clone repository
2. Open Postman Desktop
3. Import: `backend/postman/EduHub_API.postman_collection.json`
4. Start testing!

---

## 🎓 Workspace ID - Where to Find It

Your current workspace ID: `b7a9be20-989c-4fe4-bce3-978b5ea36252`

### To Get Your Own Workspace ID:

1. Open Postman Desktop
2. Go to your workspace
3. Click **Settings** (⚙️)
4. Copy **Workspace ID** from the info section

### Or via API:
```bash
# Login first
postman login

# List workspaces
postman workspace list

# Get workspace details
postman workspace get <workspace-id>
```

---

## ✅ Verification

### Check if Sync is Working:

1. **Make a change in Postman:**
   - Edit a request description
   - Add a new endpoint

2. **Check the file:**
   ```bash
   git status
   # Should show: modified: backend/postman/EduHub_API.postman_collection.json
   ```

3. **Team member pulls:**
   ```bash
   git pull
   postman api pull  # Syncs to Postman app
   ```

---

## 🐛 Troubleshooting

### Sync Not Working?

**Check 1: Postman CLI Installed?**
```bash
postman --version
```

**Check 2: Logged In?**
```bash
postman whoami
```

**Check 3: File Path Correct?**
```bash
cat .postman/resources.yaml
# Should point to: ../backend/postman/EduHub_API.postman_collection.json
```

**Check 4: Workspace Access?**
- Ensure team members are invited to workspace
- Check workspace permissions (Admin/Editor/Viewer)

---

## 🔐 Permissions

### Workspace Roles:

| Role | Can View | Can Edit | Can Share |
|------|----------|----------|-----------|
| **Viewer** | ✅ | ❌ | ❌ |
| **Editor** | ✅ | ✅ | ❌ |
| **Admin** | ✅ | ✅ | ✅ |

Recommended: Give team **Editor** access.

---

## 📚 Alternative: Git-Only Workflow (No Postman Cloud)

If you don't want to use Postman Cloud sync:

1. **Remove `.postman/` folder:**
   ```bash
   rm -rf .postman/
   echo ".postman/" >> .gitignore
   ```

2. **Team workflow:**
   - Store collections in: `backend/postman/`
   - Commit changes to Git
   - Team members manually import updated collection

**Pros:** Simple, no cloud dependency
**Cons:** No auto-sync, manual import needed

---

## 🎯 Recommended Setup for Your Team

### For Small Team (1-5 people):
✅ **Use Postman Desktop + Manual Git**
- Import collection manually
- Commit changes to Git
- Team pulls from Git

### For Larger Team (5+ people):
✅ **Use Postman Workspace + CLI**
- Auto-sync via workspace
- Everyone always has latest version
- Less manual work

---

## 📖 Official Documentation

- **Postman Git Integration:** https://learning.postman.com/docs/getting-started/importing-and-exporting-data/#importing-from-git
- **Postman CLI:** https://learning.postman.com/docs/postman-cli/postman-cli-overview/
- **Workspaces:** https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/

---

## 🎉 Quick Start Summary

**Just want to test APIs?**
```bash
# 1. Import collection
Open Postman → Import → Select backend/postman/EduHub_API.postman_collection.json

# 2. Start server
cd backend && npm start

# 3. Test!
Register User → Token auto-saved → Test other endpoints
```

**Want full team sync?**
```bash
# 1. Install CLI
brew install postman-cli

# 2. Login
postman login

# 3. Pull collections
postman api pull

# Done! Collections sync automatically
```

---

Happy Testing! 🚀
