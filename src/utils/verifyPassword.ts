import bcrypt from "bcrypt";

import * as cardRepository from "../repositories/cardRepository.js"

function verifyCorrectPassword (password: string, cardInfo: cardRepository.Card){
    const isPasswordCorrect = bcrypt.compareSync(password, cardInfo.password);
    if(!isPasswordCorrect){
        throw{
            type: "INCORRECT PASSWORD"
        }
    }
}


export const verifyPassword = {
    verifyCorrectPassword
}