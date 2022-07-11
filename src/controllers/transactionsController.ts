import { Request, Response } from "express";

import * as rechargeRepository from "./../repositories/rechargeRepository.js";
import * as paymentRepository from "./../repositories/paymentRepository.js";

import { verifyApiKey } from "../utils/verifyApiKey.js";
import { transactionsServices } from "../services/transactionsServices.js";
import { cardServices } from "../services/cardServices.js";
import { verifyCardRegistration } from "../utils/verifyCardRegistration.js";
import { verifyCardExpiration } from "../utils/verifyCardExpiration.js";
import { verifyBlock } from "../utils/verifyBlock.js";
import { verifyPassword } from "../utils/verifyPassword.js";
import { verifyIfTypeMatchs } from "../utils/verifyIfTypeMatchs.js";
import { verifyFundsForPayment } from "../utils/verifyFundsForPayment.js";

export async function recharges(req: Request, res: Response) {

    const amount: number = +req.body.amount;
    const cardId: number = +req.body.cardId;
    const employeeId: number = +req.body.employeeId;

    const apiKey = req.headers['x-api-key'] as string;
    verifyApiKey.verifyKey(apiKey)

    const cardInfo = await cardServices.findCardById(cardId)

    verifyCardRegistration.verifyCardActivation(cardInfo)

    verifyCardExpiration.verifyExpiration(cardInfo)

    await transactionsServices.findIfEmployeeFromCompanyAndCardFromEmployee(apiKey, employeeId, cardId)

    await rechargeRepository.insert({cardId, amount});

    res.sendStatus(200);
}

export async function payments(req: Request, res: Response){

    const password: string = req.body.password;
    const businessId: number = +req.body.businessId;
    const amount: number = +req.body.amount;

    const cardId: number = +req.body.cardId;
    const cardInfo = await cardServices.findCardById(cardId)

    verifyCardRegistration.verifyCardActivation(cardInfo)
    verifyCardExpiration.verifyExpiration(cardInfo)

    verifyBlock.verifyifIsBlock(cardInfo)

    verifyPassword.verifyCorrectPassword(password, cardInfo)

    const businessesRegistered = await transactionsServices.findIfCompanyIsRegistered(businessId)

    verifyIfTypeMatchs.verifyMatchType(cardInfo, businessesRegistered)

    const recharges = await cardServices.rechargeCardById(cardId)

    const payments = await cardServices.paymentCardById(cardId)

    verifyFundsForPayment.verifyFunds(recharges.rechargeAmount, payments.paymentAmount, amount)

    await paymentRepository.insert({ cardId, businessId, amount });
    res.sendStatus(200);
}
