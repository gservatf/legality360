# Legality360 - Supabase Authentication Setup

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### How to get these values:
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the "Project URL" for `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the "anon public" key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Supabase Auth Configuration

### 1. Site URL Configuration
In your Supabase dashboard, go to Authentication → URL Configuration:

**Site URL:** Set this to your production domain
- Production: `https://yourdomain.com`
- Development: `http://localhost:3000`

### 2. Redirect URLs
Add these redirect URLs in Authentication → URL Configuration:

```
http://localhost:3000
http://localhost:3000/auth/callback
https://yourdomain.com
https://yourdomain.com/auth/callback
https://your-app-viewer-domain.com
https://your-app-viewer-domain.com/auth/callback
```

### 3. Database Setup
Run the SQL migration in your Supabase SQL Editor:

```sql
-- See supabase-migration.sql file for complete migration
```

This creates:
- `profiles` table with RLS policies
- Automatic profile creation trigger
- Proper permissions for users to manage their own profiles

## Testing Plan

### Step 1: Development Testing
```bash
npm run dev
```
- Test user registration and login
- Verify profile creation
- Check client panel access

### Step 2: Local Build Testing
```bash
npm run build
npm run start
```
- Test production build locally
- Verify environment variables are loaded
- Check authentication flow

### Step 3: Production Direct URL Testing
Deploy to your hosting platform and test:
- Direct access to your domain
- User registration/login
- Profile management
- Role-based access control

### Step 4: Production Viewer Testing
Test inside the MGX App Viewer:
- Authentication in iframe context
- Session persistence
- Third-party cookie handling

## Known Issues & Solutions

### Issue 1: "Error al inicializar la autenticación"
**Cause:** Missing or incorrect environment variables
**Solution:** 
- Verify `.env.local` file exists and has correct values
- Check Supabase project URL and anon key
- Ensure variables start with `NEXT_PUBLIC_`

### Issue 2: Authentication works in dev but not production
**Cause:** Environment variables not deployed or incorrect Site URL
**Solution:**
- Verify environment variables are set in your hosting platform
- Update Supabase Site URL to match your production domain
- Add production domain to Redirect URLs

### Issue 3: Authentication fails in iframe/viewer
**Cause:** Third-party cookies blocked or CORS issues
**Solution:**
- Ensure Site URL includes viewer domain
- Add viewer domain to Redirect URLs
- Consider using `flowType: 'pkce'` in Supabase client config

### Issue 4: Profile not created automatically
**Cause:** Database trigger not working or RLS policies blocking
**Solution:**
- Run the complete SQL migration
- Check trigger function exists and is enabled
- Verify RLS policies allow profile insertion

## Debugging Tips

### Check Environment Variables
```javascript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing')
```

### Check Authentication State
```javascript
import { supabase } from '@/lib/supabaseClient'

// Check current session
const { data: { session } } = await supabase.auth.getSession()
console.log('Current session:', session)

// Check current user
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)
```

### Check Database Connection
```javascript
// Test database query
const { data, error } = await supabase.from('profiles').select('count')
console.log('Database test:', { data, error })
```

## Production Deployment Checklist

- [ ] Environment variables configured in hosting platform
- [ ] Supabase Site URL updated to production domain
- [ ] Redirect URLs include production and viewer domains
- [ ] Database migration executed
- [ ] RLS policies enabled and tested
- [ ] Authentication flow tested in production
- [ ] Profile creation working automatically
- [ ] Role-based access control functioning