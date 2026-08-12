# Dev Test Accounts

Use these emails on the signup screen presets. In dev email-code mode, use:

- Password: `Password123!`
- Email verification code: `000000`
- Educator/admin owner code: `LEVELUP-EDU-DEV` when backend `DEBUG=true` and `EDUCATOR_ACCESS_CODES` is unset

## Student Personas

- Senior-secondary student: `levelup.dev+ss@student.test`
- JAMB candidate: `levelup.dev+jamb@student.test`
- Current university student: `levelup.dev+university@student.test`
- Graduate: `levelup.dev+graduate@student.test`
- Skilled worker: `levelup.dev+skilled@student.test`
- Working professional / career changer: `levelup.dev+professional@student.test`

## Educator / Admin Personas

- Secondary school educator/admin: `levelup.dev+school-admin@educator.test`
- University educator/admin: `levelup.dev+university-admin@educator.test`

## Reset One Test Account

```sql
with target_user as (
  select id
  from skillup_dev.users
  where lower(email) = lower('levelup.dev+ss@student.test')
)
update skillup_dev.users
set
  onboarding_completed = false,
  account_type = 'pending'
where id in (select id from target_user);

delete from skillup_dev.onboarding_drafts
where user_id in (select id from target_user);
```

Also clear browser redirect cache for the site:

```js
localStorage.removeItem('sifter_post_auth_redirect_v1');
localStorage.removeItem('sifter_post_auth_redirect_user_v1');
```
