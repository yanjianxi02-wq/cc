-- Restores public creator account requests when pgcrypto is installed in
-- Supabase's extensions schema.
-- Run this file once in the Supabase SQL Editor.

begin;

create extension if not exists pgcrypto;

alter function public.request_creator_access(text, text, text)
  set search_path = public, extensions;

revoke all on function public.request_creator_access(text, text, text) from public;
grant execute on function public.request_creator_access(text, text, text) to anon, authenticated;

commit;
