import * as cardRepository from "../repositories/cardRepository.js"

function verifyBlock(cardInfo: cardRepository.Card){
    if(cardInfo.isBlocked){
        throw{
            type: "CARD IS ALREADY BLOCKED"
        }
    }
}

export const verifyIfIsBlock = {
    verifyBlock
}