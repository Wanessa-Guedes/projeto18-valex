

function verifyFunds(rechargeAmount: number, paymentAmount: number, amount: number){
    let NewbalanceCard = rechargeAmount - paymentAmount - amount;
    if(NewbalanceCard < 0){
        throw{
            type: "INSUFFICIENT FUNDS"
        }
    }
}

export const verifyFundsForPayment = {
    verifyFunds
}