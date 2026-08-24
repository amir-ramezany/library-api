import express from "express";

import authorRouter from "./routes/author.routes.js";
import bookRouter from "./routes/book.routes.js";
import categoryRouter from "./routes/category.routes.js";
import healthRouter from "./routes/health.routes.js";

const app = express();

app.use(express.json());
app.use("/api/health", healthRouter);
app.use("/api/authors", authorRouter);
app.use("/api/books", bookRouter);
app.use("/api/categories", categoryRouter);

export default app;
