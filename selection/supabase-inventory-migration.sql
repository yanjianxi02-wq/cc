alter table public.product_catalog
  add column if not exists presale_stock text;

alter table public.product_catalog
  drop constraint if exists product_catalog_presale_stock_length_check;

alter table public.product_catalog
  add constraint product_catalog_presale_stock_length_check
  check (presale_stock is null or char_length(presale_stock) <= 100);
