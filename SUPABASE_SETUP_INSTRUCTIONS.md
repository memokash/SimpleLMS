# Supabase Setup Instructions

## Prerequisites
- Supabase account created
- Supabase CLI logged in
- New Supabase project created

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase Dashboard
2. Select your project
3. Go to Settings → API
4. Copy the following:
   - Project URL (looks like: https://xxxxx.supabase.co)
   - Anon/Public key
   - Service Role key (keep this SECRET!)

## Step 2: Update Environment Variables

1. Copy `.env.local.supabase.example` to `.env.local`:
```bash
cp .env.local.supabase.example .env.local
```

2. Fill in your Supabase credentials in `.env.local`

## Step 3: Run Database Migrations

### Option A: Via Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and click "Run"
5. Copy the entire contents of `supabase/migrations/002_row_level_security.sql`
6. Paste and click "Run"

### Option B: Via Supabase CLI

```bash
# Link your project (you'll need the project ID from dashboard)
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Or run specific migrations
supabase db push --include supabase/migrations/001_initial_schema.sql
supabase db push --include supabase/migrations/002_row_level_security.sql
```

## Step 4: Set up Storage Buckets

In Supabase Dashboard:
1. Go to Storage
2. Create a new bucket called `study-materials`
3. Make it public (toggle "Public bucket")
4. Create another bucket called `avatars`
5. Make it public

## Step 5: Configure Authentication

In Supabase Dashboard:
1. Go to Authentication → Providers
2. Enable Email provider
3. Enable Google provider (optional):
   - Add your Google OAuth credentials
   - Add redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `https://yourdomain.com/auth/callback`

## Step 6: Generate TypeScript Types

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Generate types
supabase gen types typescript --project-id your-project-ref > lib/supabase/database.types.ts
```

## Step 7: Test the Connection

Create a test file `test-supabase.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  const { data, error } = await supabase
    .from('profiles')
    .select('count')
    .limit(1);

  if (error) {
    console.error('Connection failed:', error);
  } else {
    console.log('Connection successful!');
  }
}

testConnection();
```

Run: `node test-supabase.js`

## Step 8: Migrate Existing Firebase Data

Use the migration script:
```bash
npm run migrate:firebase-to-supabase
```

## Troubleshooting

### RLS Policies Not Working
- Check that RLS is enabled on all tables
- Verify auth.uid() is being passed correctly
- Check policy conditions in SQL editor

### Authentication Issues
- Ensure redirect URLs are configured
- Check that email confirmations are disabled for development
- Verify API keys are correct

### Performance Issues
- Check that all indexes are created
- Use EXPLAIN ANALYZE on slow queries
- Enable query performance insights in Supabase

## Next Steps

1. Update all Firebase imports to use Supabase
2. Test authentication flow
3. Test quiz creation and retrieval
4. Test real-time subscriptions
5. Verify RLS policies are working

## Important Security Notes

⚠️ **NEVER** commit your `.env.local` file to git
⚠️ **NEVER** expose your service role key to the client
⚠️ Always use RLS policies for data security
⚠️ Regularly rotate your API keys

## Useful Supabase Commands

```bash
# Check migration status
supabase db migrations list

# Reset database (WARNING: Deletes all data!)
supabase db reset

# Run seeds
supabase db seed

# Open Supabase Studio locally
supabase studio

# Check logs
supabase logs --tail
```

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [SQL Editor in Dashboard](https://app.supabase.com/project/_/sql)