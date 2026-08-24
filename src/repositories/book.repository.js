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
  ) AS author
`;

export const findBooks = async () => {
  const result = await pool.query(`
    SELECT ${bookSelection}
    FROM books AS b
    JOIN authors AS a ON a.id = b.author_id
    ORDER BY b.id
  `);

  return result.rows;
};

export const findBookById = async (id) => {
  const result = await pool.query(
    `SELECT ${bookSelection}
     FROM books AS b
     JOIN authors AS a ON a.id = b.author_id
     WHERE b.id = $1`,
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
