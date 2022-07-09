import { Request, Response } from "express";
import { faker } from '@faker-js/faker';
import dayjs from "dayjs";
import Cryptr from "cryptr";
import bcrypt from "bcrypt";

import * as companyRepository from "../repositories/companyRepository.js";
import * as employeeRepository from "../repositories/employeeRepository.js";
import * as cardRepository from "../repositories/cardRepository.js"
import * as rechargeRepository from "../repositories/rechargeRepository.js"
import * as paymentRepository from "../repositories/paymentRepository.js"

import { cardServices } from "../services/cardServices.js";
import { generateInfosCard } from "../utils/generateInfosCard.js";

export async function createCard(req: Request, res: Response) {
        //
        const {employeeId, cardType}:{employeeId: number, cardType:any} = req.body;

        // A chave de API deverá ser recebida no header x-api-key
        const apiKey = req.headers['x-api-key'] as string;

        if(!apiKey){
            throw{
                type: "NOT FOUND"
            }
        }

        res.locals.createCard = {
            employeeId, 
            cardType,
            apiKey
        }
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
    
    const cardId: number = req.body.cardId;
    
    // Somente cartões cadastrados devem ser ativados (pensar num res.locals aqui quando for separar)
    const cardInfo = await cardRepository.findById(cardId);

    if(!cardInfo){
        throw {
            type: "CARD DOESN'T EXIST"
        }
    }

    // Somente cartões não expirados devem ser ativados
    const formatExpiredData = dayjs(`01/${cardInfo.expirationDate}`).format();
    const cardIsExpired = dayjs().isAfter(formatExpiredData)
    if(cardIsExpired){
        throw{
            type: "CARD IS ALREADY EXPIRED"
        }
    }

    //Cartões já ativados (com senha cadastrada) não devem poder ser ativados de novo
    if(cardInfo.password !== null){
        throw {
            type: "CARD ALREADY REGISTERED"
        }
    }

    // O CVC deverá ser recebido e verificado para garantir a segurança da requisição
    const securityCode: string = req.body.securityCode;

    const cryptr = new Cryptr('myTotallySecretKey');
    const decryptedString = cryptr.decrypt(cardInfo.securityCode);

    if(securityCode !== decryptedString){
        throw {
            type: "CVV INCORRECT"
        }
    }

    // A senha do cartão deverá ser persistida de forma criptografada por ser um dado sensível
    const password: string = req.body.password;
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
    // Para isso, precisamos do identificador do cartão.(CVV?)

    // Somente cartões cadastrados devem poder ser visualizados
    const cardId: number = +req.params.cardId;
    const cardInfo = await cardRepository.findById(cardId);
    if(cardInfo == undefined){
        throw {
            type: "CARD DOESN'T EXIST"
        }
    }
    // O saldo de um cartão equivale a soma de suas recargas menos a soma de suas compras
    const recharges = await rechargeRepository.findByCardId(cardId);
    let rechargeAmount: number = 0;
        recharges?.map(recharge => {
            rechargeAmount += recharge.amount
        })

    const payments = await paymentRepository.findByCardId(cardId);
    let paymentAmount: number = 0;
        payments?.map(payment => {
            paymentAmount += payment.amount
        })

    let balanceCard = rechargeAmount - paymentAmount;

    res.send({"balance": balanceCard, "transactions": payments, "recharges": recharges}).status(200);
    
}

export async function cardBlock(req: Request, res: Response) {
    //Nessa rota, empregados podem bloquear cartões. 
    //Para um cartão ser bloqueado precisamos do identificador(CVC ou id?) e da senha do mesmo.

    // Somente cartões cadastrados devem ser bloqueados
    const cardId: number = +req.body.cardId;
    const password: string = req.body.password;

    const cardInfo = await cardRepository.findById(cardId);
    if(cardInfo == undefined){
        throw {
            type: "CARD DOESN'T EXIST"
        }
    }

    //A senha do cartão deverá ser recebida e verificada para garantir a segurança da requisição
    const isPasswordCorrect = bcrypt.compareSync(password, cardInfo.password);
    if(!isPasswordCorrect){
        throw{
            type: "INCORRECT PASSWORD"
        }
    }
    
    //Somente cartões não expirados devem ser bloqueados
    const formatExpiredData = dayjs(`01/${cardInfo.expirationDate}`).format();
    const cardIsExpired = dayjs().isAfter(formatExpiredData)
    if(cardIsExpired){
        throw{
            type: "CARD IS ALREADY EXPIRED"
        }
    }

    //Somente cartões não bloqueados devem ser bloqueados
    if(cardInfo.isBlocked){
        throw{
            type: "CARD IS ALREADY BLOCKED"
        }
    }

    await cardRepository.update(cardId, {isBlocked: true});

    res.sendStatus(200);
}

export async function cardUnblock(req: Request, res: Response) {
    //Nessa rota, empregados podem desbloquear cartões. 
    //Para um cartão ser desbloqueado precisamos do identificador e da senha do mesmo.

    //Somente cartões cadastrados devem ser desbloqueados
    const cardId: number = +req.body.cardId;
    const password: string = req.body.password;

    const cardInfo = await cardRepository.findById(cardId);
    if(cardInfo == undefined){
        throw {
            type: "CARD DOESN'T EXIST"
        }
    }

    //A senha do cartão deverá ser recebida e verificada para garantir a segurança da requisição
    const isPasswordCorrect = bcrypt.compareSync(password, cardInfo.password);
    if(!isPasswordCorrect){
        throw{
            type: "INCORRECT PASSWORD"
        }
    }
    //Somente cartões não expirados devem ser desbloqueados
    const formatExpiredData = dayjs(`01/${cardInfo.expirationDate}`).format();
    const cardIsExpired = dayjs().isAfter(formatExpiredData)
    if(cardIsExpired){
        throw{
            type: "CARD IS ALREADY EXPIRED"
        }
    }

    //Somente cartões bloqueados devem ser desbloqueados
    if(!cardInfo.isBlocked){
        throw{
            type: "CARD IS NOT BLOCKED"
        }
    }

    await cardRepository.update(cardId, {isBlocked: false});

    res.sendStatus(200);

}
