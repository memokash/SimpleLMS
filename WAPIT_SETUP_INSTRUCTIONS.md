# WAPIT Supabase Setup Instructions

**Project:** SimpleLMS with WAPIT Supabase Database  
**Status:** Ready for configuration  
**Migration:** 100% complete, awaiting environment setup  

## Current Situation

✅ **Code Migration:** Complete - All Firebase code removed, Supabase implemented  
✅ **File Structure:** Complete - All necessary files present  
❌ **Dependencies:** Missing - @supabase/ssr package needs installation  
❌ **Environment:** Missing - WAPIT Supabase credentials needed  

## Required Environment Variables

You need to configure these variables in your `.env.local` file with your WAPIT Supabase project credentials:

```env
# Required for basic functionality
NEXT_PUBLIC_SUPABASE_URL=https://[your-wapit-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# Optional - if using direct postgres connection
DATABASE_URL=postgresql://[connection-string]

# AI Services (optional but recommended)
ANTHROPIC_API_KEY=sk-ant-api03-[your-key]
OPENAI_API_KEY=sk-proj-[your-key]

# Stripe (optional for payments)
STRIPE_SECRET_KEY=sk_live_[your-key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_[your-key]
STRIPE_WEBHOOK_SECRET=whsec_[your-key]

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development
```

## Setup Steps

### Step 1: Fix Dependencies
```bash
# Clear npm cache
npm cache clean --force

# Remove existing node_modules and lock file
rm -rf node_modules package-lock.json

# Fresh install
npm install
```

### Step 2: Configure Environment
1. Get your WAPIT Supabase project credentials:
   - Go to https://supabase.com/dashboard
   - Select your WAPIT project
   - Go to Settings > API
   - Copy the Project URL and anon public key

2. Create or update `.env.local`:
```bash
cp .env.local.example .env.local
# Edit .env.local with your WAPIT credentials
```

### Step 3: Verify Setup
```bash
# Test environment validation
npm run validate:env

# Should show:
# ✅ Supabase: ENABLED
# ✅ Core services ready
```

### Step 4: Generate Database Types
```bash
# Generate TypeScript types from your WAPIT database
npm run supabase:generate-types
```

### Step 5: Test Application
```bash
# Start development server
npm run dev

# Should start on http://localhost:3001 without errors
```

### Step 6: Run Comprehensive Tests
```bash
# Run the functionality tests
tsx scripts/test-functionality-manual.ts

# Should achieve >90% success rate
```

## Troubleshooting

### If npm install fails:
1. Check internet connection
2. Try using a different npm registry:
   ```bash
   npm install --registry https://registry.npmjs.org/
   ```
3. Clear all caches:
   ```bash
   npm cache clean --force
   yarn cache clean  # if using yarn
   ```

### If environment validation fails:
1. Check `.env.local` file exists
2. Verify no extra spaces in environment variables
3. Ensure Supabase URL includes https://
4. Verify anon key starts with "eyJ"

### If application won't start:
1. Check for TypeScript errors: `npm run build`
2. Verify all environment variables are set
3. Check console for specific error messages

## Database Schema

Your WAPIT database should have these tables:
- `users` - User accounts and profiles
- `courses` - Course content and metadata
- `quizzes` - Quiz questions and answers
- `user_progress` - Learning progress tracking
- `community_posts` - Discussion forum posts
- `quiz_attempts` - Quiz results and analytics

## Expected File Structure

After successful setup, your project should have:
```
SimpleLMS/
├── .env.local                    # Your WAPIT credentials
├── node_modules/                 # All dependencies installed
├── lib/supabase/
│   ├── client.ts                 # Working Supabase client
│   ├── server.ts                 # Working server client
│   └── database.types.ts         # Generated from WAPIT DB
├── app/components/               # All components working
└── package.json                  # All dependencies listed
```

## Success Indicators

When setup is complete, you should see:
1. ✅ `npm run validate:env` passes without errors
2. ✅ `npm run dev` starts successfully on port 3001
3. ✅ Application loads in browser without console errors
4. ✅ Database connection works (can see user data, courses, etc.)
5. ✅ Authentication system functional

## Support

If you encounter issues:
1. Check the test results in `test-results.json`
2. Review the comprehensive test report: `COMPREHENSIVE_FUNCTIONALITY_TEST_REPORT.md`
3. Run the manual test script to identify specific problems: `tsx scripts/test-functionality-manual.ts`

---

**Created:** 2025-09-28  
**For:** WAPIT Supabase Project Integration  
**Status:** Ready for user configuration