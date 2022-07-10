import * as companyRepository from "../repositories/companyRepository.js";
import * as employeeRepository from "../repositories/employeeRepository.js";
import * as cardRepository from "../repositories/cardRepository.js";
import * as rechargeRepository from "../repositories/rechargeRepository.js";
import * as paymentRepository from "../repositories/paymentRepository.js";

async function validateAPIKey(apiKey: string) {
    const isValidKey = await companyRepository.findByApiKey(apiKey)
        
    if(!isValidKey){
        throw{
            type: "NOT REGISTERED"
        }
    }
}

async function registeredEmployee(employeeId: number) {
    const validEmployee = await employeeRepository.findById(employeeId);
    if(!validEmployee){
        throw{
            type: "NOT REGISTERED"
        }
    }

    return validEmployee;
}

async function confirmCardType(employeeId: number, cardType: cardRepository.TransactionTypes) {
    const hasThisCard = await cardRepository.findByTypeAndEmployeeId(cardType, employeeId);
    if(hasThisCard !== undefined){
        throw {
            type: "CARD TYPE ALREADY REGISTERED"
        }
    }
}

async function findCardById(cardId: number) {
    const cardInfo = await cardRepository.findById(cardId);
    if(!cardInfo){
        throw {
            type: "CARD DOESN'T EXIST"
        }
    }

    return cardInfo
}

async function rechargeCardById(cardId: number) {
    const recharges = await rechargeRepository.findByCardId(cardId);
    let rechargeAmount: number = 0;
        recharges?.map(recharge => {
            rechargeAmount += recharge.amount
        })
    
        return {recharges, rechargeAmount};
}

async function paymentCardById(cardId: number) {
    const payments = await paymentRepository.findByCardId(cardId);
    let paymentAmount: number = 0;
        payments?.map(payment => {
            paymentAmount += payment.amount
        })

        return {payments, paymentAmount}
}

export const cardServices = {
    validateAPIKey,
    registeredEmployee,
    confirmCardType,
    findCardById,
    rechargeCardById,
    paymentCardById
}