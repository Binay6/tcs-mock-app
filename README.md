# TCS NQT Mock Test Platform 🎯

A free, full-featured TCS NQT mock test platform with Firebase leaderboard.

## Features
- ✅ 46 questions across 5 sections (from real TCS NQT paper)
- ⏱️ Per-section countdown timers
- 🏆 Live leaderboard saved to Firebase
- 📧 Email + phone capture before test
- 📱 WhatsApp share button on results
- 🚩 Flag questions for review
- 📊 Detailed answer review after test

---

## Setup Instructions

### Step 1 — Install Node.js
Download from https://nodejs.org (choose LTS version)

### Step 2 — Open this folder in VS Code
```
File → Open Folder → select this folder
```

### Step 3 — Open Terminal in VS Code
```
Terminal → New Terminal
```

### Step 4 — Install dependencies
```bash
npm install
```

### Step 5 — Run locally
```bash
npm start
```
Opens at http://localhost:3000 ✅

---

## Deploy to GitHub + Vercel

### Push to GitHub
```bash
git init
git add .
git commit -m "TCS NQT Mock Test Platform"
```
Then create repo on github.com and:
```bash
git remote add origin https://github.com/YOURNAME/tcs-nqt-mock.git
git push -u origin main
```

### Deploy on Vercel
1. Go to vercel.com → sign in with GitHub
2. Click "Add New Project" → Import your repo
3. Leave all settings default → Deploy
4. Live in 60 seconds! 🚀

---

## Adding More Questions
Open `src/questions.js` and add more questions to any section's `questions` array following the same format:
```js
{
  id: 16,
  topic: "Topic Name",
  text: "Your question here",
  options: ["Option A", "Option B", "Option C", "Option D"],
  answer: 0, // index of correct answer (0=A, 1=B, 2=C, 3=D)
}
```

---

## Firebase Firestore Rules (after testing)
When you go live, update Firestore rules to:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scores/{document} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```
