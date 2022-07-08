import { Request, Response } from "express";
import dayjs from "dayjs";

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
    if(cardInfo.isBlocked){
        throw {
            type: "CARD IS ALREADY BLOCKED"
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