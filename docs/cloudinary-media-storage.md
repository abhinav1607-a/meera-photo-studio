# Cloudinary media storage setup

This change keeps Supabase Authentication and Postgres data while moving new gallery uploads to Cloudinary.

## 1. Configure Cloudinary
In Cloudinary Console, keep the preset `meera_studio_upload` in **Signed** mode. Use the cloud name `pj4ejo1j`. The upload preset should allow JPG, JPEG, PNG and WEBP and use the `meera-photo-studio` asset folder.

## 2. Add Vercel environment variables
In Vercel → Project → Settings → Environment Variables, add these for Production and Preview as appropriate:
- `CLOUDINARY_CLOUD_NAME` = `pj4ejo1j`
- `CLOUDINARY_API_KEY` = your Cloudinary API Key
- `CLOUDINARY_API_SECRET` = your Cloudinary API Secret (**server-side only; never prefix with VITE_**)
- `CLOUDINARY_UPLOAD_PRESET` = `meera_studio_upload`

Keep existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configured. The API routes use them to verify that a signed-in user is listed in `public.admins`.

## 3. Run the database migration
Run `supabase/migrations/20261023_add_cloudinary_public_id.sql` in Supabase SQL Editor. This adds a nullable column for the Cloudinary public ID without changing existing gallery records.

## 4. Redeploy and test
Redeploy the Vercel project after setting variables. Sign in at `/admin`, upload one test photo, confirm it appears on the public gallery, replace it, and delete it. New uploads use Cloudinary; older rows that still have `storage_path` continue to use their existing Supabase Storage files until replaced or deleted.

Do not remove the Supabase Storage bucket or its files until you have verified that all required older photos have been migrated.
