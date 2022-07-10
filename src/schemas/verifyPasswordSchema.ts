import Joi from "joi";


export const passwordSchema = Joi.object({
    password: Joi.string().length(4).required()
})