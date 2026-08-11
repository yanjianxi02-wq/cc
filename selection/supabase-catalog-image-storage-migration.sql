-- Catalog image storage for Excel-embedded product pictures.
-- The bucket is public for creator-facing product cards; only brand admins can write.

begin;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'catalog-product-images',
  'catalog-product-images',
  true,
  1572864,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "brand admins can upload catalog images" on storage.objects;
create policy "brand admins can upload catalog images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'catalog-product-images'
  and public.is_brand_admin()
);

drop policy if exists "brand admins can update catalog images" on storage.objects;
create policy "brand admins can update catalog images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'catalog-product-images'
  and public.is_brand_admin()
)
with check (
  bucket_id = 'catalog-product-images'
  and public.is_brand_admin()
);

drop policy if exists "brand admins can delete catalog images" on storage.objects;
create policy "brand admins can delete catalog images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'catalog-product-images'
  and public.is_brand_admin()
);

commit;
