import { NextFunction, Request, Response } from "express";

export default async function handleError(error, req: Request, res: Response, next: NextFunction) {
    if(error.type == "NOT FOUND"){
        return res.status(404).send(`${error.type}`);
    }

    if(error.type == "NOT REGISTERED" || error.type == "CARD ALREADY REGISTERED"){
        return res.status(401).send(`${error.type}`);
    }

    if(error.details){
        return res.status(402).send(`${error.message}`);
    }

    return res.status(500).send("Internal Server Error")
}