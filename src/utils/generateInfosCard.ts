import {faker} from "@faker-js/faker";
import dayjs from "dayjs";
import Cryptr from "cryptr";

function generateCard(validEmployee){
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

            return {creditCarNumber, cardNameEmployee, encryptedString, expireDate, cardCVV}
}

export const generateInfosCard = {
    generateCard
}