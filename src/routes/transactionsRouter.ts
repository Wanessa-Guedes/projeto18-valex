import {Router} from "express";

import { payments, recharges } from "../controllers/transactionsController.js";

import { schemaValidator } from "../middlewares/schemaValidator.js";
import { rechargeSchema } from "../schemas/rechargeSchema.js";

const transactionsRouter = Router();

transactionsRouter.post("/recharge", schemaValidator(rechargeSchema), recharges)
transactionsRouter.post("/payments", payments)


export default transactionsRouter;