-- Restrict profiles UPDATE to safe columns only.
-- Without this, authenticated users could overwrite any column including id and
-- created_at, and could also set email to a value that diverges from auth.users.
-- The RLS policy controls which rows a user can touch; column-level grants
-- control which columns they can write.
revoke update on public.profiles from authenticated;
grant update (email) on public.profiles to authenticated;
