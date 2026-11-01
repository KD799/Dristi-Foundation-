# Dristi Foundation

A responsive React application for Dristi Foundation, with public organization
information and updates, member event registrations, and an administrator
dashboard. Supabase provides authentication, Postgres, row-level security, and
public image storage.

## Project status

The Vite application, public pages, authentication screens, member registration
flows, and admin CRUD screens are implemented. A production build and lint run
are available through the scripts below. Supabase-backed features require a
configured project and the database setup in `supabase/schema.sql`.

Admins can publish update-specific applications with built-in eye camp, book
distribution, flood relief, and community templates, then add custom questions.
Citizens submit through the update card, and applications remain linked to that
update in both citizen and admin portals.

## Run locally

1. Install Node.js (use the current LTS release).
2. From this directory, install dependencies:

   ```sh
   npm install
   ```

3. Copy `.env.example` to `.env` and set the Supabase project URL and anon key.
   These are public client settings; never put a Supabase service-role key in
   the frontend.
4. Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor.
5. Start the development server:

   ```sh
   npm run dev
   ```

To verify the production bundle and lint:

```sh
npm run build
npm run lint
```

## Supabase setup

Create a Supabase project, then run `supabase/schema.sql` in its SQL Editor. The
script creates the application tables, user-profile trigger, row-level security
policies, and the public `post-images` storage bucket. It can be run again
without duplicating policies.

### Email verification

Account signup uses email confirmation only. Phone numbers are optional contact
details and are not used for authentication. In the Supabase dashboard:

1. Keep **Confirm email** enabled under Authentication provider settings.
2. Leave the Phone provider disabled; no SMS provider is needed.
3. Configure the email templates and redirect URLs for the deployed app.

Users must confirm their email before signing in. Citizens sign in at `/login`;
administrators use the separate `/admin/login` form. The admin form accepts only
accounts whose role in `public.profiles` is `admin`; the citizen form accepts
only `user` accounts. The admin sign-in URL is not linked in public navigation,
but keeping it private is not an authorization control: admin routes and
Supabase row-level security policies enforce access based on the verified role
and an MFA-authenticated (`aal2`) session. Admins must scan the enrollment QR
code with an authenticator app and verify a six-digit code at first sign-in;
subsequent admin sign-ins require a code from that app. The schema grants
authenticated users read-only access to profiles; only a trusted project owner
can assign or change roles.

After applying the schema, use an admin account you control to enroll its
authenticator factor at `/admin/login` before using the admin portal. Store the
authenticator recovery method securely; losing the authenticator may require a
project owner to reset the account's factor through a trusted administrative
process. Do not share the QR code or setup secret.

New accounts receive the `user` role automatically. To grant administrator
access, first sign up with the intended account, then run this statement in the
SQL Editor with that account's email:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id
  from auth.users
  where email = 'admin@example.com'
);
```

### Deploy to Vercel

Import this repository into Vercel and set the Vite Supabase environment
variables from `.env.example` in the project's Environment Variables settings.
Do not add a Supabase service-role key to Vercel's `VITE_` variables or to
frontend code. `vercel.json` provides the SPA fallback so direct links such as
`/admin/login` resolve correctly after deployment. Set the deployed URL as the
Supabase Site URL and add your production domain and email-confirmation return
URLs to Supabase's allowed redirect URLs.

Replace the placeholder organization contact details and registration number
in `src/config/orgInfo.js` before launch.
