import {Router} from "express";
import { createCard } from "../controllers/cardController.js";

const cardRouter = Router();

cardRouter.post("/creatCard", createCard)

export default cardRouter;