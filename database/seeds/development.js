import "dotenv/config";

import pool from "../../src/config/db.js";

const findOrCreateAuthor = async (client, { name, biography }) => {
  const existingAuthor = await client.query(
    "SELECT id FROM authors WHERE name = $1 LIMIT 1",
    [name],
  );

  if (existingAuthor.rows[0]) {
    return existingAuthor.rows[0].id;
  }

  const createdAuthor = await client.query(
    `INSERT INTO authors (name, biography)
     VALUES ($1, $2)
     RETURNING id`,
    [name, biography],
  );

  return createdAuthor.rows[0].id;
};

let client;

try {
  client = await pool.connect();
  await client.query("BEGIN");

  const georgeOrwellId = await findOrCreateAuthor(client, {
    name: "George Orwell",
    biography: "English novelist, essayist, and critic.",
  });

  const ursulaLeGuinId = await findOrCreateAuthor(client, {
    name: "Ursula K. Le Guin",
    biography: "American author known for speculative fiction.",
  });

  await client.query(
    `INSERT INTO books (title, isbn, description, published_year, author_id)
     VALUES
       ($1, $2, $3, $4, $5),
       ($6, $7, $8, $9, $10)
     ON CONFLICT (isbn) DO NOTHING`,
    [
      "1984",
      "9780451524935",
      "A dystopian novel about totalitarianism and surveillance.",
      1949,
      georgeOrwellId,
      "A Wizard of Earthsea",
      "9780547773742",
      "A fantasy novel set in the archipelago of Earthsea.",
      1968,
      ursulaLeGuinId,
    ],
  );

  await client.query(
    `INSERT INTO categories (name)
     VALUES ($1), ($2)
     ON CONFLICT (name) DO NOTHING`,
    ["Dystopian", "Fantasy"],
  );

  await client.query(
    `INSERT INTO book_categories (book_id, category_id)
     SELECT b.id, c.id
     FROM books AS b
     CROSS JOIN categories AS c
     WHERE (b.isbn = $1 AND c.name = $2)
        OR (b.isbn = $3 AND c.name = $4)
     ON CONFLICT (book_id, category_id) DO NOTHING`,
    ["9780451524935", "Dystopian", "9780547773742", "Fantasy"],
  );

  await client.query("COMMIT");
  console.log("Development data seeded successfully.");
} catch (error) {
  if (client) {
    await client.query("ROLLBACK");
  }

  console.error("Failed to seed development data:", error);
  process.exitCode = 1;
} finally {
  client?.release();
  await pool.end();
}
