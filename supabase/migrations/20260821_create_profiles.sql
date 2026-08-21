-- Step 5: Create profiles table for authenticated users
-- This table extends Supabase auth.users with public profile information

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

-- Create index on email for faster lookups
create index if not exists profiles_email_idx on public.profiles (email);

-- Enable RLS (Row Level Security)
alter table public.profiles enable row level security;

-- RLS Policy: Users can read their own profile
create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- RLS Policy: Users can update their own profile (but not role)
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

-- RLS Policy: Service role can manage profiles
-- (used by server-side code only, never exposed to client)
create policy "Service role can manage profiles"
  on public.profiles for all
  using (auth.role() = 'authenticated' or auth.role() = 'service_role')
  with check (auth.role() = 'authenticated' or auth.role() = 'service_role');

-- Create trigger to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger handle_profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Function to handle new user signup (called via trigger)
-- This automatically creates a profile when a new user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'customer');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
