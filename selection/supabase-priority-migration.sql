alter table public.product_overrides
  add column if not exists creator_sort_priority integer
  check (creator_sort_priority between 1 and 9999);

alter table public.product_catalog
  add column if not exists creator_sort_priority integer
  check (creator_sort_priority between 1 and 9999);

create index if not exists product_overrides_creator_sort_priority_idx
  on public.product_overrides(creator_sort_priority asc nulls last);

create index if not exists product_catalog_creator_sort_priority_idx
  on public.product_catalog(creator_sort_priority asc nulls last);
