import pool from "../config/db.js";

const bookSelection = `
  b.id,
  b.title,
  b.isbn,
  b.description,
  b.published_year,
  b.author_id,
  b.created_at,
  b.updated_at,
  json_build_object(
    'id', a.id,
    'name', a.name
  ) AS author,
  COALESCE(
    json_agg(
      json_build_object(
        'id', c.id,
        'name', c.name
      )
      ORDER BY c.name, c.id
    ) FILTER (WHERE c.id IS NOT NULL),
    '[]'::json
  ) AS categories
`;

const bookSortColumns = new Map([
  ["id", "b.id"],
  ["title", "b.title"],
  ["isbn", "b.isbn"],
  ["published_year", "b.published_year"],
  ["created_at", "b.created_at"],
]);

export const findBooks = async ({
  search,
  authorId,
  category,
  publishedYear,
  sortBy,
  order,
  page,
  limit,
}) => {
  const conditions = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(b.title ILIKE $${values.length} OR b.isbn ILIKE $${values.length})`,
    );
  }

  if (authorId) {
    values.push(authorId);
    conditions.push(`b.author_id = $${values.length}`);
  }

  if (category) {
    values.push(category);
    conditions.push(`
      EXISTS (
        SELECT 1
        FROM book_categories AS filter_bc
        JOIN categories AS filter_category
          ON filter_category.id = filter_bc.category_id
        WHERE filter_bc.book_id = b.id
          AND LOWER(filter_category.name) = LOWER($${values.length})
      )
    `);
  }

  if (publishedYear) {
    values.push(publishedYear);
    conditions.push(`b.published_year = $${values.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await pool.query(
    `SELECT COUNT(*) AS total_items
     FROM books AS b
     ${whereClause}`,
    values,
  );

  const sortColumn = bookSortColumns.get(sortBy) ?? "b.id";
  const sortOrder = order === "desc" ? "DESC" : "ASC";
  const offset = (page - 1) * limit;
  const queryValues = [...values, limit, offset];
  const limitPlaceholder = `$${queryValues.length - 1}`;
  const offsetPlaceholder = `$${queryValues.length}`;

  const result = await pool.query(
    `
    SELECT ${bookSelection}
    FROM books AS b
    JOIN authors AS a ON a.id = b.author_id
    LEFT JOIN book_categories AS bc ON bc.book_id = b.id
    LEFT JOIN categories AS c ON c.id = bc.category_id
    ${whereClause}
    GROUP BY b.id, a.id
    ORDER BY ${sortColumn} ${sortOrder} NULLS LAST, b.id ASC
    LIMIT ${limitPlaceholder}
    OFFSET ${offsetPlaceholder}
    `,
    queryValues,
  );

  return {
    books: result.rows,
    totalItems: Number(countResult.rows[0].total_items),
  };
};

export const findBookById = async (id) => {
  const result = await pool.query(
    `SELECT ${bookSelection}
     FROM books AS b
     JOIN authors AS a ON a.id = b.author_id
     LEFT JOIN book_categories AS bc ON bc.book_id = b.id
     LEFT JOIN categories AS c ON c.id = bc.category_id
     WHERE b.id = $1
     GROUP BY b.id, a.id`,
    [id],
  );

  return result.rows[0] ?? null;
};

export const createBook = async ({
  title,
  isbn,
  description,
  published_year,
  author_id,
}) => {
  const result = await pool.query(
    `INSERT INTO books (
       title,
       isbn,
       description,
       published_year,
       author_id
     )
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [title, isbn, description ?? null, published_year ?? null, author_id],
  );

  return findBookById(result.rows[0].id);
};

export const updateBook = async (
  id,
  { title, isbn, description, published_year, author_id },
) => {
  const assignments = [];
  const values = [];

  const addAssignment = (column, value) => {
    values.push(value);
    assignments.push(`${column} = $${values.length}`);
  };

  if (title !== undefined) addAssignment("title", title);
  if (isbn !== undefined) addAssignment("isbn", isbn);
  if (description !== undefined) addAssignment("description", description);
  if (published_year !== undefined) {
    addAssignment("published_year", published_year);
  }
  if (author_id !== undefined) addAssignment("author_id", author_id);

  if (assignments.length === 0) {
    return findBookById(id);
  }

  values.push(id);

  const result = await pool.query(
    `UPDATE books
     SET ${assignments.join(", ")}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${values.length}
     RETURNING id`,
    values,
  );

  if (!result.rows[0]) {
    return null;
  }

  return findBookById(result.rows[0].id);
};

export const deleteBook = async (id) => {
  const result = await pool.query("DELETE FROM books WHERE id = $1", [id]);

  return result.rowCount > 0;
};

export const addCategoryToBook = async (bookId, categoryId) => {
  await pool.query(
    `INSERT INTO book_categories (book_id, category_id)
     VALUES ($1, $2)
     ON CONFLICT (book_id, category_id) DO NOTHING`,
    [bookId, categoryId],
  );
};

export const removeCategoryFromBook = async (bookId, categoryId) => {
  const result = await pool.query(
    `DELETE FROM book_categories
     WHERE book_id = $1 AND category_id = $2`,
    [bookId, categoryId],
  );

  return result.rowCount > 0;
};
