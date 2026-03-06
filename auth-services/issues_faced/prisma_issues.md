# Prisma Issues Log — Proctora Backend

---

## Issue 1 — Prisma version conflict with VS Code extension

**Error:**
Prisma extension in VS Code was not working / schema highlighting broken.

**Cause:**
Latest Prisma version was incompatible with the VS Code Prisma extension.

**Fix:**
- Installed pinned version: `npm install prisma@5 @prisma/client@5`
- Downgraded VS Code Prisma extension to `5.15.0`

---

## Issue 2 — `Cannot read properties of undefined (reading 'findUnique')`

**Error:**
```
TypeError: Cannot read properties of undefined (reading 'findUnique')
    at findUserByEmail (user.repository.js:14)
```

**Cause:**
The Prisma schema had `model Userss` (double s) but the repository code was calling `prisma.user` (singular, no s). Prisma generates client methods based on the model name, so `prisma.user` was `undefined`.

**Fix:**
Updated all repository calls from `prisma.user` → `prisma.userss` to match the schema model name. Then ran `npx prisma generate` to regenerate the client.

---

## Issue 3 — `The table public.User does not exist in the current database`

**Error:**
```
PrismaClientKnownRequestError:
Invalid prisma.user.findUnique() invocation:
The table `public.User` does not exist in the current database.
```

**Cause:**
During debugging, the schema model was temporarily renamed from `Userss` → `User`. After running `npx prisma generate`, the client expected a `"User"` table but the actual database table was `"Userss"`. The two were out of sync.

**Fix:**
- Ran `npx prisma db push` which revealed the actual table in the database was `Userss` (with 3 existing rows)
- Cancelled the push (would have dropped data)
- Reverted schema back to `model Userss`
- Ran `npx prisma generate` again to resync the client

---

## Issue 4 — `relation "userss" does not exist` in psql

**Error:**
```sql
SELECT * FROM userss;
ERROR: relation "userss" does not exist
```

**Cause:**
PostgreSQL table names are case-sensitive when created with quoted identifiers. Prisma creates the table as `"Userss"` (capital U). Running `SELECT * FROM userss` (lowercase, no quotes) fails.

**Fix:**
Always use double quotes with the exact casing Prisma used:
```sql
SELECT * FROM "Userss";
```

---

## Issue 5 — Email already exists on re-registration

**Error:**
```json
{ "message": "An account with this email already exists" }
```

**Cause:**
Previous register attempts failed mid-way (nodemailer crash after DB insert). The user row was already written to `"Userss"` with `verified = false`, but the email was never sent. Re-registering with the same email hit the duplicate check.

**Fix:**
Delete the stuck unverified user directly in psql:
```sql
DELETE FROM "Userss" WHERE email = 'your@email.com';
```
Then register again.

**Long-term fix (recommended):**
Update the register service to allow re-registration if the existing user is unverified — overwrite their record and resend the verification email.

---

## Issue 6 — Migrations not applied / table missing in database

**Error:**
```
The table `public.User` does not exist in the current database.
```

**Cause:**
`npx prisma migrate dev` was run but the migration history had conflicting model names (`Users` → `User` across different migration files), so the table didn't match what the client expected.

**Fix:**
```powershell
npx prisma db push      # fast sync schema to DB without migration history
npx prisma generate     # regenerate client to match
```

