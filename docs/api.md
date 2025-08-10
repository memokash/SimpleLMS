# SimpleLMS API Documentation

## Overview
SimpleLMS provides a comprehensive REST API for medical education features including AI-powered quiz generation, profile management, and question banking.

## Authentication
All API endpoints require authentication using Firebase ID tokens.

### Authentication Header
```http
Authorization: Bearer <firebase-id-token>
```

### Rate Limiting
- **AI Generation**: 5 requests per minute
- **File Upload**: 3 requests per 5 minutes  
- **General**: 10 requests per minute

## Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

---

## AI Endpoints

### Generate Quiz Questions
Generate medical quiz questions from content using OpenAI.

**Endpoint:** `POST /ai/generate-quiz`

**Authentication:** Required

**Rate Limit:** 5 requests/minute

#### Request Body
```json
{
  "content": "Medical content to generate questions from",
  "specialty": "Cardiology",
  "difficulty": "Medium", 
  "category": "Medical Knowledge",
  "topic": "Myocardial Infarction",
  "questionCount": 10
}
```

#### Parameters
| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| content | string | Yes | Content to base questions on (100-50000 chars) | - |
| specialty | string | No | Medical specialty | "General Medicine" |
| difficulty | enum | No | "Easy", "Medium", "Hard" | "Medium" |
| category | string | No | Question category | "Medical Knowledge" |
| topic | string | No | Specific topic focus | - |
| questionCount | number | Yes | Number of questions (1-25) | - |

#### Response
```json
{
  "success": true,
  "questions": [
    {
      "question": "A 65-year-old male presents with crushing chest pain. What is the most appropriate initial test?",
      "options": ["A. ECG", "B. Chest X-ray", "C. Echo", "D. Stress test"],
      "correctAnswer": 0,
      "explanation": "ECG is the most important initial test for suspected MI...",
      "topic": "Myocardial Infarction"
    }
  ],
  "savedToBank": true,
  "bankMessage": "10 questions saved to community question bank",
  "metadata": {
    "specialty": "Cardiology",
    "difficulty": "Medium", 
    "category": "Medical Knowledge",
    "questionCount": 10
  }
}
```

#### Error Responses
```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR", 
  "details": ["Content must be at least 100 characters"]
}
```

**Error Codes:**
- `VALIDATION_ERROR` (400): Invalid request parameters
- `AUTH_REQUIRED` (401): Missing or invalid authentication
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `AI_SERVICE_ERROR` (503): OpenAI service unavailable
- `INTERNAL_ERROR` (500): Server error

---

### Analyze Content
Analyze medical content for key concepts and topics.

**Endpoint:** `POST /ai/analyze-content`

**Authentication:** Required

#### Request Body
```json
{
  "content": "Medical text to analyze",
  "analysisType": "concepts"
}
```

#### Response
```json
{
  "success": true,
  "analysis": {
    "keyTopics": ["Cardiology", "ECG"],
    "difficulty": "Intermediate",
    "concepts": ["MI", "ST elevation"],
    "recommendedQuestions": 8
  }
}
```

---

### Enhance Quiz Explanations
Improve existing question explanations using AI.

**Endpoint:** `POST /ai/enhance-quiz-explanations`

**Authentication:** Required

#### Request Body
```json
{
  "questionId": "string",
  "currentExplanation": "Basic explanation"
}
```

---

## Profile Management

### Upload Profile Picture
Upload and update user profile picture.

**Endpoint:** `POST /profile/upload-picture`

**Authentication:** Required

**Rate Limit:** 3 requests per 5 minutes

**Content-Type:** `multipart/form-data`

#### Request Body
```
file: <image-file>
```

#### File Requirements
- **Formats:** JPG, PNG, GIF, WebP
- **Size:** 1KB - 5MB
- **Validation:** File header verification
- **Security:** Filename sanitization, virus scanning

#### Response
```json
{
  "success": true,
  "photoURL": "https://storage.googleapis.com/...",
  "message": "Profile picture updated successfully"
}
```

#### Error Responses
```json
{
  "error": "Invalid file type", 
  "code": "INVALID_FILE_TYPE"
}
```

**Error Codes:**
- `NO_FILE` (400): No file provided
- `INVALID_FILE_TYPE` (400): Unsupported file format
- `INVALID_FILE_SIZE` (400): File too large/small
- `INVALID_IMAGE_FORMAT` (400): Corrupted image file
- `STORAGE_UPLOAD_ERROR` (500): Upload failed

---

## Stripe Integration

### Create Checkout Session
Create Stripe checkout session for subscription.

**Endpoint:** `POST /create-checkout-session`

**Authentication:** Required

#### Request Body
```json
{
  "priceId": "price_xxx",
  "successUrl": "https://app.com/success",
  "cancelUrl": "https://app.com/cancel"
}
```

#### Response
```json
{
  "sessionId": "cs_xxx",
  "url": "https://checkout.stripe.com/xxx"
}
```

### Stripe Webhook
Handle Stripe webhook events for subscription management.

**Endpoint:** `POST /stripe/webhook`

**Authentication:** Stripe signature verification

**Events Handled:**
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

---

## Question Bank

### Get Question Bank Statistics
Retrieve statistics about the community question bank.

**Function:** `getQuestionBankStats()`

#### Response
```json
{
  "totalQuestions": 1247,
  "categories": {
    "Medical Knowledge": 456,
    "Clinical Skills": 298
  },
  "difficulties": {
    "Easy": 412,
    "Medium": 567,
    "Hard": 268
  },
  "recentlyAdded": 23,
  "communityContributions": 1247
}
```

### Search Questions
Search questions with filters.

**Function:** `searchQuestions(searchTerm, filters, limit)`

#### Parameters
```typescript
searchTerm: string = ''
filters: {
  category?: string
  specialty?: string
  difficulty?: string[]
  tags?: string[]
  verified?: boolean
  minUpvotes?: number
} = {}
limit: number = 50
```

#### Response
```typescript
QuestionBankQuestion[]
```

### Generate Quiz from Bank
Create a quiz using questions from the community bank.

**Function:** `generateQuizFromBank(category, questionCount, difficulty?)`

#### Response
```json
{
  "quizId": "quiz_xxx",
  "title": "Cardiology Quiz - 20 Questions", 
  "questions": [...]
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "error": "Human readable error message",
  "code": "MACHINE_READABLE_CODE",
  "details": "Additional error details or validation errors"
}
```

### HTTP Status Codes
- **200**: Success
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (auth required)
- **403**: Forbidden (insufficient permissions)
- **429**: Too Many Requests (rate limited)
- **500**: Internal Server Error
- **503**: Service Unavailable

---

## Security Features

### Input Validation
- All string inputs are sanitized
- File uploads have comprehensive validation
- Request size limits enforced
- SQL injection prevention

### Authentication & Authorization
- Firebase ID token verification
- Role-based access control
- Email verification requirements

### Rate Limiting
- Per-IP rate limiting
- Endpoint-specific limits
- Exponential backoff recommendations

### File Upload Security
- MIME type validation
- File header verification
- Filename sanitization
- Size restrictions
- Automatic cleanup of old files

---

## SDKs and Examples

### TypeScript/JavaScript
```typescript
// Initialize
import { auth } from 'firebase/auth';

// Get ID token
const token = await auth.currentUser?.getIdToken();

// Make authenticated request
const response = await fetch('/api/ai/generate-quiz', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'Medical content here...',
    questionCount: 10
  })
});

const result = await response.json();
```

### Error Handling Example
```typescript
try {
  const response = await apiCall();
  const data = await response.json();
  
  if (!response.ok) {
    switch (data.code) {
      case 'RATE_LIMIT_EXCEEDED':
        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, data.retryAfter * 1000));
        return apiCall(); // Retry
      
      case 'VALIDATION_ERROR':
        // Handle validation errors
        console.error('Validation errors:', data.details);
        break;
        
      default:
        console.error('API Error:', data.error);
    }
  }
} catch (error) {
  console.error('Network error:', error);
}
```

---

## Rate Limiting Details

### Current Limits
| Endpoint | Limit | Window |
|----------|-------|--------|
| `/ai/generate-quiz` | 5 requests | 1 minute |
| `/profile/upload-picture` | 3 requests | 5 minutes |
| General API | 10 requests | 1 minute |

### Rate Limit Headers
```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1640995200
```

### Exceeding Limits
When rate limits are exceeded, the API returns:
```json
{
  "error": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED", 
  "retryAfter": 60
}
```

---

## Changelog

### v1.0.0 (Current)
- Initial API release
- AI quiz generation
- Profile picture upload
- Stripe integration
- Question bank management
- Comprehensive security implementation

### Planned Features
- Bulk question import/export
- Real-time collaboration features
- Advanced analytics endpoints
- Mobile app specific optimizations

---

## Support

### Getting Help
- GitHub Issues: [Repository Issues](https://github.com/your-repo/issues)
- Documentation: [Full Documentation](https://docs.your-domain.com)
- Email: support@your-domain.com

### API Status
Check API status at: https://status.your-domain.com

### Community
- Discord: [Community Server](https://discord.gg/your-server)
- Forum: [Community Forum](https://forum.your-domain.com)