# Library Management API

A learning-oriented REST API built with Node.js and Express. The project is
developed one phase at a time so each backend concept can be studied before the
next phase begins.

## Phase 1: Project foundation

This phase provides the Express application foundation and a health-check
endpoint. It does not include database or library-domain features.

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and adjust the port if needed.

3. Start the development server:

   ```bash
   npm run dev
   ```

For a normal start without file watching, run `npm start`.

### Health check

Send a request to:

```text
GET http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "ok"
}
```

The request enters the Express application in `src/app.js`, is matched to the
`/api/health` router, and is handled by `src/routes/health.routes.js`.
