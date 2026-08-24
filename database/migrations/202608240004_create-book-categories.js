export const up = (pgm) => {
  pgm.createTable("book_categories", {
    book_id: {
      type: "integer",
      notNull: true,
      primaryKey: true,
      references: "books",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    category_id: {
      type: "integer",
      notNull: true,
      primaryKey: true,
      references: "categories",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  });
};

export const down = (pgm) => {
  pgm.dropTable("book_categories");
};
