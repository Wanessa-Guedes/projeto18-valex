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
        //
        const {employeeId, cardType}:{employeeId: number, cardType: cardRepository.TransactionTypes} = req.body;

        // A chave de API deverá ser recebida no header x-api-key
        const apiKey = req.headers['x-api-key'] as string;
        verifyApiKey.verifyKey(apiKey)

        // A chave de API deve ser possuida por alguma empresa
        await cardServices.validateAPIKey(apiKey)

        // Somente empregados cadastrados devem possuir cartões
        const validEmployee = await cardServices.registeredEmployee(employeeId)

        // Empregados não podem possuir mais de um cartão do mesmo tipo
        await cardServices.confirmCardType(employeeId, cardType)
        
        //GERANDO INFORMAÇÕES DO CARTÃO
        const infosCard = generateInfosCard.generateCard(validEmployee);

        // criação do cartão
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

        res.status(201).send([cardData.number, infosCard.cardCVV]);
}

export async function activateCard(req: Request, res: Response) {
    
    const cardId: number = +req.body.cardId;
    const securityCode: string = req.body.securityCode;
    const password: string = req.body.password;
    // Somente cartões cadastrados devem ser ativados 
    const cardInfo = await cardServices.findCardById(cardId);

    // Somente cartões não expirados devem ser ativados
    verifyCardExpiration.verifyExpiration(cardInfo)

    //Cartões já ativados (com senha cadastrada) não devem poder ser ativados de novo
    verifyCardRegistration.verifyRegister(cardInfo)

    // O CVC deverá ser recebido e verificado para garantir a segurança da requisição
    verifyCVC.cardCVC(securityCode, cardInfo)

    // A senha do cartão deverá ser persistida de forma criptografada por ser um dado sensível
    const hash = 10;
    const passwordHasehd = bcrypt.hashSync(password, hash);

    await cardRepository.update(cardInfo.id, {password: passwordHasehd});

    res.sendStatus(201);

}

//TODO: ROTA DANDO ERRO - VOLTAR AQUI (Visualização de cartões)
export async function getCards(req: Request, res: Response) {
    // Nessa rota, empregados podem visualizar os dados de seus cartões. 
    //Para um cartão ser visualizado precisamos do identificador do empregado e da senha dos cartões.
    const employeeId: number = req.body.employeeId;
    const passwords: string[] = req.body.passwords;

    //Somente cartões cadastrados devem poder ser visualizados
    const isCardRegistered = await cardRepository.findByEmployeeId(employeeId);
    if(isCardRegistered.length == 0){
        throw{
            type: "NOT REGISTERED"
        }
    }

    //Somente cartões ativos podem ser visualizados
    let cardsActived = [];
    isCardRegistered?.filter((cardRegistered) => {
        if(!cardRegistered.isBlocked && cardRegistered.password !== null){
                let isPassword = passwords.map(password => {
                    bcrypt.compareSync(password, cardRegistered.password)
            })
            if(isPassword){
                cardsActived.push(cardRegistered)
            }
        }
    })

    if(cardsActived.length == 0){
        throw{
            type: "NO CARDS ACTIVE OR PASSWORD DONT MATCH"
        }
    }

    res.sendStatus(200)
}


export async function cardTransactions(req: Request, res: Response) {
    // Nessa rota, empregados podem visualizar o saldo de um cartão e as transações do mesmo. 
    // Para isso, precisamos do identificador do cartão.

    // Somente cartões cadastrados devem poder ser visualizados
    const cardId: number = +req.params.cardId;
    const cardInfo = await cardServices.findCardById(cardId)

    // Somente cartões ativos tem transações
    verifyCardRegistration.verifyCardActivation(cardInfo)

    // O saldo de um cartão equivale a soma de suas recargas menos a soma de suas compras
    const rechargeInfo = await cardServices.rechargeCardById(cardId)

    const paymentInfo = await cardServices.paymentCardById(cardId);

    let balanceCard = rechargeInfo.rechargeAmount - paymentInfo.paymentAmount;

    res.send({"balance": balanceCard, "transactions": paymentInfo.payments, "recharges": rechargeInfo.recharges}).status(200);
    
}

export async function cardBlock(req: Request, res: Response) {
    //Nessa rota, empregados podem bloquear cartões. 
    //Para um cartão ser bloqueado precisamos do identificador(CVC ou id?) e da senha do mesmo.

    // Somente cartões cadastrados devem ser bloqueados
    const cardId: number = +req.params.cardId;
    const password: string = req.body.password;
    const cardInfo = await cardServices.findCardById(cardId)

    // Somente cartões ativos podem ser bloqueados
    verifyCardRegistration.verifyCardActivation(cardInfo)

    //A senha do cartão deverá ser recebida e verificada para garantir a segurança da requisição
    verifyPassword.verifyCorrectPassword(password, cardInfo)
    
    //Somente cartões não expirados devem ser bloqueados
    verifyCardExpiration.verifyExpiration(cardInfo)

    //Somente cartões não bloqueados devem ser bloqueados
    verifyBlock.verifyifIsBlock(cardInfo)

    await cardRepository.update(cardId, {isBlocked: true});

    res.sendStatus(200);
}

export async function cardUnblock(req: Request, res: Response) {
    //Nessa rota, empregados podem desbloquear cartões. 
    //Para um cartão ser desbloqueado precisamos do identificador e da senha do mesmo.

    //Somente cartões cadastrados devem ser desbloqueados
    const cardId: number = +req.params.cardId;
    const password: string = req.body.password;

    const cardInfo = await cardServices.findCardById(cardId)
    
    // Somente cartões ativos podem ser desbloqueados
    verifyCardRegistration.verifyCardActivation(cardInfo)
    
    //A senha do cartão deverá ser recebida e verificada para garantir a segurança da requisição
    verifyPassword.verifyCorrectPassword(password, cardInfo)

    //Somente cartões não expirados devem ser desbloqueados
    verifyCardExpiration.verifyExpiration(cardInfo)

    //Somente cartões bloqueados devem ser desbloqueados
    verifyBlock.verifyIfIsUnblock(cardInfo)

    await cardRepository.update(cardId, {isBlocked: false});

    res.sendStatus(200);

}
