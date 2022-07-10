import { Request, Response } from "express";
import dayjs from "dayjs";
import bcrypt from "bcrypt" ;

import * as cardRepository from "./../repositories/cardRepository.js"
import * as rechargeRepository from "./../repositories/rechargeRepository.js"
import * as businessRepository from "./../repositories/businessRepository.js"
import * as paymentRepository from "./../repositories/paymentRepository.js"

import { verifyApiKey } from "../utils/verifyApiKey.js";
import { transactionsServices } from "../services/transactionsServices.js";
import { cardServices } from "../services/cardServices.js";
import { verifyCardRegistration } from "../utils/verifyCardRegistration.js";
import { verifyCardExpiration } from "../utils/verifyCardExpiration.js";

export async function recharges(req: Request, res: Response) {
    //Nessa rota, empresas com uma chave de API válida podem recarregar cartões de seus empregados.
    // Para um cartão ser recarregado precisamos do identificador do mesmo.
    const amount: number = +req.body.amount;
    const cardId: number = +req.body.cardId;
    const employeeId: number = +req.body.employeeId;

    const apiKey = req.headers['x-api-key'] as string;
    verifyApiKey.verifyKey(apiKey)

    //Somente cartões cadastrados devem receber recargas
    const cardInfo = await cardServices.findCardById(cardId)

    //Somente cartões ativos devem receber recargas
    verifyCardRegistration.verifyCardActivation(cardInfo)

    //Somente cartões não expirados devem receber recargas
    verifyCardExpiration.verifyExpiration(cardInfo)

    //Somente empregados da empresa podem ter o cartão recarregado
    await transactionsServices.findIfEmployeeFromCompanyAndCardFromEmployee(apiKey, employeeId, cardId)
    
    //A recarga deve ser persistida
    await rechargeRepository.insert({cardId, amount});

    res.sendStatus(200);
}

export async function payments(req: Request, res: Response){
    // TODO: Somente montantes maiores que 0 deveram ser aceitos
    const password: string = req.body.password;
    const businessId: number = +req.body.businessId;
    const amount: number = +req.body.amount;
    //Somente cartões cadastrados devem poder comprar
    const cardId: number = +req.body.cardId;
    const cardInfo = await cardRepository.findById(cardId);
    console
    if(cardInfo == undefined){
        throw {
            type: "CARD DOESN'T EXIST"
        }
    }
    //Somente cartões ativos devem poder comprar 
    if(cardInfo.password == null){
        throw {
            type: "CARD IS NOT ACTIVATED"
        }
    }
    //Somente cartões não expirados devem poder comprar
    const formatExpiredData = dayjs(`01/${cardInfo.expirationDate}`).format();
    const cardIsExpired = dayjs().isAfter(formatExpiredData)
    if(cardIsExpired){
        throw{
            type: "CARD IS ALREADY EXPIRED"
        }
    }
    //Somente cartões não bloqueados devem poder comprar
    if(cardInfo.isBlocked){
        throw {
            type: "CARD IS ALREADY BLOCKED"
        }
    }
    //A senha do cartão deverá ser recebida e verificada para garantir a segurança da requisição
    const isPasswordCorrect = bcrypt.compareSync(password, cardInfo.password);
    if(!isPasswordCorrect){
        throw{
            type: "INCORRECT PASSWORD"
        }
    }
    
    //Somente estabelecimentos cadastrados devem poder transacionar
    const businessesRegistered = await businessRepository.findById(businessId);
    if(!businessesRegistered){
        throw{
            type: "BUSINESS NOT REGISTERED"
        }
    }
    //Somente estabelecimentos do mesmo tipo do cartão devem poder transacionar com ele
    if(cardInfo.type !== businessesRegistered.type){
        throw{
            type: "PAYMENT FAILLED: INCORRECT TYPE"
        }
    }
    
    //O cartão deve possuir saldo suficiente para cobrir o montante da compra
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

    let NewbalanceCard = rechargeAmount - paymentAmount - amount;
    if(NewbalanceCard < 0){
        throw{
            type: "INSUFFICIENT FUNDS"
        }
    }

    //A compra deve ser persistida

    await paymentRepository.insert({ cardId, businessId, amount });
    res.sendStatus(200);
}
