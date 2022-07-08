import { Request, Response } from "express";
import dayjs from "dayjs";
import bcrypt from "bcrypt" ;

import * as cardRepository from "./../repositories/cardRepository.js"
import * as rechargeRepository from "./../repositories/rechargeRepository.js"

export async function recharges(req: Request, res: Response) {
    //Nessa rota, empresas com uma chave de API válida podem recarregar cartões de seus empregados.
    // Para um cartão ser recarregado precisamos do identificador do mesmo.
    const amount: number = +req.body.amount;
    const apiKey = req.headers['x-api-key'] as string;

        if(!apiKey){
            throw{
                type: "NOT FOUND"
            }
        }

    // TODO: Somente valores maiores que 0 deveram ser aceitos

    //Somente cartões cadastrados devem receber recargas
    const cardId: number = +req.body.cardId;
    const cardInfo = await cardRepository.findById(cardId);
    if(cardInfo == undefined){
        throw {
            type: "CARD DOESN'T EXIST"
        }
    }

    //Somente cartões ativos devem receber recargas
    if(cardInfo.password == null){
        throw {
            type: "CARD IS NOT ACTIVATED"
        }
    }

    //Somente cartões não expirados devem receber recargas
    const formatExpiredData = dayjs(`01/${cardInfo.expirationDate}`).format();
    const cardIsExpired = dayjs().isAfter(formatExpiredData)
    if(cardIsExpired){
        throw{
            type: "CARD IS ALREADY EXPIRED"
        }
    }

    //A recarga deve ser persistida
    await rechargeRepository.insert({cardId, amount});

    res.sendStatus(200);
}

export async function payments(req: Request, res: Response){
    // TODO: Somente montantes maiores que 0 deveram ser aceitos
    const password: string = req.body.password;
    //Somente cartões cadastrados devem poder comprar
    const cardId: number = +req.body.cardId;
    const cardInfo = await cardRepository.findById(cardId);
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
    //Somente estabelecimentos do mesmo tipo do cartão devem poder transacionar com ele
    //O cartão deve possuir saldo suficiente para cobrir o montante da compra
    //A compra deve ser persistida
}

//TODO: MUDAR DATA DE EXPIRAÇÃO
//TODO: ROTA RECARGAS --> VER SE O EMPREGADO PERTENCE A EMPRESA