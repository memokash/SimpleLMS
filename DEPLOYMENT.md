# SimpleLMS Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
Copy `.env.example` to `.env.local` and configure all required variables:
- Firebase configuration
- OpenAI and Anthropic API keys
- Stripe keys and webhooks
- Production URLs

### 2. Database Setup
- Ensure Firestore security rules are deployed
- Set up proper indexes for queries
- Configure Firebase Authentication providers

### 3. Build and Test
```bash
pnpm build
pnpm start
```

### 4. Security Checklist
- [x] API routes have input validation
- [x] Rate limiting implemented
- [x] No sensitive data in logs
- [x] Environment variables properly secured
- [ ] CORS configured for production domains
- [ ] Stripe webhooks verified

## Deployment Options

### Vercel (Recommended)
1. Connect your Git repository
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Custom Server
1. Build the application: `pnpm build`
2. Set production environment variables
3. Run: `pnpm start`
4. Configure reverse proxy (nginx/Apache)
5. Set up SSL certificates

## Post-Deployment

### Monitor
- Check application logs
- Verify all API endpoints work
- Test payment flows
- Monitor performance metrics

### Firestore Rules
Ensure your Firestore rules are secure:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Courses are public read, admin write
    match /courses/{courseId} {
      allow read: if true;
      allow write: if request.auth != null; // Add admin check
    }
  }
}
```

## Environment-Specific Configuration

### Production
- Enable TypeScript strict mode ✅
- Remove console.logs in production builds
- Enable minification and compression
- Configure CDN for static assets

### Security Headers
Add to next.config.js:
```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  }
];
```

## Troubleshooting

### Common Issues
1. **Firebase Connection**: Check API key configuration
2. **Stripe Webhooks**: Verify endpoint URL and secret
3. **Build Errors**: Run TypeScript check: `npx tsc --noEmit`
4. **Performance**: Check for N+1 queries (fixed ✅)

### Performance Monitoring
- Implement logging for API response times
- Monitor Firebase read/write costs
- Set up error tracking (Sentry recommended)