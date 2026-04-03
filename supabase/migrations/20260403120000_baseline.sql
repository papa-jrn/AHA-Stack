-- Profiles mirror auth.users (extend with app fields later)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Stripe Checkout records (written only by webhook + service role)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  stripe_checkout_session_id text not null unique,
  supabase_user_id uuid references auth.users (id) on delete set null,
  amount_total integer not null default 0,
  currency text not null default 'usd',
  status text not null default 'complete',
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "payments_select_own"
  on public.payments for select
  using (auth.uid() = supabase_user_id);

-- No insert/update/delete policies for anon/authenticated — only service role (webhook)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
