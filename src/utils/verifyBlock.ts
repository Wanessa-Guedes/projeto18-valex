import * as cardRepository from "../repositories/cardRepository.js"

function verifyifIsBlock(cardInfo: cardRepository.Card){
    if(cardInfo.isBlocked){
        throw{
            type: "CARD IS BLOCKED"
        }
    }
}

function verifyIfIsUnblock(cardInfo: cardRepository.Card){
    if(!cardInfo.isBlocked){
        throw{
            type: "CARD IS NOT BLOCKED"
        }
    }
}

export const verifyBlock = {
    verifyifIsBlock,
    verifyIfIsUnblock
}