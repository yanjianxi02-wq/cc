-- Apply this migration in Supabase SQL Editor after backing up the project.
-- It closes public product reads and binds creator submissions to auth.uid().

begin;

create or replace function public.is_brand_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'yanjianxi02@gmail.com';
$$;

revoke all on function public.is_brand_admin() from public;
grant execute on function public.is_brand_admin() to authenticated;

drop policy if exists "anyone can read product overrides" on public.product_overrides;
drop policy if exists "admin can write product overrides" on public.product_overrides;
drop policy if exists "brand can manage product overrides" on public.product_overrides;

create policy "brand can manage product overrides"
on public.product_overrides
for all
to authenticated
using (public.is_brand_admin())
with check (public.is_brand_admin());

drop policy if exists "anyone can read active product catalog" on public.product_catalog;
drop policy if exists "admin can write product catalog" on public.product_catalog;
drop policy if exists "brand can manage product catalog" on public.product_catalog;

create policy "brand can manage product catalog"
on public.product_catalog
for all
to authenticated
using (public.is_brand_admin())
with check (public.is_brand_admin());

drop function if exists public.submit_selection(text, jsonb);

create or replace function public.submit_selection(p_items jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_submission_id uuid;
  v_creator_name text;
  v_item_count integer;
  v_visible_item_count integer;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select creator_name
    into v_creator_name
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

  select count(*)
    into v_visible_item_count
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

  insert into public.submissions (creator_name, item_count)
  values (v_creator_name, v_item_count)
  returning id into v_submission_id;

  insert into public.selection_items (
    submission_id,
    sku,
    product_name,
    category,
    style,
    plan_level,
    price,
    image_url,
    is_featured,
    intent,
    remark
  )
  select
    v_submission_id,
    product.sku,
    product.product_name,
    product.category,
    coalesce(override.style, product.style),
    coalesce(override.plan_level, product.plan_level),
    coalesce(override.price, product.price),
    coalesce(override.image_url, product.image_url),
    coalesce((item ->> 'is_featured')::boolean, false),
    case
      when item ->> 'intent' in ('直播挂车', '试穿寄样', '短视频种草', '重点推荐')
        then item ->> 'intent'
      else '直播挂车'
    end,
    left(coalesce(item ->> 'remark', ''), 500)
  from jsonb_array_elements(p_items) as item
  join public.product_catalog as product
    on product.sku = btrim(item ->> 'sku')
  left join public.product_overrides as override
    on override.sku = product.sku;

  return v_submission_id;
end;
$$;

revoke all on function public.submit_selection(jsonb) from public;
grant execute on function public.submit_selection(jsonb) to authenticated;

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
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.creator_profiles
    where user_id = auth.uid()
      and status = 'active'
  ) then
    raise exception 'creator account is not active' using errcode = '42501';
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
  from public.product_catalog as product
  left join public.product_overrides as override
    on override.sku = product.sku
  where product.is_active = true
    and coalesce(override.is_hidden, false) = false
  order by
    coalesce(override.creator_sort_priority, product.creator_sort_priority) asc nulls last,
    product.stock desc nulls last,
    product.onsale_date desc nulls last,
    product.updated_at desc;
end;
$$;

revoke all on function public.get_creator_visible_products() from public;
grant execute on function public.get_creator_visible_products() to authenticated;

commit;
