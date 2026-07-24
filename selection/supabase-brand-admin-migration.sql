-- Adds the second authorized brand administrator without changing creator data.
-- Run this file once in the Supabase SQL Editor.

begin;

create or replace function public.is_brand_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'yanjianxi02@gmail.com',
    'huangshaoqing@inman.cc'
  );
$$;

revoke all on function public.is_brand_admin() from public;
grant execute on function public.is_brand_admin() to authenticated;

drop policy if exists "authenticated can read submissions" on public.submissions;
drop policy if exists "brand can read submissions" on public.submissions;
create policy "brand can read submissions"
  on public.submissions for select to authenticated
  using (public.is_brand_admin());

drop policy if exists "authenticated can read selection items" on public.selection_items;
drop policy if exists "brand can read selection items" on public.selection_items;
create policy "brand can read selection items"
  on public.selection_items for select to authenticated
  using (public.is_brand_admin());

drop policy if exists "admin can read creator access requests" on public.creator_access_requests;
drop policy if exists "brand can read creator access requests" on public.creator_access_requests;
create policy "brand can read creator access requests"
  on public.creator_access_requests for select to authenticated
  using (public.is_brand_admin());

drop policy if exists "admin can manage creator access requests" on public.creator_access_requests;
drop policy if exists "brand can manage creator access requests" on public.creator_access_requests;
create policy "brand can manage creator access requests"
  on public.creator_access_requests for all to authenticated
  using (public.is_brand_admin())
  with check (public.is_brand_admin());

drop policy if exists "admin can read creator profiles" on public.creator_profiles;
drop policy if exists "brand can read creator profiles" on public.creator_profiles;
create policy "brand can read creator profiles"
  on public.creator_profiles for select to authenticated
  using (public.is_brand_admin() or auth.uid() = user_id);

create or replace function public.approve_creator_access(
  p_request_id uuid,
  p_review_note text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.creator_access_requests%rowtype;
  v_user_id uuid;
  v_admin_email text;
begin
  if not public.is_brand_admin() then
    raise exception 'forbidden';
  end if;

  v_admin_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  select *
  into v_request
  from public.creator_access_requests
  where id = p_request_id
    and status = 'pending'
  limit 1;

  if v_request.id is null then
    raise exception 'request not found';
  end if;

  if exists (
    select 1
    from auth.users
    where lower(email) = lower(v_request.email)
  ) or exists (
    select 1
    from public.creator_profiles
    where lower(email) = lower(v_request.email)
  ) then
    raise exception 'account already exists';
  end if;

  v_user_id := gen_random_uuid();

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  )
  values (
    '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated',
    'authenticated', v_request.email, v_request.password_hash, now(),
    '{"provider":"email","providers":["email"],"role":"creator"}'::jsonb,
    jsonb_build_object('creator_name', v_request.creator_name, 'role', 'creator'),
    now(), now(), '', '', '', ''
  );

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  )
  values (
    gen_random_uuid(), v_user_id, v_request.email,
    jsonb_build_object('sub', v_user_id::text, 'email', v_request.email),
    'email', now(), now(), now()
  );

  insert into public.creator_profiles (
    user_id, creator_name, email, status, approved_at, approved_by
  )
  values (
    v_user_id, v_request.creator_name, v_request.email, 'active', now(), v_admin_email
  );

  update public.creator_access_requests
  set status = 'approved',
      review_note = coalesce(p_review_note, ''),
      reviewed_at = now(),
      reviewed_by = v_admin_email,
      approved_user_id = v_user_id
  where id = p_request_id;

  return v_user_id;
end;
$$;

create or replace function public.reject_creator_access(
  p_request_id uuid,
  p_review_note text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request_id uuid;
  v_admin_email text;
begin
  if not public.is_brand_admin() then
    raise exception 'forbidden';
  end if;

  v_admin_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  update public.creator_access_requests
  set status = 'rejected',
      review_note = coalesce(p_review_note, ''),
      reviewed_at = now(),
      reviewed_by = v_admin_email
  where id = p_request_id
    and status = 'pending'
  returning id into v_request_id;

  if v_request_id is null then
    raise exception 'request not found';
  end if;

  return v_request_id;
end;
$$;

revoke all on function public.approve_creator_access(uuid, text) from public;
grant execute on function public.approve_creator_access(uuid, text) to authenticated;

revoke all on function public.reject_creator_access(uuid, text) from public;
grant execute on function public.reject_creator_access(uuid, text) to authenticated;

commit;
