# NEXORA TECHNOLOGY

A maintainable corporate website starter with responsive public pages, Express APIs, SQLite persistence, SMTP notifications, and a session-protected admin dashboard.

## Requirements

- Node.js 20 or newer and npm
- A terminal for creating the first admin account
- SMTP credentials only if you want actual email notifications

## Install and run

```bash
npm install
cp .env.example .env
```

Edit `.env` and set a long, unique `SESSION_SECRET` (at least 32 random characters). The SQLite database is created automatically at the path in `DATABASE_FILE`; starter service and clearly labelled sample portfolio records are seeded at startup.

Create the first administrator interactively:

```bash
npm run create-admin
```

Use a valid email and a unique password of at least 12 characters. The password is hashed using bcrypt before storage. Do not put admin passwords in source code, `.env`, or version control. Run this command again only to create another account with a different email; it will not overwrite an existing account.

Start the server:

```bash
npm start
```

Open `http://localhost:3000`. Admin login is at `http://localhost:3000/admin/login.html`.

Development with automatic restart:

```bash
npm run dev
```

## SMTP email notifications

Set these environment variables in `.env` for a supported SMTP account:

- `SMTP_HOST`: SMTP hostname
- `SMTP_PORT`: usually `587` for STARTTLS or `465` for implicit TLS
- `SMTP_SECURE`: `false` for STARTTLS on 587; `true` for implicit TLS on 465
- `SMTP_USER` and `SMTP_PASS`: provider-issued credentials or app password
- `SMTP_FROM`: a sender identity authorized by your provider
- `INQUIRY_TO`: recipient address (defaults in the example to `nexoratechnology6@gmail.com`)

Valid SMTP credentials and a provider that permits the sender/recipient are required for actual email delivery. Without SMTP settings, form submissions still validate and save to SQLite; email notifications are skipped and a warning is logged. If SMTP delivery fails, the inquiry remains saved and the server logs a minimal failure message without exposing inquiry contents or credentials. Review operational logs periodically.

## Pages and features

Public pages: Home, About Us, Services, Service Details, Portfolio, Project Details, Our Process, Contact Us, Get a Quote, FAQ, Privacy Policy, Terms of Service and custom 404. Portfolio filters run in vanilla JavaScript. Shared navigation and footer are rendered by `public/js/main.js`.

API:
- `POST /api/contact`
- `POST /api/quotes`
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- Protected `/api/admin/stats`, `/api/admin/inquiries`, `/api/admin/inquiries/:id`, status updates and deletion
- Protected service and portfolio item management endpoints
- `GET /api/health`

The admin dashboard provides inquiry search/type/status filters, detail view, status updates, confirmed deletion, basic service management (add/show/hide/delete), and portfolio item management (add/show/hide/delete). Public content pages currently use curated frontend content and the seeded sample concepts. New service/project records are available in admin management but are not automatically inserted into the hand-authored public page cards; update the relevant HTML or extend the public API rendering to publish new content.

## Database

SQLite schema is initialized automatically. Main tables:
- `admins`: email and bcrypt password hash
- `inquiries`: contact and quote submissions, timestamps and status
- `services`: editable service records
- `projects`: portfolio records and a `sample` flag

Back up the database file regularly. The database file and session database are ignored by git.

## Security and deployment checklist

1. Use a supported Node.js release, install dependencies, and keep dependencies updated.
2. Set `NODE_ENV=production`, a unique random `SESSION_SECRET`, and `TRUST_PROXY=true` only when running behind a correctly configured trusted HTTPS reverse proxy.
3. Terminate HTTPS at a trusted reverse proxy or platform and configure secure cookies correctly. Do not expose the Node process directly to the public internet without TLS and deployment-level protections.
4. Restrict inbound traffic, configure correct host/origin policy at the proxy, and keep `.env` and SQLite files out of public directories and version control.
5. Use a durable writable volume for `DATABASE_FILE` and the session database. SQLite is best for a single-instance/small deployment; use a managed database and shared session store if scaling across multiple instances.
6. Configure SMTP credentials as deployment secrets, never commit them, and test delivery with a controlled mailbox.
7. Use a least-privilege OS account, file permissions, backups, monitoring and log rotation. Do not log passwords or full inquiry bodies.
8. Review and adapt Privacy Policy and Terms of Service with qualified counsel before publication.
9. Set an appropriate Content Security Policy for any external assets you choose to use. This template uses Bootstrap from jsDelivr and Google Fonts; self-host assets if your policy requires it.
10. Before launch, verify the full workflow on the actual hosting platform and test restore from backup.

## Validation and limitations

- Server-side field length/email validation is implemented for inquiry endpoints, with browser-native validation for user convenience.
- Rate limiting and Helmet security headers are enabled. Sessions use a SQLite-backed store and the session identifier is regenerated on successful login.
- No real client testimonials, awards, certifications, company statistics or delivered client projects are claimed. The initial portfolio entries are labelled sample concepts.
- The application code includes an `npm test` script using Node's built-in test runner; tests should be added and run in your deployment environment. Do not interpret a successful server start as proof of full end-to-end or production security testing.
- This is a production-oriented starter, not a substitute for deployment-specific security review. Consider CSRF protection for admin mutation endpoints, SMTP provider-specific verification, automated tests, backups and monitoring before a public production launch.
