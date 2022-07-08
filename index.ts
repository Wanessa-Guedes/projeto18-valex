import express from "express";
import "express-async-errors";
import dotenv from "dotenv";
dotenv.config();
import router from "./src/routes/index.js";
import handleError from "./src/middlewares/errorHandlingMiddleware.js"; 

const app = express();
app.use(express.json());

app.use(router) 
app.use(handleError)

const PORT = +process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server up on port ${PORT}`);
})