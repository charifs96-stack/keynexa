# Step 5: Quick Start Guide - Get Authentication Working

## ⚠️ Registration Failing?

If you see "Registration failed. Please try again.", it means the database migration hasn't been applied yet.

---

## REQUIRED: Apply Database Migration

### Step 1: Open Supabase SQL Editor

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your KeyNexa project
3. Click **SQL Editor** (left sidebar)
4. Click **New query**

### Step 2: Copy & Paste the Migration SQL

Go to your project and open:
`supabase/migrations/20260821_create_profiles.sql`

Copy the entire SQL content and paste it into Supabase SQL Editor.

Or use this SQL directly:

```sql
-- Create profiles table
create table if not exists public.profiles (
  id uuid not null primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'customer'::text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint role_check check (role in ('customer', 'admin')),
  constraint email_not_empty check (email <> '')
);

-- Create indexes
create index if not exists profiles_email_idx on public.profiles (email);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies
create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

create policy "Service role can manage profiles"
  on public.profiles for all
  using (auth.role() = 'authenticated' or auth.role() = 'service_role')
  with check (auth.role() = 'authenticated' or auth.role() = 'service_role');

-- Trigger function for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger handle_profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Trigger function for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'customer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### Step 3: Run the SQL

1. Click **Run** (blue play button)
2. Wait for success message
3. Check **No errors**

### Step 4: Verify

In Supabase SQL Editor, run:
```sql
SELECT * FROM public.profiles;
```

Should show empty table (that's correct - no users yet).

---

## Now Test Registration

### Step 1: Start Dev Server
```bash
npm run dev
```

### Step 2: Register New Account
1. Go to http://localhost:3000/register
2. Enter:
   - Full Name: John Doe
   - Email: john@example.com
   - Password: password123
   - Confirm: password123
3. Click "Register"

### Step 3: Check Success
- Should redirect to /login
- Go to Supabase > Auth > Users
- Should see new user with email
- Run SQL: `SELECT * FROM public.profiles WHERE email = 'john@example.com'`
- Should see profile record with role='customer'

### Step 4: Login
1. Go to http://localhost:3000/login
2. Email: john@example.com
3. Password: password123
4. Click "Login"
5. Should redirect to /account
6. See profile information

---

## If Still Failing

### Check 1: Verify Database Trigger
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

Should return a row. If empty, trigger didn't create.

### Check 2: Check RLS Policies
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

Should show 3 policies.

### Check 3: Check Profiles Table
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'profiles';
```

Should return one row with 'profiles'.

### Check 4: View Supabase Logs
1. Supabase Dashboard > Project
2. Go to **Logs** (bottom left)
3. Check for error messages
4. Look for auth or database errors

---

## Troubleshooting

### Error: "Email is already registered"
- That email already exists
- Try a different email
- Or delete user from Supabase > Auth > Users

### Error: "Password must be at least 8 characters"
- Password is too short
- Use at least 8 characters

### Error: "This email is already registered"
- Check Supabase > Auth > Users
- Delete the user and try again

### Registration still failing?
- Check browser console for error details (F12 > Console)
- Check Supabase logs for server errors
- Verify database trigger created correctly
- Make sure profiles table exists

---

## Commands to Copy & Paste

**Verify profiles table exists:**
```sql
SELECT * FROM public.profiles LIMIT 1;
```

**Check triggers:**
```sql
SELECT * FROM pg_trigger 
WHERE tgname IN ('on_auth_user_created', 'handle_profiles_updated_at');
```

**Check RLS policies:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

**Delete test user:**
```sql
DELETE FROM auth.users WHERE email = 'john@example.com';
```
(Profiles record auto-deletes due to CASCADE delete)

---

## Success Indicators

✅ Registration redirects to /login
✅ New user appears in Auth > Users
✅ Profile record created in public.profiles
✅ Profile has role='customer'
✅ Can login with new credentials
✅ Account page shows profile info
✅ Logout button works
✅ Protected routes redirect to login when logged out

---

Once all these work, you have a fully functional authentication system! 🎉

For complete testing procedures, see:
- `STEP_5_AUTHENTICATION_COMPLETE.md`
- `STEP_5_FINAL_DELIVERY.md`
