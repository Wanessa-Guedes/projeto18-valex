import * as companyRepository from "../repositories/companyRepository.js";
import * as employeeRepository from "../repositories/employeeRepository.js";
import * as cardRepository from "../repositories/cardRepository.js"

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

async function confirmCardType(employeeId: number, cardType: any) {
    const hasThisCard = await cardRepository.findByTypeAndEmployeeId(cardType, employeeId);
    if(hasThisCard !== undefined){
        throw {
            type: "CARD TYPE ALREADY REGISTERED"
        }
    }
}

export const cardServices = {
    validateAPIKey,
    registeredEmployee,
    confirmCardType
}