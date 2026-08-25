import express from "express";

import errorHandler from "./middlewares/error.middleware.js";
import notFound from "./middlewares/notFound.middleware.js";
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
app.use(notFound);
app.use(errorHandler);

export default app;
