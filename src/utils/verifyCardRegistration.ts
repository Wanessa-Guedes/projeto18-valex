import * as cardRepository from "../repositories/cardRepository.js"

function verifyRegister(cardInfo: cardRepository.Card){
    if(cardInfo.password !== null){
        throw {
            type: "CARD ALREADY REGISTERED"
        }
    }
}

function verifyCardActivation(cardInfo: cardRepository.Card){
    if(cardInfo.password == null){
        throw {
            type: "CARD IS NOT ACTIVATED"
        }
    }
}

export const verifyCardRegistration = {
    verifyRegister,
    verifyCardActivation
}