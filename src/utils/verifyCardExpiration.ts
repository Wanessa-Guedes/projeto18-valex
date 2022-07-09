import dayjs from "dayjs";

import * as cardRepository from "../repositories/cardRepository.js"

function verifyExpiration (cardInfo: cardRepository.Card) {

    const expiredData = cardInfo.expirationDate.split('/');
    let formatExpiredData: string = '';
    if(+expiredData[0] < 10){
        formatExpiredData = dayjs(`01/0${+expiredData[0]+1}/${expiredData[1]}`).format();
    } else if (+expiredData[0] >= 10 && +expiredData[0] < 12){
        formatExpiredData = dayjs(`01/${+expiredData[0]+1}/${expiredData[1]}`).format();
    } else {
        formatExpiredData = dayjs(`01/01/${+expiredData[1]+1}`).format();
    }

    const cardIsExpired = dayjs().isAfter(formatExpiredData)
    if(cardIsExpired){
        throw{
            type: "CARD IS ALREADY EXPIRED"
        }
    }

}

export const verifyCardExpiration = {
    verifyExpiration
}