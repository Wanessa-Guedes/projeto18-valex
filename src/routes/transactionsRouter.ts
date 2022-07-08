import {Router} from "express";

import { payments, recharges } from "../controllers/transactionsController.js";

const transactionsRouter = Router();

transactionsRouter.post("/recharge", recharges)
transactionsRouter.post("/payments", payments)


export default transactionsRouter;