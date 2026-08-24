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

export const findBooks = async () => {
  const result = await pool.query(`
    SELECT ${bookSelection}
    FROM books AS b
    JOIN authors AS a ON a.id = b.author_id
    LEFT JOIN book_categories AS bc ON bc.book_id = b.id
    LEFT JOIN categories AS c ON c.id = bc.category_id
    GROUP BY b.id, a.id
    ORDER BY b.id
  `);

  return result.rows;
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
