# Quick GitHub Setup - 5 Minutes

## 🚀 Fast Track to GitHub

### 1. Create Repository on GitHub
Go to: https://github.com/new
- Name: `attendance-tracking-system`
- Description: "Multi-organization attendance system"
- Visibility: Public or Private
- **Don't** initialize with README
- Click "Create repository"

### 2. Run These Commands

Open terminal in your project folder and run:

```bash
# Initialize Git
git init

# Configure Git (first time only - use YOUR info)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Complete attendance tracking system"

# Rename branch to main
git branch -M main

# Connect to GitHub (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/attendance-tracking-system.git

# Push to GitHub
git push -u origin main
```

### 3. Done! 🎉

Visit your repository: `https://github.com/YOUR_USERNAME/attendance-tracking-system`

---

## If You Need Authentication

When prompted for password, use a **Personal Access Token**:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "Git Access"
4. Check: ✅ `repo`
5. Generate and copy the token
6. Use token as password when Git asks

---

## Future Updates

```bash
git add .
git commit -m "Your change description"
git push
```

---

**See GITHUB-SETUP-GUIDE.md for detailed instructions and troubleshooting.**
