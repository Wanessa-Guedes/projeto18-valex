import express from "express";
import "express-async-errors";
import dotenv from "dotenv";
dotenv.config();
import router from "./src/routes/index.js";


const app = express();
app.use(express.json());

app.use(router) 


const PORT = +process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server up on port ${PORT}`);
})