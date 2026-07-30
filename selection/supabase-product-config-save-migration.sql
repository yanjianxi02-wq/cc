-- Brand product configuration save v1.
--
-- Keep inventory and product overrides in one authorized transaction so a
-- pasted/uploaded image cannot leave the product in a partially saved state.

begin;

alter table public.product_catalog
  add column if not exists presale_stock text,
  add column if not exists creator_sort_priority integer;

alter table public.product_overrides
  add column if not exists creator_sort_priority integer;

create or replace function public.save_brand_product_configuration(
  p_sku text,
  p_price numeric,
  p_image_url text,
  p_plan_level text,
  p_style text,
  p_stock numeric,
  p_presale_stock text,
  p_creator_sort_priority integer,
  p_is_hidden boolean
)
returns table (
  sku text,
  image_url text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sku text := btrim(coalesce(p_sku, ''));
  v_user_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_presale_stock text := nullif(btrim(coalesce(p_presale_stock, '')), '');
begin
  if not public.is_brand_admin() then
    raise exception 'brand admin required' using errcode = '42501';
  end if;

  if v_sku = '' then
    raise exception 'sku is required';
  end if;
  if p_price is not null and (p_price < 0 or p_price > 100000) then
    raise exception 'invalid price';
  end if;
  if p_stock is not null and (p_stock < 0 or p_stock > 100000000) then
    raise exception 'invalid stock';
  end if;
  if p_creator_sort_priority is not null
    and (p_creator_sort_priority < 1 or p_creator_sort_priority > 9999) then
    raise exception 'invalid creator sort priority';
  end if;
  if char_length(coalesce(p_plan_level, '')) > 20
    or char_length(coalesce(p_style, '')) > 100
    or char_length(coalesce(v_presale_stock, '')) > 100 then
    raise exception 'product configuration is too long';
  end if;
  if p_image_url is not null
    and char_length(p_image_url) > 2000000 then
    raise exception 'image payload is too large';
  end if;

  update public.product_catalog
  set stock = p_stock,
      presale_stock = v_presale_stock,
      updated_by = v_user_email,
      updated_at = now()
  where product_catalog.sku = v_sku;

  if not found then
    raise exception 'catalog product not found';
  end if;

  insert into public.product_overrides (
    sku,
    price,
    image_url,
    plan_level,
    style,
    is_hidden,
    creator_sort_priority,
    updated_by,
    updated_at
  )
  values (
    v_sku,
    p_price,
    p_image_url,
    nullif(btrim(coalesce(p_plan_level, '')), ''),
    nullif(btrim(coalesce(p_style, '')), ''),
    coalesce(p_is_hidden, false),
    case when coalesce(p_is_hidden, false) then null else p_creator_sort_priority end,
    v_user_email,
    now()
  )
  on conflict (sku) do update
  set price = excluded.price,
      image_url = excluded.image_url,
      plan_level = excluded.plan_level,
      style = excluded.style,
      is_hidden = excluded.is_hidden,
      creator_sort_priority = excluded.creator_sort_priority,
      updated_by = excluded.updated_by,
      updated_at = excluded.updated_at;

  return query
  select product_override.sku, product_override.image_url, product_override.updated_at
  from public.product_overrides as product_override
  where product_override.sku = v_sku;
end;
$$;

revoke all on function public.save_brand_product_configuration(
  text, numeric, text, text, text, numeric, text, integer, boolean
) from public;
grant execute on function public.save_brand_product_configuration(
  text, numeric, text, text, text, numeric, text, integer, boolean
) to authenticated;

commit;
