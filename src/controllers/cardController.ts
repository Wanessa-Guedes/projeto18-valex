import { Request, Response } from "express";
import bcrypt from "bcrypt";

import * as cardRepository from "../repositories/cardRepository.js";
import { cardServices } from "../services/cardServices.js";

import { verifyApiKey } from "../utils/verifyApiKey.js";
import { generateInfosCard } from "../utils/generateInfosCard.js";
import { verifyCardExpiration } from "../utils/verifyCardExpiration.js";
import { verifyCardRegistration } from "../utils/verifyCardRegistration.js";
import { verifyCVC } from "../utils/verifyCVC.js";
import { verifyPassword } from "../utils/verifyPassword.js";
import { verifyBlock } from "../utils/verifyBlock.js";

export async function createCard(req: Request, res: Response) {
        const {employeeId, cardType}:{employeeId: number, cardType: cardRepository.TransactionTypes} = req.body;
        //TODO: ADD UM MIDDLEWARE DE VALIDAR ESSE HEADER
        const apiKey = req.headers['x-api-key'] as string;
        verifyApiKey.verifyKey(apiKey)

        await cardServices.validateAPIKey(apiKey)

        const validEmployee = await cardServices.registeredEmployee(employeeId)

        await cardServices.confirmCardType(employeeId, cardType)
        
        const infosCard = generateInfosCard.generateCard(validEmployee);

        const cardData = {
        employeeId: employeeId,
        number: infosCard.creditCarNumber,
        cardholderName: infosCard.cardNameEmployee,
        securityCode: infosCard.encryptedString,
        expirationDate: infosCard.expireDate,
        isVirtual: false,
        isBlocked: false,
        type: cardType}

        await cardRepository.insert(cardData)

        res.status(201).send([{"Card Number": cardData.number, "CVC": infosCard.cardCVV, 
                                "Name": cardData.cardholderName, "Validate": cardData.expirationDate,
                                "Type": cardData.type}]);
}

export async function activateCard(req: Request, res: Response) {
    
    const cardId: number = +req.body.cardId;
    const securityCode: string = req.body.securityCode;
    const password: string = req.body.password;

    const cardInfo = await cardServices.findCardById(cardId);

    verifyCardExpiration.verifyExpiration(cardInfo)

    verifyCardRegistration.verifyRegister(cardInfo)

    verifyCVC.cardCVC(securityCode, cardInfo)

    const hash = 10;
    const passwordHasehd = bcrypt.hashSync(password, hash);

    await cardRepository.update(cardInfo.id, {password: passwordHasehd});

    res.sendStatus(201);

}

export async function cardTransactions(req: Request, res: Response) {

    const cardId: number = +req.params.cardId;
    const cardInfo = await cardServices.findCardById(cardId)

    verifyCardRegistration.verifyCardActivation(cardInfo)

    const rechargeInfo = await cardServices.rechargeCardById(cardId)

    const paymentInfo = await cardServices.paymentCardById(cardId);

    let balanceCard = rechargeInfo.rechargeAmount - paymentInfo.paymentAmount;

    res.send({"balance": balanceCard, "transactions": paymentInfo.payments, "recharges": rechargeInfo.recharges}).status(200);
    
}

export async function cardBlock(req: Request, res: Response) {

    const cardId: number = +req.params.cardId;
    const password: string = req.body.password;
    const cardInfo = await cardServices.findCardById(cardId)

    verifyCardRegistration.verifyCardActivation(cardInfo)

    verifyPassword.verifyCorrectPassword(password, cardInfo)

    verifyCardExpiration.verifyExpiration(cardInfo)

    verifyBlock.verifyifIsBlock(cardInfo)

    await cardRepository.update(cardId, {isBlocked: true});

    res.sendStatus(200);
}

export async function cardUnblock(req: Request, res: Response) {

    const cardId: number = +req.params.cardId;
    const password: string = req.body.password;

    const cardInfo = await cardServices.findCardById(cardId)

    verifyCardRegistration.verifyCardActivation(cardInfo)

    verifyPassword.verifyCorrectPassword(password, cardInfo)

    verifyCardExpiration.verifyExpiration(cardInfo)

    verifyBlock.verifyIfIsUnblock(cardInfo)

    await cardRepository.update(cardId, {isBlocked: false});

    res.sendStatus(200);

}
