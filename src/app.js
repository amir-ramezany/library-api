import express from "express";

import authorRouter from "./routes/author.routes.js";
import healthRouter from "./routes/health.routes.js";

const app = express();

app.use(express.json());
app.use("/api/health", healthRouter);
app.use("/api/authors", authorRouter);

export default app;
