# GitHub Repository Setup Guide

## Complete Guide to Push Your Project to GitHub

### Prerequisites
- Git installed on your computer
- GitHub account created
- GitHub CLI (optional but recommended)

---

## Step 1: Create GitHub Repository

### Option A: Using GitHub Website (Recommended for beginners)

1. Go to https://github.com
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the details:
   - **Repository name:** `attendance-tracking-system` (or your preferred name)
   - **Description:** "Multi-organization employee time and attendance management system with mobile app and admin dashboard"
   - **Visibility:** Choose Public or Private
   - **DO NOT** check "Initialize this repository with a README" (we already have one)
   - **DO NOT** add .gitignore or license (we already have them)
5. Click "Create repository"
6. **Keep this page open** - you'll need the commands shown

### Option B: Using GitHub CLI (Advanced)

```bash
# Login to GitHub
gh auth login

# Create repository
gh repo create attendance-tracking-system --public --description "Multi-organization attendance system"
```

---

## Step 2: Initialize Local Git Repository

Open your terminal in the project folder (`C:\Users\Alfraskhan\Desktop\tracker`) and run:

```bash
# Initialize git repository
git init

# Check status
git status
```

---

## Step 3: Configure Git (First Time Only)

If this is your first time using Git, configure your identity:

```bash
# Set your name
git config --global user.name "Your Name"

# Set your email (use your GitHub email)
git config --global user.email "your.email@example.com"

# Verify configuration
git config --list
```

---

## Step 4: Add Files to Git

```bash
# Add all files to staging
git add .

# Check what will be committed
git status

# You should see all your files listed in green
```

---

## Step 5: Create First Commit

```bash
# Create initial commit
git commit -m "Initial commit: Multi-organization attendance tracking system

- Backend API with 13 Supabase Edge Functions
- Next.js admin dashboard with employee management
- React Native/Expo mobile app for employees
- Complete documentation and testing scripts"

# Verify commit was created
git log --oneline
```

---

## Step 6: Connect to GitHub Repository

Replace `YOUR_USERNAME` with your actual GitHub username:

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/attendance-tracking-system.git

# Verify remote was added
git remote -v
```

**Example:**
```bash
git remote add origin https://github.com/johndoe/attendance-tracking-system.git
```

---

## Step 7: Push to GitHub

```bash
# Push to GitHub (first time)
git push -u origin main

# If you get an error about 'master' vs 'main', rename the branch:
git branch -M main
git push -u origin main
```

**Note:** You may be prompted to login to GitHub. Use your GitHub username and a Personal Access Token (not your password).

---

## Step 8: Create Personal Access Token (If Needed)

If Git asks for authentication:

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "Git CLI Access"
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)
7. Use this token as your password when Git prompts you

---

## Step 9: Verify Upload

1. Go to your GitHub repository page
2. Refresh the page
3. You should see all your files uploaded
4. Check that the README.md displays correctly

---

## Complete Command Summary

Here's the complete sequence of commands:

```bash
# 1. Initialize repository
git init

# 2. Configure Git (first time only)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 3. Add all files
git add .

# 4. Create initial commit
git commit -m "Initial commit: Multi-organization attendance tracking system"

# 5. Rename branch to main (if needed)
git branch -M main

# 6. Add remote repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/attendance-tracking-system.git

# 7. Push to GitHub
git push -u origin main
```

---

## Future Updates

After the initial push, when you make changes:

```bash
# 1. Check what changed
git status

# 2. Add changed files
git add .

# 3. Commit with a message
git commit -m "Description of changes"

# 4. Push to GitHub
git push
```

---

## Important Files Already Configured

✅ `.gitignore` - Already configured to exclude:
- `.env` files (keeps your secrets safe)
- `node_modules/` (too large for Git)
- `.next/` and build folders
- `.expo/` temporary files
- `.supabase/` local files
- IDE settings

✅ `.env.example` - Template for environment variables (safe to commit)

---

## What Gets Uploaded

**Included:**
- ✅ All source code
- ✅ Documentation (*.md files)
- ✅ Configuration files
- ✅ Database migrations
- ✅ Test scripts
- ✅ .env.example (template)

**Excluded (by .gitignore):**
- ❌ .env (your actual secrets)
- ❌ node_modules/ (dependencies)
- ❌ Build folders
- ❌ Temporary files
- ❌ IDE settings

---

## Troubleshooting

### Error: "remote origin already exists"
```bash
# Remove existing remote
git remote remove origin

# Add it again with correct URL
git remote add origin https://github.com/YOUR_USERNAME/attendance-tracking-system.git
```

### Error: "failed to push some refs"
```bash
# Pull first, then push
git pull origin main --rebase
git push origin main
```

### Error: "Authentication failed"
- Make sure you're using a Personal Access Token, not your password
- Generate a new token at https://github.com/settings/tokens

### Error: "Permission denied"
- Check that the repository URL is correct
- Verify you have write access to the repository

---

## Repository Structure on GitHub

After upload, your repository will look like this:

```
attendance-tracking-system/
├── admin-dashboard/          # Next.js admin dashboard
├── employee-mobile-app/      # React Native mobile app
├── supabase/                 # Backend functions & migrations
├── docs/                     # Documentation
├── scripts/                  # Setup scripts
├── test-*.js                 # API test scripts
├── .gitignore               # Git ignore rules
├── .env.example             # Environment template
├── README.md                # Main documentation
├── PROJECT-STATUS.md        # Project status
├── SYSTEM-COMPLETE.md       # System overview
└── package.json             # Root dependencies
```

---

## Next Steps After Upload

1. **Add Repository Description**
   - Go to repository settings
   - Add topics: `attendance-tracking`, `supabase`, `nextjs`, `react-native`, `expo`

2. **Update README.md**
   - Add GitHub repository URL
   - Add badges (optional)
   - Add screenshots (optional)

3. **Create Releases**
   - Tag version 1.0.0
   - Create release notes

4. **Set Up GitHub Actions** (Optional)
   - Automated testing
   - Automated deployment

---

## Security Reminder

⚠️ **NEVER commit these files:**
- `.env` (contains your actual Supabase credentials)
- Any file with passwords or API keys
- Database dumps with real data

✅ **Safe to commit:**
- `.env.example` (template without real values)
- Source code
- Documentation
- Configuration files

---

## Need Help?

If you encounter issues:
1. Check the error message carefully
2. Search GitHub documentation: https://docs.github.com
3. Check Git documentation: https://git-scm.com/doc
4. Ask for help with the specific error message

---

**Your project is ready to be shared with the world!** 🚀
