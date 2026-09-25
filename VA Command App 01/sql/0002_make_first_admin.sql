-- Run this ONCE, by hand, after you've signed up in the app yourself.
-- This is the only way to become an admin — there's no button for it,
-- on purpose (see lib/admin/require-admin.ts). Nothing in the product
-- can grant this to anyone, including you, without editing the database directly.

-- 1. Find your own user id (run this first, on its own):
select id, email from auth.users where email = 'the-email-you-signed-up-with@example.com';

-- 2. Copy the id from the result above, paste it below, and run this:
insert into public.platform_admins (user_id) values ('paste-your-uuid-here');

-- 3. Confirm it worked:
select * from public.platform_admins;
