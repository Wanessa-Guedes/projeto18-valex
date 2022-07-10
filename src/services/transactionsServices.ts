import * as employeeRepository from "./../repositories/employeeRepository.js";
import * as cardRepository from "./../repositories/cardRepository.js";

async function findIfEmployeeFromCompanyAndCardFromEmployee(apiKey: string, employeeId: number, cardId: number) {
    const employees = await employeeRepository.findEmployeeByCiaApiKey(apiKey);
    const cardInfo = await cardRepository.findById(cardId);

    let isEmployee: number[] = [];

    employees.map(employee => {
        if(employee.id == employeeId){
            if(cardInfo.employeeId == employeeId){
                isEmployee.push(employeeId)
            }
        }
    })

    if(isEmployee.length == 0){
        throw{
            type: "EMPLOYEE NOT REGISTERED IN THIS COMPANY OR CARD DOESN'T BELONG TO EMPLOYEE"
        }
    }
}

export const transactionsServices = {
    findIfEmployeeFromCompanyAndCardFromEmployee
}