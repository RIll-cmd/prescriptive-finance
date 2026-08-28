Absolutely. Since your **main UI and login UI are already built**, Phase 1 should be strictly about turning that frontend into a **real full-stack application**.

I would make Phase 1 fairly detailed and structured so that you can implement it task-by-task.

# PHASE 1 — CORE DATA FOUNDATION

### Goal

> Connect the existing frontend to a FastAPI backend, establish the database, implement real authentication, create the user's initial financial profile, and make protected user data persist between sessions.

At the end:

```text
Register
   ↓
User created in database
   ↓
Login
   ↓
Authentication token/session
   ↓
Dashboard
   ↓
User-specific data loaded
   ↓
Logout
   ↓
Login again
   ↓
Same user data restored
```

---

# 1. PHASE 1 SCOPE

### Build

- Authentication backend
- User database
- Session/JWT authentication
- Protected API routes
- User profile
- Money source foundation
- Default categories
- Frontend API integration
- Authentication state
- Error/loading handling
- Database migrations
- Basic testing

### Do NOT build yet

Don't let Phase 1 expand into Phase 2.

```text
❌ Transaction tracking
❌ Financial Health Score
❌ Budget engine
❌ Safe-to-Spend
❌ Goals
❌ Bills
❌ Ciel
❌ AI
❌ SMS parsing
❌ Receipt OCR
❌ Bank APIs
❌ GCash API
❌ Maya API
❌ Financial analytics
```

You are building the **foundation those systems will depend on**.

---

# 2. TARGET ARCHITECTURE

Your first working architecture should be:

```text
                 NEXT.JS
              ┌───────────┐
              │ Login UI  │
              │ Register  │
              │ Dashboard │
              └─────┬─────┘
                    │
                HTTP/JSON
                    │
                    ↓
               FASTAPI
          ┌──────────────────┐
          │ Authentication   │
          │ User API         │
          │ Money Source API │
          └────────┬─────────┘
                   │
                Services
                   │
                   ↓
              ORM / DB Layer
                   │
                   ↓
                DATABASE
```

The frontend should **never directly access the database**.

```text
❌ Next.js → Database

✅ Next.js → FastAPI → Database
```

---

# 3. DATABASE FOUNDATION

Start with four core tables:

```text
users
money_sources
categories
transactions
```

However, because **Phase 1 doesn't implement transactions yet**, you can create the transaction table now as a foundation, but don't build its UI/API until Phase 2.

---

# 4. `users` TABLE

This is your most important table.

### Suggested structure

```text
users
────────────────────────────
id
email
password_hash
first_name
last_name
avatar_url
currency
timezone
created_at
updated_at
last_login_at
is_active
```

### Explanation

#### `id`

Unique user identifier.

Use:

```text
UUID
```

rather than sequential IDs if possible.

Example:

```text
550e8400-e29b-41d4-a716-446655440000
```

---

### `email`

```text
VARCHAR
UNIQUE
NOT NULL
```

Used for login.

You should normalize it:

```text
User@Gmail.com
```

→

```text
user@gmail.com
```

---

### `password_hash`

**Never store:**

```text
password = "123456"
```

Store something like:

```text
$argon2id$v=19$...
```

Use a modern password hashing algorithm such as **Argon2id**.

---

### `first_name`

Used by your dashboard:

> Good evening, Cyrill.

---

### `last_name`

Optional at first.

---

### `avatar_url`

For your existing UI profile/avatar.

---

### `currency`

Default:

```text
PHP
```

Eventually support:

```text
PHP
USD
EUR
JPY
...
```

But don't build currency conversion yet.

---

### `timezone`

Default for your target users:

```text
Asia/Manila
```

This becomes important later for:

- Daily spending
- Payday
- Notifications
- Recurring bills
- Financial forecasts

---

### `created_at`

When the account was created.

---

### `updated_at`

Last profile modification.

---

### `last_login_at`

Useful for security and future analytics.

---

### `is_active`

Allows you to deactivate accounts without immediately deleting them.

---

# 5. USER MODEL

Your backend model might conceptually look like:

```text
User
│
├── id
├── email
├── password_hash
├── first_name
├── last_name
├── avatar_url
├── currency
├── timezone
├── created_at
├── updated_at
├── last_login_at
└── is_active
```

Relationships:

```text
User
 │
 ├──────< MoneySources
 │
 ├──────< Transactions
 │
 └──────< Categories
```

---

# 6. MONEY SOURCES

Remember your important design decision:

> **These are NOT connected financial accounts.**

They are simply places/labels the user uses to organize their money.

For example:

```text
GCash
Cash
Maya
BPI
BDO
Other
```

The application has **zero credentials/API access** to these institutions.

---

# 7. `money_sources` TABLE

Suggested:

```text
money_sources
────────────────────────────
id
user_id
name
type
currency
initial_balance
current_balance
is_active
created_at
updated_at
```

### Example

```text
id: 1
user_id: abc123
name: GCash
type: E_WALLET
currency: PHP
initial_balance: 5000
current_balance: 5000
```

Another:

```text
id: 2
user_id: abc123
name: Cash
type: CASH
currency: PHP
initial_balance: 2000
current_balance: 2000
```

---

# 8. MONEY SOURCE TYPES

Start with:

```text
CASH
E_WALLET
BANK
CREDIT_CARD
OTHER
```

The user can create:

```text
GCash → E_WALLET
Maya → E_WALLET
BPI → BANK
Cash → CASH
```

Again, these are **labels only**.

---

# 9. MONEY SOURCE RULES

Important rules:

### User ownership

A user can only see their own money sources.

```text
User A
 ↓
GCash
Cash
```

User B cannot request:

```text
GET /money-sources/...
```

and retrieve User A's data.

The backend must always verify ownership.

---

### No duplicate problem

You can initially allow:

```text
GCash
GCash
```

but I'd recommend preventing duplicates by using:

```text
user_id + normalized_name
```

or simply handling duplicates in the service layer.

---

# 10. DEFAULT MONEY SOURCES

I'd actually **not automatically create GCash, Maya, BPI, etc. for everyone**.

Instead, during onboarding:

```text
Where do you usually keep your money?

☐ GCash
☐ Maya
☐ Bank
☐ Cash
☐ Other
```

The user selects what they actually use.

Then:

```text
User selects GCash + Cash

↓

Create:

GCash
Cash
```

This keeps the app personalized.

---

# 11. CATEGORIES TABLE

Even though category functionality belongs more heavily to Phase 2, create the database foundation now.

```text
categories
────────────────────────────
id
user_id
name
type
icon
is_default
created_at
updated_at
```

### Type

```text
INCOME
EXPENSE
```

---

# 12. DEFAULT CATEGORIES

When a user registers, you can create their default categories.

### Expenses

```text
Food
Transportation
Bills
Shopping
Entertainment
Education
Healthcare
Personal
Debt
Other
```

### Income

```text
Salary
Allowance
Freelance
Business
Gift
Other
```

Don't over-engineer categories yet.

Phase 2 can add:

- custom categories
- category editing
- category rules
- automatic categorization

---

# 13. TRANSACTIONS TABLE

Create the schema now, but don't implement the complete feature yet.

```text
transactions
────────────────────────────
id
user_id
money_source_id
category_id
type
amount
merchant
description
transaction_date
source
created_at
updated_at
```

### Type

```text
INCOME
EXPENSE
TRANSFER
```

### Source

This will become extremely useful later:

```text
MANUAL
SMS
NOTIFICATION
RECEIPT
CSV
```

For Phase 1:

```text
MANUAL
```

is enough.

---

# 14. DATABASE RELATIONSHIPS

The structure should be:

```text
USER
 │
 ├───────────────┐
 │               │
 ↓               ↓
MONEY SOURCES   CATEGORIES
 │
 │
 └───────────┐
             ↓
        TRANSACTIONS
```

More explicitly:

```text
users
  │
  ├── 1:N → money_sources
  │
  ├── 1:N → categories
  │
  └── 1:N → transactions
                 │
                 ├── money_source
                 └── category
```

---

# 15. BACKEND PROJECT STRUCTURE

For Phase 1, you don't need the giant backend structure yet.

Start with:

```text
apps/api/
│
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   ├── deps.py
│   │   └── routes/
│   │       ├── auth.py
│   │       ├── users.py
│   │       └── money_sources.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── money_source.py
│   │   ├── category.py
│   │   └── transaction.py
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── user.py
│   │   └── money_source.py
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   └── money_source_service.py
│   │
│   └── core/
│       ├── config.py
│       ├── database.py
│       ├── security.py
│       └── logging.py
│
├── tests/
│   ├── test_auth.py
│   ├── test_users.py
│   └── test_money_sources.py
│
├── requirements.txt
└── Dockerfile
```

---

# 16. AUTHENTICATION FLOW

This should be your first real feature.

## Registration

Frontend:

```text
User enters:

Email
Password
Confirm Password
First Name
```

↓

```text
POST /api/v1/auth/register
```

↓

Backend validates:

```text
Is email valid?
Is email already registered?
Is password acceptable?
Do passwords match?
```

↓

Hash password:

```text
password
 ↓
Argon2id
 ↓
password_hash
```

↓

Create:

```text
User
```

↓

Create default categories.

↓

Optionally create selected money sources.

↓

Return success.

---

# 17. REGISTRATION RESPONSE

Don't return the password.

Example:

```json
{
  "user": {
    "id": "...",
    "email": "user@example.com",
    "first_name": "Cyrill"
  }
}
```

Never return:

```text
password
password_hash
```

---

# 18. LOGIN FLOW

Frontend:

```text
Email
Password
      ↓
POST /api/v1/auth/login
```

Backend:

```text
Find user
   ↓
Verify password
   ↓
Create authentication session/token
   ↓
Return authentication result
```

Frontend:

```text
Authentication successful
        ↓
Store auth state
        ↓
Redirect /dashboard
```

---

# 19. JWT / SESSION DESIGN

For your project, you can use:

### Access token

Short-lived.

Example:

```text
15–30 minutes
```

### Refresh token

Longer-lived.

Example:

```text
7–30 days
```

The frontend uses the access token for API requests.

When it expires:

```text
Access token
     ↓
Refresh
     ↓
New access token
```

---

# 20. IMPORTANT: TOKEN STORAGE

For a serious application, don't casually put long-lived authentication credentials in:

```text
localStorage
```

A safer architecture is generally:

```text
HttpOnly
Secure
SameSite
Cookie
```

for session/refresh credentials.

Your frontend then communicates with FastAPI while the browser handles the cookie.

This is something you should implement deliberately rather than simply copying a JWT tutorial.

---

# 21. PROTECTED ROUTES

Your API needs authentication dependencies.

Conceptually:

```text
GET /api/v1/users/me
       ↓
Authentication middleware/dependency
       ↓
Validate token/session
       ↓
Get user
       ↓
Return data
```

If unauthenticated:

```text
401 Unauthorized
```

---

# 22. USER API

Create:

```text
GET /api/v1/users/me
```

Returns:

```json
{
  "id": "...",
  "email": "...",
  "first_name": "...",
  "last_name": "...",
  "avatar_url": null,
  "currency": "PHP",
  "timezone": "Asia/Manila"
}
```

---

# 23. UPDATE PROFILE

Create:

```text
PATCH /api/v1/users/me
```

Allow:

```text
first_name
last_name
avatar_url
currency
timezone
```

Do not allow the client to modify:

```text
id
password_hash
created_at
```

through the normal profile endpoint.

Password changes should have a dedicated endpoint later.

---

# 24. LOGOUT

Create:

```text
POST /api/v1/auth/logout
```

The server should invalidate/revoke the relevant session/refresh token if you're using server-tracked sessions or refresh-token rotation.

Then frontend:

```text
Clear auth state
 ↓
Redirect /login
```

---

# 25. AUTH API STRUCTURE

Your first API should look roughly like:

```text
/api/v1
│
├── /auth
│   ├── POST /register
│   ├── POST /login
│   ├── POST /logout
│   └── POST /refresh
│
├── /users
│   ├── GET /me
│   └── PATCH /me
│
└── /money-sources
    ├── GET /
    ├── POST /
    ├── PATCH /{id}
    └── DELETE /{id}
```

You don't need transaction endpoints yet.

---

# 26. FRONTEND AUTH STATE

Your Next.js app needs a single source of truth.

Conceptually:

```text
Auth State

{
    user: User | null,
    isAuthenticated: boolean,
    isLoading: boolean
}
```

Possible states:

```text
LOADING
AUTHENTICATED
UNAUTHENTICATED
```

---

# 27. APPLICATION STARTUP

When the application opens:

```text
Open app
 ↓
Check authentication
 ↓
GET /users/me
 ↓
 ┌───────────────┐
 │               │
Authenticated   Not authenticated
 │               │
 ↓               ↓
Dashboard       Login
```

This prevents the annoying behavior where the UI briefly shows the dashboard and then kicks the user back to login.

---

# 28. PROTECTED FRONTEND ROUTES

Your existing dashboard routes should become protected.

Example:

```text
/dashboard
/money
/transactions
/goals
/insights
/settings
```

If not authenticated:

```text
→ /login
```

But remember:

> **Frontend route protection is not your security boundary.**

The FastAPI API must independently verify authentication.

---

# 29. API CLIENT

Create one central API client.

For example:

```text
src/lib/api.ts
```

Instead of doing random fetch calls everywhere:

```text
component
 ↓
fetch(...)
```

use:

```text
component
 ↓
feature API function
 ↓
api client
 ↓
FastAPI
```

Example structure:

```text
features/
└── auth/
    ├── api.ts
    ├── hooks.ts
    └── types.ts
```

---

# 30. MONEY SOURCE API

Although transactions aren't implemented yet, make money sources functional in Phase 1.

### Get

```text
GET /money-sources
```

### Create

```text
POST /money-sources
```

Example:

```json
{
  "name": "GCash",
  "type": "E_WALLET",
  "currency": "PHP",
  "initial_balance": 5000
}
```

### Update

```text
PATCH /money-sources/{id}
```

### Delete

```text
DELETE /money-sources/{id}
```

---

# 31. MONEY SOURCE UI

You don't need a giant feature.

Just create a basic settings/onboarding interface:

```text
YOUR MONEY SOURCES

┌────────────────────────┐
│ 💳 GCash               │
│ ₱5,000                 │
└────────────────────────┘

┌────────────────────────┐
│ 💵 Cash                │
│ ₱2,000                 │
└────────────────────────┘

        + Add source
```

Again:

> No "Connect GCash."

Instead:

> **Add GCash as a money source.**

That wording reinforces your product philosophy.

---

# 32. ONBOARDING

After registration, I'd add a very small onboarding flow.

### Step 1

```text
Welcome to Financial OS
```

### Step 2

```text
What should we call you?

Cyrill
```

### Step 3

```text
What currency do you use?

₱ PHP
```

### Step 4

```text
Where do you usually keep money?

☑ GCash
☑ Cash
☐ Bank
☐ Maya
```

### Step 5

```text
You're ready.

Let's understand your finances.
```

Then:

```text
→ Dashboard
```

Don't ask 20 questions during onboarding.

---

# 33. DEFAULT DATA CREATION

When onboarding completes:

```text
User
 ↓
Create profile
 ↓
Create selected money sources
 ↓
Create default categories
 ↓
Dashboard
```

Example:

```text
USER
 ├── GCash
 ├── Cash
 │
 ├── Food
 ├── Transport
 ├── Bills
 ├── Shopping
 ├── Entertainment
 └── ...
```

---

# 34. ERROR HANDLING

Build this now rather than later.

### Registration

```text
Email already exists
```

### Login

```text
Invalid email or password
```

Don't say:

> Email doesn't exist.

That can help attackers enumerate accounts.

Use:

> **Invalid email or password.**

### Network

```text
Unable to connect to server.
Please try again.
```

### Session expired

```text
Your session has expired.
Please log in again.
```

---

# 35. LOADING STATES

Your UI skeleton should now receive real states.

### Login

```text
Signing in...
```

### Registration

```text
Creating account...
```

### Dashboard

```text
Loading your financial profile...
```

### Money sources

```text
Loading...
```

Avoid letting users click buttons multiple times while a request is processing.

---

# 36. DATABASE MIGRATIONS

Don't manually modify your production database every time your schema changes.

Use migrations.

Your workflow should be:

```text
Change model
     ↓
Create migration
     ↓
Review migration
     ↓
Run migration
     ↓
Database updated
```

Also have:

```text
seed/
```

for development data.

---

# 37. ENVIRONMENT VARIABLES

Create:

```text
.env.example
```

Something like:

```text
DATABASE_URL=

JWT_SECRET=

ACCESS_TOKEN_EXPIRE_MINUTES=

REFRESH_TOKEN_EXPIRE_DAYS=

NEXT_PUBLIC_API_URL=
```

Never commit your actual `.env`.

---

# 38. CORS

Your frontend and backend will likely run separately during development.

Example:

```text
Next.js
localhost:3000

FastAPI
localhost:8000
```

Configure FastAPI CORS to allow your frontend origin.

Don't use:

```text
allow_origins=["*"]
```

as your final configuration.

---

# 39. LOGGING

At minimum, log:

```text
Request
Response status
Errors
Authentication failures
Server exceptions
```

But **never log**:

```text
Passwords
Password hashes
Access tokens
Refresh tokens
Sensitive financial information
```

---

# 40. TESTING

Phase 1 should have actual tests.

## Authentication tests

```text
✓ Register valid user
✓ Reject duplicate email
✓ Reject invalid email
✓ Reject weak password
✓ Login valid credentials
✓ Reject invalid credentials
✓ Protected route without auth → 401
✓ Protected route with valid auth → 200
✓ Logout invalidates session
```

---

## User tests

```text
✓ Get current user
✓ Update profile
✓ Cannot access another user
```

---

## Money source tests

```text
✓ Create source
✓ List own sources
✓ Update own source
✓ Delete own source
✓ Cannot access another user's source
```

That last one is **very important**.

---

# 41. SECURITY CHECKLIST

Before declaring Phase 1 finished:

```text
[ ] Passwords are hashed
[ ] Passwords never stored plaintext
[ ] Passwords never returned by API
[ ] Authentication required for protected endpoints
[ ] User ownership checked on every resource
[ ] CORS configured
[ ] Secrets stored in environment variables
[ ] Tokens handled securely
[ ] Login errors don't reveal account existence
[ ] Rate limiting considered for authentication
[ ] Sensitive information excluded from logs
[ ] HTTPS planned for production
```

---

# 42. PHASE 1 DEVELOPMENT ORDER

Don't build everything simultaneously.

Follow this order:

### STEP 1 — Backend setup

```text
FastAPI
Database
ORM
Configuration
Environment variables
```

↓

### STEP 2 — Database models

```text
User
MoneySource
Category
Transaction
```

↓

### STEP 3 — Migrations

```text
Initial migration
```

↓

### STEP 4 — Authentication

```text
Register
Password hashing
Login
Session/token
Logout
```

↓

### STEP 5 — Authentication dependency

```text
get_current_user()
```

↓

### STEP 6 — User API

```text
GET /users/me
PATCH /users/me
```

↓

### STEP 7 — Frontend authentication

```text
Login UI
 ↓
API
 ↓
Auth state
 ↓
Dashboard
```

↓

### STEP 8 — Protected routes

```text
Dashboard
Settings
Money sources
```

↓

### STEP 9 — Onboarding

```text
Profile
Currency
Money sources
```

↓

### STEP 10 — Default data

```text
Categories
Money sources
```

↓

### STEP 11 — Error/loading states

↓

### STEP 12 — Testing

↓

### STEP 13 — Phase 1 completion test

---

# 43. FINAL PHASE 1 USER FLOW

When everything is done, your app should behave like this:

```text
                  NEW USER
                     │
                     ↓
                REGISTER
                     │
                     ↓
              Create User
                     │
                     ↓
           Hash Password
                     │
                     ↓
          Create Categories
                     │
                     ↓
                ONBOARDING
                     │
          ┌──────────┼──────────┐
          ↓          ↓          ↓
        Name      Currency   Sources
                              │
                         GCash / Cash
                              │
                              ↓
                         DASHBOARD
```

Returning user:

```text
                  USER
                   │
                   ↓
                 LOGIN
                   │
                   ↓
            Verify Password
                   │
                   ↓
            Create Session
                   │
                   ↓
              DASHBOARD
                   │
                   ↓
             Load User Data
                   │
        ┌──────────┼───────────┐
        ↓          ↓           ↓
      Profile   Sources    Categories
```

Logout:

```text
Dashboard
   ↓
Logout
   ↓
Session invalidated
   ↓
Auth state cleared
   ↓
/login
```

---

# 44. PHASE 1 DEFINITION OF DONE

**Do not move to Phase 2 until all of these work:**

### Authentication

- [ ] User can register
- [ ] Password is securely hashed
- [ ] User can login
- [ ] User remains authenticated after page refresh
- [ ] User can logout
- [ ] Invalid credentials are rejected
- [ ] Protected APIs reject unauthenticated requests

### User

- [ ] User profile is stored
- [ ] User can retrieve profile
- [ ] User can update profile
- [ ] User data persists

### Money Sources

- [ ] User can create a money source
- [ ] User can see their sources
- [ ] User can edit sources
- [ ] User can delete sources
- [ ] Users cannot access another user's sources
- [ ] No bank/e-wallet API connection exists

### Database

- [ ] Migrations work
- [ ] Relationships work
- [ ] Foreign keys work
- [ ] Development seed works

### Frontend

- [ ] Existing login UI is connected
- [ ] Dashboard displays actual user information
- [ ] Loading states work
- [ ] Error states work
- [ ] Protected routes work
- [ ] Logout works

### Testing

- [ ] Authentication tests pass
- [ ] User tests pass
- [ ] Ownership/security tests pass

---

## The Phase 1 end state

Your app should **look almost like the UI you already have**, but underneath it should have become a real application:

```text
             YOUR EXISTING UI
                    │
                    ↓
             NEXT.JS FRONTEND
                    │
                    ↓
               FASTAPI API
                    │
                    ↓
             SERVICE LAYER
                    │
                    ↓
                DATABASE
                    │
        ┌───────────┼────────────┐
        ↓           ↓            ↓
      Users     Money Sources  Categories
                                  │
                            Transactions
                             (Phase 2)
```

Then Phase 2 can start cleanly with:

> **Transactions → Income → Expenses → Transfers → Categories → Transaction history → Basic financial analytics.**

That separation is important: **Phase 1 establishes identity and ownership; Phase 2 starts actually recording the user's financial life.**
