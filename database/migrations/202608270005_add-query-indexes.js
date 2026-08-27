export const up = (pgm) => {
  pgm.createIndex("books", "author_id", {
    name: "books_author_id_index",
  });

  pgm.createIndex("books", "published_year", {
    name: "books_published_year_index",
  });

  pgm.createIndex("book_categories", "category_id", {
    name: "book_categories_category_id_index",
  });
};

export const down = (pgm) => {
  pgm.dropIndex("book_categories", "category_id", {
    name: "book_categories_category_id_index",
  });

  pgm.dropIndex("books", "published_year", {
    name: "books_published_year_index",
  });

  pgm.dropIndex("books", "author_id", {
    name: "books_author_id_index",
  });
};
