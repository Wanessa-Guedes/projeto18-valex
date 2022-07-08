import {Router} from "express";

import { schemaValidator } from "./../middlewares/schemaValidator.js";
import { typeCardSchema } from "../schemas/typeCardSchema.js";
import { cardBlock, cardTransactions, cardUnblock, createCard, getCards } from "../controllers/cardController.js";
import { activateCard } from "../controllers/cardController.js";
import { activationCardSchema } from "../schemas/cardActivationSchema.js";

const cardRouter = Router();

cardRouter.post("/card", schemaValidator(typeCardSchema), createCard)
cardRouter.post("/activatecard", schemaValidator(activationCardSchema), activateCard)
cardRouter.get("/card", getCards)
cardRouter.get("/cardbalance/:cardId", cardTransactions)
cardRouter.put("/card/block", cardBlock)
cardRouter.put("/card/unblock", cardUnblock)

export default cardRouter;