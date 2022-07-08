import {Router} from "express";
import { createCard } from "../controllers/cardController.js";

import { schemaValidator } from "./../middlewares/schemaValidator.js";
import { typeCardSchema } from "../schemas/typeCardSchema.js";

const cardRouter = Router();

cardRouter.post("/creatcard", schemaValidator(typeCardSchema), createCard)
cardRouter.post("/activatecard")

export default cardRouter;