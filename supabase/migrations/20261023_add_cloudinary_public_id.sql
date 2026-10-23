-- Run this migration in the Supabase SQL Editor before using Cloudinary uploads.
-- Existing Supabase Storage files are not deleted by this migration.
alter table public.gallery_items
  add column if not exists cloudinary_public_id text;
