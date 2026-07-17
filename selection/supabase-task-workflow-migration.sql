-- Selection task workflow v1.
-- Apply after supabase-access-hardening-migration.sql.
-- This keeps historical submissions intact and scopes new creator browsing/submission
-- to the task and creator assignment maintained by the brand side.

begin;

create table if not exists public.selection_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 80),
  description text not null default '' check (char_length(description) <= 500),
  due_at timestamptz,
  recommended_count integer check (recommended_count between 1 and 200),
  status text not null default 'active' check (status in ('draft', 'active', 'closed', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.selection_task_products (
  task_id uuid not null references public.selection_tasks(id) on delete cascade,
  sku text not null references public.product_catalog(sku) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (task_id, sku)
);

create table if not exists public.selection_task_assignments (
  task_id uuid not null references public.selection_tasks(id) on delete cascade,
  creator_user_id uuid not null references public.creator_profiles(user_id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (task_id, creator_user_id)
);

alter table public.submissions
  add column if not exists creator_user_id uuid references auth.users(id) on delete set null,
  add column if not exists task_id uuid references public.selection_tasks(id) on delete set null;

alter table public.selection_items
  add column if not exists selection_order integer check (selection_order between 1 and 200);

create index if not exists selection_tasks_status_due_idx
  on public.selection_tasks(status, due_at asc nulls last, created_at desc);
create index if not exists selection_task_products_task_idx
  on public.selection_task_products(task_id);
create index if not exists selection_task_assignments_creator_idx
  on public.selection_task_assignments(creator_user_id, task_id);
create index if not exists submissions_creator_task_idx
  on public.submissions(creator_user_id, task_id, submitted_at desc);
create index if not exists selection_items_submission_order_idx
  on public.selection_items(submission_id, selection_order);

alter table public.selection_tasks enable row level security;
alter table public.selection_task_products enable row level security;
alter table public.selection_task_assignments enable row level security;

drop policy if exists "brand can manage selection tasks" on public.selection_tasks;
create policy "brand can manage selection tasks"
  on public.selection_tasks for all to authenticated
  using (public.is_brand_admin())
  with check (public.is_brand_admin());

drop policy if exists "brand can manage selection task products" on public.selection_task_products;
create policy "brand can manage selection task products"
  on public.selection_task_products for all to authenticated
  using (public.is_brand_admin())
  with check (public.is_brand_admin());

drop policy if exists "brand can manage selection task assignments" on public.selection_task_assignments;
create policy "brand can manage selection task assignments"
  on public.selection_task_assignments for all to authenticated
  using (public.is_brand_admin())
  with check (public.is_brand_admin());

create or replace function public.create_selection_task(
  p_title text,
  p_description text default '',
  p_due_at timestamptz default null,
  p_recommended_count integer default null,
  p_creator_user_ids uuid[] default array[]::uuid[],
  p_skus text[] default array[]::text[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task_id uuid;
  v_title text := btrim(coalesce(p_title, ''));
  v_description text := left(coalesce(p_description, ''), 500);
  v_requested_product_count integer;
  v_valid_product_count integer;
  v_requested_creator_count integer;
  v_valid_creator_count integer;
begin
  if not public.is_brand_admin() then
    raise exception 'brand admin required' using errcode = '42501';
  end if;

  if char_length(v_title) < 1 or char_length(v_title) > 80 then
    raise exception 'task title must be between 1 and 80 characters';
  end if;

  if p_due_at is not null and p_due_at <= now() then
    raise exception 'task due time must be in the future';
  end if;

  if p_recommended_count is not null and (p_recommended_count < 1 or p_recommended_count > 200) then
    raise exception 'recommended count must be between 1 and 200';
  end if;

  select count(distinct btrim(sku))
    into v_requested_product_count
  from unnest(coalesce(p_skus, array[]::text[])) as sku
  where btrim(sku) <> '';

  if v_requested_product_count < 1 then
    raise exception 'select at least one product for the task';
  end if;

  select count(*) into v_valid_product_count
  from public.product_catalog as product
  left join public.product_overrides as override
    on override.sku = product.sku
  where product.sku in (
    select distinct btrim(sku)
    from unnest(coalesce(p_skus, array[]::text[])) as sku
    where btrim(sku) <> ''
  )
    and product.is_active = true
    and coalesce(override.is_hidden, false) = false;

  if v_valid_product_count <> v_requested_product_count then
    raise exception 'task contains unavailable products';
  end if;

  select count(distinct creator_user_id)
    into v_requested_creator_count
  from unnest(coalesce(p_creator_user_ids, array[]::uuid[])) as creator_user_id;

  if v_requested_creator_count < 1 then
    raise exception 'assign at least one active creator';
  end if;

  select count(*) into v_valid_creator_count
  from public.creator_profiles
  where user_id in (
    select distinct creator_user_id
    from unnest(coalesce(p_creator_user_ids, array[]::uuid[])) as creator_user_id
  )
    and status = 'active';

  if v_valid_creator_count <> v_requested_creator_count then
    raise exception 'task contains inactive creator accounts';
  end if;

  insert into public.selection_tasks (
    title,
    description,
    due_at,
    recommended_count,
    status,
    created_by
  )
  values (
    v_title,
    v_description,
    p_due_at,
    p_recommended_count,
    'active',
    auth.uid()
  )
  returning id into v_task_id;

  insert into public.selection_task_products (task_id, sku)
  select v_task_id, btrim(sku)
  from unnest(coalesce(p_skus, array[]::text[])) as sku
  where btrim(sku) <> ''
  group by btrim(sku);

  insert into public.selection_task_assignments (task_id, creator_user_id)
  select v_task_id, creator_user_id
  from unnest(coalesce(p_creator_user_ids, array[]::uuid[])) as creator_user_id
  group by creator_user_id;

  return v_task_id;
end;
$$;

create or replace function public.get_creator_selection_tasks()
returns table (
  id uuid,
  title text,
  description text,
  due_at timestamptz,
  recommended_count integer,
  status text,
  product_count integer,
  latest_submission_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not exists (
    select 1
    from public.creator_profiles
    where user_id = auth.uid()
      and status = 'active'
  ) then
    raise exception 'active creator account required' using errcode = '42501';
  end if;

  return query
  select
    task.id,
    task.title,
    task.description,
    task.due_at,
    task.recommended_count,
    task.status,
    count(distinct task_product.sku)::integer as product_count,
    max(submission.submitted_at) as latest_submission_at
  from public.selection_tasks as task
  join public.selection_task_assignments as assignment
    on assignment.task_id = task.id
   and assignment.creator_user_id = auth.uid()
  left join public.selection_task_products as task_product
    on task_product.task_id = task.id
  left join public.submissions as submission
    on submission.task_id = task.id
   and submission.creator_user_id = auth.uid()
  where task.status = 'active'
    and (task.due_at is null or task.due_at > now())
  group by task.id, task.title, task.description, task.due_at, task.recommended_count, task.status
  order by task.due_at asc nulls last, task.created_at desc;
end;
$$;

create or replace function public.get_creator_task_products(p_task_id uuid)
returns table (
  sku text,
  product_name text,
  category text,
  onsale_date date,
  style text,
  price numeric,
  image_url text,
  plan_level text,
  season text,
  stock numeric,
  presale_stock text,
  creator_sort_priority integer,
  tag text,
  points jsonb,
  source text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not exists (
    select 1
    from public.creator_profiles
    where user_id = auth.uid()
      and status = 'active'
  ) then
    raise exception 'active creator account required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.selection_tasks as task
    join public.selection_task_assignments as assignment
      on assignment.task_id = task.id
    where task.id = p_task_id
      and assignment.creator_user_id = auth.uid()
      and task.status = 'active'
      and (task.due_at is null or task.due_at > now())
  ) then
    raise exception 'selection task is unavailable' using errcode = '42501';
  end if;

  return query
  select
    product.sku,
    product.product_name,
    product.category,
    product.onsale_date,
    coalesce(override.style, product.style) as style,
    coalesce(override.price, product.price) as price,
    coalesce(override.image_url, product.image_url) as image_url,
    coalesce(override.plan_level, product.plan_level) as plan_level,
    product.season,
    product.stock,
    product.presale_stock,
    coalesce(override.creator_sort_priority, product.creator_sort_priority) as creator_sort_priority,
    product.tag,
    product.points,
    product.source,
    product.updated_at
  from public.selection_task_products as task_product
  join public.product_catalog as product
    on product.sku = task_product.sku
  left join public.product_overrides as override
    on override.sku = product.sku
  where task_product.task_id = p_task_id
    and product.is_active = true
    and coalesce(override.is_hidden, false) = false
  order by
    coalesce(override.creator_sort_priority, product.creator_sort_priority) asc nulls last,
    product.stock desc nulls last,
    product.onsale_date desc nulls last,
    product.updated_at desc;
end;
$$;

create or replace function public.submit_selection(p_items jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_submission_id uuid;
  v_creator_name text;
  v_creator_user_id uuid;
  v_item_count integer;
  v_visible_item_count integer;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select user_id, creator_name
    into v_creator_user_id, v_creator_name
  from public.creator_profiles
  where user_id = auth.uid()
    and status = 'active'
  limit 1;

  if v_creator_name is null then
    raise exception 'creator account is not active' using errcode = '42501';
  end if;

  if jsonb_typeof(p_items) <> 'array' then
    raise exception 'selection items must be an array';
  end if;

  v_item_count := jsonb_array_length(p_items);
  if v_item_count < 1 or v_item_count > 200 then
    raise exception 'selection item count must be between 1 and 200';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_items) as item
    where nullif(btrim(item ->> 'sku'), '') is null
  ) then
    raise exception 'selection contains an empty sku';
  end if;

  if (
    select count(distinct btrim(item ->> 'sku'))
    from jsonb_array_elements(p_items) as item
  ) <> v_item_count then
    raise exception 'selection contains duplicate sku values';
  end if;

  select count(*) into v_visible_item_count
  from jsonb_array_elements(p_items) as item
  join public.product_catalog as product
    on product.sku = btrim(item ->> 'sku')
  left join public.product_overrides as override
    on override.sku = product.sku
  where product.is_active = true
    and coalesce(override.is_hidden, false) = false;

  if v_visible_item_count <> v_item_count then
    raise exception 'selection contains unavailable products';
  end if;

  insert into public.submissions (creator_name, creator_user_id, item_count)
  values (v_creator_name, v_creator_user_id, v_item_count)
  returning id into v_submission_id;

  insert into public.selection_items (
    submission_id, selection_order, sku, product_name, category, style, plan_level,
    price, image_url, is_featured, intent, remark
  )
  select
    v_submission_id,
    submitted_item.selection_order::integer,
    product.sku,
    product.product_name,
    product.category,
    coalesce(override.style, product.style),
    coalesce(override.plan_level, product.plan_level),
    coalesce(override.price, product.price),
    coalesce(override.image_url, product.image_url),
    coalesce((submitted_item.item ->> 'is_featured')::boolean, false),
    case
      when submitted_item.item ->> 'intent' in ('直播挂车', '试穿寄样', '短视频种草', '重点推荐')
        then submitted_item.item ->> 'intent'
      else '直播挂车'
    end,
    left(coalesce(submitted_item.item ->> 'remark', ''), 500)
  from jsonb_array_elements(p_items) with ordinality as submitted_item(item, selection_order)
  join public.product_catalog as product
    on product.sku = btrim(submitted_item.item ->> 'sku')
  left join public.product_overrides as override
    on override.sku = product.sku;

  return v_submission_id;
end;
$$;

create or replace function public.submit_task_selection(
  p_task_id uuid,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_submission_id uuid;
  v_creator_name text;
  v_item_count integer;
  v_valid_item_count integer;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select creator_name into v_creator_name
  from public.creator_profiles
  where user_id = auth.uid()
    and status = 'active'
  limit 1;

  if v_creator_name is null then
    raise exception 'creator account is not active' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.selection_tasks as task
    join public.selection_task_assignments as assignment
      on assignment.task_id = task.id
    where task.id = p_task_id
      and assignment.creator_user_id = auth.uid()
      and task.status = 'active'
      and (task.due_at is null or task.due_at > now())
  ) then
    raise exception 'selection task is unavailable' using errcode = '42501';
  end if;

  if jsonb_typeof(p_items) <> 'array' then
    raise exception 'selection items must be an array';
  end if;

  v_item_count := jsonb_array_length(p_items);
  if v_item_count < 1 or v_item_count > 200 then
    raise exception 'selection item count must be between 1 and 200';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_items) as item
    where nullif(btrim(item ->> 'sku'), '') is null
  ) or (
    select count(distinct btrim(item ->> 'sku'))
    from jsonb_array_elements(p_items) as item
  ) <> v_item_count then
    raise exception 'selection contains invalid sku values';
  end if;

  select count(*) into v_valid_item_count
  from jsonb_array_elements(p_items) as item
  join public.selection_task_products as task_product
    on task_product.task_id = p_task_id
   and task_product.sku = btrim(item ->> 'sku')
  join public.product_catalog as product
    on product.sku = task_product.sku
  left join public.product_overrides as override
    on override.sku = product.sku
  where product.is_active = true
    and coalesce(override.is_hidden, false) = false;

  if v_valid_item_count <> v_item_count then
    raise exception 'selection contains products outside the available task pool';
  end if;

  insert into public.submissions (creator_name, creator_user_id, task_id, item_count)
  values (v_creator_name, auth.uid(), p_task_id, v_item_count)
  returning id into v_submission_id;

  insert into public.selection_items (
    submission_id, selection_order, sku, product_name, category, style, plan_level,
    price, image_url, is_featured, intent, remark
  )
  select
    v_submission_id,
    submitted_item.selection_order::integer,
    product.sku,
    product.product_name,
    product.category,
    coalesce(override.style, product.style),
    coalesce(override.plan_level, product.plan_level),
    coalesce(override.price, product.price),
    coalesce(override.image_url, product.image_url),
    coalesce((submitted_item.item ->> 'is_featured')::boolean, false),
    case
      when submitted_item.item ->> 'intent' in ('直播挂车', '试穿寄样', '短视频种草', '重点推荐')
        then submitted_item.item ->> 'intent'
      else '直播挂车'
    end,
    left(coalesce(submitted_item.item ->> 'remark', ''), 500)
  from jsonb_array_elements(p_items) with ordinality as submitted_item(item, selection_order)
  join public.selection_task_products as task_product
    on task_product.task_id = p_task_id
   and task_product.sku = btrim(submitted_item.item ->> 'sku')
  join public.product_catalog as product
    on product.sku = task_product.sku
  left join public.product_overrides as override
    on override.sku = product.sku;

  return v_submission_id;
end;
$$;

-- Retire the legacy unscoped submission path. The public client must submit
-- against an assigned task, otherwise a creator could submit SKU values that
-- were visible in a different task.
create or replace function public.submit_selection(p_items jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  raise exception 'task scoped submission is required' using errcode = '42501';
end;
$$;

-- Retire the global catalog RPC as well. Product data is only returned by
-- get_creator_task_products after verifying the current task assignment.
create or replace function public.get_creator_visible_products()
returns table (
  sku text,
  product_name text,
  category text,
  onsale_date date,
  style text,
  price numeric,
  image_url text,
  plan_level text,
  season text,
  stock numeric,
  presale_stock text,
  creator_sort_priority integer,
  tag text,
  points jsonb,
  source text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  raise exception 'task scoped catalog access is required' using errcode = '42501';
end;
$$;

revoke all on function public.create_selection_task(text, text, timestamptz, integer, uuid[], text[]) from public;
grant execute on function public.create_selection_task(text, text, timestamptz, integer, uuid[], text[]) to authenticated;
revoke all on function public.get_creator_selection_tasks() from public;
grant execute on function public.get_creator_selection_tasks() to authenticated;
revoke all on function public.get_creator_task_products(uuid) from public;
grant execute on function public.get_creator_task_products(uuid) to authenticated;
revoke all on function public.submit_selection(jsonb) from public;
grant execute on function public.submit_selection(jsonb) to authenticated;
revoke all on function public.submit_task_selection(uuid, jsonb) from public;
grant execute on function public.submit_task_selection(uuid, jsonb) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'selection_tasks'
  ) then
    alter publication supabase_realtime add table public.selection_tasks;
  end if;
end $$;

commit;
