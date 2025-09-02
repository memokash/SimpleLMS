# SimpleLMS: Quiz Library vs Community Question Bank

## Overview

SimpleLMS has TWO distinct sections for questions:

### 1. 📚 Quiz Library (`/courses` page)
- **What it is:** Pre-loaded medical quizzes from imported Excel files
- **Current status:** ✅ **1,746 quizzes loaded and working**
- **Database:** `courses` collection with `questions` subcollections
- **Purpose:** Ready-to-use comprehensive medical quizzes
- **Features:**
  - Complete quizzes with explanations
  - Professional medical content
  - Immediate access for students
  - Categories need AI processing (currently uncategorized)

### 2. 👥 Community Question Bank (`/question-bank` page)
- **What it is:** Platform for users to create and share their own questions
- **Current status:** 🆕 **Empty - ready for community contributions**
- **Database:** `questionBank` collection (separate from quizzes)
- **Purpose:** Collaborative question creation and sharing
- **Features:**
  - User-generated content
  - AI-assisted question generation
  - Peer review and voting
  - Community collaboration

## Key Differences

| Feature | Quiz Library | Community Question Bank |
|---------|--------------|-------------------------|
| **Source** | Pre-loaded from Excel | User-generated |
| **Count** | 1,746 quizzes (~40,000+ questions) | 0 (empty, awaiting contributions) |
| **Database** | `courses` collection | `questionBank` collection |
| **Access** | Immediate | Requires community participation |
| **Quality** | Professional/verified | Community-reviewed |
| **Purpose** | Study & practice | Collaboration & sharing |

## Current Status

### ✅ Working:
- Quiz Library displays all 1,746 quizzes
- Users can browse and take quizzes
- Search and filter functionality works
- Navigation to quiz page functional

### 🆕 Ready for Use:
- Community Question Bank infrastructure ready
- AI generation interface built
- Upload functionality prepared
- Voting and review system ready

### ⚠️ Notes:
- Quiz categories need AI processing (all show as "Uncategorized")
- Community Question Bank is empty (expected - needs users to contribute)
- These are separate systems - don't mix them up

## How to Use

### For Students:
1. Go to `/courses` to access 1,746 ready quizzes
2. Click any quiz to start studying
3. Use search to find specific topics

### For Contributors:
1. Go to `/question-bank` to contribute questions
2. Use "Generate with AI" to create questions
3. Upload your own questions
4. Review and vote on community questions

## Database Structure

### Quiz Library (Existing Content):
```
courses/
  ├── {courseId}/
  │   ├── NewTitle: "Quiz title"
  │   ├── CourseName: "Course name"
  │   ├── BriefDescription: "Description"
  │   └── questions/
  │       ├── {questionId}/
  │       │   ├── Question: "Question text"
  │       │   ├── Option (a): "Option A"
  │       │   ├── Option (b): "Option B"
  │       │   ├── Answer: "a"
  │       │   └── ...
```

### Community Question Bank (Empty):
```
questionBank/
  ├── {questionId}/
  │   ├── question: "Question text"
  │   ├── options: ["A", "B", "C", "D"]
  │   ├── correctAnswer: 0
  │   ├── explanation: "Explanation"
  │   ├── createdBy: "userId"
  │   ├── upvotes: 0
  │   ├── downvotes: 0
  │   └── ...
```

## Summary

- **Quiz Library (`/courses`)**: 1,746 working quizzes for immediate use
- **Question Bank (`/question-bank`)**: Empty community platform for creating/sharing questions
- These are SEPARATE features - Quiz Library is for studying, Question Bank is for contributing