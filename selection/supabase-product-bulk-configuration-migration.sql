-- Brand product bulk configuration save v1.
--
-- Saves every confirmed row in one transaction. This keeps a stock change and
-- its related product overrides consistent when the Excel回填表 updates both.

begin;

alter table public.product_catalog
  add column if not exists presale_stock text,
  add column if not exists creator_sort_priority integer;

alter table public.product_overrides
  add column if not exists creator_sort_priority integer;

create or replace function public.save_brand_product_configurations(p_items jsonb)
returns table (sku text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_item jsonb;
  v_sku text;
  v_seen_skus text[] := array[]::text[];
  v_price numeric;
  v_stock numeric;
  v_presale_stock text;
  v_plan_level text;
  v_style text;
  v_image_url text;
  v_priority integer;
  v_is_hidden boolean;
begin
  if not public.is_brand_admin() then
    raise exception 'brand admin required' using errcode = '42501';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'items must be a non-empty array';
  end if;
  if jsonb_array_length(p_items) > 1000 then
    raise exception 'a maximum of 1000 items can be saved at once';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_sku := btrim(coalesce(v_item ->> 'sku', ''));
    if v_sku = '' then
      raise exception 'sku is required';
    end if;
    if v_sku = any(v_seen_skus) then
      raise exception 'duplicate sku: %', v_sku;
    end if;
    v_seen_skus := array_append(v_seen_skus, v_sku);

    v_price := nullif(btrim(coalesce(v_item ->> 'price', '')), '')::numeric;
    v_stock := nullif(btrim(coalesce(v_item ->> 'stock', '')), '')::numeric;
    v_presale_stock := nullif(btrim(coalesce(v_item ->> 'presale_stock', '')), '');
    v_plan_level := nullif(btrim(coalesce(v_item ->> 'plan_level', '')), '');
    v_style := nullif(btrim(coalesce(v_item ->> 'style', '')), '');
    v_image_url := nullif(btrim(coalesce(v_item ->> 'image_url', '')), '');
    v_priority := nullif(btrim(coalesce(v_item ->> 'creator_sort_priority', '')), '')::integer;
    v_is_hidden := coalesce((v_item ->> 'is_hidden')::boolean, false);

    if v_price is not null and (v_price < 0 or v_price > 100000) then
      raise exception 'invalid price';
    end if;
    if v_stock is not null and (v_stock < 0 or v_stock > 100000000) then
      raise exception 'invalid stock';
    end if;
    if v_priority is not null and (v_priority < 1 or v_priority > 9999) then
      raise exception 'invalid creator sort priority';
    end if;
    if char_length(coalesce(v_plan_level, '')) > 20
      or char_length(coalesce(v_style, '')) > 100
      or char_length(coalesce(v_presale_stock, '')) > 100 then
      raise exception 'product configuration is too long';
    end if;
    if v_image_url is not null and char_length(v_image_url) > 2000000 then
      raise exception 'image payload is too large';
    end if;

    update public.product_catalog
    set stock = v_stock,
        presale_stock = v_presale_stock,
        updated_by = v_user_email,
        updated_at = now()
    where product_catalog.sku = v_sku;
    if not found then
      raise exception 'catalog product not found';
    end if;

    insert into public.product_overrides (
      sku, price, image_url, plan_level, style, is_hidden, creator_sort_priority, updated_by, updated_at
    ) values (
      v_sku, v_price, v_image_url, v_plan_level, v_style, v_is_hidden,
      case when v_is_hidden then null else v_priority end, v_user_email, now()
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

    sku := v_sku;
    return next;
  end loop;
end;
$$;

revoke all on function public.save_brand_product_configurations(jsonb) from public;
grant execute on function public.save_brand_product_configurations(jsonb) to authenticated;

commit;
