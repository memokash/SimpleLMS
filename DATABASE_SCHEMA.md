# SimpleLMS Database Schema - Single Source of Truth

This document defines the canonical database schema for SimpleLMS. All code should follow these exact field names and types.

## Core Collections

### 1. `users` Collection
**Document ID:** Firebase Auth UID
```javascript
{
  // Identity
  uid: string,                    // Firebase Auth UID
  email: string,                  // User email
  displayName: string,            // Display name
  photoURL: string,               // Profile photo URL
  
  // Subscription
  stripeCustomerId: string,       // Stripe customer ID
  subscriptionId: string,         // Stripe subscription ID
  subscriptionStatus: string,     // 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
  subscriptionTier: string,       // 'free' | 'pro' | 'premium'
  subscriptionEndDate: timestamp, // Subscription end date
  
  // Medical Info
  medicalStatus: string,          // 'Medical Student' | 'Resident' | 'Fellow' | 'Attending' | 'Other'
  yearLevel: string,              // Year in training
  currentRotation: string,        // Current rotation
  institution: string,            // Medical institution
  specialty: string,              // Medical specialty
  
  // Statistics
  totalStudyTime: number,         // Total study seconds
  quizzesCompleted: number,       // Completed quiz count
  coursesCompleted: number,       // Completed course count
  averageScore: number,           // Average score (0-100)
  studyStreak: number,            // Current streak days
  lastActive: timestamp,          // Last activity
  
  // Metadata
  createdAt: timestamp,           // Account creation
  updatedAt: timestamp            // Last update
}
```

### 2. `profiles` Collection
**Document ID:** User ID (same as Firebase Auth UID)
```javascript
{
  // Identity
  userId: string,                 // Firebase Auth UID
  firstName: string,              // First name
  lastName: string,               // Last name
  email: string,                  // Email address
  phone: string,                  // Phone number
  profilePicture: string,         // Profile picture URL
  bio: string,                    // Biography
  
  // Medical Profile
  medicalStatus: string,          // Same options as users collection
  yearLevel: string,              // Year in training
  currentRotation: string,        // Current rotation
  rotationLocation: string,       // Rotation location
  institution: string,            // Medical institution
  location: string,               // Geographic location
  interests: array,               // Array of interest strings
  
  // Privacy Settings
  privacy: {
    showEmail: string,            // 'public' | 'colleagues' | 'private'
    showPhone: string,            // 'public' | 'colleagues' | 'private'
    showLocation: string,         // 'public' | 'colleagues' | 'private'
    showRotation: string,         // 'public' | 'colleagues' | 'private'
    showRotationLocation: string, // 'public' | 'colleagues' | 'private'
    showInstitution: string,      // 'public' | 'colleagues' | 'private'
    showStatus: string            // 'public' | 'colleagues' | 'private'
  },
  
  // Status
  isActive: boolean,              // Profile active
  lastSeen: timestamp,            // Last seen
  
  // Metadata
  createdAt: timestamp,           // Profile creation
  updatedAt: timestamp            // Last update
}
```

### 3. `courses` Collection
**Document ID:** Auto-generated
```javascript
{
  // Course Info
  id: string,                     // Document ID
  courseName: string,             // Course name
  title: string,                  // Display title
  description: string,            // Course description
  
  // Categorization
  category: string,               // Course category
  specialty: string,              // Medical specialty
  difficulty: string,             // 'Beginner' | 'Intermediate' | 'Advanced'
  
  // Access Control
  isPublic: boolean,              // Public access (default: true)
  isPremium: boolean,             // Premium content
  requiredTier: string,           // 'free' | 'pro' | 'premium'
  
  // Metrics
  questionCount: number,          // Number of questions
  rating: number,                 // Average rating (0-5)
  enrolledStudents: number,       // Enrolled count
  
  // Metadata
  instructor: string,             // Instructor name
  createdAt: timestamp,           // Creation time
  updatedAt: timestamp            // Last update
}
```

### 4. `courses/{courseId}/questions` Subcollection
**Document ID:** Auto-generated
```javascript
{
  // Question Content
  question: string,               // Question text
  options: array,                 // Array of answer options
  correctAnswer: number,          // Index of correct answer (0-based)
  
  // Explanations
  correctExplanation: string,     // Explanation for correct answer
  incorrectExplanation: string,   // Explanation for wrong answers
  hintMessage: string,            // Hint for question
  
  // Categorization
  category: string,               // Question category
  specialty: string,              // Medical specialty
  difficulty: string,             // 'easy' | 'medium' | 'hard'
  tags: array,                    // Array of tag strings
  
  // AI Enhancement
  aiEnhanced: boolean,            // AI enhanced flag
  enhancedBy: string,             // 'openai' | 'manual'
  enhancedAt: timestamp,          // Enhancement time
  confidence: string,             // 'high' | 'medium' | 'low'
  
  // Statistics
  timesUsed: number,              // Usage count
  averageCorrectRate: number,     // Success rate (0-100)
  
  // Metadata
  createdBy: string,              // Creator user ID
  createdAt: timestamp,           // Creation time
  updatedAt: timestamp            // Last update
}
```

### 5. `userProgress` Collection
**Document ID:** `{userId}_{courseId}`
```javascript
{
  // Identification
  userId: string,                 // User ID
  courseId: string,               // Course ID
  
  // Progress
  progress: number,               // Progress percentage (0-100)
  completed: boolean,             // Completion status
  
  // Scoring
  lastScore: number,              // Last attempt score
  bestScore: number,              // Best score achieved
  averageScore: number,           // Average of all attempts
  attempts: number,               // Number of attempts
  
  // Time Tracking
  totalTimeSpent: number,         // Total seconds spent
  startedAt: timestamp,           // First started
  completedAt: timestamp,         // Completion time
  lastAccessed: timestamp,        // Last access time
  
  // Question Details
  completedQuestions: array,      // Array of completed question IDs
  incorrectQuestions: array,      // Array of incorrect question IDs
  flaggedQuestions: array,        // Array of flagged question IDs
  
  // Metadata
  updatedAt: timestamp            // Last update
}
```

### 6. `quizAttempts` Collection
**Document ID:** Auto-generated
```javascript
{
  // Identification
  userId: string,                 // User ID
  courseId: string,               // Course ID
  
  // Results
  score: number,                  // Raw score
  totalPoints: number,            // Total possible points
  percentage: number,             // Percentage (0-100)
  totalQuestions: number,         // Question count
  correctAnswers: number,         // Correct count
  
  // Timing
  startedAt: timestamp,           // Start time
  completedAt: timestamp,         // End time
  timeSpent: number,              // Total seconds
  
  // Mode
  mode: string,                   // 'study' | 'test' | 'flashcard'
  
  // Answers
  answers: array,                 // Array of answer objects
  /* Answer object structure:
  {
    questionId: string,
    selectedAnswer: number,
    isCorrect: boolean,
    timeSpent: number
  }
  */
  
  // Metadata
  createdAt: timestamp            // Creation time
}
```

### 7. `questionBank` Collection
**Document ID:** Auto-generated
```javascript
{
  // Question Content (same as course questions)
  question: string,               // Question text
  options: array,                 // Array of answer options
  correctAnswer: number,          // Index of correct answer
  
  // Explanations
  correctExplanation: string,     // Correct answer explanation
  incorrectExplanation: string,   // Wrong answer explanation
  hintMessage: string,            // Hint message
  
  // Categorization
  category: string,               // Question category
  specialty: string,              // Medical specialty
  topic: string,                  // Specific topic
  difficulty: string,             // 'easy' | 'medium' | 'hard'
  tags: array,                    // Array of tags
  
  // AI Tracking
  aiEnhanced: boolean,            // AI enhanced
  enhancedBy: string,             // 'openai' | 'manual'
  enhancedAt: timestamp,          // Enhancement time
  confidence: string,             // 'high' | 'medium' | 'low'
  
  // Source
  source: string,                 // Source identifier
  sourceDocumentId: string,       // Source document reference
  
  // Statistics
  timesUsed: number,              // Usage count
  averageCorrectRate: number,     // Success rate
  
  // Community Features
  upvotes: number,                // Upvote count
  downvotes: number,              // Downvote count
  reports: array,                 // Array of report objects
  
  // Metadata
  createdBy: string,              // Creator user ID
  createdAt: timestamp,           // Creation time
  updatedAt: timestamp            // Last update
}
```

### 8. `invitations` Collection
**Document ID:** Auto-generated
```javascript
{
  // Sender Info
  senderUserId: string,           // Sender's user ID
  senderEmail: string,            // Sender's email
  senderName: string,             // Sender's name
  
  // Recipient Info
  recipientEmail: string,         // Recipient's email
  
  // Invitation Details
  message: string,                // Invitation message
  referralCode: string,           // Unique referral code
  
  // Status
  status: string,                 // 'pending' | 'sent' | 'failed' | 'accepted'
  
  // Timestamps
  sentAt: timestamp,              // Sent time
  acceptedAt: timestamp,          // Acceptance time
  
  // Tracking
  acceptedByUserId: string        // User who accepted
}
```

### 9. `subscriptions` Collection (Stripe Integration)
**Document ID:** User ID
```javascript
{
  // User Reference
  userId: string,                 // Firebase Auth UID
  
  // Stripe Data
  customerId: string,             // Stripe customer ID
  subscriptionId: string,         // Stripe subscription ID
  priceId: string,                // Stripe price ID
  
  // Subscription Details
  status: string,                 // Stripe subscription status
  plan: string,                   // 'free' | 'pro' | 'premium'
  
  // Billing Period
  currentPeriodStart: timestamp,  // Current period start
  currentPeriodEnd: timestamp,    // Current period end
  cancelAt: timestamp,            // Scheduled cancellation
  
  // Payment
  paymentMethod: string,          // Payment method ID
  lastPaymentAmount: number,      // Last payment amount (cents)
  lastPaymentDate: timestamp,     // Last payment date
  
  // Metadata
  createdAt: timestamp,           // Subscription creation
  updatedAt: timestamp            // Last update
}
```

## Data Validation Rules

### Required Fields
All documents must have:
- Appropriate ID field
- createdAt timestamp (except for subcollections)
- Basic identification fields

### Field Types
- **string**: Text data
- **number**: Numeric values (integers or decimals)
- **boolean**: true/false values
- **timestamp**: Firestore timestamp
- **array**: Array of values
- **object**: Nested object structure

### Naming Conventions
- Use camelCase for all field names
- No spaces or special characters in field names
- Consistent naming across collections

## Security Considerations

### User Data Access
- Users can only read/write their own user document
- Users can only read/write their own profile
- Users can only read/write their own progress

### Public Data
- Courses marked as isPublic: true
- Question bank questions (read-only for non-creators)

### Premium Content
- Check subscriptionTier before allowing access
- Verify subscription status is 'active'

## Migration Notes

### From Interfaces to Direct Schema
1. Remove TypeScript interfaces where possible
2. Use direct field access with proper null checking
3. Validate data at runtime using the schema above
4. Keep field names exactly as specified

### Data Consistency
1. Always use the field names as specified above
2. Don't add extra fields without updating this schema
3. Handle missing fields gracefully with defaults
4. Validate data before writing to Firestore

## Implementation Guidelines

### Reading Data
```javascript
// Example: Read user profile
const userDoc = await getDoc(doc(db, 'users', userId));
if (userDoc.exists()) {
  const userData = userDoc.data();
  // Access fields directly as specified in schema
  const email = userData.email;
  const tier = userData.subscriptionTier || 'free';
}
```

### Writing Data
```javascript
// Example: Update user progress
await setDoc(doc(db, 'userProgress', `${userId}_${courseId}`), {
  userId: userId,
  courseId: courseId,
  progress: 50,
  completed: false,
  lastScore: 85,
  attempts: 1,
  lastAccessed: serverTimestamp(),
  updatedAt: serverTimestamp()
}, { merge: true });
```

### Data Validation
```javascript
// Validate before writing
function validateUserData(data) {
  const required = ['uid', 'email'];
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  // Validate field types
  if (typeof data.email !== 'string') {
    throw new Error('Email must be a string');
  }
  
  // Validate enum values
  const validTiers = ['free', 'pro', 'premium'];
  if (data.subscriptionTier && !validTiers.includes(data.subscriptionTier)) {
    throw new Error('Invalid subscription tier');
  }
}
```

---

**Important:** This schema is the single source of truth. All code changes should reference this document to ensure consistency across the application.