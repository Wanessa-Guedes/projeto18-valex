import * as cardRepository from "./../repositories/cardRepository.js";
import * as businessRepository from "./../repositories/businessRepository.js"


function verifyMatchType(cardInfo: cardRepository.Card, businessesRegistered: businessRepository.Business){
    if(cardInfo.type !== businessesRegistered.type){
        throw{
            type: "PAYMENT FAILLED: INCORRECT TYPE"
        }
    }
}

export const verifyIfTypeMatchs = {
    verifyMatchType
}