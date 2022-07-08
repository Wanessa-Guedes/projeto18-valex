import {Router} from "express";

import { schemaValidator } from "./../middlewares/schemaValidator.js";
import { typeCardSchema } from "../schemas/typeCardSchema.js";
import { createCard } from "../controllers/cardController.js";
import { activateCard } from "../controllers/cardController.js";
import { activationCardSchema } from "../schemas/cardActivationSchema.js";

const cardRouter = Router();

cardRouter.post("/creatcard", schemaValidator(typeCardSchema), createCard)
cardRouter.post("/activatecard", schemaValidator(activationCardSchema), activateCard)

export default cardRouter;