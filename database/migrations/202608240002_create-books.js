export const up = (pgm) => {
  pgm.createTable("books", {
    id: {
      type: "serial",
      primaryKey: true,
    },
    title: {
      type: "varchar(255)",
      notNull: true,
    },
    isbn: {
      type: "varchar(17)",
      notNull: true,
      unique: true,
    },
    description: {
      type: "text",
    },
    published_year: {
      type: "smallint",
    },
    author_id: {
      type: "integer",
      notNull: true,
      references: "authors",
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  pgm.addConstraint("books", "books_published_year_non_negative_check", {
    check: "published_year >= 0",
  });
};

export const down = (pgm) => {
  pgm.dropTable("books");
};
