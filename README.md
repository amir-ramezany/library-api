# Library Management API

A learning-oriented REST API built with Node.js and Express. The project is
developed one phase at a time so each backend concept can be studied before the
next phase begins.

## Current features

- Express application foundation
- Health-check endpoint
- PostgreSQL connection pool
- Reversible migrations for authors and books
- Development seed data
- Authors CRUD API
- Books CRUD API with author data
- Categories CRUD API
- Book-category many-to-many relationships
- Book search, filtering, sorting, and pagination

### Setup

Prerequisites: Node.js 20.11 or newer and PostgreSQL.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and update the database credentials:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Create the PostgreSQL database named in `DATABASE_URL`.

4. Apply the database migrations and optionally seed development data:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Start the development server:

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

## Authors API

| Method | Endpoint | Behavior |
| --- | --- | --- |
| `GET` | `/api/authors` | List all authors |
| `GET` | `/api/authors/:id` | Get one author |
| `POST` | `/api/authors` | Create an author |
| `PATCH` | `/api/authors/:id` | Update supplied author fields |
| `DELETE` | `/api/authors/:id` | Delete an author |

Example request body:

```json
{
  "name": "Octavia E. Butler",
  "biography": "American science fiction author."
}
```

Author requests flow from the router to the controller and then to the author
repository. A separate service is not used yet because basic author CRUD has no
business rule to coordinate; a pass-through service would add no useful layer.

## Books API

| Method | Endpoint | Behavior |
| --- | --- | --- |
| `GET` | `/api/books` | Query books with authors and categories |
| `GET` | `/api/books/:id` | Get one book with its author |
| `POST` | `/api/books` | Create a book for an existing author |
| `PATCH` | `/api/books/:id` | Update supplied book fields |
| `DELETE` | `/api/books/:id` | Delete a book |

Example request body:

```json
{
  "title": "Kindred",
  "isbn": "9780807083697",
  "description": "A novel combining time travel and historical fiction.",
  "published_year": 1979,
  "author_id": 3
}
```

Book creation and author reassignment pass through `book.service.js`. The
service verifies that the referenced author exists before the repository writes
the book. Book reads use a SQL `JOIN` and return an `author` object containing
the related author's ID and name.

### Querying books

`GET /api/books` supports these query parameters:

| Parameter | Example | Behavior |
| --- | --- | --- |
| `search` | `search=node` | Case-insensitive title or ISBN search |
| `authorId` | `authorId=3` | Filter by author ID |
| `category` | `category=backend` | Filter by exact category name, ignoring case |
| `publishedYear` | `publishedYear=2024` | Filter by publication year |
| `sortBy` | `sortBy=title` | Sort by a whitelisted field |
| `order` | `order=desc` | Use ascending or descending order |
| `page` | `page=2` | Select the result page |
| `limit` | `limit=10` | Set page size, up to 100 |

Allowed `sortBy` values are `id`, `title`, `isbn`, `published_year`, and
`created_at`. Unsupported values safely fall back to `id` rather than becoming
part of the SQL query.

Query options can be combined:

```text
GET /api/books?category=backend&search=node&sortBy=title&order=asc&page=1&limit=10
```

The list response contains the selected books and pagination metadata:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

PostgreSQL `LIMIT` controls the page size. `OFFSET` skips rows belonging to
earlier pages. A separate `COUNT(*)` query calculates `totalItems` and
`totalPages`.

## Categories API

| Method | Endpoint | Behavior |
| --- | --- | --- |
| `GET` | `/api/categories` | List all categories |
| `GET` | `/api/categories/:id` | Get one category |
| `POST` | `/api/categories` | Create a category |
| `PATCH` | `/api/categories/:id` | Update a category name |
| `DELETE` | `/api/categories/:id` | Delete a category |

Example request body:

```json
{
  "name": "Science Fiction"
}
```

Category names are unique. Category requests use a route, controller, and
repository; there is no category service because basic CRUD currently has no
business rule to coordinate.

## Book-category relationships

| Method | Endpoint | Behavior |
| --- | --- | --- |
| `PUT` | `/api/books/:bookId/categories/:categoryId` | Attach a category |
| `DELETE` | `/api/books/:bookId/categories/:categoryId` | Detach a category |

Attaching a category uses `PUT` because repeating the same request leaves the
relationship in the same state. A successful `PUT` returns the updated book,
including its `categories` array. A successful `DELETE` returns status `204`.

The `book_categories` junction table represents the many-to-many relationship:

```text
books (1) ── (*) book_categories (*) ── (1) categories
```

Its composite primary key contains `book_id` and `category_id`, preventing the
same category from being attached to a book more than once. Deleting a book or
category automatically deletes its junction rows.

## Database

The PostgreSQL connection pool in `src/config/db.js` reads `DATABASE_URL` from
the environment. A pool reuses a limited collection of database connections
instead of opening a new connection for every query.

### Schema

An author can have many books, while each book belongs to one author:

```text
authors (1) ──────── (*) books
```

The `books.author_id` foreign key enforces this relationship. PostgreSQL rejects
books that reference an author that does not exist and prevents an author from
being deleted while books still reference it. ISBN values are unique.

The `created_at` and `updated_at` columns initially default to the current time.
Future update queries must explicitly change `updated_at`; a default value only
runs when a row is inserted.

### Migrations

Apply all pending migrations:

```bash
npm run db:migrate
```

Roll back the most recently applied migration:

```bash
npm run db:migrate:down
```

The first rollback removes `books`. Running the rollback command again removes
`authors`. This reverse order matters because `books` depends on `authors`.

### Inspecting the tables

Connect using PostgreSQL's `psql` client:

```powershell
psql $env:DATABASE_URL
```

Then inspect the schema:

```text
\dt
\d authors
\d books
SELECT * FROM authors;
SELECT * FROM books;
```
