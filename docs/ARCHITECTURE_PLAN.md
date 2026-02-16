## Why Supabase + PostgreSQL?

### 1. All-in-One Solution

Supabase provides everything you need in one place:

- **Authentication** (email/password, social login, password reset, email verification)
- **Database** (PostgreSQL for storing expenses, categories, budgets)
- **Real-time sync** (automatic updates across devices)
- **Row-level security** (ensures users only see their own expense data)
- **Storage** (for receipt images if you add that later)
- **Built-in API** (auto-generated REST and GraphQL APIs)

### 2. Perfect for Personal Finance Apps

- **Relational data**: Expenses have relationships (categories, tags, budgets) - PostgreSQL excels at this
- **Complex queries**: Easy to build reports like "spending by category this month" or "compare to last year"
- **Data integrity**: Built-in constraints and transactions ensure your financial data is accurate
- **Future-proof**: As your app grows, you can add features like shared budgets, recurring expenses, etc.

### 3. Developer Experience

- **Free tier**: 500MB database, 50MB file storage, 2GB bandwidth - more than enough for personal use
- **TypeScript support**: Auto-generated types for your database tables
- **Easy setup**: No backend code needed - just install the client library
- **Great documentation**: Extensive guides for React Native/Expo

### 4. Cost & Scaling

- **Free forever** for small projects
- If you grow: $25/month for unlimited projects (vs Firebase $25+/month per project)
- **Open source**: Can self-host if you want full control later

## Alternative Options (and why I didn't recommend them)

### Firebase Authentication

**Pros**:

- Very popular, good docs, easy setup

**Cons**:

- Firestore (NoSQL) isn't ideal for financial data with relationships
- More expensive at scale
- Vendor lock-in (harder to migrate away)
- Less powerful querying for financial reports

### Custom Backend (Node.js + Express + PostgreSQL)

**Pros**:

- Complete control, learn backend development

**Cons**:

- Much more work: Need to build auth, API endpoints, security, hosting
- Need to deploy and maintain a server
- Costs more (need a VPS/server)
- Delays getting to the actual expense tracking features

### Local Storage Only (AsyncStorage/SQLite)

**Pros**:

- No backend needed, works offline, fast

**Cons**:

- No data sync between devices
- No backup - lose phone = lose all data
- Can't use on web or multiple devices
- No email verification or password reset flows

## Authentication Flow (Step-by-Step)

1️⃣ First Login (Online)
User enters email + password
Supabase Auth verifies credentials
App receives:
access_token (JWT)
refresh_token
Tokens are stored in Expo SecureStore

2️⃣ Enable Biometrics (Post-login)
Prompt user:
“Enable Face ID / Fingerprint to unlock the app?”
Store a boolean flag in SecureStore (not the biometric itself)

3️⃣ App Cold Start
Check for stored session in SecureStore
If session exists:
Prompt biometric auth
If success → unlock app
If biometric fails:
Fall back to password re-auth

4️⃣ Offline Behavior
User can:
View expenses
Add expenses
See analytics
No network call required
Background sync waits for connectivity

Authentication is implemented using Supabase Auth with email/password credentials. Authenticated sessions are persisted securely using Expo SecureStore. Biometric authentication (Face ID / Fingerprint) is used as an app-level unlock mechanism on cold start, not as a replacement for authentication. This approach ensures strong security, offline usability, and a clean separation of concerns.



## EXPO GO VS DEVELOPMENT BUILD

- To use a custom scheme, need to shift to development build since expo go only uses exp://<your-local-ip>:8081/*

using development build, and to open magic link on ios simulator use this command:

xcrun simctl openurl booted "https://qeigzvwthgoqdmpqgpvn.supabase.co/auth/v1/verify?token=4e94d6879485c86fb9d9eef29d55dafca2d6fca05c7aeeb08e59bf90&type=recovery&redirect_to=expensetracking://auth/reset-password"


Turns on Row Level Security for the expenses table
Without RLS policies defined, nobody can access this table (not even authenticated users)
You must explicitly define policies to grant access
Why it's important:
Prevents users from seeing each other's expenses
Even if someone hacks your API keys, they can't access other users' data
Security is enforced at the database level, not just in your app code\\

Creates a database index for faster queries
expenses_user_id_date_idx = name of the index
on expenses(user_id, date desc) = index the user_id and date columns together, with dates sorted descending (newest first)
Why it's important:
When you query SELECT * FROM expenses WHERE user_id = '...' ORDER BY date DESC, the database can use this index instead of scanning every row
Makes your app much faster when loading expenses
Especially important as users accumulate hundreds or thousands of expenses


## why using flatlist vs flashlist

## why using development build (for using custom scheme)