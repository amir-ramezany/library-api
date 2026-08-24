import pool from "../config/db.js";

const authorColumns = `
  id,
  name,
  biography,
  created_at,
  updated_at
`;

export const findAuthors = async () => {
  const result = await pool.query(`
    SELECT ${authorColumns}
    FROM authors
    ORDER BY id
  `);

  return result.rows;
};

export const findAuthorById = async (id) => {
  const result = await pool.query(
    `SELECT ${authorColumns}
     FROM authors
     WHERE id = $1`,
    [id],
  );

  return result.rows[0] ?? null;
};

export const createAuthor = async ({ name, biography }) => {
  const result = await pool.query(
    `INSERT INTO authors (name, biography)
     VALUES ($1, $2)
     RETURNING ${authorColumns}`,
    [name, biography ?? null],
  );

  return result.rows[0];
};

export const updateAuthor = async (id, { name, biography }) => {
  const assignments = [];
  const values = [];

  if (name !== undefined) {
    values.push(name);
    assignments.push(`name = $${values.length}`);
  }

  if (biography !== undefined) {
    values.push(biography);
    assignments.push(`biography = $${values.length}`);
  }

  if (assignments.length === 0) {
    return findAuthorById(id);
  }

  values.push(id);

  const result = await pool.query(
    `UPDATE authors
     SET ${assignments.join(", ")}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${values.length}
     RETURNING ${authorColumns}`,
    values,
  );

  return result.rows[0] ?? null;
};

export const deleteAuthor = async (id) => {
  const result = await pool.query("DELETE FROM authors WHERE id = $1", [id]);

  return result.rowCount > 0;
};
