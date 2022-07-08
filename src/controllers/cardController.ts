import { Request, Response } from "express";
import { faker } from '@faker-js/faker';
import dayjs from "dayjs";
import Cryptr from "cryptr";

import * as companyRepository from "../repositories/companyRepository.js";
import * as employeeRepository from "../repositories/employeeRepository.js";
import * as cardRepository from "../repositories/cardRepository.js"

export async function createCard(req: Request, res: Response) {
    try {
        //
        const {employeeId, cardType} = req.body;

        // A chave de API deverá ser recebida no header x-api-key
        const apiKey = req.headers['x-api-key'] as string;

        if(!apiKey){
            throw{
                type: "NOT FOUND"
            }
        }

        // A chave de API deve ser possuida por alguma empresa
        const isValidKey = await companyRepository.findByApiKey(apiKey)
        if(!isValidKey){
            throw{
                type: "NOT REGISTERED"
            }
        }

        // Somente empregados cadastrados devem possuir cartões
        const validEmployee = await employeeRepository.findById(employeeId);
        if(!validEmployee){
            throw{
                type: "NOT REGISTERED"
            }
        }

        // Empregados não podem possuir mais de um cartão do mesmo tipo
        const hasThisCard = await cardRepository.findByTypeAndEmployeeId(cardType, employeeId);
        if(!hasThisCard){
            throw {
                type: "CARD ALREADY REGISTERED"
            }
        }
        //TODO: O tipo do cartão só deve ser uma das seguintes opções:(??)

        //Utilize a biblioteca faker para gerar o número do cartão
        const creditCarNumber = faker.finance.creditCardNumber('visa');

        //O nome no cartão deve estar no formato primeiro nome + iniciais de nomes do meio + ultimo nome (tudo em caixa alta).
        const employeeName = validEmployee.fullName.split(' ');
        let arrCardNameEmployee: string[] = [];
        let cardNameEmployee: string = '';

        if(employeeName.length > 2){
            employeeName.map((name, index) => {
                if(index != 0 && index != employeeName.length - 1){
                    if(name.length > 2){
                        name = name.slice(0,1);
                    }
                }
                arrCardNameEmployee.push(name)
            });
            cardNameEmployee = arrCardNameEmployee.join(' ').toUpperCase();
        }
        
        // A data de expiração deverá ser o dia atual 5 anos a frente e no formato MM/YY
        const expireDate = dayjs().add(5, 'year').format('MM/YY');

        //O código de segurança (CVC) deverá ser persistido de forma criptografada por ser um dado sensível
        const cardCVV = faker.finance.creditCardCVV();
        const cryptr = new Cryptr('myTotallySecretKey');

        const encryptedString = cryptr.encrypt(cardCVV);
        //const decryptedString = cryptr.decrypt(encryptedString);

        // criação do cartão
        const cardData = {
        employeeId: employeeId,
        number: creditCarNumber,
        cardholderName: cardNameEmployee,
        securityCode: encryptedString,
        expirationDate: expireDate,
        isVirtual: false,
        isBlocked: false,
        type: cardType}

        await cardRepository.insert(cardData)


    } catch (error) {
        return res.status(500).send({message: 'Erro ao acessar o banco de dados.'})
    }
}