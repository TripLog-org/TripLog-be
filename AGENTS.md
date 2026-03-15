# AGENTS.md — TripLog API Server

> Guidelines for AI coding agents working in this repository.

---

## Project Overview

TripLog is a **Node.js / Express REST API** backend for a travel-logging mobile app.
It exposes ~30 REST endpoints, uses MongoDB via Mongoose, handles Apple/Google OAuth, image uploads (Multer + Sharp → S3), and integrates the Korean Tourism Public API.

**Stack**: Node.js · Express.js · MongoDB (Mongoose) · JWT · Axios · Multer · Sharp · Swagger/OpenAPI 3.0  
**Deploy target**: Vercel (serverless)  
**Entry point**: `app.js`

---

## Commands

### Run the server
```bash
npm start           # node app.js — starts on PORT from .env (default 3000)
```

### Seed sample data
```bash
npm run seed:recommendations   # inserts 5 sample recommendation docs into MongoDB
npm run seed:posts             # inserts sample post docs
```

### No build step, no test runner, no linter configured.
There are **no test scripts** in package.json. When adding tests, use a standard framework
(e.g. Jest or Mocha) and document commands here.

### Swagger UI (dev)
```
http://localhost:3000/api-docs
```

---

## Project Structure

```
app.js                  # Express app setup + middleware registration
src/
├── config/             # Environment config, DB connection, Swagger spec
│   ├── index.js        # All env vars consolidated here
│   ├── database.js     # Mongoose connect
│   └── swagger.js      # Swagger/OpenAPI spec builder
├── controllers/        # Request handlers — business logic lives here
├── models/             # Mongoose schema definitions
├── routes/             # Express Router files (one per resource)
├── middlewares/        # Auth, error handler, upload (Multer)
├── services/           # External API clients (Korean Tourism API)
├── utils/              # Pure utility helpers
└── seeds/              # One-off data seeding scripts
uploads/                # Local image storage (dev only; S3 in production)
scripts/                # Ad-hoc utility scripts
```

---

## Language & Module System

- **Pure JavaScript (ES5/ES2020)** — no TypeScript, no Babel, no transpilation.
- **CommonJS only** — always use `require()` / `module.exports`. Never use `import`/`export`.
- Node.js version: implied ≥18 (uses `Buffer.from(..., 'base64url')`).

```js
// CORRECT
const express = require('express');
const { User } = require('../models');
module.exports = myFunction;

// WRONG — do not use
import express from 'express';
export default myFunction;
```

---

## Code Style

### Formatting
- 2-space indentation; single quotes for strings.
- Trailing commas in multi-line objects/arrays.
- Arrow functions preferred for callbacks and helpers; `async/await` over `.then()`.
- Avoid semicolons only if the rest of the file omits them — match the file you're editing
  (existing files all use **semicolons**).

### Naming
| Thing | Convention | Example |
|---|---|---|
| Variables / functions | camelCase | `generateTokens`, `upsertSocialUser` |
| Classes / Mongoose models | PascalCase | `User`, `Trip`, `Photo` |
| Constants (config values) | camelCase (not SCREAMING_SNAKE) | `config.jwt.secret` |
| Route files | camelCase | `auth.js`, `tripController.js` |
| URL paths | kebab-case | `/api/auth/apple`, `/api/trips/:tripId` |

### Comments
- Use Korean for user-facing business logic comments (matches existing codebase).
- Use English for technical/structural comments if you prefer, but be consistent within a file.

---

## Controllers

All controller functions are `async` and follow this pattern:

```js
exports.myAction = async (req, res, next) => {
  try {
    // ... logic ...
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);   // always delegate to errorHandler middleware
  }
};
```

- **Never** call `res.json()` without also setting an appropriate status code.
- **Always** pass errors to `next(error)` — do not write inline error responses in catch blocks
  unless the error needs a specific non-500 status (then set `error.statusCode` before calling `next`).
- Success responses use `{ success: true, data: ... }` shape.
- Error responses are handled centrally by `src/middlewares/errorHandler.js`.

---

## Error Handling

`src/middlewares/errorHandler.js` is the single error sink:

```js
// Attach statusCode to the error before calling next():
const error = new Error('Not found');
error.statusCode = 404;
return next(error);
```

The handler returns:
```json
{ "success": false, "message": "..." }
// + "stack" in development only
```

Do **not** create separate error classes unless genuinely needed; just attach `statusCode` + `message`.

---

## Models (Mongoose)

```js
const mongoose = require('mongoose');

const mySchema = new mongoose.Schema(
  {
    field: { type: String, required: true, trim: true },
    enum_field: { type: String, enum: ['a', 'b'], required: true },
    ref_field: { type: mongoose.Schema.Types.ObjectId, ref: 'OtherModel' },
  },
  { timestamps: true }   // always include timestamps
);

// Add indexes after schema definition
mySchema.index({ field1: 1, field2: 1 }, { unique: true });

module.exports = mongoose.model('ModelName', mySchema);
```

- Always pass `{ timestamps: true }` — `createdAt` / `updatedAt` are expected by the app.
- Export the compiled model directly (not the schema).
- Models are barrel-exported from `src/models/index.js` — add new models there.

---

## Routes

```js
const express = require('express');
const router = express.Router();
const myController = require('../controllers/myController');
const { authenticate } = require('../middlewares/auth');

// Swagger JSDoc comment immediately before each route
/**
 * @swagger
 * /api/resource:
 *   get:
 *     summary: ...
 *     tags: [Tag]
 *     ...
 */
router.get('/', authenticate, myController.list);

module.exports = router;
```

- Every route that requires a logged-in user **must** use the `authenticate` middleware.
- Every public endpoint must have a Swagger JSDoc block.
- Register new route files in `src/routes/index.js`.

---

## Authentication

- JWT access token + refresh token pattern.
- `authenticate` middleware (`src/middlewares/auth.js`) attaches `req.user` (the full Mongoose User doc).
- Tokens are generated via `generateTokens(userId)` in `authController.js`.
- Supported providers: `apple` | `google`.

---

## Environment Variables

All config is read from `.env` via `dotenv` and re-exported from `src/config/index.js`.
**Never** read `process.env.*` directly outside of `src/config/index.js`.

Key variables:
```
PORT, MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN,
JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN,
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI,
APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY,
AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME,
TOUR_API_KEY, NODE_ENV
```

---

## API Response Conventions

| Scenario | Shape |
|---|---|
| Success (single) | `{ success: true, data: { ... } }` |
| Success (list) | `{ success: true, count: N, pagination: {...}, data: [...] }` |
| Error | `{ success: false, message: "..." }` |

Pagination query params: `page` (default 1), `pageSize` (default 20, max 100).

---

## Do Not

- Do not add TypeScript, ESLint, or Prettier configs without explicit instruction.
- Do not change the module system from CommonJS to ESM.
- Do not commit `.env` or any credentials.
- Do not suppress errors silently — always propagate via `next(error)`.
- Do not add new npm dependencies without confirming with the user first.
