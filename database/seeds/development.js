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
