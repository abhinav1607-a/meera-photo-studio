# Meera Photo Studio

A premium, editorial-style photography and cinematography portfolio for Meera Photo Studio, Raipur, Chhattisgarh, India.

**GitHub repository:** https://github.com/abhinav1607-a/meera-photo-studio

## Brand details

- **Studio:** Meera Photo Studio
- **Photographer:** Mukesh Agrawal
- **Experience:** More than 30 years
- **Location:** Raipur, Chhattisgarh, India
- **Phone / WhatsApp:** +91 9827486699
- **Email:** meerastudiorpr@gmail.com

## What's in this repository

### Public website
- Responsive photography portfolio with a deep navy, slate-blue and ivory visual system.
- Homepage, photographer introduction, services, booking calls to action, portfolio, Kazima Album Making, cinematography, institutional associations and contact form.
- Gallery category filters, image lightbox, keyboard navigation and accessible image labels.
- A visible preview-mode notice while sample portfolio images are being used.
- WhatsApp links with prefilled messages for weddings, pre-weddings, birthdays, events, video, drone and album enquiries.
- Telephone and email links, responsive mobile navigation and a floating WhatsApp shortcut.
- Reduced-motion support and basic SEO / Open Graph metadata.

### Private admin area
Visit /admin after configuring Supabase. The dashboard supports:
- Secure Supabase email/password authentication with an admin allow-list.
- Multi-image uploads to persistent Supabase Storage (JPG, PNG, WEBP, AVIF; 15 MB per image).
- Photo titles, captions, categories, alt text, publish/unpublish, featured status, replacement and deletion.
- Video project creation, publication, visibility and deletion. YouTube and Vimeo URLs can open in an embedded player; direct MP4 / WebM / Ogg URLs use a native player.
- Editable service descriptions and image URLs.
- Secure enquiry review, status changes and deletion.
- Editing homepage heading, supporting copy, biography, hero image URL, phone, email and location.

### Backend
The Supabase schema includes tables and row-level security for:
- Admin membership
- Gallery items
- Video projects
- Services
- Public site settings
- Private customer enquiries

The schema also creates a public portfolio storage bucket with authenticated-admin write policies and seeds starter services. New enquiry records are public-insert only; reading, changing or deleting enquiries requires an authorised admin.

## Run locally

Requirements: Node.js 20 or later and npm.

1. Clone this repository.
2. Install dependencies:

   npm install

3. Copy .env.example to .env (on Windows PowerShell: Copy-Item .env.example .env).
4. Configure Supabase using the steps below. The public portfolio can run in preview mode without Supabase, but login, persistent gallery uploads and database enquiries will not be enabled until configured.
5. Start the local server:

   npm run dev

6. Create and test a production build:

   npm run build
   npm run preview

## Configure Supabase (required for admin and persistent content)

1. Create a project in Supabase.
2. In Project Settings / API, copy the project URL and publishable anon key. Add them to your local .env file:

   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

   The anon/publishable key is designed for the browser when Row Level Security is correctly configured. Never put the service-role key in frontend variables or commit any real .env file.

3. Open SQL Editor in the Supabase dashboard and run the contents of supabase/schema.sql. This creates tables, RLS policies, storage bucket rules, grants and starter service records.
4. In Supabase Authentication, create the owner's user or invite the owner's email. Set a strong password and configure the allowed redirect URLs for your local and production site.
5. Find that user’s UUID in Authentication / Users. In the SQL Editor, run the following statement with the real UUID substituted:

   insert into public.admins (user_id) values ('PASTE_AUTH_USER_UUID_HERE');

6. Restart the local Vite server after saving .env. Open /admin and sign in with the authorised account.
7. Upload the studio's own work, review sample images and replace them before public promotion. The admin preview and public page should show only content published in the database once at least one gallery image has been published.

### Important security notes
- Keep all secrets out of source control. Only the public Supabase URL and anon/publishable key belong in the browser configuration.
- Database RLS—not just hiding links in the UI—protects admin operations.
- Enquiry form inserts have server-side table constraints, but before using the form at scale, add CAPTCHA or an Edge Function with rate limiting / abuse protection.
- Use the least-privilege admin account, strong authentication and reviewed RLS policies.
- Only publish client photographs when the studio has the appropriate permission to use them.
- The portfolio Storage bucket is public so published image URLs can load without sign-in. Upload only photographs approved for public access; unpublishing hides an image in the gallery but does not make a known image URL private or revoke copies already shared.
- The institutional association names appear as supplied in the brief. Confirm official organisation styling and permissions before adding official logos or implying an endorsement.

## Deployment

The repository contains a Vercel rewrite file and a Netlify _redirects rule for the client-side /admin route.

1. Push the repository to GitHub and import it into Vercel or Netlify.
2. Set the build command to npm run build and the output directory to dist.
3. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the hosting environment variables.
4. Set SITE_URL to your actual production HTTPS domain in the build environment. The build script creates sitemap.xml and updates robots.txt only when this value is configured; it intentionally does not guess or publish a placeholder domain.
5. Add the production site URL to Supabase Authentication's site URL and allowed redirect URLs.
6. Run the schema in the target Supabase project and register the authorised admin UUID.
7. Test photo upload, replacement and deletion, public category filtering, video playback, contact submission, mobile layouts and the /admin route on the deployed domain.

A hosting account, Supabase project credentials, custom domain and production deployment permissions have not been provided in this conversation, so this repository is not claimed to be deployed or production-verified.

## Image and video content

Until the studio uploads its portfolio, the public site uses clearly labelled sample imagery from Unsplash. These sample images are placeholders only and must not be represented as photographs taken by Meera Photo Studio. Service photos and the hero image can be changed through the admin area; uploaded portfolio images are stored in Supabase Storage.

For embedded video playback, use YouTube or Vimeo links, or direct video files with MP4, WebM or Ogg extensions. Other links open with an external-provider fallback.

## GitHub workflow

The intended repository is:

https://github.com/abhinav1607-a/meera-photo-studio

Do not commit real .env files, user credentials, private customer data, service-role keys or database passwords.
