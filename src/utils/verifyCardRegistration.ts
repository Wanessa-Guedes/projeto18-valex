import * as cardRepository from "../repositories/cardRepository.js"

function verifyRegister(cardInfo: cardRepository.Card){
    if(cardInfo.password !== null){
        throw {
            type: "CARD ALREADY REGISTERED"
        }
    }
}

export const verifyCardRegistration = {
    verifyRegister
}