import Joi from "joi";


export const rechargeSchema = Joi.object({
    amount: Joi.number().positive().greater(0).required(),
    cardId: Joi.number().required(),
    employeeId: Joi.number().required()
})