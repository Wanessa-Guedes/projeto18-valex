import { Request, Response } from "express";
import { faker } from '@faker-js/faker';
import dayjs from "dayjs";
import Cryptr from "cryptr";
import bcrypt from "bcrypt";

import * as companyRepository from "../repositories/companyRepository.js";
import * as employeeRepository from "../repositories/employeeRepository.js";
import * as cardRepository from "../repositories/cardRepository.js"

export async function createCard(req: Request, res: Response) {
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
        if(hasThisCard !== undefined){
            throw {
                type: "CARD TYPE ALREADY REGISTERED"
            }
        }
        
        //Utilize a biblioteca faker para gerar o número do cartão
        const creditCarNumber = faker.finance.creditCardNumber('visa');
        
        //O nome no cartão deve estar no formato primeiro nome + iniciais de nomes do meio + ultimo nome (tudo em caixa alta).
        const employeeName: string[]= validEmployee.fullName.split(' ');
        let arrCardNameEmployee: string[] = [];
        let cardNameEmployee: string = '';

        if(employeeName.length > 2){
            employeeName.map((name, index) => {
                if(index != 0 && index != employeeName.length - 1){
                    if(name.length > 2){
                        name = name.slice(0,1);
                    } else {
                        name = "";
                    }
                }
                arrCardNameEmployee.push(name)
            });
            cardNameEmployee = arrCardNameEmployee.join(' ').toUpperCase();
        } else {
            cardNameEmployee = employeeName.join(' ').toUpperCase();
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

        res.status(201).send([cardData.number, cardCVV]);
}

export async function activateCard(req: Request, res: Response) {
    
    const cardId: number = req.body.cardId;
    
    // Somente cartões cadastrados devem ser ativados (pensar num res.locals aqui quando for separar)
    const cardInfo = await cardRepository.findById(cardId);

    if(!cardInfo){
        throw {
            type: "CARD DOESN'T EXIST"
        }
    }

    // Somente cartões não expirados devem ser ativados
    const formatExpiredData = dayjs(`01/${cardInfo.expirationDate}`).format();
    const cardIsExpired = dayjs().isAfter(formatExpiredData)
    if(cardIsExpired){
        throw{
            type: "CARD IS ALREADY EXPIRED"
        }
    }

    //Cartões já ativados (com senha cadastrada) não devem poder ser ativados de novo
    if(cardInfo.password !== null){
        throw {
            type: "CARD ALREADY REGISTERED"
        }
    }

    // O CVC deverá ser recebido e verificado para garantir a segurança da requisição
    const securityCode: string = req.body.securityCode;

    const cryptr = new Cryptr('myTotallySecretKey');
    const decryptedString = cryptr.decrypt(cardInfo.securityCode);

    if(securityCode !== decryptedString){
        throw {
            type: "CVV INCORRECT"
        }
    }

    // A senha do cartão deverá ser persistida de forma criptografada por ser um dado sensível
    const password: string = req.body.password;
    const hash = 10;
    const passwordHasehd = bcrypt.hashSync(password, hash);

    await cardRepository.update(cardInfo.id, {password: passwordHasehd});

    res.sendStatus(201);

}