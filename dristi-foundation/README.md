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

If the base schema has already been applied, run
`supabase/migrations/20261101_admin_mfa_approval.sql` in the SQL Editor. This
adds the owner-controlled admin MFA approval flag and updates the database
admin check. Existing admin accounts will need a trusted project owner to
review and explicitly enable that flag after verifying the authenticator.

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
and an MFA-authenticated (`aal2`) session. A separate owner-controlled
`admin_mfa_enabled` profile flag must also be enabled; clients cannot change
roles or this flag. Admin sign-in never offers first-factor enrollment.
Subsequent admin sign-ins require a code from the authenticator app.

First-factor enrollment is not allowed from the admin sign-in flow. For new
administrator onboarding, the intended person should sign up and confirm email,
then enroll and verify an authenticator at `/account/security` while still a
citizen. A trusted project owner must verify the person's identity and
successful setup through an out-of-band channel before enabling admin access.
For an existing admin without a verified factor, the project owner must
temporarily set the account to `user` and set `admin_mfa_enabled` to `false`,
have the person enroll and verify at `/account/security`, then verify identity
out of band before restoring `admin` and setting `admin_mfa_enabled` to `true`.
This owner-controlled approval is required because a password-only session can
start first-factor enrollment through Supabase Auth directly. The database
approval flag blocks all admin operations until that factor and the person's
identity have been verified out of band. Supabase Auth requires an `aal2`
session to enroll additional factors after a verified factor already exists.

Store the authenticator recovery method securely; losing the authenticator may
require a project owner to reset the account's factor through a trusted
administrative process. Do not share the QR code or setup secret.

New accounts receive the `user` role automatically. To grant administrator
access, first confirm the account has an authenticator enrolled and verify the
intended person's identity out of band. Then run this statement in the SQL
Editor with that account's email:

```sql
update public.profiles
set role = 'admin',
    admin_mfa_enabled = true
where id = (
  select id
  from auth.users
  where email = 'admin@example.com'
);
```

The role and MFA approval flag are both required by the database's
`is_admin()` function, along with an `aal2` session. Do not set the flag until
the person and their authenticator have been verified through a trusted channel.

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
