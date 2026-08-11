-- Default creator catalog fallback.
-- Apply after supabase-task-workflow-migration.sql.
--
-- A creator sees either an assigned campaign or, only when no active campaign
-- is assigned, this single brand-managed fallback catalog. No global catalog
-- RPC is restored.

begin;

alter table public.selection_tasks
  add column if not exists task_kind text not null default 'campaign';

update public.selection_tasks
set task_kind = 'campaign'
where task_kind is null or btrim(task_kind) = '';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'selection_tasks_task_kind_check'
      and conrelid = 'public.selection_tasks'::regclass
  ) then
    alter table public.selection_tasks
      add constraint selection_tasks_task_kind_check
      check (task_kind in ('campaign', 'default_catalog'));
  end if;
end $$;

create unique index if not exists selection_tasks_one_active_default_catalog_idx
  on public.selection_tasks (task_kind)
  where task_kind = 'default_catalog' and status = 'active';

create or replace function public.set_default_creator_catalog(
  p_skus text[] default array[]::text[],
  p_recommended_count integer default null,
  p_description text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task_id uuid;
  v_requested_product_count integer;
  v_valid_product_count integer;
begin
  if not public.is_brand_admin() then
    raise exception 'brand admin required' using errcode = '42501';
  end if;

  if p_recommended_count is not null and (p_recommended_count < 1 or p_recommended_count > 200) then
    raise exception 'recommended count must be between 1 and 200';
  end if;

  select count(distinct btrim(sku))
    into v_requested_product_count
  from unnest(coalesce(p_skus, array[]::text[])) as sku
  where btrim(sku) <> '';

  if v_requested_product_count < 1 or v_requested_product_count > 5000 then
    raise exception 'default catalog must contain between 1 and 5000 products';
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
    raise exception 'default catalog contains unavailable products';
  end if;

  select task.id
    into v_task_id
  from public.selection_tasks as task
  where task.task_kind = 'default_catalog'
    and task.status = 'active'
  limit 1
  for update;

  if v_task_id is null then
    insert into public.selection_tasks (
      title, description, due_at, recommended_count, status, task_kind, created_by
    )
    values (
      '默认达人商品库', left(coalesce(p_description, ''), 500), null,
      p_recommended_count, 'active', 'default_catalog', auth.uid()
    )
    returning id into v_task_id;
  else
    update public.selection_tasks
    set
      title = '默认达人商品库',
      description = left(coalesce(p_description, ''), 500),
      due_at = null,
      recommended_count = p_recommended_count,
      updated_at = now()
    where id = v_task_id;

    delete from public.selection_task_products
    where task_id = v_task_id;
  end if;

  insert into public.selection_task_products (task_id, sku)
  select v_task_id, btrim(sku)
  from unnest(coalesce(p_skus, array[]::text[])) as sku
  where btrim(sku) <> ''
  group by btrim(sku);

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
    select 1 from public.creator_profiles
    where user_id = auth.uid() and status = 'active'
  ) then
    raise exception 'active creator account required' using errcode = '42501';
  end if;

  return query
  with active_campaigns as (
    select task.id
    from public.selection_tasks as task
    join public.selection_task_assignments as assignment
      on assignment.task_id = task.id
     and assignment.creator_user_id = auth.uid()
    where task.task_kind = 'campaign'
      and task.status = 'active'
      and (task.due_at is null or task.due_at > now())
  ), accessible_tasks as (
    select id from active_campaigns
    union all
    select task.id
    from public.selection_tasks as task
    where task.task_kind = 'default_catalog'
      and task.status = 'active'
      and not exists (select 1 from active_campaigns)
  )
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
  join accessible_tasks as accessible on accessible.id = task.id
  left join public.selection_task_products as task_product on task_product.task_id = task.id
  left join public.submissions as submission
    on submission.task_id = task.id and submission.creator_user_id = auth.uid()
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
    select 1 from public.creator_profiles
    where user_id = auth.uid() and status = 'active'
  ) then
    raise exception 'active creator account required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.selection_tasks as task
    where task.id = p_task_id
      and task.status = 'active'
      and (
        (
          task.task_kind = 'campaign'
          and (task.due_at is null or task.due_at > now())
          and exists (
            select 1 from public.selection_task_assignments as assignment
            where assignment.task_id = task.id and assignment.creator_user_id = auth.uid()
          )
        )
        or (
          task.task_kind = 'default_catalog'
          and not exists (
            select 1
            from public.selection_tasks as campaign
            join public.selection_task_assignments as assignment
              on assignment.task_id = campaign.id
             and assignment.creator_user_id = auth.uid()
            where campaign.task_kind = 'campaign'
              and campaign.status = 'active'
              and (campaign.due_at is null or campaign.due_at > now())
          )
        )
      )
  ) then
    raise exception 'selection task is unavailable' using errcode = '42501';
  end if;

  return query
  select
    product.sku,
    product.product_name,
    product.category,
    product.onsale_date,
    coalesce(override.style, product.style),
    coalesce(override.price, product.price),
    coalesce(override.image_url, product.image_url),
    coalesce(override.plan_level, product.plan_level),
    product.season,
    product.stock,
    product.presale_stock,
    coalesce(override.creator_sort_priority, product.creator_sort_priority),
    product.tag,
    product.points,
    product.source,
    product.updated_at
  from public.selection_task_products as task_product
  join public.product_catalog as product on product.sku = task_product.sku
  left join public.product_overrides as override on override.sku = product.sku
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
  where user_id = auth.uid() and status = 'active'
  limit 1;

  if v_creator_name is null then
    raise exception 'creator account is not active' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.selection_tasks as task
    where task.id = p_task_id
      and task.status = 'active'
      and (
        (
          task.task_kind = 'campaign'
          and (task.due_at is null or task.due_at > now())
          and exists (
            select 1 from public.selection_task_assignments as assignment
            where assignment.task_id = task.id and assignment.creator_user_id = auth.uid()
          )
        )
        or (
          task.task_kind = 'default_catalog'
          and not exists (
            select 1
            from public.selection_tasks as campaign
            join public.selection_task_assignments as assignment
              on assignment.task_id = campaign.id
             and assignment.creator_user_id = auth.uid()
            where campaign.task_kind = 'campaign'
              and campaign.status = 'active'
              and (campaign.due_at is null or campaign.due_at > now())
          )
        )
      )
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
    select 1 from jsonb_array_elements(p_items) as item
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
    on task_product.task_id = p_task_id and task_product.sku = btrim(item ->> 'sku')
  join public.product_catalog as product on product.sku = task_product.sku
  left join public.product_overrides as override on override.sku = product.sku
  where product.is_active = true and coalesce(override.is_hidden, false) = false;

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
    on task_product.task_id = p_task_id and task_product.sku = btrim(submitted_item.item ->> 'sku')
  join public.product_catalog as product on product.sku = task_product.sku
  left join public.product_overrides as override on override.sku = product.sku;

  return v_submission_id;
end;
$$;

revoke all on function public.set_default_creator_catalog(text[], integer, text) from public;
grant execute on function public.set_default_creator_catalog(text[], integer, text) to authenticated;
revoke all on function public.get_creator_selection_tasks() from public;
grant execute on function public.get_creator_selection_tasks() to authenticated;
revoke all on function public.get_creator_task_products(uuid) from public;
grant execute on function public.get_creator_task_products(uuid) to authenticated;
revoke all on function public.submit_task_selection(uuid, jsonb) from public;
grant execute on function public.submit_task_selection(uuid, jsonb) to authenticated;

commit;
