-- Clear old unconfirmed users and confirm the rest
DELETE FROM auth.users WHERE email_confirmed_at IS NULL;
UPDATE auth.users SET email_confirmed_at = now();
