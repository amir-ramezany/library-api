export const up = (pgm) => {
  pgm.createTable("categories", {
    id: {
      type: "serial",
      primaryKey: true,
    },
    name: {
      type: "varchar(100)",
      notNull: true,
      unique: true,
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
};

export const down = (pgm) => {
  pgm.dropTable("categories");
};
