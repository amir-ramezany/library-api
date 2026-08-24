import pool from "../config/db.js";

const categoryColumns = `
  id,
  name,
  created_at,
  updated_at
`;

export const findCategories = async () => {
  const result = await pool.query(`
    SELECT ${categoryColumns}
    FROM categories
    ORDER BY name, id
  `);

  return result.rows;
};

export const findCategoryById = async (id) => {
  const result = await pool.query(
    `SELECT ${categoryColumns}
     FROM categories
     WHERE id = $1`,
    [id],
  );

  return result.rows[0] ?? null;
};

export const createCategory = async ({ name }) => {
  const result = await pool.query(
    `INSERT INTO categories (name)
     VALUES ($1)
     RETURNING ${categoryColumns}`,
    [name],
  );

  return result.rows[0];
};

export const updateCategory = async (id, { name }) => {
  if (name === undefined) {
    return findCategoryById(id);
  }

  const result = await pool.query(
    `UPDATE categories
     SET name = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING ${categoryColumns}`,
    [name, id],
  );

  return result.rows[0] ?? null;
};

export const deleteCategory = async (id) => {
  const result = await pool.query("DELETE FROM categories WHERE id = $1", [id]);

  return result.rowCount > 0;
};
