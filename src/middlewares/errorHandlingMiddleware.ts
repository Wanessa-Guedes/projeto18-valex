import { NextFunction, Request, Response } from "express";

export default async function handleError(error, req: Request, res: Response, next: NextFunction) {
    if(error.type == "NOT FOUND" || error.type == "CARD DOESN'T EXIST"){
        return res.status(404).send(`${error.type}`);
    }

    if(error.type == "NOT REGISTERED" || error.type == "CARD ALREADY REGISTERED" 
        || error.type == "CARD IS ALREADY EXPIRED" || error.type == "CARD TYPE ALREADY REGISTERED"
        || error.type == "CVC INCORRECT" || error.type == "NO CARDS ACTIVE OR PASSWORD DONT MATCH" ||
        error.type == "CARD IS BLOCKED" || error.type == "INCORRECT PASSWORD" ||
        error.type == "CARD IS NOT BLOCKED" || error.type == "CARD IS NOT ACTIVATED" || 
        error.type == "BUSINESS NOT REGISTERED" || error.type == "PAYMENT FAILLED: INCORRECT TYPE"
        || error.type == "INSUFFICIENT FUNDS" || 
        error.type == "EMPLOYEE NOT REGISTERED IN THIS COMPANY OR CARD DOESN'T BELONG TO EMPLOYEE"){
        return res.status(401).send(`${error.type}`);
    }

    if(error.details){
        return res.status(422).send(`${error.message}`);
    }

    return res.status(500).send("Internal Server Error")
}