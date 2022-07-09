import Cryptr from "cryptr";

import * as cardRepository from "../repositories/cardRepository.js"

function cardCVC (securityCode: string, cardInfo: cardRepository.Card){

    const cryptr = new Cryptr('myTotallySecretKey');
    const decryptedString = cryptr.decrypt(cardInfo.securityCode);

    if(securityCode !== decryptedString){
        throw {
            type: "CVC INCORRECT"
        }
    }
}

export const verifyCVC = {
    cardCVC
}