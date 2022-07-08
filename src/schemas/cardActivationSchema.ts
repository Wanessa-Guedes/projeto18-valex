import Joi from "joi";

// A senha do cartão deverá ser composta de 4 números

export const activationCardSchema = Joi.object({
    cardId: Joi.number().required(),
    securityCode: Joi.string().length(3).required(),
    password: Joi.string().length(4).required()
})