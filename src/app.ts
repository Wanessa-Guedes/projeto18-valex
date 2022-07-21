import express from "express";
import "express-async-errors";

import router from "./routes/index.js";
import handleError from "./middlewares/errorHandlingMiddleware.js"; 

const app = express();
app.use(express.json());

app.use(router) 
app.use(handleError)

export default app;

