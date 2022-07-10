import Joi from "joi";


export const paymentSchema = Joi.object({
    password: Joi.string().length(4).required(),
    businessId: Joi.number().required(),
    amount: Joi.number().positive().greater(0).required(),
    cardId: Joi.number().required()
})