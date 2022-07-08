import {Router} from "express";

import { recharges } from "../controllers/transactionsController.js";

const transactionsRouter = Router();

transactionsRouter.post("/recharge", recharges)


export default transactionsRouter;